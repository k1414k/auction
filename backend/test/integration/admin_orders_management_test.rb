require "test_helper"
require "securerandom"

class AdminOrdersManagementTest < Minitest::Test
  PASSWORD = "password123"
  HOST = "backend"

  def setup
    @suffix = SecureRandom.hex(3)
    @users = []
    @categories = []
    @items = []
    @orders = []
  end

  def teardown
    order_ids = @orders.map(&:id)
    item_ids = @items.map(&:id)
    user_ids = @users.map(&:id)

    Review.where(order_id: order_ids).delete_all if order_ids.any?
    Message.where(order_id: order_ids).delete_all if order_ids.any?
    WalletTransaction.where(order_id: order_ids).delete_all if order_ids.any?
    Order.where(id: order_ids).delete_all if order_ids.any?
    AdminPermission.where(user_id: user_ids).delete_all if user_ids.any?
    Item.where(id: item_ids).delete_all if item_ids.any?
    Category.where(id: @categories.map(&:id)).delete_all if @categories.any?
    User.where(id: user_ids).delete_all if user_ids.any?
  end

  def test_super_admin_can_list_orders_without_shipping_addresses
    admin = create_user("sa", role: :super_admin)
    first_order = create_order("first", created_at: 2.hours.ago)
    second_order = create_order("second", created_at: 1.hour.ago)
    session, headers = signed_session_for(admin)

    session.get "/admin/v1/orders", headers: headers, as: :json
    body = response_json(session)

    assert_equal 200, session.response.status, body.inspect
    assert_equal [second_order.id, first_order.id], body.map { |order| order.fetch("id") }
    assert_equal second_order.item.title, body.first.fetch("itemTitle")
    assert_equal second_order.buyer.nickname, body.first.fetch("buyerNickname")
    assert_equal second_order.seller.nickname, body.first.fetch("sellerNickname")
    refute body.first.key?("shippingAddress")
  end

  def test_super_admin_can_view_order_detail
    admin = create_user("sa", role: :super_admin)
    order = create_order("detail", shipping_address: "東京都千代田区 1-1")
    message = Message.create!(order: order, user: order.buyer, content: "発送予定を教えてください")
    review = Review.create!(
      order: order,
      reviewer: order.buyer,
      reviewee: order.seller,
      rating: :good,
      comment: "ありがとうございました"
    )
    session, headers = signed_session_for(admin)

    session.get "/admin/v1/orders/#{order.id}", headers: headers, as: :json
    body = response_json(session)

    assert_equal 200, session.response.status, body.inspect
    assert_equal order.id, body.fetch("id")
    assert_equal order.item.title, body.dig("item", "title")
    assert_equal order.buyer.email, body.dig("buyer", "email")
    assert_equal order.seller.email, body.dig("seller", "email")
    assert_equal "東京都千代田区 1-1", body.fetch("shippingAddress")
    assert_equal 1, body.fetch("messagesCount")
    assert_equal message.order_id, order.id
    assert_equal review.id, body.fetch("reviews").first.fetch("id")
    assert_equal "good", body.fetch("reviews").first.fetch("rating")
    assert_equal true, body.fetch("canUpdate")
  end

  def test_read_only_admin_can_view_but_cannot_update_order
    admin = create_user("ad", role: :admin)
    AdminPermission.create!(
      user: admin,
      resource: "orders",
      can_read: true,
      can_update: false
    )
    order = create_order("readonly")
    session, headers = signed_session_for(admin)

    session.get "/admin/v1/orders/#{order.id}", headers: headers, as: :json
    detail = response_json(session)

    assert_equal 200, session.response.status, detail.inspect
    assert_equal false, detail.fetch("canUpdate")

    session.patch "/admin/v1/orders/#{order.id}",
      params: { status: "completed" },
      headers: headers,
      as: :json

    assert_equal 403, session.response.status
    assert order.reload.waiting_shipping?
  end

  def test_admin_without_order_read_permission_is_forbidden
    admin = create_user("ad", role: :admin)
    order = create_order("forbidden")
    session, headers = signed_session_for(admin)

    session.get "/admin/v1/orders/#{order.id}", headers: headers, as: :json

    assert_equal 403, session.response.status
  end

  private

  def create_order(label, created_at: Time.current, shipping_address: "東京都テスト区 1-1")
    seller = create_user("s#{label[0]}")
    buyer = create_user("b#{label[0]}")
    category = Category.create!(name: "c#{SecureRandom.hex(3)}").tap { |record| @categories << record }
    item = Item.create!(
      user: seller,
      category: category,
      title: "#{label} #{@suffix}",
      description: "order test",
      price: 2500,
      trading_status: :trading,
      sale_type: :fixed_price
    ).tap { |record| @items << record }

    Order.create!(
      item: item,
      buyer: buyer,
      seller: seller,
      status: :waiting_shipping,
      shipping_address: shipping_address,
      created_at: created_at,
      updated_at: created_at
    ).tap { |record| @orders << record }
  end

  def create_user(label, role: :user)
    User.create!(
      email: "#{label}-#{SecureRandom.hex(4)}@example.com",
      password: PASSWORD,
      nickname: "#{label}#{SecureRandom.hex(2)}",
      role: role
    ).tap { |record| @users << record }
  end

  def signed_session_for(user)
    session = ActionDispatch::Integration::Session.new(Rails.application)
    session.host! HOST
    session.post "/auth/sign_in",
      params: { email: user.email, password: PASSWORD },
      as: :json

    assert_equal 200, session.response.status, session.response.body

    headers = {
      "ACCEPT" => "application/json",
      "CONTENT_TYPE" => "application/json"
    }
    %w[access-token client uid].each do |key|
      value = session.response.headers[key]
      headers[key] = value if value.present?
    end
    [session, headers]
  end

  def response_json(session)
    body = session.response.body.to_s
    body.empty? ? {} : JSON.parse(body)
  end
end

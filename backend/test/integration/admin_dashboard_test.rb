require "test_helper"
require "securerandom"

class AdminDashboardTest < Minitest::Test
  PASSWORD = "password123"
  HOST = "backend"

  def setup
    @suffix = SecureRandom.hex(3)
    @users = []
    @categories = []
    @items = []
    @orders = []
    @bids = []
    @offers = []
  end

  def teardown
    Order.where(id: @orders.map(&:id)).delete_all if @orders.any?
    Bid.where(id: @bids.map(&:id)).delete_all if @bids.any?
    Offer.where(id: @offers.map(&:id)).delete_all if @offers.any?
    Item.where(id: @items.map(&:id)).delete_all if @items.any?
    Category.where(id: @categories.map(&:id)).delete_all if @categories.any?
    User.where(id: @users.map(&:id)).delete_all if @users.any?
  end

  def test_dashboard_returns_real_sales_trend_activities_and_growth_rates
    admin = create_user("admin", role: :super_admin, created_at: 10.days.ago)
    seller = create_user("seller", created_at: 10.days.ago)
    buyer = create_user("buyer", created_at: 45.days.ago)
    bidder = create_user("bidder", created_at: 10.days.ago)
    category = create_category
    today_item = create_item("today", seller, category, price: 3210, created_at: 10.days.ago)
    previous_item = create_item("previous", seller, category, price: 1200, created_at: 45.days.ago)
    current_order = create_order(today_item, buyer, seller, created_at: Time.current)
    create_order(previous_item, buyer, seller, created_at: 45.days.ago)
    create_bid(today_item, bidder, amount: 3300)
    create_offer(today_item, buyer, amount: 3000)
    session, headers = signed_session_for(admin)

    session.get "/admin/v1/dashboard", headers: headers, as: :json
    body = response_json(session)

    assert_equal 200, session.response.status, body.inspect
    assert body.dig("stats", "totalRevenue") >= 4410
    assert_equal expected_growth_rate(:orders), body.dig("stats", "growthRate", "orders")
    assert_equal expected_growth_rate(:revenue), body.dig("stats", "growthRate", "revenue")

    today_point = body.fetch("sales_trend").find { |point| point.fetch("date") == Time.zone.today.iso8601 }
    assert today_point, body.fetch("sales_trend").inspect
    assert today_point.fetch("orders") >= 1
    assert today_point.fetch("revenue") >= current_order.item.price

    activity_bodies = body.fetch("recent_activities").map { |activity| activity.fetch("body") }
    assert activity_bodies.any? { |body_text| body_text.include?(today_item.title) }
    assert body.fetch("recent_orders").any? { |order| order.fetch("id") == current_order.id }
  end

  private

  def create_user(label, role: :user, created_at: Time.current)
    User.create!(
      email: "#{label}-#{SecureRandom.hex(4)}@example.com",
      password: PASSWORD,
      password_confirmation: PASSWORD,
      nickname: "#{label[0, 6]}#{SecureRandom.hex(2)}".first(10),
      role: role,
      created_at: created_at,
      updated_at: created_at
    ).tap { |record| @users << record }
  end

  def create_category
    Category.create!(name: "d#{@suffix}").tap { |record| @categories << record }
  end

  def create_item(label, seller, category, price:, created_at:)
    Item.create!(
      user: seller,
      category: category,
      title: "dashboard #{label} #{@suffix}",
      description: "dashboard test",
      price: price,
      trading_status: :trading,
      sale_type: :fixed_price,
      created_at: created_at,
      updated_at: created_at
    ).tap { |record| @items << record }
  end

  def create_order(item, buyer, seller, created_at:)
    Order.create!(
      item: item,
      buyer: buyer,
      seller: seller,
      status: :waiting_shipping,
      created_at: created_at,
      updated_at: created_at
    ).tap { |record| @orders << record }
  end

  def create_bid(item, user, amount:)
    Bid.create!(item: item, user: user, amount: amount).tap { |record| @bids << record }
  end

  def create_offer(item, user, amount:)
    Offer.create!(item: item, user: user, amount: amount).tap { |record| @offers << record }
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

  def expected_growth_rate(metric)
    current_window = 30.days.ago..Time.current
    previous_window = 60.days.ago...30.days.ago

    current, previous =
      case metric
      when :orders
        [
          Order.where(created_at: current_window).count,
          Order.where(created_at: previous_window).count
        ]
      when :revenue
        [
          Order.joins(:item).where(orders: { created_at: current_window }).sum("items.price"),
          Order.joins(:item).where(orders: { created_at: previous_window }).sum("items.price")
        ]
      end

    return current.positive? ? 100.0 : 0.0 if previous.to_i.zero?

    (((current.to_f - previous.to_f) / previous.to_f) * 100).round(1)
  end
end

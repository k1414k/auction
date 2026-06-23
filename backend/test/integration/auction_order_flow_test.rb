require "test_helper"
require "securerandom"

class AuctionOrderFlowTest < Minitest::Test
  PASSWORD = "password123"
  HOST = "backend"

  def setup
    @suffix = SecureRandom.hex(3)
    @users = []
    @categories = []
    @items = []
    @addresses = []
    @orders = []
  end

  def teardown
    item_ids = @items.map(&:id)
    order_ids = @orders.map(&:id)

    Message.where(order_id: order_ids).delete_all if order_ids.any?
    Order.where(id: order_ids).delete_all if order_ids.any?
    Order.where(item_id: item_ids).delete_all if item_ids.any?
    Bid.where(item_id: item_ids).delete_all if item_ids.any?
    Offer.where(item_id: item_ids).delete_all if item_ids.any?
    Favorite.where(item_id: item_ids).delete_all if item_ids.any?
    Address.where(id: @addresses.map(&:id)).delete_all if @addresses.any?
    Item.where(id: item_ids).delete_all if item_ids.any?
    Category.where(id: @categories.map(&:id)).delete_all if @categories.any?
    User.where(id: @users.map(&:id)).delete_all if @users.any?
  end

  def test_winning_bidder_can_checkout_ended_auction_at_winning_price
    seller = create_user("seller")
    winner = create_user("winner")
    other = create_user("other")
    category = create_category
    address = create_address(winner)
    item = create_auction_item(seller, category, end_at: 1.hour.ago)

    Bid.create!(item: item, user: other, amount: 1400)
    Bid.create!(item: item, user: winner, amount: 1800)

    session, headers = signed_session_for(winner)
    session.get "/auction/v1/items/#{item.id}", headers: headers, as: :json
    body = response_json(session)

    assert_equal 200, session.response.status
    assert_equal true, body["auction_ended"]
    assert_equal 1800, body["winning_bid_amount"]
    assert_equal true, body["can_checkout_auction"]

    order_session, order_body = post_order(winner, item, address)
    assert_equal 200, order_session.response.status, order_body.inspect

    order = Order.find(order_body.fetch("order_id"))
    @orders << order

    assert_equal winner.id, order.buyer_id
    assert_equal seller.id, order.seller_id
    assert order.waiting_shipping?
    assert item.reload.trading?
    assert_equal 1800, item.price
    assert_equal 98200, winner.reload.points
    assert_equal 1800, seller.reload.balance

    duplicate_session, = post_order(winner, item, address)
    assert_equal 422, duplicate_session.response.status
  end

  def test_loser_and_active_auction_bidder_cannot_checkout
    seller = create_user("seller")
    winner = create_user("winner")
    loser = create_user("loser")
    category = create_category
    loser_address = create_address(loser)
    winner_address = create_address(winner)

    ended_item = create_auction_item(seller, category, end_at: 1.hour.ago)
    Bid.create!(item: ended_item, user: winner, amount: 1600)

    loser_session, loser_body = post_order(loser, ended_item, loser_address)
    assert_equal 422, loser_session.response.status
    assert_equal "落札者のみ購入できます", loser_body["error"]

    active_item = create_auction_item(seller, category, end_at: 1.hour.from_now)
    Bid.create!(item: active_item, user: winner, amount: 1600)

    active_session, active_body = post_order(winner, active_item, winner_address)
    assert_equal 422, active_session.response.status
    assert_equal "オークションはまだ終了していません", active_body["error"]
  end

  def test_fixed_price_purchase_still_uses_item_price
    seller = create_user("seller")
    buyer = create_user("buyer")
    category = create_category
    address = create_address(buyer)
    item = create_fixed_item(seller, category, price: 2500)

    session, body = post_order(buyer, item, address)
    assert_equal 200, session.response.status, body.inspect

    order = Order.find(body.fetch("order_id"))
    @orders << order

    assert item.reload.trading?
    assert_equal 2500, item.price
    assert_equal 97500, buyer.reload.points
    assert_equal 2500, seller.reload.balance
  end

  def test_bid_api_rejects_low_bid_and_accepts_minimum_bid
    seller = create_user("seller")
    first_bidder = create_user("first")
    second_bidder = create_user("second")
    category = create_category
    item = create_auction_item(seller, category, end_at: 1.hour.from_now)

    Bid.create!(item: item, user: first_bidder, amount: 1100)

    session, headers = signed_session_for(second_bidder)
    session.post "/auction/v1/items/#{item.id}/bids",
      params: { amount: 1150 },
      headers: headers,
      as: :json

    low_bid_body = response_json(session)
    assert_equal 422, session.response.status
    assert_includes low_bid_body["error"], "最低入札額"

    session.post "/auction/v1/items/#{item.id}/bids",
      params: { amount: 1200 },
      headers: headers,
      as: :json

    success_body = response_json(session)
    assert_equal 201, session.response.status, success_body.inspect
    assert_equal 1200, item.highest_bid.amount
  end

  private

  def create_user(role, points: 100000)
    User.create!(
      email: "#{role}-#{@suffix}@example.com",
      password: PASSWORD,
      nickname: "#{role[0, 4]}#{@suffix}",
      points: points
    ).tap { |user| @users << user }
  end

  def create_category
    Category.create!(name: "c#{@suffix}").tap { |category| @categories << category }
  end

  def create_address(user)
    Address.create!(
      user: user,
      title: "home",
      name: "Test User",
      address: "Tokyo Test 1-1",
      postal_code: "123-4567",
      phone_number: "09012345678"
    ).tap { |address| @addresses << address }
  end

  def create_auction_item(seller, category, end_at:)
    Item.create!(
      user: seller,
      category: category,
      title: "auction #{@suffix}",
      description: "auction",
      price: 1000,
      start_price: 1000,
      sale_type: :auction,
      trading_status: :listed,
      end_at: end_at,
      min_increment: 100
    ).tap { |item| @items << item }
  end

  def create_fixed_item(seller, category, price:)
    Item.create!(
      user: seller,
      category: category,
      title: "fixed #{@suffix}",
      description: "fixed",
      price: price,
      sale_type: :fixed_price,
      trading_status: :listed
    ).tap { |item| @items << item }
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
    update_auth_headers!(headers, session.response)
    [session, headers]
  end

  def post_order(user, item, address)
    session, headers = signed_session_for(user)
    session.post "/auction/v1/orders",
      params: { item_id: item.id, address_id: address.id, payment_method: "ポイント" },
      headers: headers,
      as: :json
    [session, response_json(session)]
  end

  def response_json(session)
    body = session.response.body.to_s
    body.empty? ? {} : JSON.parse(body)
  end

  def update_auth_headers!(headers, response)
    %w[access-token client uid].each do |key|
      value = response.headers[key]
      headers[key] = value if value.present?
    end
  end
end

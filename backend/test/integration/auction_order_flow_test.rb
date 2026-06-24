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
    assert_equal 1, winner.wallet_transactions.points.purchase.where(order: order).count
    assert_equal 1, seller.wallet_transactions.balance.sale.where(order: order).count
    assert winner.notifications.todo.where(action_url: "/items/#{item.id}/checkout").exists?
    assert seller.notifications.where(action_url: "/transaction/#{order.id}").exists?
    assert other.notifications.where(title: "落札できませんでした", action_url: "/items/#{item.id}").exists?

    duplicate_session, = post_order(winner, item, address)
    assert_equal 422, duplicate_session.response.status
  end

  def test_ended_auction_without_bids_notifies_seller_only_once
    seller = create_user("seller")
    category = create_category
    item = create_auction_item(seller, category, end_at: 1.hour.ago)

    2.times { AuctionSettlementService.settle_item!(item) }

    notifications = seller.notifications.where(
      title: "入札なしでオークションが終了しました",
      action_url: "/items/#{item.id}/edit"
    )
    assert_equal 1, notifications.count
    assert notifications.first.todo?
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
    assert_equal 1, seller.notifications.where(title: "新しい入札がありました").count
    assert_equal 1, first_bidder.notifications.todo.where(title: "入札額が更新されました").count

    session.get "/auction/v1/user/bids", headers: headers, as: :json
    bids_body = response_json(session)
    assert_equal 200, session.response.status
    assert_equal item.id, bids_body.first.fetch("item_id")
    assert_equal "winning", bids_body.first.fetch("status")
  end

  def test_my_bids_returns_latest_bid_per_item_with_current_status
    seller = create_user("seller")
    bidder = create_user("bidder")
    other = create_user("other")
    category = create_category

    winning_item = create_auction_item(seller, category, end_at: 1.hour.from_now)
    first_bid = Bid.create!(item: winning_item, user: bidder, amount: 1100)
    Bid.create!(item: winning_item, user: other, amount: 1200)
    latest_bid = Bid.create!(item: winning_item, user: bidder, amount: 1300)

    outbid_item = create_auction_item(seller, category, end_at: 2.hours.from_now)
    Bid.create!(item: outbid_item, user: bidder, amount: 1100)
    Bid.create!(item: outbid_item, user: other, amount: 1200)

    won_item = create_auction_item(seller, category, end_at: 2.hours.ago)
    Bid.create!(item: won_item, user: other, amount: 1200)
    Bid.create!(item: won_item, user: bidder, amount: 1300)

    lost_item = create_auction_item(seller, category, end_at: 1.hour.ago)
    Bid.create!(item: lost_item, user: bidder, amount: 1200)
    Bid.create!(item: lost_item, user: other, amount: 1300)

    session, headers = signed_session_for(bidder)
    session.get "/auction/v1/user/bids", headers: headers, as: :json
    body = response_json(session)

    assert_equal 200, session.response.status, body.inspect
    assert_equal 4, body.length

    bids_by_item = body.index_by { |entry| entry.fetch("item_id") }

    winning_entry = bids_by_item.fetch(winning_item.id)
    assert_equal latest_bid.id, winning_entry.fetch("id")
    refute_equal first_bid.id, winning_entry.fetch("id")
    assert_equal 1300, winning_entry.fetch("my_bid_amount")
    assert_equal 1300, winning_entry.fetch("highest_bid_amount")
    assert_equal "winning", winning_entry.fetch("status")

    outbid_entry = bids_by_item.fetch(outbid_item.id)
    assert_equal 1100, outbid_entry.fetch("my_bid_amount")
    assert_equal 1200, outbid_entry.fetch("highest_bid_amount")
    assert_equal "outbid", outbid_entry.fetch("status")

    won_entry = bids_by_item.fetch(won_item.id)
    assert_equal "won", won_entry.fetch("status")
    assert_equal "waiting_payment", won_entry.fetch("order_status")
    assert won_entry.fetch("order_id").present?

    lost_entry = bids_by_item.fetch(lost_item.id)
    assert_equal "lost", lost_entry.fetch("status")
    assert_nil lost_entry.fetch("order_id")
    assert_nil lost_entry.fetch("order_status")
  end

  def test_seller_can_accept_offer_and_buyer_can_finish_payment
    seller = create_user("seller")
    buyer = create_user("buyer")
    other_buyer = create_user("other")
    category = create_category
    address = create_address(buyer)
    item = create_negotiation_item(seller, category, price: 3000)

    other_session, other_headers = signed_session_for(other_buyer)
    other_session.post "/auction/v1/items/#{item.id}/offers",
      params: { amount: 2300 },
      headers: other_headers,
      as: :json
    other_offer_body = response_json(other_session)
    assert_equal 201, other_session.response.status, other_offer_body.inspect
    other_offer = Offer.find(other_offer_body.fetch("id"))

    buyer_session, buyer_headers = signed_session_for(buyer)
    buyer_session.post "/auction/v1/items/#{item.id}/offers",
      params: { amount: 2400 },
      headers: buyer_headers,
      as: :json
    offer_body = response_json(buyer_session)

    assert_equal 201, buyer_session.response.status, offer_body.inspect
    offer = Offer.find(offer_body.fetch("id"))

    seller_session, seller_headers = signed_session_for(seller)
    seller_session.get "/auction/v1/offers", headers: seller_headers, as: :json
    offers_body = response_json(seller_session)

    assert_equal 200, seller_session.response.status
    assert_equal offer.id, offers_body.first.fetch("id")

    seller_session.patch "/auction/v1/offers/#{offer.id}",
      params: { status: "accepted" },
      headers: seller_headers,
      as: :json
    accepted_body = response_json(seller_session)

    assert_equal 200, seller_session.response.status, accepted_body.inspect
    order = Order.find(accepted_body.fetch("order_id"))
    @orders << order

    assert order.waiting_payment?
    assert item.reload.trading?
    assert_equal 2400, item.price
    assert buyer.notifications.todo.where(action_url: "/items/#{item.id}/checkout").exists?
    assert other_offer.reload.rejected?
    assert other_buyer.notifications.where(title: "オファーが見送られました", action_url: "/items/#{item.id}").exists?

    checkout_session, checkout_body = post_order(buyer, item, address)
    assert_equal 200, checkout_session.response.status, checkout_body.inspect
    assert_equal order.id, checkout_body.fetch("order_id")
    assert order.reload.waiting_shipping?
    assert_equal 97600, buyer.reload.points
    assert_equal 2400, seller.reload.balance
  end

  def test_transaction_message_notifies_the_other_party
    seller = create_user("seller")
    buyer = create_user("buyer")
    category = create_category
    item = create_fixed_item(seller, category, price: 2500)
    item.update!(trading_status: :trading)
    order = Order.create!(item: item, buyer: buyer, seller: seller, status: :waiting_shipping)
    @orders << order

    session, headers = signed_session_for(buyer)
    session.post "/auction/v1/orders/#{order.id}/messages",
      params: { content: "発送予定を教えてください" },
      headers: headers,
      as: :json

    body = response_json(session)
    assert_equal 201, session.response.status, body.inspect
    assert_equal "発送予定を教えてください", body.fetch("content")

    notification = seller.notifications.find_by!(
      title: "取引メッセージが届きました",
      action_url: "/transaction/#{order.id}"
    )
    assert_equal buyer.id, notification.actor_id
    assert_equal 0, buyer.notifications.where(title: "取引メッセージが届きました").count
  end

  def test_notifications_api_filters_and_marks_only_own_notification_as_read
    user = create_user("user")
    other = create_user("other")
    notice = Notification.create_for!(user: user, title: "通常通知", action_url: "/")
    todo = Notification.create_for!(user: user, title: "要対応通知", action_url: "/user/profile", category: :todo)
    other_notification = Notification.create_for!(user: other, title: "他人の通知")

    session, headers = signed_session_for(user)
    session.get "/auction/v1/notifications", headers: headers, as: :json
    all_body = response_json(session)

    assert_equal 200, session.response.status
    assert_equal [todo.id, notice.id], all_body.map { |entry| entry.fetch("id") }

    session.get "/auction/v1/notifications?category=todo", headers: headers, as: :json
    todo_body = response_json(session)

    assert_equal 200, session.response.status
    assert_equal [todo.id], todo_body.map { |entry| entry.fetch("id") }

    session.patch "/auction/v1/notifications/#{todo.id}", headers: headers, as: :json
    updated_body = response_json(session)

    assert_equal 200, session.response.status
    assert updated_body.fetch("read_at").present?
    assert todo.reload.read_at.present?

    session.patch "/auction/v1/notifications/#{other_notification.id}", headers: headers, as: :json
    assert_equal 404, session.response.status
    assert_nil other_notification.reload.read_at
  end

  def test_review_rating_and_comment_are_persisted_when_order_completes
    seller = create_user("seller")
    buyer = create_user("buyer")
    category = create_category
    address = create_address(buyer)
    item = create_fixed_item(seller, category, price: 2500)

    session, body = post_order(buyer, item, address)
    assert_equal 200, session.response.status, body.inspect

    order = Order.find(body.fetch("order_id"))
    @orders << order
    order.update!(status: :waiting_review)

    session, headers = signed_session_for(buyer)
    session.patch "/auction/v1/orders/#{order.id}",
      params: { status: "completed", rating: "good", comment: "ありがとうございました" },
      headers: headers,
      as: :json
    completed_body = response_json(session)

    assert_equal 200, session.response.status, completed_body.inspect
    assert_equal "completed", completed_body.fetch("status")
    assert_equal "good", completed_body.fetch("review").fetch("rating")
    assert_equal "ありがとうございました", completed_body.fetch("review").fetch("comment")
    assert_equal "good", order.reviews.find_by!(reviewer: buyer).rating
    assert item.reload.sold?
  end

  def test_seller_can_update_listed_item_but_not_trading_item
    seller = create_user("seller")
    buyer = create_user("buyer")
    category = create_category
    address = create_address(buyer)
    item = create_fixed_item(seller, category, price: 2500)

    seller_session, seller_headers = signed_session_for(seller)
    seller_session.patch "/auction/v1/items/#{item.id}",
      params: { item: { title: "updated #{@suffix}" } },
      headers: seller_headers,
      as: :json

    assert_equal 200, seller_session.response.status, response_json(seller_session).inspect
    assert_equal "updated #{@suffix}", item.reload.title

    order_session, order_body = post_order(buyer, item, address)
    assert_equal 200, order_session.response.status, order_body.inspect
    @orders << Order.find(order_body.fetch("order_id"))

    seller_session.patch "/auction/v1/items/#{item.id}",
      params: { item: { title: "blocked #{@suffix}" } },
      headers: seller_headers,
      as: :json
    blocked_body = response_json(seller_session)

    assert_equal 422, seller_session.response.status
    assert_equal "取引中または販売終了の商品は編集できません", blocked_body.fetch("error")
    assert_equal "updated #{@suffix}", item.reload.title
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

  def create_negotiation_item(seller, category, price:)
    Item.create!(
      user: seller,
      category: category,
      title: "negotiation #{@suffix}",
      description: "negotiation",
      price: price,
      sale_type: :negotiation,
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

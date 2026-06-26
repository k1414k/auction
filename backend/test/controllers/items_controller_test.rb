require "test_helper"
require "securerandom"

class ItemsControllerTest < Minitest::Test
  HOST = "backend"

  def setup
    @users = []
    @categories = []
    @items = []
    @favorites = []
    @bids = []
    @seller = create_user("seller")
    @category = create_category("家電")
    @session = ActionDispatch::Integration::Session.new(Rails.application)
    @session.host! HOST
  end

  def teardown
    Favorite.where(id: @favorites.map(&:id)).delete_all if @favorites.any?
    Bid.where(id: @bids.map(&:id)).delete_all if @bids.any?
    Item.where(id: @items.map(&:id)).delete_all if @items.any?
    Category.where(id: @categories.map(&:id)).delete_all if @categories.any?
    User.where(id: @users.map(&:id)).delete_all if @users.any?
  end

  def test_search_normalizes_title_and_ranks_exact_title_before_partial_matches
    exact = create_item(title: "Ｎｉｎｔｅｎｄｏ　Ｓｗｉｔｃｈ")
    partial = create_item(title: "Nintendo Switch 対応ケース")
    create_item(title: "別の商品", description: "Nintendo Switchで使える周辺機器")
    draft = create_item(title: "Nintendo Switch 非公開", trading_status: :draft)

    @session.get "/auction/v1/items", params: { q: "Nintendo   Switch" }

    assert_equal 200, @session.response.status
    body = response_json
    assert_equal exact.id, body.first.fetch("id")
    assert_includes body.map { |item| item.fetch("id") }, partial.id
    refute_includes body.map { |item| item.fetch("id") }, draft.id
  end

  def test_search_filters_by_category_name
    other_category = create_category("雑貨")
    matching = create_item(title: "青いバッグ", category: other_category)
    create_item(title: "青いバッグ", category: @category)

    @session.get "/auction/v1/items", params: { q: "バッグ", category: other_category.name }

    assert_equal 200, @session.response.status
    body = response_json
    assert_equal [matching.id], body.map { |item| item.fetch("id") }
  end

  def test_recommendations_prioritize_favorites_then_bids_and_recency
    popular = create_item(title: "人気商品", created_at: 3.days.ago)
    bid_item = create_item(title: "入札商品", created_at: 2.days.ago)
    recent = create_item(title: "新着商品", created_at: 1.day.ago)
    first_user = create_user("first")
    second_user = create_user("second")

    @favorites << Favorite.create!(user: first_user, item: popular)
    @favorites << Favorite.create!(user: second_user, item: popular)
    @bids << Bid.create!(user: first_user, item: bid_item, amount: 1200)

    @session.get "/auction/v1/items", params: { limit: 3 }

    assert_equal 200, @session.response.status
    body = response_json
    assert_equal [popular.id, bid_item.id, recent.id], body.map { |item| item.fetch("id") }
  end

  private

  def create_user(label)
    User.create!(
      email: "#{label}-#{SecureRandom.hex(4)}@example.com",
      password: "password123",
      nickname: "#{label[0, 4]}#{SecureRandom.hex(2)}"
    ).tap { |user| @users << user }
  end

  def create_category(prefix)
    Category.create!(name: "#{prefix}#{SecureRandom.hex(2)}").tap { |category| @categories << category }
  end

  def create_item(title:, description: "商品説明", category: @category, trading_status: :listed, created_at: Time.current)
    Item.create!(
      user: @seller,
      category: category,
      title: title,
      description: description,
      price: 1000,
      condition: :good,
      sale_type: :fixed_price,
      trading_status: trading_status,
      created_at: created_at,
      updated_at: created_at
    ).tap { |item| @items << item }
  end

  def response_json
    JSON.parse(@session.response.body)
  end
end

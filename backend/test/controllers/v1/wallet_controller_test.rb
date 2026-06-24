require "test_helper"
require "securerandom"

class V1WalletControllerTest < Minitest::Test
  PASSWORD = "password123"
  HOST = "backend"

  def setup
    @suffix = SecureRandom.hex(4)
    @users = []
  end

  def teardown
    user_ids = @users.map(&:id)
    WalletTransaction.where(user_id: user_ids).delete_all if user_ids.any?
    User.where(id: user_ids).delete_all if user_ids.any?
  end

  def test_wallet_history_requires_authentication
    session = ActionDispatch::Integration::Session.new(Rails.application)
    session.host! HOST
    session.get "/auction/v1/user/wallet_transactions", as: :json

    assert_equal 401, session.response.status
  end

  def test_wallet_history_only_returns_the_current_users_transactions_newest_first
    user = create_user("owner", balance: 500, points: 1_500)
    other = create_user("other")
    older = create_transaction(
      user: user,
      account: :balance,
      kind: :sale,
      amount: 500,
      balance_after: 500,
      points_after: 1_000,
      description: "古い売上",
      created_at: 2.hours.ago
    )
    newer = create_transaction(
      user: user,
      account: :points,
      kind: :charge,
      amount: 500,
      balance_after: 0,
      points_after: 1_500,
      description: "新しいポイント",
      created_at: 1.hour.ago
    )
    create_transaction(
      user: other,
      account: :points,
      kind: :adjustment,
      amount: 9_999,
      balance_after: 0,
      points_after: 9_999,
      description: "他ユーザーの履歴",
      created_at: Time.current
    )

    session, headers = signed_session_for(user)
    session.get "/auction/v1/user/wallet_transactions", headers: headers, as: :json

    assert_equal 200, session.response.status
    body = response_json(session)
    assert_equal [newer.id, older.id], body.map { |transaction| transaction.fetch("id") }
    assert_equal(
      {
        "id" => newer.id,
        "account" => "points",
        "kind" => "charge",
        "amount" => 500,
        "balance_after" => 0,
        "points_after" => 1_500,
        "description" => "新しいポイント",
        "order_id" => nil
      },
      body.first.except("created_at")
    )
  end

  def test_charging_sales_creates_balance_and_points_history_atomically
    user = create_user("charger", balance: 2_000, points: 3_000)
    session, headers = signed_session_for(user)
    transaction_count = user.wallet_transactions.count

    session.patch "/auction/v1/user/wallet",
      params: { amount: 1_200, type: "charge" },
      headers: headers,
      as: :json

    assert_equal 200, session.response.status
    assert_equal transaction_count + 2, user.wallet_transactions.count
    assert_equal({ "balance" => 800, "points" => 4_200 }, response_json(session))

    transactions = user.wallet_transactions.order(:id)
    assert_equal ["balance", "points"], transactions.map(&:account)
    assert_equal [-1_200, 1_200], transactions.map(&:amount)
    assert_equal [800, 800], transactions.map(&:balance_after)
    assert_equal [4_200, 4_200], transactions.map(&:points_after)
    assert transactions.all?(&:charge?)
  end

  def test_failed_charge_does_not_change_balances_or_create_history
    user = create_user("insufficient", balance: 500, points: 3_000)
    session, headers = signed_session_for(user)
    transaction_count = user.wallet_transactions.count

    session.patch "/auction/v1/user/wallet",
      params: { amount: 600, type: "charge" },
      headers: headers,
      as: :json

    assert_equal 422, session.response.status
    assert_equal transaction_count, user.wallet_transactions.count
    assert_equal "売上高が足りません", response_json(session).fetch("error")
    assert_equal 500, user.reload.balance
    assert_equal 3_000, user.points
  end

  private

  def create_user(label, balance: 0, points: 100_000)
    User.create!(
      email: "#{label}-#{@suffix}@example.com",
      password: PASSWORD,
      password_confirmation: PASSWORD,
      name: label,
      nickname: "#{label}#{@suffix.first(4)}".first(10),
      balance: balance,
      points: points
    ).tap { |user| @users << user }
  end

  def create_transaction(**attributes)
    WalletTransaction.create!(attributes)
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

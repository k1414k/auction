require "test_helper"
require "securerandom"

class AdminSettingsFlowTest < Minitest::Test
  PASSWORD = "password123"
  NEW_PASSWORD = "new-password456"
  HOST = "backend"

  def setup
    @users = []
  end

  def teardown
    User.where(id: @users.map(&:id)).delete_all if @users.any?
  end

  def test_admin_can_update_own_account_name
    admin = create_user("settings", role: :admin, name: "Before Name")
    session, headers = signed_session_for(admin)

    session.put "/auth",
      params: { name: "After Name" },
      headers: headers,
      as: :json

    assert_equal 200, session.response.status, session.response.body
    body = response_json(session)
    assert_equal "After Name", body.dig("data", "name")
    assert_equal "After Name", admin.reload.name
  end

  def test_admin_can_change_own_password_from_settings
    admin = create_user("password", role: :admin)
    session, headers = signed_session_for(admin)

    session.put "/auth",
      params: {
        current_password: PASSWORD,
        password: NEW_PASSWORD,
        password_confirmation: NEW_PASSWORD
      },
      headers: headers,
      as: :json

    assert_equal 200, session.response.status, session.response.body
    assert admin.reload.valid_password?(NEW_PASSWORD)
    refute admin.valid_password?(PASSWORD)
  end

  def test_admin_password_change_rejects_wrong_current_password
    admin = create_user("wrong", role: :admin)
    session, headers = signed_session_for(admin)

    session.put "/auth",
      params: {
        current_password: "wrong-password",
        password: NEW_PASSWORD,
        password_confirmation: NEW_PASSWORD
      },
      headers: headers,
      as: :json

    assert_equal 422, session.response.status
    assert admin.reload.valid_password?(PASSWORD)
    refute admin.valid_password?(NEW_PASSWORD)
  end

  private

  def create_user(label, role:, name: nil)
    User.create!(
      email: "#{label}-#{SecureRandom.hex(4)}@example.com",
      password: PASSWORD,
      password_confirmation: PASSWORD,
      name: name,
      nickname: "#{label[0, 6]}#{SecureRandom.hex(2)}".first(10),
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

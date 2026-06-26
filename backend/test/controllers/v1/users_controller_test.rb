require "test_helper"
require "securerandom"

class V1UsersControllerTest < Minitest::Test
  PASSWORD = "password123"
  HOST = "backend"

  def setup
    @suffix = SecureRandom.hex(4)
    @users = []
  end

  def teardown
    User.where(id: @users.map(&:id)).delete_all if @users.any?
  end

  def test_profile_update_requires_authentication
    session = ActionDispatch::Integration::Session.new(Rails.application)
    session.host! HOST

    session.patch "/auction/v1/user/profile",
      params: { introduction: "ログインなしでは保存しない" },
      as: :json

    assert_equal 401, session.response.status
  end

  def test_current_user_can_update_introduction
    user = create_user("owner", introduction: "更新前")
    other = create_user("other", introduction: "他ユーザー")
    new_introduction = "新しい自己紹介です。\nよろしくお願いします。"
    session, headers = signed_session_for(user)

    session.patch "/auction/v1/user/profile",
      params: { introduction: new_introduction },
      headers: headers,
      as: :json

    assert_equal 200, session.response.status, session.response.body
    body = response_json(session)
    assert_equal user.id, body.fetch("id")
    assert_equal user.email, body.fetch("email")
    assert_equal new_introduction, body.fetch("introduction")
    assert_equal new_introduction, user.reload.introduction
    assert_equal "他ユーザー", other.reload.introduction
  end

  def test_current_user_can_clear_introduction
    user = create_user("empty", introduction: "削除予定")
    session, headers = signed_session_for(user)

    session.patch "/auction/v1/user/profile",
      params: { introduction: "" },
      headers: headers,
      as: :json

    assert_equal 200, session.response.status, session.response.body
    assert_equal "", response_json(session).fetch("introduction")
    assert_equal "", user.reload.introduction
  end

  private

  def create_user(label, introduction:)
    User.create!(
      email: "#{label}-#{@suffix}@example.com",
      password: PASSWORD,
      password_confirmation: PASSWORD,
      name: label,
      nickname: "#{label}#{@suffix.first(4)}".first(10),
      introduction: introduction
    ).tap { |user| @users << user }
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

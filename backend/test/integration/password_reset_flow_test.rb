require "test_helper"
require "cgi"
require "securerandom"
require "uri"

class PasswordResetFlowTest < Minitest::Test
  PASSWORD = "password123"
  NEW_PASSWORD = "new-password456"
  RESET_URL = "http://localhost:3001/auth/reset-password"

  def setup
    ActionMailer::Base.deliveries.clear
    @user = User.create!(
      email: "password-reset-#{SecureRandom.hex(4)}@example.com",
      password: PASSWORD,
      nickname: "pr#{SecureRandom.hex(3)}"
    )
    @session = ActionDispatch::Integration::Session.new(Rails.application)
    @session.host! "backend"
  end

  def teardown
    @user&.destroy!
    ActionMailer::Base.deliveries.clear
  end

  def test_user_can_reset_password_from_emailed_link
    @session.post "/auth/password",
      params: { email: @user.email },
      as: :json

    assert_equal 200, @session.response.status, @session.response.body
    assert_equal 1, ActionMailer::Base.deliveries.size

    reset_link = extract_reset_link(ActionMailer::Base.deliveries.last)
    reset_uri = URI.parse(reset_link)

    @session.get "#{reset_uri.path}?#{reset_uri.query}"

    assert_equal 302, @session.response.status, @session.response.body
    redirect_uri = URI.parse(@session.response.location)
    redirect_params = Rack::Utils.parse_nested_query(redirect_uri.query)
    reset_password_token = redirect_params.fetch("reset_password_token")

    assert_equal RESET_URL, "#{redirect_uri.scheme}://#{redirect_uri.host}:#{redirect_uri.port}#{redirect_uri.path}"

    @session.put "/auth/password",
      params: {
        reset_password_token: reset_password_token,
        password: NEW_PASSWORD,
        password_confirmation: NEW_PASSWORD
      },
      as: :json

    assert_equal 200, @session.response.status, @session.response.body
    assert @user.reload.valid_password?(NEW_PASSWORD)
    refute @user.valid_password?(PASSWORD)
    assert_nil @user.reset_password_token
    refute @user.allow_password_change?
    refute_includes JSON.parse(@session.response.body).fetch("data"), "allow_password_change"

    @session.put "/auth/password",
      params: {
        reset_password_token: reset_password_token,
        password: PASSWORD,
        password_confirmation: PASSWORD
      },
      as: :json

    assert_equal 401, @session.response.status
  end

  def test_request_does_not_reveal_whether_an_email_is_registered
    @session.post "/auth/password",
      params: { email: "missing-#{SecureRandom.hex(4)}@example.com" },
      as: :json

    assert_equal 200, @session.response.status, @session.response.body
    assert_empty ActionMailer::Base.deliveries
  end

  def test_request_rejects_untrusted_redirect_url
    @session.post "/auth/password",
      params: {
        email: @user.email,
        redirect_url: "https://attacker.example/reset"
      },
      as: :json

    assert_equal 422, @session.response.status
    assert_empty ActionMailer::Base.deliveries
  end

  private

  def extract_reset_link(mail)
    body = mail.html_part&.body&.decoded || mail.body.decoded
    escaped_link = body.match(/href="([^"]+)"/)[1]
    CGI.unescapeHTML(escaped_link)
  end
end

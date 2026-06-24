module Auth
  class PasswordsController < DeviseTokenAuth::PasswordsController
    protected

    # DeviseTokenAuth validates the destination against redirect_whitelist
    # before this redirect. Rails 7 still requires an explicit cross-host opt-in.
    def redirect_options
      { allow_other_host: true }
    end
  end
end

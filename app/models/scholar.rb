class Scholar < ActiveRecord::Base
  acts_as_authentic do |c|
    c.perishable_token_valid_for 1.day
  end

  def deliver_password_reset_instructions!
    reset_perishable_token!
    Notifications.deliver_password_reset_instructions(self)
  end

  def deliver_account_confirmation_instructions!
    reset_perishable_token!
    Notifications.deliver_account_confirmation_instructions(self)
  end
end

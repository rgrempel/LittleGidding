class Notifications < ActionMailer::Base
  def password_reset_instructions(user)
    subject    'Little Gidding password reset instructions'
    recipients user.email
    from       'Little Gidding <littlegidding@pauldyck.com>'
    sent_on    Time.now
    
    body       :edit_password_reset_url => edit_password_reset_url(user.perishable_token)
  end

  def account_confirmation_instructions(user)
    subject    'Little Gidding Account Confirmation Instructions'
    recipients user.email
    from       'Little Gidding <littlegidding@pauldyck.com>'
    sent_on    Time.now
    
    body       :account_confirmation_url => edit_account_confirmation_url(user.perishable_token)    
  end
end

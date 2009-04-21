class Notifications < ActionMailer::Base
  def password_reset_instructions(user)
    subject    'Little Gidding password reset instructions'
    recipients user.email
    from       'Little Gidding <littlegidding@pauldyck.com>'
    sent_on    Time.now
    
    body       :user => user
  end

  def account_confirmation_instructions(user)
    subject    'Little Gidding Account Confirmation Instructions'
    recipients user.email
    from       'Little Gidding <littlegidding@pauldyck.com>'
    sent_on    Time.now
    
    body       :user => user   
  end
end

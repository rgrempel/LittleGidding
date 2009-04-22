class ScholarSession < Authlogic::Session::Base
  self.find_by_login_method = :find_by_email
  self.login_field = :email

  validate :check_activation
  after_validation_on_create :mark_activated

  def check_activation
    return true if attempted_record.nil?

    if attempted_record.activated_at.nil?
      errors.add_to_base("Your account has not been activated yet ... check for an email with the activation code")
      return false
    end
    true
  end

  def mark_activated
    if attempted_record.activated_at.nil?
      attempted_record.activated_at = Time.now
      attempted_record.save
    end
  end
end

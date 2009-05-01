require File.join(File.dirname(__FILE__), '..', 'test_helper')

class ScholarSessionsControllerTest < ActionController::TestCase
  setup :activate_authlogic

  def wrap_sc_params params={}
    {
      :format => :xml, 
      :request => {
        :data => {
          :scholar_sessions => params
        }
      }
    }
  end

  context "Given a scholar who is not activated, " do
    setup do
      @scholar = Scholar.new({
        :email => "rgrempel@gmail.com", 
        :full_name => "Ryan Rempel",
        :institution => "CMU"
      });
      @scholar.password = "12345"
      @scholar.password_confirmation = "12345"
      @scholar.reset_perishable_token
      @scholar.save
    end
  
    should "not be able to login with password" do
      post :create, wrap_sc_params(:email => "rgrempel@gmail.com", :password => "12345")

      assert_response :success
      assert_tag :status, :content => "-4"
      assert_tag :errors, :child => {:tag => "base", :content => /not been activated/}
      assert_nil @controller.session[:scholar_credentials]
    end

    should "be able to login with password once activated" do
      @scholar.activated_at = Time.now
      @scholar.save

      post :create, wrap_sc_params(:email => "rgrempel@gmail.com", :password => "12345")

      assert_response :success
      assert_tag :status, :content => "0"
      assert_tag :record, :child => {:tag => "email", :content => "rgrempel@gmail.com"}
      assert_not_nil @controller.session[:scholar_credentials]
    end

    should "be able to activate with perishable_token" do
      assert_nil @scholar.activated_at

      post :create, wrap_sc_params(:email => @scholar.email, :perishable_token => @scholar.perishable_token)

      assert_response :success
      assert_tag :status, :content => "0"
      assert_tag :record, :child => {:tag => "email", :content => @scholar.email}

      @scholar.reload

      assert_not_nil @scholar.activated_at, "activated_at should now be set"
      assert_not_nil @controller.session[:scholar_credentials], "should have been logged in"
    end
  end
end

require File.join(File.dirname(__FILE__), '..', 'test_helper')

class FiguresControllerTest < ActionController::TestCase
  test "get" do
    get :index, :format => "xml"

    assert_response :success
  end
end

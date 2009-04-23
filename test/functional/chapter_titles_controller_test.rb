require File.join(File.dirname(__FILE__), '..', 'test_helper')

class ChapterTitlesControllerTest < ActionController::TestCase
  test "index" do
    get :index, :format => "xml"

    assert_response :success
  end
end

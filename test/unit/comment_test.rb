# == Schema Information
#
# Table name: comments
#
#  id         :integer         not null, primary key
#  scholar_id :integer
#  figure_id  :string(255)
#  comment    :text
#  created_at :datetime
#  updated_at :datetime
#

require File.join(File.dirname(__FILE__), '..', 'test_helper')

class CommentTest < ActiveSupport::TestCase
  context "comments" do
    setup do
      @anyone = Scholar.new :email => "any@any.com", :full_name => "Any Name", :institution => "CMU"
      @anyone.password = "abcd"
      @anyone.password_confirmation = "abcd"
      @anyone.save!
    end

    should "allow tags but sanitize them" do
      c = Comment.new :comment => "<img src=\"fred.jpg\"/><script></script>"
      c.scholar_id = @anyone.id
      c.save || flunk(c.errors.inspect)
      
      assert_equal "<img src=\"fred.jpg\"/>&lt;script&gt;&lt;/script&gt;", c.comment
    end
  end
end

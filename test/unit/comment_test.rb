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

require 'test_helper'

class CommentTest < ActiveSupport::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
end

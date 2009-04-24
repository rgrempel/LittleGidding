# == Schema Information
#
# Table name: pages
#
#  id           :integer         not null, primary key
#  column_start :integer         not null
#  column_end   :integer         not null
#  filename     :string(255)
#  created_at   :datetime
#  updated_at   :datetime
#

require 'test_helper'

class PageTest < ActiveSupport::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
end

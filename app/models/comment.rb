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

class Comment < ActiveRecord::Base
  has_one :scholar

end

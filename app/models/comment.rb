# == Schema Information
#
# Table name: comments
#
#  id         :integer         not null, primary key
#  scholar_id :integer
#  figure_id  :string(255)
#  body       :text
#  created_at :datetime
#  updated_at :datetime
#

class Comment < ActiveRecord::Base
  sanitize_fields :only => [:body], :allow_tags => [:body]

  belongs_to :scholar

  attr_accessible :figure_id, :body

  validates_presence_of :scholar_id
  validates_presence_of :body

  tracks_versions

  # This is just a convenience for to_xml
  def scholar_full_name
    self.scholar.full_name
  end

  def deliver_notification!
    # TODO
  end
end

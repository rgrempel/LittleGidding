class AddVersionsToComments < ActiveRecord::Migration
  def self.up
    rename_column :comments, :comment, :body
    Comment.create_versioned_table
  end

  def self.down
    Comment.drop_versioned_table
    rename_column :comments, :body, :comment
  end
end

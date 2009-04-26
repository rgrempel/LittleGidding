class CreateComments < ActiveRecord::Migration
  def self.up
    create_table :comments do |t|
      t.integer :scholar_id
      t.string :figure_id
      t.text :comment
      t.timestamps
    end

    add_index :comments, :scholar_id
    add_index :comments, :figure_id
    add_index :comments, :created_at
  end

  def self.down
    drop_table :comments
  end
end

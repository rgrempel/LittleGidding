class CreatePages < ActiveRecord::Migration
  def self.up
    create_table :pages do |t|
      t.integer :column_start, :null => false
      t.integer :column_end, :null => false
      t.string :filename
      t.timestamps
    end

    add_index :pages, :column_start
    add_index :pages, :column_end
  end

  def self.down
    drop_table :pages
  end
end

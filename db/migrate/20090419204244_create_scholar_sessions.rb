class CreateScholarSessions < ActiveRecord::Migration
  def self.up
    create_table :scholar_sessions do |t|
      t.string :session_id, :null => false
      t.text :data
      t.timestamps
    end

    add_index :scholar_sessions, :session_id
    add_index :scholar_sessions, :updated_at
  end

  def self.down
    drop_table :scholar_sessions
  end
end

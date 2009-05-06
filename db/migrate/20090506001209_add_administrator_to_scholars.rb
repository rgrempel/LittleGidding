class AddAdministratorToScholars < ActiveRecord::Migration
  def self.up
    add_column :scholars, :administrator, :boolean
  end

  def self.down
    remove_column :scholars, :administrator
  end
end

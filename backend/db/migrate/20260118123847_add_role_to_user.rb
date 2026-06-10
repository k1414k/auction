class AddRoleToUser < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :role, :integer, null: false, default: 0
    add_index :users, :role
    #Ex:- add_index("admin_users", "username")
  end
end

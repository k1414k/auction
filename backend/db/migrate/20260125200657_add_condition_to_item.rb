class AddConditionToItem < ActiveRecord::Migration[7.1]
  def change
    add_column :items, :condition, :integer, null: false, default: 0
    #Ex:- add_column("admin_users", "username", :string, :limit =>25, :after => "email")
  end
end

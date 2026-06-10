class RenameColumnToItem < ActiveRecord::Migration[7.1]
  def change
    rename_column :items, :name, :title
    #Ex:- rename_column("admin_users", "pasword","hashed_pasword")
  end
end

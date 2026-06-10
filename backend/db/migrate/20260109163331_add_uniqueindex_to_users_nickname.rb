class AddUniqueindexToUsersNickname < ActiveRecord::Migration[7.1]
  def change
    add_index :users, :nickname, unique: true
  end
end

class AddOperationalIndexes < ActiveRecord::Migration[7.1]
  def up
    execute <<~SQL.squish
      DELETE FROM favorites newer
      USING favorites older
      WHERE newer.id > older.id
        AND newer.user_id = older.user_id
        AND newer.item_id = older.item_id
    SQL

    add_index :favorites,
      [:user_id, :item_id],
      unique: true,
      name: "index_favorites_on_user_id_and_item_id",
      if_not_exists: true

    add_index :bids,
      [:item_id, :amount],
      name: "index_bids_on_item_id_and_amount",
      if_not_exists: true
  end

  def down
    remove_index :bids, name: "index_bids_on_item_id_and_amount", if_exists: true
    remove_index :favorites, name: "index_favorites_on_user_id_and_item_id", if_exists: true
  end
end

class ChangeItemDescriptionOptions < ActiveRecord::Migration[7.1]
  def change
    change_column :items, :description, :text, null: false, default: "こちらの商品はまだ説明が書いていません。"
  end
end

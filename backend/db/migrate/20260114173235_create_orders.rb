class CreateOrders < ActiveRecord::Migration[7.1]
  def change
    create_table :orders do |t|
      t.references :item, null: false, foreign_key: true

      t.bigint :buyer_id, null: false
      t.bigint :seller_id, null: false

      t.integer :status, default: 0, null: false
      t.text :shipping_address

      t.timestamps
    end

    add_index :orders, :buyer_id
    add_index :orders, :seller_id

    add_foreign_key :orders, :users, column: :buyer_id
    add_foreign_key :orders, :users, column: :seller_id
  end
end

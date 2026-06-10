class CreateItems < ActiveRecord::Migration[7.1]
  def change
    create_table :items do |t|
      t.references :user, null: false, foreign_key: true
      t.references :category, null: false, foreign_key: true

      t.string  :name, null: false
      t.text    :description
      t.integer :price, null: false

      t.integer :trading_status, default: 0, null: false

      t.timestamps
    end

    add_index :items, :price
    add_index :items, :trading_status
  end
end

class CreateAddresses < ActiveRecord::Migration[7.1]
  def change
    create_table :addresses do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.string :name, null: false
      t.text :address, null: false
      t.string :postal_code, null: false
      t.string :phone_number, null: false

      t.timestamps
    end
  end
end

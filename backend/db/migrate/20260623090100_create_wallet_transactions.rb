class CreateWalletTransactions < ActiveRecord::Migration[7.1]
  def change
    create_table :wallet_transactions do |t|
      t.references :user, null: false, foreign_key: true
      t.references :order, null: true, foreign_key: true
      t.integer :account, null: false
      t.integer :kind, null: false
      t.integer :amount, null: false
      t.integer :balance_after, null: false
      t.integer :points_after, null: false
      t.string :description, null: false

      t.timestamps
    end

    add_index :wallet_transactions, [:user_id, :created_at]
  end
end

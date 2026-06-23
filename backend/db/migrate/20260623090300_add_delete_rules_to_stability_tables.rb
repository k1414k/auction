class AddDeleteRulesToStabilityTables < ActiveRecord::Migration[7.1]
  def change
    remove_foreign_key :notifications, column: :user_id if foreign_key_exists?(:notifications, column: :user_id)
    remove_foreign_key :notifications, column: :actor_id if foreign_key_exists?(:notifications, column: :actor_id)
    add_foreign_key :notifications, :users, column: :user_id, on_delete: :cascade unless foreign_key_exists?(:notifications, column: :user_id)
    add_foreign_key :notifications, :users, column: :actor_id, on_delete: :nullify unless foreign_key_exists?(:notifications, column: :actor_id)

    remove_foreign_key :wallet_transactions, column: :user_id if foreign_key_exists?(:wallet_transactions, column: :user_id)
    remove_foreign_key :wallet_transactions, column: :order_id if foreign_key_exists?(:wallet_transactions, column: :order_id)
    add_foreign_key :wallet_transactions, :users, column: :user_id, on_delete: :cascade unless foreign_key_exists?(:wallet_transactions, column: :user_id)
    add_foreign_key :wallet_transactions, :orders, column: :order_id, on_delete: :nullify unless foreign_key_exists?(:wallet_transactions, column: :order_id)

    remove_foreign_key :reviews, column: :order_id if foreign_key_exists?(:reviews, column: :order_id)
    remove_foreign_key :reviews, column: :reviewer_id if foreign_key_exists?(:reviews, column: :reviewer_id)
    remove_foreign_key :reviews, column: :reviewee_id if foreign_key_exists?(:reviews, column: :reviewee_id)
    add_foreign_key :reviews, :orders, column: :order_id, on_delete: :cascade unless foreign_key_exists?(:reviews, column: :order_id)
    add_foreign_key :reviews, :users, column: :reviewer_id, on_delete: :cascade unless foreign_key_exists?(:reviews, column: :reviewer_id)
    add_foreign_key :reviews, :users, column: :reviewee_id, on_delete: :cascade unless foreign_key_exists?(:reviews, column: :reviewee_id)
  end
end

class WalletTransaction < ApplicationRecord
  belongs_to :user
  belongs_to :order, optional: true

  enum account: { points: 0, balance: 1 }
  enum kind: { purchase: 0, sale: 1, charge: 2, refund: 3, adjustment: 4 }

  validates :amount, :balance_after, :points_after, presence: true
  validates :description, presence: true
end

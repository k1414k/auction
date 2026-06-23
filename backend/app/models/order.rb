class Order < ApplicationRecord
  belongs_to :item

  belongs_to :buyer, class_name: "User"
  belongs_to :seller, class_name: "User"

  has_many :messages, dependent: :destroy
  has_many :wallet_transactions, dependent: :nullify
  has_many :reviews, dependent: :destroy
  has_one :buyer_review, -> { where.not(reviewer_id: nil) }, class_name: "Review"

  enum status: {
    waiting_payment: 0,
    waiting_shipping: 1,
    waiting_review: 2,
    completed: 3
  }
end

class Review < ApplicationRecord
  belongs_to :order
  belongs_to :reviewer, class_name: "User"
  belongs_to :reviewee, class_name: "User"

  enum rating: { bad: 0, good: 1 }

  validates :rating, presence: true
  validates :reviewer_id, uniqueness: { scope: :order_id }
end

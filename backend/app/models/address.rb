class Address < ApplicationRecord
  belongs_to :user

  validates :title, :name, :address, presence: true
  # 数字のみ、またはハイフンありの形式をチェックする例
  validates :postal_code, presence: true, format: { with: /\A\d{3}-?\d{4}\z/ }
  validates :phone_number, presence: true, format: { with: /\A\d{10,11}\z/ }
end

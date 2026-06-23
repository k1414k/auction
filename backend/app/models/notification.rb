class Notification < ApplicationRecord
  belongs_to :user
  belongs_to :actor, class_name: "User", optional: true

  enum category: { notice: 0, todo: 1 }

  validates :title, presence: true

  scope :recent, -> { order(created_at: :desc, id: :desc) }

  def self.create_for!(user:, title:, body: nil, action_url: nil, category: :notice, actor: nil)
    create!(
      user: user,
      actor: actor,
      title: title,
      body: body,
      action_url: action_url,
      category: category
    )
  end
end

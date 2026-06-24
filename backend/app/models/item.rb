class Item < ApplicationRecord
  belongs_to :user
  belongs_to :category
  has_one :order
  has_many :favorites, dependent: :destroy
  has_many :favorited_users, through: :favorites, source: :user
  has_many :bids, dependent: :destroy
  has_many :offers, dependent: :destroy

  enum sale_type: { fixed_price: 0, auction: 1, negotiation: 2 }

  enum trading_status: {
    draft: 0,
    listed: 1,
    trading: 2,
    sold: 3
  }

  enum condition: {
    like_new: 0,
    good: 1,
    used: 2,
    fair: 3,
  }

  scope :searchable, -> { where(trading_status: trading_statuses[:listed]) }

  def self.normalized_search_query(value)
    value.to_s.unicode_normalize(:nfkc).strip.gsub(/\s+/, " ").downcase
  end

  def self.matching_search_query(value)
    query = normalized_search_query(value)
    return all if query.blank?

    query.split.reduce(all) do |relation, token|
      pattern = "%#{sanitize_sql_like(token)}%"
      relation.where(
        <<~SQL.squish,
          LOWER(normalize(items.title, NFKC)) LIKE :pattern
          OR LOWER(normalize(items.description, NFKC)) LIKE :pattern
        SQL
        pattern: pattern
      )
    end
  end

  def self.by_search_relevance(value)
    query = normalized_search_query(value)
    return order(created_at: :desc) if query.blank?

    exact = connection.quote(query)
    prefix = connection.quote("#{sanitize_sql_like(query)}%")
    contains = connection.quote("%#{sanitize_sql_like(query)}%")

    order(
      Arel.sql(
        <<~SQL.squish
          CASE
            WHEN LOWER(normalize(items.title, NFKC)) = #{exact} THEN 0
            WHEN LOWER(normalize(items.title, NFKC)) LIKE #{prefix} THEN 1
            WHEN LOWER(normalize(items.title, NFKC)) LIKE #{contains} THEN 2
            ELSE 3
          END ASC
        SQL
      ),
      created_at: :desc
    )
  end

  def self.recommended
    left_joins(:favorites, :bids)
      .group("items.id")
      .order(
        Arel.sql(
          "COUNT(DISTINCT favorites.id) DESC, COUNT(DISTINCT bids.id) DESC, items.created_at DESC"
        )
      )
  end

  def auction_ended?
    auction? && end_at.present? && end_at <= Time.current
  end

  def highest_bid
    bids.order(amount: :desc, created_at: :asc, id: :asc).first
  end

  def highest_bidder?(user)
    user.present? && highest_bid&.user_id == user.id
  end

  # enum shipping_fee_payer: {
  #   seller: 0,
  #   buyer: 1
  # }

  # Active Storage
  has_many_attached :images
  validate :images_count_within_limit
  validate :image_type
  validate :image_size

  private

  def images_count_within_limit
    return unless images.attached?

    if images.count > 5
      errors.add(:images, "は5枚までしかアップロードできません")
    end
  end
  
  def image_type
    images.each do |image|
      unless image.content_type.in?(%w[image/jpeg image/png image/webp])
        errors.add(:images, "はJPEG/PNG/WebPのみ対応しています")
      end
    end
  end

  def image_size
    images.each do |image|
      if image.blob.byte_size > 5.megabytes
        errors.add(:images, "は5MB以下にしてください")
      end
    end
  end

end

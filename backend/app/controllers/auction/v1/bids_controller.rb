class Auction::V1::BidsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_item

  def index
    bids = @item.bids.includes(:user).order(created_at: :desc)
    render json: bids.map { |b|
      { id: b.id, amount: b.amount, user_nickname: b.user.nickname, created_at: b.created_at }
    }
  end

  def create
    amount = params[:amount].to_i
    bid = nil
    previous_highest = nil

    ActiveRecord::Base.transaction do
      @item = Item.lock.find(@item.id)
      previous_highest = @item.highest_bid
      validate_bid!(amount)

      bid = @item.bids.create!(user: current_user, amount: amount)
    end

    Notification.create_for!(
      user: @item.user,
      actor: current_user,
      title: "新しい入札がありました",
      body: "「#{@item.title}」に¥#{bid.amount}の入札がありました。",
      action_url: "/items/#{@item.id}"
    )
    if previous_highest&.user_id.present? && previous_highest.user_id != current_user.id
      Notification.create_for!(
        user: previous_highest.user,
        actor: current_user,
        title: "入札額が更新されました",
        body: "「#{@item.title}」でほかのユーザーが最高額を更新しました。",
        action_url: "/items/#{@item.id}",
        category: :todo
      )
    end

    render json: { id: bid.id, amount: bid.amount }, status: :created
  rescue BidError => e
    render json: { error: e.message }, status: e.status
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  private

  class BidError < StandardError
    attr_reader :status

    def initialize(message, status: :unprocessable_entity)
      @status = status
      super(message)
    end
  end

  def validate_bid!(amount)
    raise BidError.new("入札額を入力してください") if amount <= 0
    raise BidError.new("自分の商品には入札できません", status: :forbidden) if @item.user_id == current_user.id
    raise BidError.new("この商品はオークションではありません") unless @item.auction?
    raise BidError.new("オークションは終了しています") if @item.end_at.present? && @item.end_at <= Time.current

    min_increment = @item.min_increment || 100
    current_max = @item.bids.maximum(:amount)
    min_bid = (current_max || @item.start_price || @item.price) + min_increment

    raise BidError.new("最低入札額は¥#{min_bid}以上です") if amount < min_bid
  end

  def set_item
    @item = Item.find(params[:item_id])
  end
end

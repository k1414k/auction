class Auction::V1::UsersController < ApplicationController
  before_action :authenticate_user!

  def my_items
    AuctionSettlementService.settle_ended_auctions!
    items = current_user.items.includes(:category, images_attachments: :blob).order(created_at: :desc)
    render json: items.map { |item|
      {
        id: item.id,
        title: item.title,
        price: item.price,
        trading_status: item.trading_status,
        image: item.images.attached? ? rails_blob_path(item.images.first, only_path: true) : nil,
        category_name: item.category&.name,
        created_at: item.created_at
      }
    }
  end

  def my_bids
    AuctionSettlementService.settle_ended_auctions!

    bids = current_user.bids
      .includes(item: [:bids, :order, { images_attachments: :blob }])
      .order(created_at: :desc)

    latest_by_item = bids.each_with_object({}) do |bid, memo|
      memo[bid.item_id] ||= bid
    end.values

    render json: latest_by_item.map { |bid| bid_json(bid) }
  end

  def wallet_transactions
    transactions = current_user.wallet_transactions.includes(:order).order(created_at: :desc).limit(100)
    render json: transactions.map { |tx|
      {
        id: tx.id,
        account: tx.account,
        kind: tx.kind,
        amount: tx.amount,
        balance_after: tx.balance_after,
        points_after: tx.points_after,
        description: tx.description,
        order_id: tx.order_id,
        created_at: tx.created_at
      }
    }
  end

  def my_profile
    render json: {
      id: current_user.id,
      name: current_user.name,
      nickname: current_user.nickname,
      email: current_user.email,
      balance: current_user.balance,
      points: current_user.points,
      introduction: current_user.introduction,
      role: current_user.role,
      avatar_url: current_user.avatar.attached? ? rails_blob_path(current_user.avatar, only_path: true) : nil
    }
  end

  def update_profile
    if current_user.update(profile_params)
      my_profile
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end


  ALLOWED_TYPES = %w[charge].freeze

  def update_wallet
    amount = params.require(:amount).to_i
    type   = params.require(:type).to_s

    return error("invalid type") unless ALLOWED_TYPES.include?(type)

    # 売上（balance）をポイントに振り替える操作だけをユーザーに許可する。
    return error("チャージする金額を入力してください") if amount <= 0

    current_user.with_lock do
      return error("売上高が足りません") if current_user.balance < amount

      current_user.update!(
        balance: current_user.balance - amount,
        points: current_user.points + amount
      )
      WalletTransaction.create!(
        user: current_user,
        account: :balance,
        kind: :charge,
        amount: -amount,
        balance_after: current_user.balance,
        points_after: current_user.points,
        description: "売上からポイントへチャージ"
      )
      WalletTransaction.create!(
        user: current_user,
        account: :points,
        kind: :charge,
        amount: amount,
        balance_after: current_user.balance,
        points_after: current_user.points,
        description: "売上からポイントへチャージ"
      )
    end

    render json: {
      balance: current_user.balance,
      points: current_user.points
    }
  end

  def update_avatar
    if params[:avatar].blank?
      return error("avatar is required")
    end

    current_user.avatar.attach(params[:avatar])

    render json: {
      avatar_url: url_for(current_user.avatar)
    }
  end

  def error(message)
    render json: { error: message }, status: :unprocessable_entity
  end

  private

  def profile_params
    params.permit(:introduction)
  end

  def bid_json(bid)
    item = bid.item
    highest_bid = highest_bid_for(item)
    order = item.order
    status =
      if order&.buyer_id == current_user.id
        "won"
      elsif item.auction_ended?
        highest_bid&.user_id == current_user.id ? "won" : "lost"
      elsif highest_bid&.user_id == current_user.id
        "winning"
      else
        "outbid"
      end

    {
      id: bid.id,
      item_id: item.id,
      item_title: item.title,
      item_image: item.images.attached? ? rails_blob_path(item.images.first, only_path: true) : nil,
      my_bid_amount: bid.amount,
      highest_bid_amount: highest_bid&.amount,
      end_at: item.end_at,
      auction_ended: item.auction_ended?,
      status: status,
      order_id: order&.buyer_id == current_user.id ? order.id : nil,
      order_status: order&.buyer_id == current_user.id ? order.status : nil,
      created_at: bid.created_at
    }
  end

  def highest_bid_for(item)
    item.bids.min_by { |candidate| [-candidate.amount, candidate.created_at, candidate.id] }
  end

end

class Auction::V1::UsersController < ApplicationController
  before_action :authenticate_user!

  def my_items
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


end

class Auction::V1::OffersController < ApplicationController
  before_action :authenticate_user!

  def index
    offers = Offer
      .joins(:item)
      .where(items: { user_id: current_user.id })
      .includes(:user, item: { images_attachments: :blob })
      .order(created_at: :desc)

    render json: offers.map { |offer| offer_json(offer) }
  end

  def create
    item = Item.find(params[:item_id])
    amount = params[:amount].to_i

    return render json: { error: "オファー額を入力してください" }, status: :unprocessable_entity if amount <= 0
    return render json: { error: "自分の商品にはオファーできません" }, status: :forbidden if item.user_id == current_user.id
    return render json: { error: "この商品は値段交渉に対応していません" }, status: :unprocessable_entity unless item.negotiation?
    return render json: { error: "この商品は購入できません" }, status: :unprocessable_entity unless item.listed?

    offer = nil
    Offer.transaction do
      item = Item.lock.find(item.id)
      raise OfferError, "この商品は購入できません" unless item.listed?

      offer = item.offers.create!(user: current_user, amount: amount)
      Notification.create_for!(
        user: item.user,
        actor: current_user,
        title: "価格交渉が届きました",
        body: "「#{item.title}」に¥#{offer.amount}のオファーが届きました。",
        action_url: "/user/items",
        category: :todo
      )
    end

    render json: { id: offer.id, amount: offer.amount, status: offer.status }, status: :created
  rescue OfferError => e
    render json: { error: e.message }, status: :unprocessable_entity
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  def update
    offer = Offer.includes(:item, :user).find(params[:id])
    return head :forbidden unless offer.item.user_id == current_user.id

    case params[:status]
    when "accepted"
      order = accept_offer!(offer)
      render json: { id: offer.id, status: offer.status, order_id: order.id }
    when "rejected"
      return render json: { error: "処理済みのオファーです" }, status: :unprocessable_entity unless offer.pending?

      Offer.transaction do
        offer.lock!
        raise OfferError, "処理済みのオファーです" unless offer.pending?

        offer.update!(status: :rejected)
        Notification.create_for!(
          user: offer.user,
          actor: current_user,
          title: "オファーが見送られました",
          body: "「#{offer.item.title}」へのオファーは承認されませんでした。",
          action_url: "/items/#{offer.item_id}"
        )
      end
      render json: { id: offer.id, status: offer.status }
    else
      render json: { error: "無効なステータスです" }, status: :unprocessable_entity
    end
  rescue OfferError => e
    render json: { error: e.message }, status: :unprocessable_entity
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  private

  class OfferError < StandardError; end

  def accept_offer!(offer)
    Order.transaction do
      item = Item.lock.find(offer.item_id)
      offer = item.offers.lock.find(offer.id)

      raise OfferError, "処理済みのオファーです" unless offer.pending?
      raise OfferError, "この商品はすでに取引中です" if item.order.present?
      raise OfferError, "この商品は購入できません" unless item.listed?

      rejected_offers = item.offers.pending.where.not(id: offer.id).includes(:user).to_a
      offer.update!(status: :accepted)
      Offer.where(id: rejected_offers.map(&:id)).update_all(status: Offer.statuses[:rejected], updated_at: Time.current)

      order = Order.create!(
        item: item,
        buyer: offer.user,
        seller: current_user,
        status: :waiting_payment
      )
      item.update!(price: offer.amount, trading_status: :trading)

      Notification.create_for!(
        user: offer.user,
        actor: current_user,
        title: "オファーが承認されました",
        body: "「#{item.title}」のオファーが承認されました。購入手続きを進めてください。",
        action_url: "/items/#{item.id}/checkout",
        category: :todo
      )
      rejected_offers.each do |rejected_offer|
        Notification.create_for!(
          user: rejected_offer.user,
          actor: current_user,
          title: "オファーが見送られました",
          body: "「#{item.title}」では別のオファーが承認されました。",
          action_url: "/items/#{item.id}"
        )
      end
      Notification.create_for!(
        user: current_user,
        actor: offer.user,
        title: "オファーを承認しました",
        body: "「#{item.title}」を¥#{offer.amount}で取引開始しました。",
        action_url: "/transaction/#{order.id}"
      )

      order
    end
  end

  def offer_json(offer)
    item = offer.item
    {
      id: offer.id,
      amount: offer.amount,
      status: offer.status,
      created_at: offer.created_at,
      buyer: {
        id: offer.user.id,
        nickname: offer.user.nickname
      },
      item: {
        id: item.id,
        title: item.title,
        price: item.price,
        trading_status: item.trading_status,
        image: item.images.attached? ? rails_blob_path(item.images.first, only_path: true) : nil
      },
      order_id: item.order&.id
    }
  end
end

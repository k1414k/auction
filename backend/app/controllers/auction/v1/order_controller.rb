class Auction::V1::OrderController < ApplicationController
  before_action :authenticate_user!
  before_action :set_order, only: [:show, :update]

  def index
    AuctionSettlementService.settle_ended_auctions!
    role = params[:role]

    orders =
      if role == "seller"
        current_user.sell_orders
      else
        current_user.buy_orders
      end

    orders = orders.includes(:item, :buyer, :seller).order(created_at: :desc)

    render json: orders.map { |o| order_json(o) }
  end

  def show
    render json: order_detail_json(@order)
  end

  def create
    AuctionSettlementService.settle_ended_auctions!
    order = nil
    ActiveRecord::Base.transaction do
      item = Item.lock.find(order_params[:item_id])
      order = payable_existing_order_for(item)
      if order
        order.lock!
        validate_existing_order_checkout!(order)
      else
        validate_purchase!(item)
      end
      purchase_price = price_for_purchase!(item)

      shipping_address = build_shipping_address

      order ||= Order.create!(
        item: item,
        buyer_id: current_user.id,
        seller_id: item.user_id,
        shipping_address: shipping_address,
        status: :waiting_payment
      )

      process_payment!(purchase_price, order_params[:payment_method], order)
      order.update!(
        shipping_address: shipping_address,
        status: order_status_for_payment(order_params[:payment_method])
      )

      if order_params[:payment_method].to_s == "ポイント"
        seller = item.user
        seller.with_lock do
          seller.update!(balance: seller.balance + purchase_price)
          record_wallet_transaction!(
            user: seller,
            account: :balance,
            kind: :sale,
            amount: purchase_price,
            order: order,
            description: "「#{item.title}」の売上"
          )
        end
      end

      item.update!(price: purchase_price, trading_status: :trading) unless item.trading?

      Notification.create_for!(
        user: order.seller,
        actor: current_user,
        title: "購入手続きが完了しました",
        body: "「#{item.title}」の支払いと配送先登録が完了しました。発送を進めてください。",
        action_url: "/transaction/#{order.id}",
        category: :todo
      )
      Notification.create_for!(
        user: current_user,
        actor: order.seller,
        title: "購入が完了しました",
        body: "「#{item.title}」の取引を開始しました。",
        action_url: "/transaction/#{order.id}"
      )
    end

    render json: { message: "success", order_id: order.id }, status: :ok

  rescue ActiveRecord::RecordNotFound
    render json: { error: "商品が見つかりません" }, status: :not_found
  rescue PurchaseError => e
    render json: { error: e.message }, status: :unprocessable_entity
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def update
    case params[:status]
    when "waiting_shipping"
      return head :forbidden unless @order.buyer_id == current_user.id
      return render json: { error: "支払い待ちの注文のみ更新できます" }, status: :unprocessable_entity unless @order.waiting_payment?

      ActiveRecord::Base.transaction do
        purchase_price = @order.item.price
        shipping_address = build_shipping_address
        process_payment!(purchase_price, params[:payment_method], @order)
        @order.update!(status: :waiting_shipping, shipping_address: shipping_address)
        seller = @order.seller
        seller.with_lock do
          seller.update!(balance: seller.balance + purchase_price)
          record_wallet_transaction!(
            user: seller,
            account: :balance,
            kind: :sale,
            amount: purchase_price,
            order: @order,
            description: "「#{@order.item.title}」の売上"
          )
        end
      end
    when "waiting_review"
      return head :forbidden unless @order.seller_id == current_user.id
      @order.update!(status: :waiting_review)
      Notification.create_for!(
        user: @order.buyer,
        actor: current_user,
        title: "商品が発送されました",
        body: "「#{@order.item.title}」が発送されました。受け取り後に評価してください。",
        action_url: "/transaction/#{@order.id}",
        category: :todo
      )
    when "completed"
      return head :forbidden unless @order.buyer_id == current_user.id
      save_review!(@order) if params[:rating].present?
      @order.update!(status: :completed)
      @order.item.update!(trading_status: :sold) if @order.item.trading?
      Notification.create_for!(
        user: @order.seller,
        actor: current_user,
        title: "取引が完了しました",
        body: "「#{@order.item.title}」の取引が完了しました。",
        action_url: "/transaction/#{@order.id}"
      )
    else
      return render json: { error: "無効なステータスです" }, status: :unprocessable_entity
    end

    render json: order_detail_json(@order)
  rescue PurchaseError => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  private

  class PurchaseError < StandardError; end

  def order_params
    params.permit(:item_id, :last_address_name, :last_address_detail, :payment_method, :address_id)
  end

  def validate_purchase!(item)
    raise PurchaseError, "自分の商品は購入できません" if item.user_id == current_user.id
    return validate_auction_orderless_purchase!(item) if item.auction?

    raise PurchaseError, "この商品は購入できません" unless item.listed?
    raise PurchaseError, "この商品はすでに注文されています" if item.order.present?
  end

  def validate_auction_orderless_purchase!(item)
    if item.order.present?
      raise PurchaseError, "落札者のみ購入できます" unless item.order.buyer_id == current_user.id
      raise PurchaseError, "この商品はすでに注文されています"
    end

    raise PurchaseError, "オークションはまだ終了していません" unless item.auction_ended?

    winning_bid = item.highest_bid
    raise PurchaseError, "入札がありません" unless winning_bid
    raise PurchaseError, "落札者のみ購入できます" unless winning_bid.user_id == current_user.id
  end

  def price_for_purchase!(item)
    return item.price unless item.auction?

    item.highest_bid.amount
  end

  def payable_existing_order_for(item)
    order = item.order
    return nil unless order&.waiting_payment?
    return nil unless order.buyer_id == current_user.id

    order
  end

  def validate_existing_order_checkout!(order)
    raise PurchaseError, "この注文は購入手続きできません" unless order.waiting_payment?
    raise PurchaseError, "注文者のみ購入手続きできます" unless order.buyer_id == current_user.id
  end

  def build_shipping_address
    if order_params[:address_id].present?
      address = current_user.addresses.find(order_params[:address_id])
      "#{address.name} #{address.address}"
    else
      name = order_params[:last_address_name].to_s.strip
      detail = order_params[:last_address_detail].to_s.strip
      raise PurchaseError, "配送先を入力してください" if name.blank? || detail.blank?
      "#{name} #{detail}"
    end
  end

  def order_status_for_payment(payment_method)
    payment_method == "ポイント" ? :waiting_shipping : :waiting_payment
  end

  def process_payment!(purchase_price, payment_method, order)
    raise PurchaseError, "ポイント決済のみ対応しています" unless payment_method == "ポイント"

    current_user.with_lock do
      raise PurchaseError, "残高が足りません" if current_user.points < purchase_price

      current_user.update!(points: current_user.points - purchase_price)
      record_wallet_transaction!(
        user: current_user,
        account: :points,
        kind: :purchase,
        amount: -purchase_price,
        order: order,
        description: "「#{order.item.title}」の購入"
      )
    end
  end

  def set_order
    @order = Order.find(params[:id])
    head :forbidden unless @order.buyer_id == current_user.id || @order.seller_id == current_user.id
  end

  def order_json(order)
    {
      id: order.id,
      item_id: order.item_id,
      item_title: order.item.title,
      item_image: order.item.images.attached? ? rails_blob_path(order.item.images.first, only_path: true) : nil,
      price: order.item.price,
      status: order.status,
      buyer_nickname: order.buyer.nickname,
      seller_nickname: order.seller.nickname,
      created_at: order.created_at
    }
  end

  def order_detail_json(order)
    buyer_review = order.reviews.find_by(reviewer_id: order.buyer_id)
    {
      id: order.id,
      item_id: order.item_id,
      item: {
        id: order.item.id,
        title: order.item.title,
        price: order.item.price,
        image: order.item.images.attached? ? rails_blob_path(order.item.images.first, only_path: true) : nil
      },
      buyer: { id: order.buyer.id, nickname: order.buyer.nickname },
      seller: { id: order.seller.id, nickname: order.seller.nickname },
      status: order.status,
      shipping_address: order.shipping_address,
      review: buyer_review && {
        rating: buyer_review.rating,
        comment: buyer_review.comment,
        created_at: buyer_review.created_at
      },
      created_at: order.created_at
    }
  end

  def save_review!(order)
    rating = params[:rating].to_s
    raise PurchaseError, "評価を選択してください" unless Review.ratings.key?(rating)

    review = order.reviews.find_or_initialize_by(reviewer: current_user)
    review.reviewee = order.seller
    review.rating = rating
    review.comment = params[:comment].to_s.strip
    review.save!
  end

  def record_wallet_transaction!(user:, account:, kind:, amount:, order:, description:)
    WalletTransaction.create!(
      user: user,
      order: order,
      account: account,
      kind: kind,
      amount: amount,
      balance_after: user.balance,
      points_after: user.points,
      description: description
    )
  end
end

class Admin::V1::OrdersController < Admin::V1::BaseController
  before_action :set_order, only: [:show, :update]
  before_action -> { authorize_admin_resource!(:orders, :read) }, only: [:index, :show]
  before_action -> { authorize_admin_resource!(:orders, :update) }, only: [:update]

  def index
    orders = Order.includes(:item, :buyer, :seller).order(created_at: :desc)
    render json: orders.map { |order| order_json(order) }
  end

  def show
    render json: order_detail_json(@order)
  end

  def update
    unless Order.statuses.key?(params[:status].to_s)
      return render_unprocessable("無効なステータスです。")
    end

    @order.update!(status: params[:status])
    @order.item.update!(trading_status: :sold) if @order.completed? && @order.item.trading?
    render json: order_detail_json(@order)
  end

  private

  def set_order
    @order = Order.includes(:item, :buyer, :seller, :messages, :reviews).find(params[:id])
  end

  def order_json(order)
    {
      id: order.id,
      itemId: order.item_id,
      itemTitle: order.item.title,
      price: order.item.price,
      status: order.status,
      buyer: order.buyer.nickname,
      seller: order.seller.nickname,
      shippingAddress: order.shipping_address,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    }
  end

  def order_detail_json(order)
    {
      **order_json(order),
      messagesCount: order.messages.size,
      review: order.reviews.first && {
        rating: order.reviews.first.rating,
        comment: order.reviews.first.comment
      }
    }
  end
end

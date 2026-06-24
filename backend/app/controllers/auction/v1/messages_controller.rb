class Auction::V1::MessagesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_order

  def index
    messages = @order.messages.includes(:user).order(created_at: :asc)
    render json: messages.map { |m| message_json(m) }
  end

  def create
    message = nil
    Message.transaction do
      message = @order.messages.create!(user: current_user, content: params[:content].to_s.strip)
      recipient = @order.buyer_id == current_user.id ? @order.seller : @order.buyer
      Notification.create_for!(
        user: recipient,
        actor: current_user,
        title: "取引メッセージが届きました",
        body: "「#{@order.item.title}」の取引に新しいメッセージがあります。",
        action_url: "/transaction/#{@order.id}"
      )
    end

    render json: message_json(message), status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  private

  def set_order
    @order = Order.find(params[:order_id])
    head :forbidden unless @order.buyer_id == current_user.id || @order.seller_id == current_user.id
  end

  def message_json(message)
    {
      id: message.id,
      content: message.content,
      user_id: message.user_id,
      user_nickname: message.user.nickname,
      created_at: message.created_at
    }
  end
end

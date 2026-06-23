class Auction::V1::NotificationsController < ApplicationController
  before_action :authenticate_user!

  def index
    AuctionSettlementService.settle_ended_auctions!

    notifications = current_user.notifications.recent.limit(100)
    notifications = notifications.where(category: params[:category]) if Notification.categories.key?(params[:category].to_s)

    render json: notifications.map { |notification| notification_json(notification) }
  end

  def update
    notification = current_user.notifications.find(params[:id])
    notification.update!(read_at: Time.current)
    render json: notification_json(notification)
  end

  private

  def notification_json(notification)
    {
      id: notification.id,
      title: notification.title,
      body: notification.body,
      action_url: notification.action_url,
      category: notification.category,
      read_at: notification.read_at,
      created_at: notification.created_at
    }
  end
end

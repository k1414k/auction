class Auction::V1::StatsController < ApplicationController
  def summary
    AuctionSettlementService.settle_ended_auctions!

    today = Time.zone.today
    yesterday = today - 1.day

    render json: {
      bids: {
        today: Bid.where(created_at: today.all_day).count,
        yesterday: Bid.where(created_at: yesterday.all_day).count
      },
      auctions: {
        today: auction_orders_count(today),
        yesterday: auction_orders_count(yesterday)
      }
    }
  end

  private

  def auction_orders_count(day)
    Order
      .joins(:item)
      .where(items: { sale_type: Item.sale_types[:auction] })
      .where(created_at: day.all_day)
      .count
  end
end

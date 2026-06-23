class AuctionSettlementService
  def self.settle_ended_auctions!
    new.call
  end

  def self.settle_item!(item)
    new.settle_item!(item)
  end

  def call
    Item
      .where(sale_type: Item.sale_types[:auction], trading_status: Item.trading_statuses[:listed])
      .where("end_at IS NOT NULL AND end_at <= ?", Time.current)
      .find_each { |item| settle_item!(item) }
  end

  def settle_item!(item)
    Order.transaction do
      locked_item = Item.lock.find(item.id)
      return locked_item.order if locked_item.order.present?
      return nil unless locked_item.auction? && locked_item.listed? && locked_item.auction_ended?

      winning_bid = locked_item.highest_bid
      return nil unless winning_bid

      order = Order.create!(
        item: locked_item,
        buyer: winning_bid.user,
        seller: locked_item.user,
        status: :waiting_payment
      )

      locked_item.update!(price: winning_bid.amount, trading_status: :trading)

      Notification.create_for!(
        user: winning_bid.user,
        actor: locked_item.user,
        title: "落札しました",
        body: "「#{locked_item.title}」を¥#{winning_bid.amount}で落札しました。購入手続きを進めてください。",
        action_url: "/items/#{locked_item.id}/checkout",
        category: :todo
      )
      Notification.create_for!(
        user: locked_item.user,
        actor: winning_bid.user,
        title: "オークションが終了しました",
        body: "「#{locked_item.title}」が¥#{winning_bid.amount}で落札されました。",
        action_url: "/transaction/#{order.id}"
      )

      order
    end
  end
end

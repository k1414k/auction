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
      unless winning_bid
        create_ended_without_bids_notification!(locked_item)
        return nil
      end

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
      losing_bidders(locked_item, winning_bid).each do |loser|
        Notification.create_for!(
          user: loser,
          actor: locked_item.user,
          title: "落札できませんでした",
          body: "「#{locked_item.title}」は¥#{winning_bid.amount}で落札されました。",
          action_url: "/items/#{locked_item.id}"
        )
      end

      order
    end
  end

  private

  def create_ended_without_bids_notification!(item)
    title = "入札なしでオークションが終了しました"
    action_url = "/items/#{item.id}/edit"
    return if item.user.notifications.exists?(title: title, action_url: action_url)

    Notification.create_for!(
      user: item.user,
      title: title,
      body: "「#{item.title}」は入札がないまま終了しました。",
      action_url: action_url,
      category: :todo
    )
  end

  def losing_bidders(item, winning_bid)
    User.where(id: item.bids.where.not(user_id: winning_bid.user_id).select(:user_id).distinct)
  end
end

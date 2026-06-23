class Admin::V1::DashboardController < Admin::V1::BaseController
  def index
    today = Time.zone.today
    current_window = 30.days.ago..Time.current
    previous_window = 60.days.ago...30.days.ago

    stats = {
      totalUsers: User.count,
      totalItems: Item.count,
      totalOrders: Order.count,
      totalRevenue: Order.joins(:item).sum("items.price"),
      growthRate: {
        users: growth_rate(User.where(created_at: current_window).count, User.where(created_at: previous_window).count),
        items: growth_rate(Item.where(created_at: current_window).count, Item.where(created_at: previous_window).count),
        orders: growth_rate(Order.where(created_at: current_window).count, Order.where(created_at: previous_window).count),
        revenue: growth_rate(
          Order.joins(:item).where(orders: { created_at: current_window }).sum("items.price"),
          Order.joins(:item).where(orders: { created_at: previous_window }).sum("items.price")
        )
      }
    }

    recent_orders = Order.includes(:item).order(created_at: :desc).limit(10).map do |order|
      {
        id: order.id,
        itemTitle: order.item.title,
        price: order.item.price,
        status: order.status,
        createdAt: order.created_at
      }
    end

    sales_trend = (6.days.ago.to_date..today).map do |day|
      orders = Order.joins(:item).where(orders: { created_at: day.all_day })
      {
        date: day.iso8601,
        orders: orders.count,
        revenue: orders.sum("items.price")
      }
    end

    recent_activities = recent_activities_json

    render json: {
      stats: stats,
      recent_orders: recent_orders,
      sales_trend: sales_trend,
      recent_activities: recent_activities
    }, status: :ok
  end

  private

  def growth_rate(current_count, previous_count)
    return current_count.positive? ? 100.0 : 0.0 if previous_count.to_i.zero?

    (((current_count.to_f - previous_count.to_f) / previous_count.to_f) * 100).round(1)
  end

  def recent_activities_json
    orders = Order.includes(:item).order(created_at: :desc).limit(5).map do |order|
      {
        id: "order-#{order.id}",
        title: "注文作成",
        body: "「#{order.item.title}」の注文が作成されました",
        createdAt: order.created_at
      }
    end

    bids = Bid.includes(:item).order(created_at: :desc).limit(5).map do |bid|
      {
        id: "bid-#{bid.id}",
        title: "入札",
        body: "「#{bid.item.title}」に¥#{bid.amount}の入札",
        createdAt: bid.created_at
      }
    end

    offers = Offer.includes(:item).order(created_at: :desc).limit(5).map do |offer|
      {
        id: "offer-#{offer.id}",
        title: "オファー",
        body: "「#{offer.item.title}」に¥#{offer.amount}のオファー",
        createdAt: offer.created_at
      }
    end

    (orders + bids + offers).sort_by { |activity| activity[:createdAt] }.reverse.first(10)
  end
end

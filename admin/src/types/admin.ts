// 管理者ユーザー型
export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  avatar?: string;
  lastLogin?: string;
  isActive: boolean;
}

// ダッシュボード統計
export interface DashboardStats {
  totalUsers: number;
  totalItems: number;
  totalOrders: number;
  totalRevenue: number;
  growthRate: {
    users: number;
    items: number;
    orders: number;
    revenue: number;
  };
}

// アイテム（商品）
export interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  status: 'active' | 'sold' | 'removed';
  seller: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

// ユーザー
export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'banned';
  createdAt: string;
  itemCount: number;
  orderCount: number;
}

// カテゴリ
export interface Category {
  id: number;
  name: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// 注文
export interface Order {
  id: number;
  userId: number;
  itemId: number;
  itemTitle: string;
  price: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// API レスポンス
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ページネーション
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// リスト形式のレスポンス
export interface ListResponse<T> {
  items: T[];
  pagination: Pagination;
}

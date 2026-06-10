// ナビゲーションメニュー項目
export interface NavItem {
  title: string;
  icon: string;
  to?: string;
  children?: NavItem[];
  badge?: number | string;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    title: 'ダッシュボード',
    icon: 'mdi-home-outline',
    to: '/dashboard'
  },
  {
    title: 'ユーザー',
    icon: 'mdi-account-multiple-outline',
    to: '/users'
  },
  {
    title: 'カテゴリ',
    icon: 'mdi-tag-outline',
    to: '/categories'
  },
  {
    title: '商品',
    icon: 'mdi-package-variant-outline',
    to: '/items'
  },
  {
    title: '注文',
    icon: 'mdi-cart-outline',
    to: '/orders'
  },
];

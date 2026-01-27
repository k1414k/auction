export type Item = {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  description: string;
  price: number;
  trading_status: "selling" | "sold";
  condition: string;
  images: string[];
  image: string;
  created_at: string;
  updated_at: string;
};

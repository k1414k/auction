export type User = {
  id?: number;
  email: string;
  name: string;
  nickname: string;
  balance: number;
  points: number;
  introduction: string;
  avatar_url: string | null;
  role: string;
};
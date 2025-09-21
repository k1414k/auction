// app/login/page.tsx
import AuthLayout from "@/components/AuthLayout";
import Link from "next/link";

export default function LoginPage() {
  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm mb-1">メールアドレス</label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">パスワード</label>
          <input
            type="password"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ログイン
        </button>
      </form>
      <div className="text-sm text-center text-gray-600 mt-4 space-y-1">
        <p>
          <Link href="/login/forgot-password" className="text-blue-600 hover:underline">
            パスワードをお忘れですか？
          </Link>
        </p>
        <p>
          アカウントがない？{" "}
          {/* <a href="/register" className="text-blue-600 hover:underline">
            新規登録
          </a> */}
        </p>
      </div>
    </AuthLayout>
  );
}

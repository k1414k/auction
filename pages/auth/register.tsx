// app/register/page.tsx
import AuthLayout from "@/components/AuthLayout";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-center mb-6">新規登録</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm mb-1">ユーザー名</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Your name"
          />
        </div>
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
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          登録する
        </button>
      </form>
      <p className="text-sm text-center text-gray-600 mt-4">
        すでにアカウントがありますか？{" "}
        <a href="/login" className="text-blue-600 hover:underline">
          ログイン
        </a>
      </p>
    </AuthLayout>
  );
}

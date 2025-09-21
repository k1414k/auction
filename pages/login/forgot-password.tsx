// app/forgot-password/page.tsx
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-center mb-6">パスワード再設定</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm mb-1">登録メールアドレス</label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="you@example.com"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition"
        >
          再設定リンクを送信
        </button>
      </form>
      <p className="text-sm text-center text-gray-600 mt-4">
        <a href="/login" className="text-blue-600 hover:underline">
          ログインに戻る
        </a>
      </p>
    </AuthLayout>
  );
}

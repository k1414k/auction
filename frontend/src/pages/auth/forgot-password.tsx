import AuthLayout from "@/components/AuthLayout"
import Link from "next/link"
import { FormEvent, useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error ?? "送信に失敗しました")
      setMessage(
        "登録済みのメールアドレスの場合、再設定リンクを送信しました。メールをご確認ください。"
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "送信に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-center mb-6">パスワード再設定</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1">登録メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>
        {message && (
          <p className="text-sm text-green-600 bg-green-50 p-2 rounded-lg">{message}</p>
        )}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
        >
          {loading ? "送信中..." : "再設定リンクを送信"}
        </button>
      </form>
      <p className="text-sm text-center text-gray-600 mt-4">
        <Link href="/auth/sign-in" className="text-blue-600 hover:underline">
          ログインに戻る
        </Link>
      </p>
    </AuthLayout>
  )
}

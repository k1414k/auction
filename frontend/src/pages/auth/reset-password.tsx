import AuthLayout from "@/components/AuthLayout"
import Link from "next/link"
import { useRouter } from "next/router"
import { FormEvent, useEffect, useState } from "react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [resetPasswordToken, setResetPasswordToken] = useState<string | null>(null)
  const [linkChecked, setLinkChecked] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (!router.isReady || resetPasswordToken) return

    const token = router.query.reset_password_token
    const value = Array.isArray(token) ? token[0] : token
    if (value) {
      setResetPasswordToken(value)
      void router.replace("/auth/reset-password", undefined, { shallow: true })
    }
    setLinkChecked(true)
  }, [resetPasswordToken, router])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!resetPasswordToken) {
      setError("再設定リンクが無効です")
      return
    }
    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください")
      return
    }
    if (password !== passwordConfirmation) {
      setError("確認用パスワードが一致しません")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          resetPasswordToken,
          password,
          passwordConfirmation,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error ?? "パスワードの変更に失敗しました")
      }

      setResetPasswordToken(null)
      setPassword("")
      setPasswordConfirmation("")
      setCompleted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "パスワードの変更に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  if (completed) {
    return (
      <AuthLayout>
        <h1 className="text-2xl font-bold text-center mb-6">パスワード変更完了</h1>
        <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
          新しいパスワードを設定しました。
        </p>
        <Link
          href="/auth/sign-in"
          className="mt-6 block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ログインする
        </Link>
      </AuthLayout>
    )
  }

  if (linkChecked && !resetPasswordToken) {
    return (
      <AuthLayout>
        <h1 className="text-2xl font-bold text-center mb-6">再設定リンクが無効です</h1>
        <p className="text-sm text-gray-600">
          リンクが古いか、有効期限が切れている可能性があります。もう一度メールを送信してください。
        </p>
        <Link
          href="/auth/forgot-password"
          className="mt-6 block w-full bg-yellow-600 text-white text-center py-2 rounded-lg hover:bg-yellow-700 transition"
        >
          再設定メールを送る
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-center mb-6">新しいパスワードを設定</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1">新しいパスワード</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            autoComplete="new-password"
            minLength={6}
            required
          />
          <p className="text-xs text-gray-500 mt-1">6文字以上で入力してください</p>
        </div>
        <div>
          <label className="block text-sm mb-1">新しいパスワード（確認）</label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !resetPasswordToken}
          className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
        >
          {loading ? "変更中..." : "パスワードを変更"}
        </button>
      </form>
    </AuthLayout>
  )
}

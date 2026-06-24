import type { NextApiRequest, NextApiResponse } from "next"
import { clearAuthCookies, createApi } from "@/lib/axios"

type ResetPasswordBody = {
  resetPasswordToken?: unknown
  password?: unknown
  passwordConfirmation?: unknown
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT")
    return res.status(405).end()
  }

  const body = req.body as ResetPasswordBody
  const resetPasswordToken =
    typeof body.resetPasswordToken === "string" ? body.resetPasswordToken : ""
  const password = typeof body.password === "string" ? body.password : ""
  const passwordConfirmation =
    typeof body.passwordConfirmation === "string"
      ? body.passwordConfirmation
      : ""

  if (!resetPasswordToken) {
    return res.status(422).json({ error: "再設定リンクが無効です" })
  }
  if (password.length < 6) {
    return res.status(422).json({ error: "パスワードは6文字以上で入力してください" })
  }
  if (password !== passwordConfirmation) {
    return res.status(422).json({ error: "確認用パスワードが一致しません" })
  }

  const api = createApi(req, res)
  try {
    await api.put("/auth/password", {
      reset_password_token: resetPasswordToken,
      password,
      password_confirmation: passwordConfirmation,
    })

    // Password reset should return the user to the normal sign-in flow rather
    // than retaining the temporary authentication token issued by the gem.
    clearAuthCookies(res)
    return res.status(200).json({ message: "パスワードを変更しました" })
  } catch (e: unknown) {
    const err = e as {
      response?: {
        status: number
        data?: { errors?: string[] | Record<string, string[]>; error?: string }
      }
    }
    const status = err.response?.status ?? 500
    const data = err.response?.data
    const errors = data?.errors
    const firstError =
      Array.isArray(errors)
        ? errors[0]
        : errors && typeof errors === "object"
          ? Object.values(errors).flat()[0]
          : undefined
    const message =
      data?.error ??
      firstError ??
      (status === 401
        ? "再設定リンクが無効か、有効期限が切れています"
        : "パスワードの変更に失敗しました")

    clearAuthCookies(res)
    return res.status(status).json({ error: message })
  }
}

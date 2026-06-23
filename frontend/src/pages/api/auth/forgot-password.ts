import type { NextApiRequest, NextApiResponse } from "next"
import { createApi } from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end()

  const api = createApi(req, res)
  try {
    const redirectUrl =
      `${req.headers.origin ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"}/auth/sign-in`
    const apiRes = await api.post("/auth/password", {
      email: req.body?.email,
      redirect_url: redirectUrl,
    })
    return res.status(200).json(apiRes.data)
  } catch (e: unknown) {
    const err = e as { response?: { status: number; data?: { errors?: string[]; error?: string } } }
    const status = err.response?.status ?? 500
    const data = err.response?.data
    const message = data?.error ?? data?.errors?.[0] ?? "再設定メールの送信に失敗しました"
    return res.status(status).json({ error: message })
  }
}

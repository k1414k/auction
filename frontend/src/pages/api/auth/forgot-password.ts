import type { NextApiRequest, NextApiResponse } from "next"
import { createApi } from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).end()
  }

  const email = typeof req.body?.email === "string" ? req.body.email.trim() : ""
  if (!email) {
    return res.status(422).json({ error: "メールアドレスを入力してください" })
  }

  const api = createApi(req, res)
  try {
    const apiRes = await api.post("/auth/password", { email })
    return res.status(200).json(apiRes.data)
  } catch (e: unknown) {
    const err = e as { response?: { status: number; data?: { errors?: string[]; error?: string } } }
    const status = err.response?.status ?? 500
    const data = err.response?.data
    const message = data?.error ?? data?.errors?.[0] ?? "再設定メールの送信に失敗しました"
    return res.status(status).json({ error: message })
  }
}

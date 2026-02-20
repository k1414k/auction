import type { NextApiRequest, NextApiResponse } from "next"
import { createRailsApi, authHeaders } from "@/lib/rails-api"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).end()
  }

  const api = createRailsApi(req, res)
  try {
    const { amount, type } = req.body
    if (amount == null || type == null) {
      return res.status(400).json({ error: "amount と type を指定してください" })
    }
    const apiRes = await api.patch(
      "/v1/user/wallet",
      { amount: Number(amount), type: String(type) },
      { headers: authHeaders(req) }
    )
    return res.status(200).json(apiRes.data)
  } catch (e: unknown) {
    const err = e as { response?: { status: number; data?: { error?: string } } }
    const status = err.response?.status ?? 500
    const message = err.response?.data?.error ?? "更新に失敗しました"
    return res.status(status).json({ error: message })
  }
}

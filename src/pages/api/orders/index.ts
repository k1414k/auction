import type { NextApiRequest, NextApiResponse } from "next"
import { createRailsApi, authHeaders } from "@/lib/rails-api"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end()

  const api = createRailsApi(req, res)
  try {
    const apiRes = await api.post(`/v1/orders`, req.body, {
      headers: authHeaders(req),
    })
    return res.status(200).json(apiRes.data)
  } catch (e: unknown) {
    const err = e as { response?: { status: number; data?: { error?: string } } }
    const status = err.response?.status ?? 500
    const message = err.response?.data?.error ?? "購入処理中にエラーが発生しました"
    return res.status(status).json({ error: message })
  }
}

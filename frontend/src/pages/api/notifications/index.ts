import type { NextApiRequest, NextApiResponse } from "next"
import { createApi } from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const api = createApi(req, res)
  try {
    if (req.method === "GET") {
      const category = typeof req.query.category === "string" ? req.query.category : undefined
      const apiRes = await api.get("/auction/v1/notifications", { params: { category } })
      return res.status(200).json(apiRes.data)
    }
    return res.status(405).end()
  } catch (e: unknown) {
    const err = e as { response?: { status: number; data?: { error?: string } } }
    return res.status(err.response?.status ?? 500).json({ error: err.response?.data?.error ?? "通知の取得に失敗しました" })
  }
}

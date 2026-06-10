import type { NextApiRequest, NextApiResponse } from "next"
import { createApi } from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const api = createApi(req, res)
  try {
    if (req.method === "GET") {
      const role = typeof req.query.role === "string" ? req.query.role : undefined
      const apiRes = await api.get("/auction/v1/orders", { params: { role } })
      return res.status(200).json(apiRes.data)
    }
    if (req.method === "POST") {
      const apiRes = await api.post("/auction/v1/orders", req.body)
      return res.status(200).json(apiRes.data)
    }
    return res.status(405).end()
  } catch (e: unknown) {
    const err = e as { response?: { status: number; data?: { error?: string } } }
    const status = err.response?.status ?? 500
    const message = err.response?.data?.error ?? "処理中にエラーが発生しました"
    return res.status(status).json({ error: message })
  }
}

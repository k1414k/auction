import type { NextApiRequest, NextApiResponse } from "next"
import { createApi } from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  if (typeof id !== "string") return res.status(400).json({ error: "Invalid order id" })

  const api = createApi(req, res)
  try {
    if (req.method === "GET") {
      const apiRes = await api.get(`/auction/v1/orders/${id}`)
      return res.status(200).json(apiRes.data)
    }
    if (req.method === "PATCH") {
      const apiRes = await api.patch(`/auction/v1/orders/${id}`, req.body)
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

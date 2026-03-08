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
      const apiRes = await api.get(`/auction/v1/orders/${id}/messages`)
      return res.status(200).json(apiRes.data)
    }
    if (req.method === "POST") {
      const apiRes = await api.post(`/auction/v1/orders/${id}/messages`, req.body)
      return res.status(apiRes.status).json(apiRes.data)
    }
    return res.status(405).end()
  } catch (e: unknown) {
    const err = e as { response?: { status: number; data?: { error?: string; errors?: string[] } } }
    const status = err.response?.status ?? 500
    const data = err.response?.data
    const message = data?.error ?? (Array.isArray(data?.errors) ? data.errors[0] : null) ?? "処理中にエラーが発生しました"
    return res.status(status).json({ error: message })
  }
}

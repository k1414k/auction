import type { NextApiRequest, NextApiResponse } from "next"
import { createApi } from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid id" })
  }

  const api = createApi(req, res)
  try {
    if (req.method === "GET") {
      const apiRes = await api.get(`/auction/v1/items/${id}`)
      return res.status(200).json({ data: apiRes.data })
    }
    if (req.method === "PATCH") {
      const apiRes = await api.patch(`/auction/v1/items/${id}`, req.body)
      return res.status(200).json({ data: apiRes.data })
    }
    if (req.method === "DELETE") {
      await api.delete(`/auction/v1/items/${id}`)
      return res.status(200).json({ success: true })
    }
    return res.status(405).end()
  } catch (e: unknown) {
    const err = e as { response?: { status: number; data?: { error?: string; errors?: string[] } } }
    const status = err.response?.status ?? 500
    const data = err.response?.data
    const message = data?.error ?? (Array.isArray(data?.errors) ? data.errors[0] : null) ?? "処理に失敗しました"
    return res.status(status).json({ error: message })
  }
}

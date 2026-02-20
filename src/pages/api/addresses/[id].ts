import type { NextApiRequest, NextApiResponse } from "next"
import { createRailsApi, authHeaders } from "@/lib/rails-api"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid id" })
  }

  const api = createRailsApi(req, res)

  if (req.method === "PATCH" || req.method === "PUT") {
    try {
      const apiRes = await api.patch(`/v1/addresses/${id}`, req.body, {
        headers: authHeaders(req),
      })
      return res.status(200).json(apiRes.data)
    } catch (e: unknown) {
      const err = e as { response?: { status: number; data?: { errors?: string[] } } }
      const status = err.response?.status ?? 500
      const message = err.response?.data?.errors?.join(", ") ?? "更新に失敗しました"
      return res.status(status).json({ error: message })
    }
  }

  if (req.method === "DELETE") {
    try {
      await api.delete(`/v1/addresses/${id}`, {
        headers: authHeaders(req),
      })
      return res.status(204).end()
    } catch (e: unknown) {
      const err = e as { response?: { status: number } }
      const status = err.response?.status ?? 500
      return res.status(status).json({ error: "削除に失敗しました" })
    }
  }

  return res.status(405).end()
}

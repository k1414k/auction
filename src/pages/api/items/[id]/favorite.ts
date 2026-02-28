import type { NextApiRequest, NextApiResponse } from "next"
import { createRailsApi, authHeaders } from "@/lib/rails-api"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method !== "PUT") return res.status(405).end()

    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const api = createRailsApi(req, res)
    try {
      const apiRes = await api.put(`/auction/v1/favorites/${id}`, {}, {
        headers: authHeaders(req),
      })
      return res.status(200).json({ data: apiRes.data })
    } catch {
      return res.status(401).json({ error: "お気に入りの更新に失敗しました" })
    }
}

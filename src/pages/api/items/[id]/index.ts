import type { NextApiRequest, NextApiResponse } from "next"
import { createRailsApi, authHeaders } from "@/lib/rails-api"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method !== "GET") return res.status(405).end()

    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const api = createRailsApi(req, res)
    try {
      const apiRes = await api.get(`/v1/items/${id}`, { headers: authHeaders(req) })
      return res.status(200).json({ data: apiRes.data })
    } catch {
      return res.status(500).json({ error: 'Failed to fetch item' })
    }
}

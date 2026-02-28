import type { NextApiRequest, NextApiResponse } from "next"
import { createRailsApi, authHeaders } from "@/lib/rails-api"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method !== "GET") return res.status(405).end()

    const api = createRailsApi(req, res)
    try {
      const apiRes = await api.get("/auction/v1/items", { headers: authHeaders(req) })
      return res.status(200).json({ data: apiRes.data })
    } catch {
      return res.status(500).json({ error: 'Failed to fetch items' })
    }
}



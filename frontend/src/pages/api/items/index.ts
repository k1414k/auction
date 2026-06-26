import type { NextApiRequest, NextApiResponse } from "next"
import { createApi } from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end()

  const api = createApi(req, res)
  try {
    const params = {
      q: typeof req.query.q === "string" ? req.query.q : undefined,
      category: typeof req.query.category === "string" ? req.query.category : undefined,
      limit: typeof req.query.limit === "string" ? req.query.limit : undefined,
    }
    const apiRes = await api.get("/auction/v1/items", { params })
    return res.status(200).json({ data: apiRes.data })
  } catch {
    return res.status(500).json({ error: "Failed to fetch items" })
  }
}

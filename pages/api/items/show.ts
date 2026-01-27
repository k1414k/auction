import type { NextApiRequest, NextApiResponse } from "next"
import api from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method !== "GET") return res.status(405).end()

    try {
      const apiRes = await api.get(
        `/v1/item1s/${req}`,
      )
  
      return res.status(200).json({ data: apiRes.data })
    } catch (e) {
      return res.status(401).json({ error: e })
    }
}

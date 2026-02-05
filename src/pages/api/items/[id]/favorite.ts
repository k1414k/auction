import type { NextApiRequest, NextApiResponse } from "next"
import api from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method !== "PUT") return res.status(405).end()

    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    try {
      const apiRes = await api.put(
        `/v1/favorites/${id}`,{},
        {
          headers: {
                'access-token': req.cookies['access-token'],
                client: req.cookies['client'],
                uid: req.cookies['uid']
            }
        }
      )
  
      return res.status(200).json({ data: apiRes.data })
    } catch (e) {
      return res.status(401).json({ error: e })
    }
}

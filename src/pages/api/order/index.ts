import type { NextApiRequest, NextApiResponse } from "next"
import api from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method !== "POST") return res.status(405).end()

    try {
      const apiRes = await api.post(
        `/v1/orders`,{
          ////
        },
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

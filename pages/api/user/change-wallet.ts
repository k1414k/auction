import type { NextApiRequest, NextApiResponse } from "next"
import api from "@/lib/axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).end()
  }

  try {
    const { amount, type } = req.body
        
    const apiRes = await api.patch(
      "/v1/user/wallet",
      { 
        amount: amount,
        type: type
      },
      {
        headers: {
          "access-token": req.cookies["access-token"],
          client: req.cookies["client"],
          uid: req.cookies["uid"],
        },
      }
    )

    return res.status(200).json({ user: apiRes.data.data })
  } catch (e) {
    return res.status(401).json({ error: "update failed" })
  }
}

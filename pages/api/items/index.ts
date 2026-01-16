import type { NextApiRequest, NextApiResponse } from "next"
import api from "@/lib/axios"

type Items = {
  id: number;
  user_id: number;
  category_id: number;
  name: string;

  description: string;
  price: number;
  trading_status: string;
  created_at: string;
  updated_at: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const apiRes = await api.get(
        "/v1/items",
      )
  
      return res.status(200).json({ data: apiRes.data })
    } catch (e) {
      return res.status(401).json({ error: e })
    }
  }
  else if (req.method === "POST"){
    try {
      const {
        category_id, name, description, price
      } = req.body

      const apiRes = await api.post(
        "/v1/items",
        {
          category_id, name, description, price
        },
        {
          headers: {
            'access-token': req.cookies['access-token'],
            client: req.cookies['client'],
            uid: req.cookies['uid']
          },  
        },
        
      )
  
      return res.status(200).json({ data: apiRes.data })
    } catch (e) {
      return res.status(401).json({ error: e })
    }
  }
  else {
    return res.status(405).end()
  }

}

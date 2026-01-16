import type { NextApiRequest, NextApiResponse } from 'next'
import api from "@/lib/axios";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).end()
    }

    try {
        const apiRes = await api.get('/v1/user', {
            headers: {
                'access-token': req.cookies['access-token'],
                client: req.cookies['client'],
                uid: req.cookies['uid']
            },
        })

        return res.status(200).json({ user: apiRes.data })//なぜdataのとこ消すと401になる？
    } catch (e) {
        return res.status(401).json(e)
    }
}

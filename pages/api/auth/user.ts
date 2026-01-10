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
        // ブラウザから送られてきた Cookie を取得
        const accessToken = req.cookies['access-token']
        const client = req.cookies['client']
        const uid = req.cookies['uid']


        const apiRes = await api.get('/v1/user', {
            headers: {
                'access-token': accessToken,
                client,
                uid,
            },
        })

        return res.status(200).json({ user: apiRes.data })//なぜdataのとこ消すと401になる？
    } catch (e) {
        return res.status(401).json(e)
    }
}

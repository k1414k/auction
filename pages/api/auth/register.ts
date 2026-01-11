import type { NextApiRequest, NextApiResponse } from 'next'
import api from "@/lib/axios";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).end()
    }

    try {
        const { name, email, password, password_confirmation } = req.body

        const apiRes = await api.post(
            '/auth',
            { name, email, password, password_confirmation },
        )

        return res.status(200).json({ user: apiRes.data })
    } catch (e) {
        return res.status(401).json({e})
    }
}

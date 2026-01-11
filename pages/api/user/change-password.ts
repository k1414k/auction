import type { NextApiRequest, NextApiResponse } from 'next'
import api from "@/lib/axios";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'PUT') {
        return res.status(405).end()
    }

    try {
        // ブラウザから送られてきた Cookie を取得
        const accessToken = req.cookies['access-token']
        const client = req.cookies['client']
        const uid = req.cookies['uid']
        const {currentPassword, newPassword, newPassswordConfirmation} = req.body

        const apiRes = await api.put('/auth', {
              current_password: currentPassword,
              password: newPassword,
              password_confirmation: newPassswordConfirmation
            },
            {
                headers: {
                    'access-token': accessToken,
                    client,
                    uid,
                },
            } 
        )

        return res.status(200).json({ user: apiRes.data })//なぜdataのとこ消すと401になる？
    } catch (e) {
        return res.status(401).json({errors: e?.response?.data})
    }
}

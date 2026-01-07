import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).end()
    }

    try {
        const { email, password } = req.body

        // Rails にログインリクエスト
        const apiRes = await axios.post(
            'http://localhost:3000/auth/sign_in',
            { email, password }
        )

        // 🔑 Railsの認証ヘッダを Cookie に保存
        res.setHeader('Set-Cookie', [
            `access-token=${apiRes.headers['access-token']}; Path=/; HttpOnly`,
            `client=${apiRes.headers['client']}; Path=/; HttpOnly`,
            `uid=${apiRes.headers['uid']}; Path=/; HttpOnly`,
        ])

        return res.status(200).json({ user: apiRes.data.data })
    } catch (e) {
        return res.status(401).json({
            message: 'メールアドレスまたはパスワードが違います',
        })
    }
}

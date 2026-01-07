import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";
import apiServer from "@/lib/axios/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Cookieをパース
        const cookies = cookie.parse(req.headers.cookie ?? "")
        const accessToken = cookies["access-token"]
        const client = cookies["client"]
        const uid = cookies["uid"]

        if (!accessToken || !client || !uid){
            return res.status(401).end()
        }

        const apiResponse = await apiServer.get("/auth/validate_token", {
            headers: {
                "access-token": accessToken,
                client: client,
                uid: uid
            }
        })

        return  res.status(200).json(apiResponse.data)

    } catch {
        return res.status(400).end()
    }
}
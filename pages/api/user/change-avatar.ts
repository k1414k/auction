import type { NextApiRequest, NextApiResponse } from "next"
import api from "@/lib/axios"
import formidable from "formidable"
import fs from "fs"
import FormData from "form-data"

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).end()
  }

  const form = formidable({})

  try {
    const [fields, files] = await form.parse(req)
    const avatar =
      Array.isArray(files.avatar) ? files.avatar[0] : files.avatar

    if (!avatar) {
      return res.status(400).json({ error: "no avatar" })
    }

    const railsForm = new FormData()
    railsForm.append(
      "avatar",
      fs.createReadStream(avatar.filepath),
      avatar.originalFilename || "avatar.png"
    )

    const apiRes = await api.patch(
      "/v1/user/avatar",
      railsForm,
      {
        headers: {
          ...railsForm.getHeaders(),
          "access-token": req.cookies["access-token"],
          client: req.cookies["client"],
          uid: req.cookies["uid"],
        },
      }
    )

    return res.status(200).json(apiRes.data)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: "upload failed" })
  }
}

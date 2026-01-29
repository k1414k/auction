import type { NextApiRequest, NextApiResponse } from "next"
import formidable, { File } from "formidable"
import fs from "fs"
import FormData from "form-data"
import api from "@/lib/axios"

export const config = {
  api: { bodyParser: false },
}

// Rails 認証ヘッダ
const authHeaders = (req: NextApiRequest) => ({
  "access-token": req.cookies["access-token"] || "",
  client: req.cookies["client"] || "",
  uid: req.cookies["uid"] || "",
})

// fields を string に正規化する helper
const getField = (field?: string | string[]) =>
  Array.isArray(field) ? field[0] : field ?? ""

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end()
  }
  
  try {
    // ① multipart を解析
    const form = formidable({ maxFileSize: 5 * 1024 * 1024 })
    const [fields, files] = await form.parse(req)

    // ② Rails 用 FormData
    const railsForm = new FormData()
    // --- text fields ---
    railsForm.append("item[title]", getField(fields.title))
    railsForm.append("item[description]", getField(fields.description))
    railsForm.append("item[price]", getField(fields.price))
    railsForm.append("item[category_id]", getField(fields.category_id))
    railsForm.append("item[condition]", getField(fields.condition))

    // --- images ---
    const images: File[] = files.images
      ? Array.isArray(files.images)
        ? files.images
        : [files.images]
      : []

    images.forEach((img) => {
      railsForm.append(
        "item[images][]",
        fs.createReadStream(img.filepath),
        img.originalFilename || "image.png"
      )})

    // ③ Rails API へ中継
    const apiRes = await api.post("/v1/items", railsForm, {
      headers: {
        ...railsForm.getHeaders(),
        ...authHeaders(req),
      },
    })

    return res.status(201).json(apiRes.data)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: "item create failed" })
  }
}
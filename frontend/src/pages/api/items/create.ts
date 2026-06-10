import type { NextApiRequest, NextApiResponse } from "next"
import formidable, { File } from "formidable"
import fs from "fs"
import FormData from "form-data"
import { createApi } from "@/lib/axios"

export const config = {
  api: { bodyParser: false },
}

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
    const form = formidable({ maxFileSize: 5 * 1024 * 1024 })
    const [fields, files] = await form.parse(req)

    const railsForm = new FormData()
    railsForm.append("item[title]", getField(fields.title))
    railsForm.append("item[description]", getField(fields.description))
    railsForm.append("item[price]", getField(fields.price))
    railsForm.append("item[category_id]", getField(fields.category_id))
    railsForm.append("item[condition]", getField(fields.condition))
    railsForm.append("item[sale_type]", getField(fields.sale_type) || "0")
    if (getField(fields.sale_type) === "1") {
      railsForm.append("item[start_price]", getField(fields.start_price) || getField(fields.price))
      railsForm.append("item[end_at]", getField(fields.end_at))
      railsForm.append("item[min_increment]", getField(fields.min_increment) || "100")
    }

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
      )
    })

    const api = createApi(req, res)
    const apiRes = await api.post("/auction/v1/items", railsForm, {
      headers: railsForm.getHeaders(),
    })
    return res.status(201).json(apiRes.data)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: "item create failed" })
  }
}

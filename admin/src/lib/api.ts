import axios from 'axios'

/* NEXT API を呼び出すときは lib/fetch　ファイルを参照する */
const api = axios.create({
    baseURL: process.env.NUXT_PUBLIC_API_BASE || process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true
})

export default api

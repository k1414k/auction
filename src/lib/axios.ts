import axios from "axios";

/* NEXT API を呼び出すときは lib/fetch　ファイルを参照する */
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // .env
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true
})

export default api
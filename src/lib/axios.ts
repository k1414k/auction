import axios from "axios";

/* NEXT API を呼び出すときは lib/fetch　ファイルを参照する */
const api = axios.create({
    baseURL: process.env.INTERNAL_API_BASE_URL, // .env , .docker-compose
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true
})

export default api
import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // .env.local
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // 必要オプション?意味は？
})

export default api
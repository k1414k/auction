import AuthLayout from "@/components/AuthLayout";
import Link from "next/link";
import api from "@/lib/axios";
import {useState} from "react";


export default function LoginPage() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState('')
  const formData = {
    email: email,
    password: password,
  }
  const checkData = async () => {
    // if (!validateData()) return

    try {
      setErrors("")

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error()
      }

      window.location.href = "/"
    } catch {
      setErrors("メールアドレスとパスワードが違います")
    }
  }
  // const validateData = () => { //異常ない場合true
  //   const newErrors:string[] = []
  //
  //   if (email.trim().length < 4){
  //     newErrors.push("正しいメールアドレスを入力してください")
  //   }
  //   if (password.trim().length < 6){
  //     newErrors.push("パスワードは６文字以上必要です")
  //   }
  //
  //   setErrors(newErrors)
  //   return newErrors.length === 0
  // }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm mb-1">メールアドレス</label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="your@example.com"
            onChange={e=>setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">パスワード</label>
          <input
            type="password"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="••••••••"
            onChange={e=>setPassword(e.target.value)}
          />
        </div>
        <button
            type="button"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={checkData}
        >
          ログイン
        </button>
      </form>
      <div className="text-sm text-center text-gray-600 mt-4 space-y-1">
        <p>
          <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
            パスワードをお忘れですか？
          </Link>
        </p>
        <p>
          アカウントがない？{" "}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

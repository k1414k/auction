// app/register/page.tsx
import AuthLayout from "@/components/AuthLayout";
import { useUserStore } from "@/stores/userStore";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { nextApi } from "@/lib/fetch";
import { User } from "@/types/user";

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setErrors([]);

      type RegisterResponse = { user: User };
      const data = await nextApi<typeof form, RegisterResponse>("/auth/register", {
        method: "POST",
        body: form,
      });

      // 登録成功直後に store へ保存（/auth/user と同じ形の User 型を想定）
      setUser(data.user);

      // プロフィールへ遷移
      router.replace("/user/profile");
    } catch (error) {
      console.error(error);
      setErrors(["このメールアドレスは使用できません"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (form.name.trim().length < 4) {
      newErrors.push("ユーザー名は4文字以上必要です");
    }

    if (!form.email.includes("@") || form.email.trim().length < 4) {
      newErrors.push("正しいメールアドレスを入力してください");
    }

    if (form.password.trim().length < 6) {
      newErrors.push("パスワードは6文字以上必要です");
    }

    if (form.password !== form.password_confirmation) {
      newErrors.push("パスワード確認が一致しません");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-center mb-6">新規登録</h1>

      {errors.length > 0 && (
        <div className="p-3 bg-red-100 mb-4 text-red-600 rounded-lg">
          <ul className="list-disc pl-5">
            {errors.map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1">名前</label>
          <input
            type="text"
            value={form.name}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Your name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">メールアドレス</label>
          <input
            type="email"
            value={form.email}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="you@example.com"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">パスワード</label>
          <input
            type="password"
            value={form.password}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="••••••••"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">パスワード確認</label>
          <input
            type="password"
            value={form.password_confirmation}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="••••••••"
            onChange={(e) =>
              setForm({ ...form, password_confirmation: e.target.value })
            }
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "登録中..." : "登録する"}
        </button>
      </form>

      <p className="text-sm text-center text-gray-600 mt-4">
        すでにアカウントがありますか？{" "}
        <Link href="/auth/sign-in" className="text-blue-600 hover:underline">
          ログイン
        </Link>
      </p>
    </AuthLayout>
  );
}
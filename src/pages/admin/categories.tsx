// pages/admin/categories.tsx
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, X } from "lucide-react";

export default function AdminCategories() {
    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">カテゴリ管理</h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* List */}
                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <h2 className="font-semibold mb-4 text-gray-700">登録済みカテゴリ</h2>
                    <ul className="space-y-2">
                        {["レディース", "メンズ", "ベビー・キッズ", "インテリア", "本・音楽・ゲーム"].map((cat) => (
                            <li key={cat} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group">
                                <span className="text-sm font-medium">{cat}</span>
                                <button className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Add New */}
                <div className="h-fit bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="font-semibold mb-4 text-gray-700">新規作成</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">カテゴリ名</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="例: スポーツ・レジャー"
                            />
                        </div>
                        <button className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center justify-center gap-2">
                            <Plus size={16} />
                            追加する
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
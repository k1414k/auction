// pages/admin/items.tsx
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Search, Trash2, Eye } from "lucide-react";

export default function AdminItems() {
    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">商品管理</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="商品名・IDで検索"
                        className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b text-gray-500">
                        <tr>
                            <th className="px-4 py-3 w-16">画像</th>
                            <th className="px-4 py-3">商品名 / 出品者</th>
                            <th className="px-4 py-3">価格</th>
                            <th className="px-4 py-3">状態</th>
                            <th className="px-4 py-3 text-right">操作</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <tr key={item} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded object-cover" />
                                    {/* <Image ... /> */}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900">iPhone 13 Pro Max</div>
                                    <div className="text-xs text-gray-500">User_id: 402</div>
                                </td>
                                <td className="px-4 py-3 font-medium">¥98,000</td>
                                <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      販売中
                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button className="text-gray-400 hover:text-blue-600 mx-2">
                                        <Eye size={18} />
                                    </button>
                                    <button className="text-gray-400 hover:text-red-600">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
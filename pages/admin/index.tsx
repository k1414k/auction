// pages/admin/index.tsx (Dashboard)
import {AdminLayout} from "@/components/admin/AdminLayout";
import {DollarSign, Users, Package, ShoppingBag} from "lucide-react";

export default function AdminDashboard() {
    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">ダッシュボード</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="総売上" value="¥1,204,000" icon={DollarSign} color="text-green-600"/>
                <StatCard label="総ユーザー" value="342人" icon={Users} color="text-blue-600"/>
                <StatCard label="出品数" value="1,890件" icon={Package} color="text-orange-600"/>
                <StatCard label="成立取引" value="450件" icon={ShoppingBag} color="text-purple-600"/>
            </div>

            {/* Recent Orders (簡易版) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-700 mb-4">最近の取引</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-3">Order ID</th>
                            <th className="px-4 py-3">商品名</th>
                            <th className="px-4 py-3">価格</th>
                            <th className="px-4 py-3">ステータス</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/* APIから取得したデータでmapする */}
                        {[1, 2, 3].map((i) => (
                            <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">#100{i}</td>
                                <td className="px-4 py-3">ヴィンテージカメラ</td>
                                <td className="px-4 py-3">¥12,000</td>
                                <td className="px-4 py-3">
                                    <span
                                        className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">完了</span>
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

interface StatCardProps {
    label?: string
}

function StatCard({label, value, icon: Icon, color}: any) {
    return (
        <div
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className={`p-3 rounded-full bg-gray-50 mb-3 ${color}`}>
                <Icon size={24}/>
            </div>
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-xl font-bold text-gray-800">{value}</div>
        </div>
    );
}
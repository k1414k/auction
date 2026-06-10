import React, { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Package, List, Menu, X, Users } from "lucide-react";

const NAV_ITEMS = [
    { label: "ダッシュボード", href: "/admin", icon: LayoutDashboard },
    { label: "商品管理", href: "/admin/items", icon: Package },
    { label: "カテゴリ管理", href: "/admin/categories", icon: List },
    { label: "ユーザー管理", href: "/admin/users", icon: Users },
];

// 別途のドメインを利用/参考

export function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0
      `}>
                <div className="p-6 font-bold text-xl border-b border-slate-700 flex justify-between items-center">
                    <span>Admin Panel</span>
                    <button onClick={() => setIsOpen(false)} className="md:hidden">
                        <X size={24} />
                    </button>
                </div>
                <nav className="p-4 space-y-2">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition text-sm"
                            onClick={() => setIsOpen(false)}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="bg-white shadow-sm p-4 md:hidden flex items-center">
                    <button onClick={() => setIsOpen(true)}>
                        <Menu size={24} className="text-gray-600" />
                    </button>
                    <span className="ml-4 font-bold text-gray-800">管理画面</span>
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
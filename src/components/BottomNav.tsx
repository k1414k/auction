import Link from "next/link";
import { useRouter } from "next/router";
import {
  House,
  Heart,
  Search,
  CircleUser,
  CameraIcon,
} from "lucide-react";

export function BottomNav() {
  const { pathname } = useRouter()
  const navItems = [
    { href: "/", label: "ホーム", icon: House },
    { href: "/search", label: "探す", icon: Search },
    { href: "/sell", label: "出品", icon: CameraIcon },
    { href: "/favorites", label: "いいね", icon: Heart },
    { href: "/user/profile", label: "マイページ", icon: CircleUser },
  ]


  return (
    <nav className="fixed z-50 bg-white/20 border shadow-lg transition-all
          /* 【スマホ (デフォルト)】 
            位置: 上 (top-20), 左 (left-20)
            形状: 四角 (rounded-md)
          */
          top-20 left-20 rounded-md

          /* 【PC (md以上)】 
            位置リセット: top指定を解除 (top-auto), 左指定を解除して中央へ
            位置: 下 (bottom-4)
            形状: 丸 (rounded-full)
          */
          md:top-auto md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:rounded-full
        ">
      <div className="
        /* スマホ: 縦並び (grid) */
        grid gap-4 p-2

        /* PC: 横並び (flex) */
        md:flex md:items-center md:gap-2 md:p-1
      ">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link key={label} href={href}>
              <div
              className={`
                  flex flex-col items-center justify-center transition
                  
                  /* アイコン枠のサイズと形状 */
                  /* スマホ: 四角 */
                  w-14 h-12 rounded-md
                  
                  /* PC: 丸 */
                  md:w-20 md:h-14 md:rounded-full
                  
                  ${
                    isActive
                      ? "bg-gray-200 text-black font-bold"
                      : "text-slate-500 hover:text-black"
                  }
                `}
              >
                <Icon size={20} />
                <span className="text-[10px] leading-tight">
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>

  );
}

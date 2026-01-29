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
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2
      max-w-screen-sm bg-white/20 border rounded-full shadow-lg z-50 py-0.5">
      <div className="flex justify-between px-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link key={label} href={href}>
              <div
                className={`
                  flex flex-col items-center justify-center
                  w-20 h-14 rounded-full
                  transition
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

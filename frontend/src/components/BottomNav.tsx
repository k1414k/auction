import Link from "next/link";
import { useRouter } from "next/router";
import { House, Heart, Search, CircleUser, CameraIcon } from "lucide-react";

export function BottomNav() {
  const { pathname } = useRouter();
  const navItems = [
    { href: "/", label: "ホーム", icon: House },
    { href: "/search", label: "探す", icon: Search },
    { href: "/sell", label: "出品", icon: CameraIcon },
    { href: "/favorites", label: "いいね", icon: Heart },
    { href: "/user/profile", label: "マイページ", icon: CircleUser },
  ];

  return (
    <nav className="hidden md:block fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t shadow-lg">
      <div className="flex w-full">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link key={label} href={href} className="flex-1">
              <div
                className={`flex flex-col items-center justify-center py-2 transition-colors ${
                  isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Icon size={22} />
                <span className="text-[10px] mt-0.5 leading-tight">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

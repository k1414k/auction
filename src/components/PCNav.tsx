import Link from "next/link";
import { useRouter } from "next/router";
import { House, Heart, Search, CircleUser, CameraIcon } from "lucide-react";

export function PCNav() {
  const { pathname } = useRouter();
  const navItems = [
    { href: "/", label: "ホーム", icon: House },
    { href: "/search", label: "探す", icon: Search },
    { href: "/sell", label: "出品", icon: CameraIcon },
    { href: "/favorites", label: "いいね", icon: Heart },
    { href: "/user/profile", label: "マイページ", icon: CircleUser },
  ];

  return (
    <div className="border-t md:hidden">
      <div className="max-w-[1420px] mx-auto px-2 flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link key={label} href={href}>
              <div
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                <Icon size={17} />
                <span>{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

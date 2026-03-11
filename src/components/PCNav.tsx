import Link from "next/link";
import { useRouter } from "next/router";
import { House, Heart, Search, CircleUser, CameraIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function PCNav() {
  const { pathname } = useRouter();
  const [statIndex, setStatIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  const navItems = [
    { href: "/", label: "ホーム", icon: House },
    { href: "/search", label: "探す", icon: Search },
    { href: "/sell", label: "出品", icon: CameraIcon },
    { href: "/favorites", label: "いいね", icon: Heart },
    { href: "/user/profile", label: "マイページ", icon: CircleUser },
  ];

  const stats = [
    { label: "本日の入札数", value: 10 },
    { label: "本日の落札数", value: 4 },
    { label: "昨日の入札数", value: 18 },
    { label: "昨日の落札数", value: 7 },
  ];

  // ループを自然に見せるために複製
  const loopStats = useMemo(() => [...stats, ...stats], [stats]);

  useEffect(() => {
    const timer = setInterval(() => {
      setStatIndex((prev) => prev + 1);
    }, 2200);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (statIndex >= stats.length) {
      const resetTimer = setTimeout(() => {
        setAnimate(false);
        setStatIndex(0);
      }, 450);

      const restoreTimer = setTimeout(() => {
        setAnimate(true);
      }, 500);

      return () => {
        clearTimeout(resetTimer);
        clearTimeout(restoreTimer);
      };
    }
  }, [statIndex, stats.length]);

  const rowHeight = 28;

  return (
    <div className="md:hidden border-t border-gray-100 bg-white">
      <div className="max-w-[1200px] mx-auto px-2 flex items-center justify-between gap-4">
        {/* 左: ナビ */}
        <div className="flex items-center min-w-0">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <Link key={label} href={href}>
                <div
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-md font-medium border-b-2 transition-colors whitespace-nowrap ${
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

        {/* 右: 1行だけ見える縦ティッカー */}
        <div className="shrink-0">
          <div
            className="w-[230px] overflow-hidden rounded-md border border-gray-200 bg-gray-50 px-3"
            style={{ height: `${rowHeight}px` }}
          >
            <div
              className={animate ? "transition-transform duration-500 ease-in-out" : ""}
              style={{
                transform: `translateY(-${statIndex * rowHeight}px)`,
              }}
            >
              {loopStats.map((stat, idx) => (
                <div
                  key={`${stat.label}-${idx}`}
                  className="flex h-[28px] items-center justify-between gap-3 text-md whitespace-nowrap"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-700" />
                    <span className="truncate text-gray-800">{stat.label}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
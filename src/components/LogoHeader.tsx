import Link from "next/link";

export default function LogoHeader() {
  return (
    <Link href="/" className="cursor-pointer">
      <div className="relative inline-block text-2xl font-bold text-slate-700">
        Auction
        <span className="absolute -top-0 -left-1.5 text-[16px] leading-none text-slate-600">
          *
        </span>
      </div>
    </Link>
  );
}
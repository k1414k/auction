// components/AuctionCard.tsx
import Image from "next/image";

export function AuctionCard({
  title,
  price,
  remain,
  img,
  note,
}: {
  title: string;
  price: number;
  remain: string;
  img?: string;
  note?: string;
}) {
  return (
    <article className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
      <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
        {img ? (
          <Image src={img} alt={title} width={300} height={200} className="object-contain" />
        ) : (
          <div className="text-gray-400">画像なし</div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-slate-800">{title}</h3>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="text-lg font-bold text-sky-600">¥{price.toLocaleString()}</div>
          <div className="text-xs text-gray-500">{remain}</div>
        </div>
        {note && <div className="mt-3 text-xs bg-sky-50 text-sky-700 rounded-md px-2 py-1 text-center">{note}</div>}
        <button className="mt-3 w-full py-2 rounded-lg bg-sky-600 text-white text-sm">入札する</button>
      </div>
    </article>
  );
}

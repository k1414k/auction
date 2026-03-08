type Props = {
  count?: number;
};

export function SkeletonCard({ count = 1 }: Props) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <article key={i} className="text-center overflow-hidden mt-3">
          <div className="relative w-full h-40 bg-gray-200 animate-pulse rounded overflow-hidden" />
          <div className="p-1.5">
            <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mx-auto" />
            <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2 mx-auto mt-2" />
          </div>
        </article>
      ))}
    </>
  );
}

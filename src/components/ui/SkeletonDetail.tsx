export function SkeletonDetail() {
  return (
    <div className="p-5 space-y-6">
      <div className="grid grid-cols-7 gap-6 md:grid-cols-1">
        <div className="col-span-4">
          <div className="aspect-square bg-gray-200 animate-pulse rounded-xl w-full" />
        </div>
        <div className="col-span-3 space-y-4 -mr-4">
          <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4" />
          <div className="h-8 bg-gray-200 animate-pulse rounded w-1/2" />
          <div className="flex gap-4 p-4 bg-gray-100 rounded-2xl items-center">
            <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 animate-pulse rounded w-24" />
              <div className="h-3 bg-gray-100 animate-pulse rounded w-20" />
            </div>
          </div>
          <div className="space-y-3 my-10">
            <div className="h-4 bg-gray-200 animate-pulse rounded w-20" />
            <div className="h-3 bg-gray-100 animate-pulse rounded w-full" />
            <div className="h-3 bg-gray-100 animate-pulse rounded w-full" />
            <div className="h-3 bg-gray-100 animate-pulse rounded w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

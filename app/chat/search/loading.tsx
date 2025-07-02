export default function ChatSearchLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-px bg-gray-300" />
              <div className="w-40 h-6 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-6" />
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-full h-10 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
                <div className="w-full h-10 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Results Skeleton */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {/* Header Skeleton */}
              <div className="flex items-center justify-between">
                <div className="w-48 h-6 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              </div>

              {/* Message Cards Skeleton */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="w-full h-16 bg-gray-200 rounded animate-pulse" />
                      <div className="flex gap-2">
                        <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
                        <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
                        <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

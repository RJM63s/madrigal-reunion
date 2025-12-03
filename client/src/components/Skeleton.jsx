// Skeleton loading components - Airbnb style

function SkeletonBase({ className = '' }) {
  return (
    <div className={`skeleton ${className}`} />
  );
}

// Card skeleton for member cards
export function SkeletonCard() {
  return (
    <div className="modern-card p-4 w-full">
      <div className="flex items-center gap-3">
        <SkeletonBase className="w-16 h-16 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBase className="h-4 w-3/4 rounded" />
          <SkeletonBase className="h-3 w-1/2 rounded" />
          <SkeletonBase className="h-3 w-1/3 rounded" />
        </div>
      </div>
    </div>
  );
}

// Stats skeleton
export function SkeletonStats() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex justify-between items-center py-3 border-b border-neutral-200 last:border-0">
          <SkeletonBase className="h-4 w-1/3 rounded" />
          <SkeletonBase className="h-8 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

// Photo gallery skeleton
export function SkeletonPhoto() {
  return (
    <div className="aspect-square rounded-2xl overflow-hidden">
      <SkeletonBase className="w-full h-full" />
    </div>
  );
}

// Grid of photo skeletons
export function SkeletonPhotoGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPhoto key={i} />
      ))}
    </div>
  );
}

// Member list skeleton
export function SkeletonMemberList({ count = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// Generation group skeleton
export function SkeletonGenerationGroup() {
  return (
    <div className="flex-shrink-0" style={{ width: '280px' }}>
      <div className="mb-6">
        <SkeletonBase className="h-6 w-28 rounded-full" />
      </div>
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

// Full page skeleton for family tree
export function SkeletonFamilyTree() {
  return (
    <div className="min-h-screen bg-white md:bg-neutral-50">
      {/* Header skeleton */}
      <div className="bg-white border-b border-neutral-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <SkeletonBase className="h-8 w-48 rounded mb-2" />
          <SkeletonBase className="h-4 w-32 rounded" />
        </div>
      </div>

      {/* Mobile horizontal scroll skeleton */}
      <div className="md:hidden">
        <div className="horizontal-scroll p-6">
          <div className="inline-flex gap-8 min-w-full">
            <SkeletonGenerationGroup />
            <SkeletonGenerationGroup />
            <SkeletonGenerationGroup />
          </div>
        </div>
      </div>

      {/* Desktop grid skeleton */}
      <div className="hidden md:block px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {[1, 2].map((gen) => (
            <div key={gen} className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <SkeletonBase className="h-8 w-32 rounded-full" />
                <div className="flex-1 h-px bg-neutral-200" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SkeletonBase;

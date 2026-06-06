type AuthFormSkeletonProps = {
  fields?: number;
};

export function AuthFormSkeleton({ fields = 3 }: AuthFormSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading form"
      className="flex flex-col gap-5"
    >
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <div className="vl-shimmer h-4 w-28 rounded" />
          <div className="vl-shimmer h-11 rounded-md" />
        </div>
      ))}
      <div className="vl-shimmer h-10 rounded-md" />
    </div>
  );
}

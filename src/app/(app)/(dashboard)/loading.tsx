import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-10">
      <Skeleton className="h-8 w-64 bg-cream-dark" />
      <div className="flex gap-5">
        <Skeleton className="h-40 w-full bg-cream-dark rounded-xl" />
        <Skeleton className="h-40 w-full bg-cream-dark rounded-xl" />
        <Skeleton className="h-40 w-full bg-cream-dark rounded-xl" />
      </div>
    </div>
  );
}

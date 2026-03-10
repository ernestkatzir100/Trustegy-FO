import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col items-center gap-6">
      <Skeleton className="h-10 w-32 bg-cream-dark" />
      <Skeleton className="h-5 w-48 bg-cream-dark" />
      <Skeleton className="h-12 w-64 bg-cream-dark rounded-xl" />
    </div>
  );
}

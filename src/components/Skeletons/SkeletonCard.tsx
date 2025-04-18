import { Skeleton } from '@/components/ui/skeleton';

export function PhotoSkeleton() {
  return (
    <div className="flex w-fit flex-col space-y-3 rounded-xl border p-4">
      <Skeleton className="h-[200px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4 space-y-3 rounded-xl p-4 md:flex-row md:space-y-0">
      <div className="flex justify-center">
        <Skeleton className="h-[200px] w-[250px] rounded-full" />
      </div>
      <div className="flex flex-col items-center justify-center space-y-2 md:items-end">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[250px]" />
      </div>
    </div>
  );
}

export function DropDownSkeleton() {
  return (
    <div className="flex">
      <Skeleton className="h-11 w-11 rounded-full" />
      <div className="flex flex-col items-center justify-center">
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  );
}

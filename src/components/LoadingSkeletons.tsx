"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Hero Section Skeleton */}
            <div className="rounded-3xl bg-white/5 p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        <Skeleton className="h-4 w-24 bg-white/10" />
                        <Skeleton className="h-12 w-64 bg-white/20" />
                        <Skeleton className="h-4 w-48 bg-white/10" />
                    </div>
                    <div className="w-full md:w-[300px]">
                        <Skeleton className="h-32 w-full bg-white/10 rounded-2xl" />
                    </div>
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-white/5 border-white/10">
                        <CardHeader>
                            <Skeleton className="h-4 w-24 bg-white/10" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-10 w-32 bg-white/20 mb-4" />
                            <Skeleton className="h-2 w-full bg-white/10" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export function ChoresSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-48 bg-white/20" />
                            <Skeleton className="h-4 w-32 bg-white/10" />
                        </div>
                        <Skeleton className="h-10 w-24 bg-white/10 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ExpensesSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-64 w-full bg-white/5 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="bg-white/5 border-white/10">
                        <CardHeader>
                            <Skeleton className="h-5 w-32 bg-white/20" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-24 bg-white/20 mb-2" />
                            <Skeleton className="h-4 w-full bg-white/10" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

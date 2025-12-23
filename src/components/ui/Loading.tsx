import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ className = "" }: { className?: string }) => {
    return <Loader2 className={`w-6 h-6 animate-spin text-teal-600 ${className}`} />;
};

export const LoadingScreen = ({ message = "Đang tải dữ liệu..." }: { message?: string }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
            <p className="text-slate-600 font-medium animate-pulse">{message}</p>
        </div>
    );
};

export const Skeleton = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={`animate-pulse rounded-md bg-slate-200 ${className}`}
            {...props}
        />
    );
};

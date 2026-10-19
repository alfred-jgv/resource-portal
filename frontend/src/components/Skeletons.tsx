interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return <span className={`rd-skeleton ${className}`} aria-hidden="true" />;
}

export function AppShellSkeleton() {
    return (
        <div className="rd-app-skeleton" role="status" aria-label="Loading application">
            <Skeleton className="rd-skeleton-sidebar" />
            <main className="rd-app-skeleton-main">
                <Skeleton className="rd-skeleton-heading" />
                <Skeleton className="rd-skeleton-copy" />
                <Skeleton className="rd-skeleton-panel" />
            </main>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="rd-skeleton-stack" role="status" aria-label="Loading dashboard">
            <div className="rd-skeleton-intro">
                <Skeleton className="rd-skeleton-title" />
                <Skeleton className="rd-skeleton-copy" />
            </div>
            <div className="rd-skeleton-metrics">
                {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="rd-skeleton-metric" />)}
            </div>
            <div className="rd-skeleton-cards">
                {Array.from({ length: 2 }, (_, index) => (
                    <div className="rd-skeleton-card" key={index}>
                        <Skeleton className="rd-skeleton-card-title" />
                        {Array.from({ length: 4 }, (_, row) => <Skeleton key={row} className="rd-skeleton-line" />)}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TableSkeleton({ columns = 4, rows = 5 }: { columns?: number; rows?: number }) {
    const gridTemplateColumns = `repeat(${columns}, minmax(120px, 1fr))`;
    return (
        <div className="rd-skeleton-table" role="status" aria-label="Loading records">
            <div className="rd-skeleton-table-row rd-skeleton-table-header" style={{ gridTemplateColumns }}>
                {Array.from({ length: columns }, (_, index) => <Skeleton key={index} className="rd-skeleton-cell" />)}
            </div>
            {Array.from({ length: rows }, (_, row) => (
                <div className="rd-skeleton-table-row" style={{ gridTemplateColumns }} key={row}>
                    {Array.from({ length: columns }, (_, column) => <Skeleton key={column} className="rd-skeleton-cell" />)}
                </div>
            ))}
        </div>
    );
}

export function TaskListSkeleton() {
    return (
        <div className="rd-task-list" role="status" aria-label="Loading tasks">
            {Array.from({ length: 4 }, (_, index) => (
                <div className="rd-task-card rd-task-card--skeleton" key={index}>
                    <div className="rd-task-header">
                        <div className="rd-skeleton-task-copy">
                            <Skeleton className="rd-skeleton-task-meta" />
                            <Skeleton className="rd-skeleton-task-title" />
                        </div>
                        <Skeleton className="rd-skeleton-status" />
                        <Skeleton className="rd-skeleton-chevron" />
                    </div>
                </div>
            ))}
        </div>
    );
}

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";

interface SummaryCardProps {
    title: string;
    value: string | number;
    subValue: string | number;
    label: string;
    subLabel: string;
    color?: "blue" | "green" | "orange" | "red";
}

export function SummaryCard({
    title,
    value,
    subValue,
    label,
    subLabel,
    color = "blue",
}: SummaryCardProps) {
    const colorClasses = {
        blue: "text-info",
        green: "text-success",
        orange: "text-warning",
        red: "text-danger",
    };

    return (
        <Card className="flex-1 min-w-[200px] hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
                <h3 className={cn("font-medium mb-4 text-sm uppercase tracking-wider", colorClasses[color])}>{title}</h3>
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-2xl font-bold text-foreground">{value}</div>
                        <div className="text-xs text-secondary mt-1">{label}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-semibold text-foreground">{subValue}</div>
                        <div className="text-xs text-secondary mt-1">{subLabel}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

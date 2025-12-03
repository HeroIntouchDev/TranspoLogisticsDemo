"use client";

import { useEffect, useState } from "react";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Filter } from "lucide-react";
import { Exhibition, ExhibitionProduct } from "@/lib/db";

interface ExhibitionWithOrders extends Exhibition {
    orders: (ExhibitionProduct & { productName?: string; productImage?: string; productUnit?: string })[];
    totalValue: number;
    totalQuantity: number;
}

export default function OrdersPage() {
    const [exhibitions, setExhibitions] = useState<ExhibitionWithOrders[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/orders");
            const data = await res.json();
            setExhibitions(data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Summary Section */}
            <section>
                <h2 className="text-2xl font-bold text-foreground mb-6">Orders Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard
                        title="Total Exhibitions"
                        value={exhibitions.length}
                        subValue=""
                        label="Active"
                        subLabel=""
                        color="blue"
                    />
                    {/* Add more summary cards as needed */}
                </div>
            </section>

            {/* Orders Table Section */}
            <Card className="border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border">
                    <CardTitle className="text-xl font-semibold text-foreground">Exhibition Orders</CardTitle>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2">
                            <Filter className="w-4 h-4" />
                            Filters
                        </Button>
                    </div>
                </CardHeader>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-secondary uppercase bg-surface-hover/50 border-b border-border">
                            <tr>
                                <th className="py-4 px-6 font-semibold">Exhibition Name</th>
                                <th className="py-4 px-6 font-semibold">Exhibition ID</th>
                                <th className="py-4 px-6 font-semibold">Total Quantity</th>
                                <th className="py-4 px-6 font-semibold">Export Date</th>
                                <th className="py-4 px-6 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center py-12 text-secondary">Loading orders...</td></tr>
                            ) : exhibitions.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-secondary">No exhibitions found</td></tr>
                            ) : exhibitions.map((exhibition) => (
                                <tr
                                    key={exhibition.id}
                                    className="hover:bg-surface-hover/50 transition-colors"
                                >
                                    <td className="py-4 px-6 font-medium text-foreground">{exhibition.name}</td>
                                    <td className="py-4 px-6 text-secondary">{exhibition.exhibitionId}</td>
                                    <td className="py-4 px-6 text-secondary">{exhibition.totalQuantity} Items</td>
                                    <td className="py-4 px-6 text-secondary">{new Date().toLocaleDateString()}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${exhibition.totalQuantity > 0
                                                ? 'bg-info/10 text-info border-info/20'
                                                : 'bg-secondary/10 text-secondary border-secondary/20'
                                            }`}>
                                            {exhibition.totalQuantity > 0 ? 'Preparing' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

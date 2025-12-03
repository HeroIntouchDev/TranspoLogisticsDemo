
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Check, X, FileText, ChevronDown } from "lucide-react";
import { Exhibition, ProductList } from "@/lib/db";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ApprovePage() {
    const router = useRouter();
    const [productLists, setProductLists] = useState<ProductList[]>([]);
    const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
    const [selectedExhibitionId, setSelectedExhibitionId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [listsRes, exhibitionsRes] = await Promise.all([
                fetch("/api/product-lists"),
                fetch("/api/exhibitions")
            ]);
            const listsData = await listsRes.json();
            const exhibitionsData = await exhibitionsRes.json();

            setProductLists(listsData);
            setExhibitions(exhibitionsData);

            if (exhibitionsData.length > 0) {
                setSelectedExhibitionId(exhibitionsData[0].exhibitionId);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const res = await fetch(`/api/product-lists/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                // Refresh data
                const listsRes = await fetch("/api/product-lists");
                const listsData = await listsRes.json();
                setProductLists(listsData);
            }
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const filteredLists = selectedExhibitionId
        ? productLists.filter(l => l.exhibitionId === selectedExhibitionId)
        : productLists;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-foreground">Approve Product Lists</h1>
                <div className="relative w-full sm:w-64">
                    <select
                        className="w-full appearance-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                        value={selectedExhibitionId}
                        onChange={(e) => setSelectedExhibitionId(e.target.value)}
                    >
                        <option value="">Select Exhibition</option>
                        {exhibitions.map(ex => (
                            <option key={ex.id} value={ex.exhibitionId}>{ex.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" />
                </div>
            </div>

            <Card className="border-border shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-secondary uppercase bg-surface-hover/50 border-b border-border">
                            <tr>
                                <th className="py-4 px-6 font-semibold">List ID</th>
                                <th className="py-4 px-6 font-semibold">Supplier</th>
                                <th className="py-4 px-6 font-semibold">Created At</th>
                                <th className="py-4 px-6 font-semibold">Total Quantity</th>
                                <th className="py-4 px-6 font-semibold">Status</th>
                                <th className="py-4 px-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-secondary">Loading...</td></tr>
                            ) : filteredLists.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-secondary">No product lists found for this exhibition</td></tr>
                            ) : filteredLists.map((list) => (
                                <tr
                                    key={list.id}
                                    className="hover:bg-surface-hover/50 transition-colors cursor-pointer group"
                                    onClick={() => router.push(`/exhibitions/product-lists/${list.id}`)}
                                >
                                    <td className="py-4 px-6 font-medium text-foreground flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        {list.id}
                                    </td>
                                    <td className="py-4 px-6 text-secondary">{list.supplierId}</td>
                                    <td className="py-4 px-6 text-secondary">{new Date(list.createdAt).toLocaleDateString()}</td>
                                    <td className="py-4 px-6 text-secondary">{list.totalQuantity}</td>
                                    <td className="py-4 px-6">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-xs font-medium border",
                                            list.status === 'approved' && "bg-success/10 text-success border-success/20",
                                            list.status === 'rejected' && "bg-danger/10 text-danger border-danger/20",
                                            list.status === 'pending' && "bg-warning/10 text-warning border-warning/20"
                                        )}>
                                            {list.status.charAt(0).toUpperCase() + list.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 text-success hover:text-success hover:bg-success/10 border-success/20"
                                                onClick={() => handleStatusUpdate(list.id, 'approved')}
                                            >
                                                <Check className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 text-danger hover:text-danger hover:bg-danger/10 border-danger/20"
                                                onClick={() => handleStatusUpdate(list.id, 'rejected')}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
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

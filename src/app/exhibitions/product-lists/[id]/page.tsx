"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProductList, ProductListItem } from "@/lib/db";
import { ArrowLeft, Trash2, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface EnrichedProductListItem extends ProductListItem {
    productName?: string;
    productSKU?: string;
    productUnit?: string;
    productImage?: string;
}

interface EnrichedProductList extends ProductList {
    items: EnrichedProductListItem[];
}

export default function ProductListDetailPage() {
    const params = useParams();
    const router = useRouter();
    const listId = params.id as string;

    const [list, setList] = useState<EnrichedProductList | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (listId) {
            fetchListDetails();
        }
    }, [listId]);

    const fetchListDetails = async () => {
        try {
            const res = await fetch(`/api/product-lists/${listId}`);
            if (!res.ok) {
                if (res.status === 404) {
                    setList(null);
                    return;
                }
                throw new Error("Failed to fetch list");
            }
            const data = await res.json();
            setList(data);
        } catch (error) {
            console.error("Failed to fetch product list details", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (!list) return;
        const updatedItems = list.items.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        setList({ ...list, items: updatedItems });
    };

    const handleRemoveItem = (itemId: string) => {
        if (!list) return;
        const updatedItems = list.items.filter(item => item.id !== itemId);
        setList({ ...list, items: updatedItems });
    };

    const handleSaveChanges = async () => {
        if (!list) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/product-lists/${listId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: list.items }),
            });
            if (res.ok) {
                fetchListDetails(); // Refresh
                alert("Changes saved successfully!");
            }
        } catch (error) {
            console.error("Failed to save changes", error);
            alert("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-6 text-center text-secondary">Loading...</div>;
    if (!list) return <div className="p-6 text-center text-secondary">Product List not found</div>;

    const isEditable = list.status === 'pending';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="p-2 h-auto hover:bg-surface-hover rounded-full text-secondary hover:text-foreground" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Product List Details</h1>
                        <div className="flex items-center gap-2 text-sm text-secondary mt-1">
                            <span>ID: {list.id}</span>
                            <span>•</span>
                            <span className={cn(
                                "capitalize font-medium",
                                list.status === 'approved' && "text-success",
                                list.status === 'rejected' && "text-danger",
                                list.status === 'pending' && "text-warning"
                            )}>
                                Status: {list.status}
                            </span>
                        </div>
                    </div>
                </div>
                {isEditable && (
                    <Button onClick={handleSaveChanges} disabled={isSaving} className="gap-2 shadow-sm">
                        <Save className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                )}
            </div>

            <Card className="border-border shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-secondary uppercase bg-surface-hover/50 border-b border-border">
                            <tr>
                                <th className="py-4 px-6 font-semibold">Product</th>
                                <th className="py-4 px-6 font-semibold">SKU</th>
                                <th className="py-4 px-6 font-semibold">Price / Unit</th>
                                <th className="py-4 px-6 font-semibold">Quantity</th>
                                <th className="py-4 px-6 font-semibold">Total</th>
                                {isEditable && <th className="py-4 px-6 font-semibold text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {list.items.map((item) => (
                                <tr key={item.id} className="hover:bg-surface-hover/50 transition-colors">
                                    <td className="py-4 px-6 font-medium text-foreground">
                                        <div className="flex items-center gap-3">
                                            {item.productImage && (
                                                <img src={item.productImage} alt="" className="w-10 h-10 rounded-lg object-cover border border-border" />
                                            )}
                                            {item.productName}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-secondary">{item.productSKU}</td>
                                    <td className="py-4 px-6 text-secondary">{item.price}฿ / {item.productUnit}</td>
                                    <td className="py-4 px-6">
                                        {isEditable ? (
                                            <Input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                                                className="w-24 h-9"
                                            />
                                        ) : (
                                            <span className="text-foreground font-medium">{item.quantity}</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 font-medium text-foreground">
                                        {(item.price * item.quantity).toLocaleString()}฿
                                    </td>
                                    {isEditable && (
                                        <td className="py-4 px-6 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 text-danger hover:text-danger hover:bg-danger/10 border-danger/20"
                                                onClick={() => handleRemoveItem(item.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

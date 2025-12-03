"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Exhibition, Product, ProductList } from "@/lib/db";
import { Plus, Search, ArrowLeft, FileText, Check } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ExhibitionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const exhibitionId = params.id as string;

    const [exhibition, setExhibition] = useState<Exhibition | null>(null);
    const [productLists, setProductLists] = useState<ProductList[]>([]);
    const [inventoryProducts, setInventoryProducts] = useState<Product[]>([]);

    const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Selection state for modal
    const [selectedProducts, setSelectedProducts] = useState<{ productId: string; quantity: number; price: number }[]>([]);

    useEffect(() => {
        if (exhibitionId) {
            fetchExhibitionDetails();
            fetchProductLists();
            fetchInventoryProducts();
        }
    }, [exhibitionId]);

    const fetchExhibitionDetails = async () => {
        try {
            const res = await fetch(`/api/exhibitions`);
            const data = await res.json();
            const found = data.find((e: Exhibition) => e.exhibitionId === exhibitionId);
            setExhibition(found);
        } catch (error) {
            console.error("Failed to fetch exhibition details", error);
        }
    };

    const fetchProductLists = async () => {
        try {
            const res = await fetch(`/api/product-lists?exhibitionId=${exhibitionId}`);
            const data = await res.json();
            setProductLists(data);
        } catch (error) {
            console.error("Failed to fetch product lists", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInventoryProducts = async () => {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            setInventoryProducts(data);
        } catch (error) {
            console.error("Failed to fetch inventory products", error);
        }
    };

    const handleCreateList = async () => {
        try {
            const res = await fetch(`/api/product-lists`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    exhibitionId,
                    supplierId: "current-user", // Placeholder
                    items: selectedProducts
                }),
            });
            if (res.ok) {
                setIsCreateListModalOpen(false);
                fetchProductLists();
                setSelectedProducts([]);
            }
        } catch (error) {
            console.error("Failed to create product list", error);
        }
    };

    const toggleProductSelection = (product: Product) => {
        setSelectedProducts(prev => {
            const exists = prev.find(p => p.productId === product.id);
            if (exists) {
                return prev.filter(p => p.productId !== product.id);
            } else {
                return [...prev, { productId: product.id, quantity: 1, price: product.buyingPrice }];
            }
        });
    };

    const updateProductQuantity = (productId: string, quantity: number) => {
        setSelectedProducts(prev => prev.map(p => p.productId === productId ? { ...p, quantity } : p));
    };

    if (!exhibition) return <div className="p-6 text-center text-secondary">Loading exhibition details...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/exhibitions" className="p-2 hover:bg-surface-hover rounded-full transition-colors text-secondary hover:text-foreground">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{exhibition.name}</h1>
                    <p className="text-sm text-secondary">{exhibition.exhibitionId}</p>
                </div>
            </div>

            <Card className="border-border shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
                    <CardTitle className="text-xl font-semibold text-foreground">Product Lists</CardTitle>
                    <Button onClick={() => setIsCreateListModalOpen(true)} className="w-full sm:w-auto gap-2">
                        <Plus className="w-4 h-4" />
                        New Product List
                    </Button>
                </CardHeader>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-secondary uppercase bg-surface-hover/50 border-b border-border">
                            <tr>
                                <th className="py-4 px-6 font-semibold">List ID</th>
                                <th className="py-4 px-6 font-semibold">Supplier</th>
                                <th className="py-4 px-6 font-semibold">Created At</th>
                                <th className="py-4 px-6 font-semibold">Total Quantity</th>
                                <th className="py-4 px-6 font-semibold">Status</th>
                                <th className="py-4 px-6 font-semibold"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-secondary">Loading product lists...</td></tr>
                            ) : productLists.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-secondary">No product lists created yet</td></tr>
                            ) : productLists.map((list) => (
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
                                    <td className="py-4 px-6 text-right text-primary font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Details
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={isCreateListModalOpen}
                onClose={() => setIsCreateListModalOpen(false)}
                title="Create New Product List"
                className="max-w-3xl"
            >
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                        <Input placeholder="Search inventory products..." className="pl-10" />
                    </div>

                    <div className="border border-border rounded-xl h-[400px] overflow-y-auto p-4 space-y-3 bg-surface-hover/20">
                        {inventoryProducts.map(product => {
                            const isSelected = selectedProducts.some(p => p.productId === product.id);
                            const selectedProduct = selectedProducts.find(p => p.productId === product.id);

                            return (
                                <div
                                    key={product.id}
                                    className={cn(
                                        "p-4 rounded-xl border transition-all duration-200",
                                        isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-surface hover:border-primary/30"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={cn(
                                                "w-5 h-5 rounded border flex items-center justify-center mt-1 cursor-pointer transition-colors",
                                                isSelected ? "bg-primary border-primary text-primary-foreground" : "border-secondary hover:border-primary"
                                            )}
                                            onClick={() => toggleProductSelection(product)}
                                        >
                                            {isSelected && <Check className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-foreground">{product.name}</p>
                                                    <p className="text-xs text-secondary mt-1">{product.availability} • {product.quantity} {product.unit}</p>
                                                </div>
                                                <p className="font-semibold text-foreground">{product.buyingPrice}฿</p>
                                            </div>

                                            {isSelected && (
                                                <div className="mt-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                                    <label className="text-xs font-medium text-secondary">Quantity:</label>
                                                    <Input
                                                        type="number"
                                                        value={selectedProduct?.quantity || 0}
                                                        onChange={(e) => updateProductQuantity(product.id, Number(e.target.value))}
                                                        className="h-8 w-24 text-sm"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                    <Button variant="outline" onClick={() => setIsCreateListModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateList} disabled={selectedProducts.length === 0}>Create List ({selectedProducts.length})</Button>
                </div>
            </Modal>
        </div>
    );
}

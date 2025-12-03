"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Filter, Download, Plus, Upload } from "lucide-react";
import { Product } from "@/lib/db";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Form state
    const [newProduct, setNewProduct] = useState<Partial<Product>>({
        name: "",
        id: "",
        category: "",
        buyingPrice: 0,
        quantity: 0,
        unit: "",
        expiryDate: "",
        thresholdValue: 0,
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddProduct = async () => {
        try {
            const formData = new FormData();
            formData.append("name", newProduct.name || "");
            formData.append("id", newProduct.id || "");
            formData.append("category", newProduct.category || "");
            formData.append("buyingPrice", String(newProduct.buyingPrice || 0));
            formData.append("quantity", String(newProduct.quantity || 0));
            formData.append("unit", newProduct.unit || "");
            formData.append("expiryDate", newProduct.expiryDate || "");
            formData.append("thresholdValue", String(newProduct.thresholdValue || 0));
            formData.append("availability", (newProduct.quantity || 0) > 0 ? "In-stock" : "Out of stock");

            if (imageFile) {
                formData.append("image", imageFile);
            }

            const res = await fetch("/api/products", {
                method: "POST",
                body: formData,
            });
            if (res.ok) {
                setIsAddModalOpen(false);
                fetchProducts();
                setNewProduct({
                    name: "",
                    id: "",
                    category: "",
                    buyingPrice: 0,
                    quantity: 0,
                    unit: "",
                    expiryDate: "",
                    thresholdValue: 0,
                    availability: "Out of stock"
                });
                setImageFile(null);
                setImagePreview(null);
            }
        } catch (error) {
            console.error("Failed to add product", error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
                <div className="text-sm text-secondary">
                    Total Products: {products.length}
                </div>
            </div>

            {/* Products Table Section */}
            <Card className="border-border shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
                    <CardTitle className="text-xl font-semibold text-foreground">Products</CardTitle>
                    <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                        <Button onClick={() => setIsAddModalOpen(true)} className="flex-1 sm:flex-none gap-2">
                            <Plus className="w-4 h-4" />
                            Add Product
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-none gap-2">
                            <Filter className="w-4 h-4" />
                            Filters
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-none gap-2">
                            <Download className="w-4 h-4" />
                            Download
                        </Button>
                    </div>
                </CardHeader>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-secondary uppercase bg-surface-hover/50 border-b border-border">
                            <tr>
                                <th className="py-4 px-6 font-semibold">Products</th>
                                <th className="py-4 px-6 font-semibold">Buying Price</th>
                                <th className="py-4 px-6 font-semibold">Quantity</th>
                                <th className="py-4 px-6 font-semibold">Threshold Value</th>
                                <th className="py-4 px-6 font-semibold">Expiry Date</th>
                                <th className="py-4 px-6 font-semibold">Availability</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-secondary">Loading products...</td></tr>
                            ) : products.map((product) => (
                                <tr key={product.id} className="hover:bg-surface-hover/50 transition-colors cursor-pointer group">
                                    <td className="py-4 px-6 font-medium text-foreground group-hover:text-primary transition-colors">
                                        <Link href={`/inventory/${product.id}`} className="block">
                                            {product.name}
                                        </Link>
                                    </td>
                                    <td className="py-4 px-6 text-secondary">{product.buyingPrice}฿</td>
                                    <td className="py-4 px-6 text-secondary">{product.quantity} Packets</td>
                                    <td className="py-4 px-6 text-secondary">{product.thresholdValue} Packets</td>
                                    <td className="py-4 px-6 text-secondary">{product.expiryDate}</td>
                                    <td className="py-4 px-6">
                                        <span
                                            className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-medium border",
                                                product.availability === "In-stock" && "bg-success/10 text-success border-success/20",
                                                product.availability === "Out of stock" && "bg-danger/10 text-danger border-danger/20",
                                                product.availability === "Low stock" && "bg-warning/10 text-warning border-warning/20"
                                            )}
                                        >
                                            {product.availability}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="flex items-center justify-between p-4 border-t border-border bg-surface-hover/20 rounded-b-xl">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <span className="text-sm text-secondary">Page 1 of 10</span>
                    <Button variant="outline" size="sm">Next</Button>
                </div>
            </Card>

            {/* Add Product Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="New Product"
                className="max-w-2xl"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                        className="col-span-1 md:col-span-2 border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-hover hover:border-primary/50 transition-all duration-200 relative group"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file && file.type.startsWith('image/')) {
                                setImageFile(file);
                                setImagePreview(URL.createObjectURL(file));
                            }
                        }}
                        onClick={() => document.getElementById('image-upload')?.click()}
                    >
                        <input
                            type="file"
                            id="image-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setImageFile(file);
                                    setImagePreview(URL.createObjectURL(file));
                                }
                            }}
                        />
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="h-32 object-contain mb-2 rounded-lg shadow-sm" />
                        ) : (
                            <div className="w-12 h-12 bg-surface-hover rounded-full mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-secondary group-hover:text-primary" />
                            </div>
                        )}
                        <p className="text-sm text-secondary">
                            {imageFile ? imageFile.name : (
                                <>Drag image here or <span className="text-primary font-medium hover:underline">Browse image</span></>
                            )}
                        </p>
                    </div>

                    <Input
                        label="Product Name"
                        placeholder="Enter product name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                    <Input
                        label="Product ID"
                        placeholder="Enter product ID"
                        value={newProduct.id}
                        onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
                    />
                    <Input
                        label="Category"
                        placeholder="Select product category"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    />
                    <Input
                        label="Buying Price"
                        placeholder="Enter buying price"
                        type="number"
                        value={newProduct.buyingPrice || ''}
                        onChange={(e) => setNewProduct({ ...newProduct, buyingPrice: Number(e.target.value) })}
                    />
                    <Input
                        label="Quantity"
                        placeholder="Enter product quantity"
                        type="number"
                        value={newProduct.quantity || ''}
                        onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
                    />
                    <Input
                        label="Unit"
                        placeholder="Enter product unit"
                        value={newProduct.unit}
                        onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    />
                    <Input
                        label="Expiry Date"
                        type="date"
                        value={newProduct.expiryDate}
                        onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })}
                    />
                    <Input
                        label="Threshold Value"
                        placeholder="Enter threshold value"
                        type="number"
                        value={newProduct.thresholdValue || ''}
                        onChange={(e) => setNewProduct({ ...newProduct, thresholdValue: Number(e.target.value) })}
                    />
                </div>
                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Discard</Button>
                    <Button onClick={handleAddProduct}>Add Product</Button>
                </div>
            </Modal>
        </div>
    );
}

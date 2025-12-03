"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Pencil, Download } from "lucide-react";

export default function ProductDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);
                }
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!product) return <div className="p-8 text-center">Product not found</div>;

    return (
        <div className="bg-white rounded-xl border border-gray-200 min-h-[calc(100vh-8rem)]">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Pencil className="w-4 h-4" />
                        Edit
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download
                    </Button>
                </div>
            </div>

            <div className="p-6">
                <div className="flex gap-8 border-b border-gray-200 mb-8">
                    <button className="pb-3 text-blue-600 border-b-2 border-blue-600 font-medium">Overview</button>
                    <button className="pb-3 text-gray-500 hover:text-gray-700 font-medium">Purchases</button>
                    <button className="pb-3 text-gray-500 hover:text-gray-700 font-medium">Adjustments</button>
                    <button className="pb-3 text-gray-500 hover:text-gray-700 font-medium">History</button>
                </div>

                <div className="grid grid-cols-3 gap-12">
                    <div className="col-span-2 space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Details</h3>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                <div>
                                    <label className="text-sm text-gray-500 block mb-1">Product name</label>
                                    <div className="text-gray-900">{product.name}</div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 block mb-1">Product ID</label>
                                    <div className="text-gray-900">{product.id}</div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 block mb-1">Product category</label>
                                    <div className="text-gray-900">{product.category}</div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 block mb-1">Expiry Date</label>
                                    <div className="text-gray-900">{product.expiryDate}</div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 block mb-1">Threshold Value</label>
                                    <div className="text-gray-900">{product.thresholdValue}</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Details</h3>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                <div>
                                    <label className="text-sm text-gray-500 block mb-1">Supplier name</label>
                                    <div className="text-gray-900">Ronald Martin</div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 block mb-1">Contact Number</label>
                                    <div className="text-gray-900">98789 86757</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Locations</h3>
                            <div className="bg-gray-50 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="py-3 px-4 text-left font-medium text-gray-500">Store Name</th>
                                            <th className="py-3 px-4 text-right font-medium text-gray-500">Stock in hand</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        <tr>
                                            <td className="py-3 px-4 text-gray-500">Sulur Branch</td>
                                            <td className="py-3 px-4 text-right text-blue-600 font-medium">15</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4 text-gray-500">Singanallur Branch</td>
                                            <td className="py-3 px-4 text-right text-blue-600 font-medium">19</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1">
                        <div className="border border-dashed border-gray-300 rounded-lg p-4 mb-8 flex items-center justify-center min-h-[200px]">
                            {/* Placeholder image */}
                            <div className="text-center">
                                <img src="/placeholder.png" alt={product.name} className="max-w-[150px] mx-auto mb-4" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Opening Stock</span>
                                <span className="font-medium text-gray-900">40</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Remaining Stock</span>
                                <span className="font-medium text-gray-900">34</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">On the way</span>
                                <span className="font-medium text-gray-900">15</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Threshold value</span>
                                <span className="font-medium text-gray-900">12</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

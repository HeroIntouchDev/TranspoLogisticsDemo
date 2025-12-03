"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Package, DollarSign, AlertTriangle, XCircle } from "lucide-react";
import { Product } from "@/lib/db";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const totalProducts = products.length;
  const totalValue = products.reduce((acc, p) => acc + (p.buyingPrice * p.quantity), 0);
  const inStock = products.filter(p => p.availability === 'In-stock').length;
  const lowStock = products.filter(p => p.availability === 'Low stock').length;
  const outOfStock = products.filter(p => p.availability === 'Out of stock').length;

  // Chart Data Preparation
  const stockStatusData = [
    { name: 'In Stock', value: inStock, color: '#10B981' }, // success
    { name: 'Low Stock', value: lowStock, color: '#F59E0B' }, // warning
    { name: 'Out of Stock', value: outOfStock, color: '#EF4444' }, // danger
  ];

  // Top Categories (mock logic if category data is sparse, or aggregate real data)
  const categoryData = products.reduce((acc: any, curr) => {
    const cat = curr.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + curr.quantity;
    return acc;
  }, {});

  const barChartData = Object.keys(categoryData).map(key => ({
    name: key,
    quantity: categoryData[key]
  })).slice(0, 5); // Top 5 categories

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="text-sm text-secondary">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Total Products</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{totalProducts}</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Package className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Total Value</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{totalValue.toLocaleString()}฿</h3>
            </div>
            <div className="p-3 bg-info/10 rounded-full text-info">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Low Stock</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{lowStock}</h3>
            </div>
            <div className="p-3 bg-warning/10 rounded-full text-warning">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Out of Stock</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{outOfStock}</h3>
            </div>
            <div className="p-3 bg-danger/10 rounded-full text-danger">
              <XCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Stock Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Top Categories by Quantity</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'var(--surface-hover)' }}
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Bar dataKey="quantity" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

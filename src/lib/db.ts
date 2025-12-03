import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

export interface Product {
    id: string;
    name: string;
    category: string;
    buyingPrice: number;
    quantity: number;
    unit: string;
    thresholdValue: number;
    expiryDate: string;
    availability: 'In-stock' | 'Out of stock' | 'Low stock';
    image?: string;
}

export interface Order {
    id: string;
    exhibition: string;
    orderValue: number;
    quantity: number;
    unit: string;
    expectedDelivery: string;
    status: 'Delayed' | 'Received' | 'Returned' | 'Out for delivery' | 'Waiting for check';
}

export interface Exhibition {
    id: string;
    exhibitionId: string;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
}

export interface ExhibitionProduct {
    id: string;
    exhibitionId: string;
    productId: string;
    quantity: number;
    price?: number;
    status: 'pending' | 'approved' | 'rejected';
    supplierId: string; // Assuming we have a way to identify suppliers, for now just a string
}

export interface ProductList {
    id: string;
    exhibitionId: string;
    supplierId: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    totalQuantity: number;
}

export interface ProductListItem {
    id: string;
    productListId: string;
    productId: string;
    quantity: number;
    price: number;
}

export interface Database {
    products: Product[];
    orders: Order[];
    exhibitions: Exhibition[];
    exhibitionProducts: ExhibitionProduct[];
    productLists: ProductList[];
    productListItems: ProductListItem[];
}

function readData(): Database {
    if (!fs.existsSync(dataFilePath)) {
        return { products: [], orders: [], exhibitions: [], exhibitionProducts: [], productLists: [], productListItems: [] };
    }
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
}

function writeData(data: Database) {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
    products: {
        getAll: () => readData().products,
        getById: (id: string) => readData().products.find((p) => p.id === id),
        add: (product: Product) => {
            const data = readData();
            data.products.push(product);
            writeData(data);
            return product;
        },
        update: (id: string, updates: Partial<Product>) => {
            const data = readData();
            const index = data.products.findIndex((p) => p.id === id);
            if (index === -1) return null;
            data.products[index] = { ...data.products[index], ...updates };
            writeData(data);
            return data.products[index];
        },
        delete: (id: string) => {
            const data = readData();
            const index = data.products.findIndex((p) => p.id === id);
            if (index === -1) return false;
            data.products.splice(index, 1);
            writeData(data);
            return true;
        },
    },
    orders: {
        getAll: () => readData().orders,
        add: (order: Order) => {
            const data = readData();
            data.orders.push(order);
            writeData(data);
            return order;
        },
    },
    exhibitions: {
        getAll: () => readData().exhibitions || [],
        getById: (id: string) => readData().exhibitions?.find((e) => e.id === id),
        add: (exhibition: Exhibition) => {
            const data = readData();
            if (!data.exhibitions) data.exhibitions = [];
            data.exhibitions.push(exhibition);
            writeData(data);
            return exhibition;
        },
    },
    exhibitionProducts: {
        getAll: () => readData().exhibitionProducts || [],
        getByExhibitionId: (exhibitionId: string) => readData().exhibitionProducts?.filter((ep) => ep.exhibitionId === exhibitionId) || [],
        add: (exhibitionProduct: ExhibitionProduct) => {
            const data = readData();
            if (!data.exhibitionProducts) data.exhibitionProducts = [];
            data.exhibitionProducts.push(exhibitionProduct);
            writeData(data);
            return exhibitionProduct;
        },
        update: (id: string, updates: Partial<ExhibitionProduct>) => {
            const data = readData();
            if (!data.exhibitionProducts) return null;
            const index = data.exhibitionProducts.findIndex((ep) => ep.id === id);
            if (index === -1) return null;
            data.exhibitionProducts[index] = { ...data.exhibitionProducts[index], ...updates };
            writeData(data);
            return data.exhibitionProducts[index];
        }
    },
    productLists: {
        getAll: () => readData().productLists || [],
        getByExhibitionId: (exhibitionId: string) => readData().productLists?.filter((pl) => pl.exhibitionId === exhibitionId) || [],
        getById: (id: string) => readData().productLists?.find((pl) => pl.id === id),
        add: (productList: ProductList) => {
            const data = readData();
            if (!data.productLists) data.productLists = [];
            data.productLists.push(productList);
            writeData(data);
            return productList;
        },
        update: (id: string, updates: Partial<ProductList>) => {
            const data = readData();
            if (!data.productLists) return null;
            const index = data.productLists.findIndex((pl) => pl.id === id);
            if (index === -1) return null;
            data.productLists[index] = { ...data.productLists[index], ...updates };
            writeData(data);
            return data.productLists[index];
        }
    },
    productListItems: {
        getAll: () => readData().productListItems || [],
        getByProductListId: (productListId: string) => readData().productListItems?.filter((pli) => pli.productListId === productListId) || [],
        add: (item: ProductListItem) => {
            const data = readData();
            if (!data.productListItems) data.productListItems = [];
            data.productListItems.push(item);
            writeData(data);
            return item;
        },
        deleteByProductListId: (productListId: string) => {
            const data = readData();
            if (!data.productListItems) return;
            data.productListItems = data.productListItems.filter(item => item.productListId !== productListId);
            writeData(data);
        }
    }
};

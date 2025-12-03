
import { NextResponse } from 'next/server';
import { db, Order } from '@/lib/db';

export async function GET() {
    // Get all exhibitions
    const exhibitions = db.exhibitions.getAll();

    // Get all approved product lists
    const allProductLists = db.productLists.getAll();
    const approvedLists = allProductLists.filter(pl => pl.status === 'approved');

    // Map approved lists to exhibitions
    const exhibitionsWithOrders = exhibitions.map(exhibition => {
        const exhibitionLists = approvedLists.filter(pl => pl.exhibitionId === exhibition.exhibitionId);

        // Calculate totals from all lists for this exhibition
        let totalValue = 0;
        let totalQuantity = 0;
        const allItems: any[] = [];

        exhibitionLists.forEach(list => {
            totalQuantity += list.totalQuantity;
            const items = db.productListItems.getByProductListId(list.id);
            items.forEach(item => {
                totalValue += (item.price || 0) * item.quantity;

                // Enrich item details
                const product = db.products.getById(item.productId);
                allItems.push({
                    ...item,
                    productName: product?.name,
                    productImage: product?.image,
                    productUnit: product?.unit,
                    supplierId: list.supplierId,
                });
            });
        });

        return {
            ...exhibition,
            orders: allItems, // Keeping 'orders' key for frontend compatibility, but it contains items from all lists
            totalValue,
            totalQuantity,
            status: exhibitionLists.length > 0 ? 'Active' : 'Pending', // Simple status logic
        };
    });

    return NextResponse.json(exhibitionsWithOrders);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newOrder: Order = {
            id: Math.floor(Math.random() * 10000).toString(),
            ...body,
        };
        const createdOrder = db.orders.add(newOrder);
        return NextResponse.json(createdOrder, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}

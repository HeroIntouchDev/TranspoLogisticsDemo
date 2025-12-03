import { NextResponse } from 'next/server';
import { db, ProductList, ProductListItem } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const exhibitionId = searchParams.get('exhibitionId');

    let lists = db.productLists.getAll();

    if (exhibitionId) {
        lists = lists.filter(l => l.exhibitionId === exhibitionId);
    }

    // Enrich with exhibition name if needed, or just return lists
    // For now, returning lists is enough. The frontend can fetch exhibition details separately or we can enrich here.

    return NextResponse.json(lists);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { exhibitionId, supplierId, items } = body;

        if (!exhibitionId || !supplierId || !items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const totalQuantity = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

        const newProductList: ProductList = {
            id: Math.random().toString(36).substr(2, 9),
            exhibitionId,
            supplierId,
            status: 'pending',
            createdAt: new Date().toISOString(),
            totalQuantity,
        };

        db.productLists.add(newProductList);

        items.forEach((item: any) => {
            const newItem: ProductListItem = {
                id: Math.random().toString(36).substr(2, 9),
                productListId: newProductList.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price || 0, // Should ideally fetch from product DB to ensure accuracy
            };
            db.productListItems.add(newItem);
        });

        return NextResponse.json(newProductList, { status: 201 });
    } catch (error) {
        console.error('Error creating product list:', error);
        return NextResponse.json({ error: 'Failed to create product list' }, { status: 500 });
    }
}

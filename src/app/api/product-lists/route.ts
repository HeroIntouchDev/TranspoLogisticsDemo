import { NextResponse } from 'next/server';
import { mockDb, ProductList, ProductListItem } from '@/services/mockDb';
import { requireRoles, PERMISSIONS } from '@/middleware/rbac';

export async function GET(request: Request) {
    const authResult = requireRoles(request, PERMISSIONS.ORDER_READ);
    if (!authResult.authorized) {
        return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const exhibitionId = searchParams.get('exhibitionId');

    let lists = mockDb.getProductLists();

    if (exhibitionId) {
        lists = lists.filter(l => l.exhibitionId === exhibitionId);
    }

    return NextResponse.json(lists);
}

export async function POST(request: Request) {
    const authResult = requireRoles(request, PERMISSIONS.ORDER_CREATE);
    if (!authResult.authorized) {
        return authResult.response;
    }

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

        mockDb.addProductList(newProductList);

        items.forEach((item: any) => {
            const newItem: ProductListItem = {
                id: Math.random().toString(36).substr(2, 9),
                productListId: newProductList.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price || 0,
            };
            mockDb.addProductListItem(newItem);
        });

        return NextResponse.json(newProductList, { status: 201 });
    } catch (error) {
        console.error('Error creating product list:', error);
        return NextResponse.json({ error: 'Failed to create product list' }, { status: 500 });
    }
}

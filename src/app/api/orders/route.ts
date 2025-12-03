
import { NextResponse } from 'next/server';
import { mockDb, Order } from '@/services/mockDb';
import { requireRoles, PERMISSIONS } from '@/middleware/rbac';

export async function GET(request: Request) {
    const authResult = requireRoles(request, PERMISSIONS.ORDER_READ);
    if (!authResult.authorized) {
        return authResult.response;
    }

    // Get all exhibitions
    const exhibitions = mockDb.getExhibitions();

    // Get all approved product lists
    const allProductLists = mockDb.getProductLists();
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
            const items = mockDb.getProductListItemsByProductListId(list.id);
            items.forEach(item => {
                totalValue += (item.price || 0) * item.quantity;

                // Enrich item details
                const product = mockDb.getProductById(item.productId);
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
            orders: allItems,
            totalValue,
            totalQuantity,
            status: exhibitionLists.length > 0 ? 'Active' : 'Pending',
        };
    });

    return NextResponse.json(exhibitionsWithOrders);
}

export async function POST(request: Request) {
    const authResult = requireRoles(request, PERMISSIONS.ORDER_CREATE);
    if (!authResult.authorized) {
        return authResult.response;
    }

    try {
        const body = await request.json();
        const { exhibitionId, items } = body;

        // CRITICAL BUSINESS LOGIC: Validate that all products are approved for this exhibition
        if (exhibitionId && items && Array.isArray(items)) {
            for (const item of items) {
                const isApproved = mockDb.isProductApprovedForExhibition(exhibitionId, item.productId);
                if (!isApproved) {
                    const product = mockDb.getProductById(item.productId);
                    return NextResponse.json(
                        { 
                            error: 'Cannot create order with unapproved products',
                            details: `Product "${product?.name}" (ID: ${item.productId}) is not approved for this exhibition`
                        },
                        { status: 400 }
                    );
                }
            }
        }

        const newOrder: Order = {
            id: Math.floor(Math.random() * 10000).toString(),
            exhibitionId,
            createdAt: new Date().toISOString(),
            status: 'DRAFT',
            ...body,
        };

        const createdOrder = mockDb.addOrder(newOrder);
        return NextResponse.json(createdOrder, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}

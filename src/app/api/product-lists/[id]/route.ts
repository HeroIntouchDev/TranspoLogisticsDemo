import { NextResponse } from 'next/server';
import { mockDb, ProductList, ProductListItem } from '@/services/mockDb';
import { requireRoles, PERMISSIONS } from '@/middleware/rbac';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const authResult = requireRoles(request, PERMISSIONS.ORDER_READ);
    if (!authResult.authorized) {
        return authResult.response;
    }

    const params = await props.params;
    const list = mockDb.getProductListById(params.id);
    if (!list) {
        return NextResponse.json({ error: 'Product list not found' }, { status: 404 });
    }

    const items = mockDb.getProductListItemsByProductListId(list.id);

    // Enrich items with product details
    const enrichedItems = items.map(item => {
        const product = mockDb.getProductById(item.productId);
        return {
            ...item,
            productName: product?.name,
            productSKU: product?.id,
            productUnit: product?.unit,
            productImage: product?.image,
        };
    });

    return NextResponse.json({ ...list, items: enrichedItems });
}

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const authResult = requireRoles(request, PERMISSIONS.ORDER_UPDATE);
    if (!authResult.authorized) {
        return authResult.response;
    }

    const params = await props.params;
    try {
        const body = await request.json();
        const { status, items } = body;

        const list = mockDb.getProductListById(params.id);
        if (!list) {
            return NextResponse.json({ error: 'Product list not found' }, { status: 404 });
        }

        // Update status
        if (status) {
            mockDb.updateProductList(list.id, { status });
        }

        // Update items if provided
        if (items && Array.isArray(items)) {
            // Calculate new total quantity
            const totalQuantity = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
            mockDb.updateProductList(list.id, { totalQuantity });

            // Remove old items
            mockDb.deleteProductListItemsByProductListId(list.id);

            // Add new items
            items.forEach((item: any) => {
                const newItem: ProductListItem = {
                    id: Math.random().toString(36).substr(2, 9),
                    productListId: list.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price || 0,
                };
                mockDb.addProductListItem(newItem);
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating product list:', error);
        return NextResponse.json({ error: 'Failed to update product list' }, { status: 500 });
    }
}

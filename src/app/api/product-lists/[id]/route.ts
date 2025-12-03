import { NextResponse } from 'next/server';
import { db, ProductList, ProductListItem } from '@/lib/db';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const list = db.productLists.getById(params.id);
    if (!list) {
        return NextResponse.json({ error: 'Product list not found' }, { status: 404 });
    }

    const items = db.productListItems.getByProductListId(list.id);

    // Enrich items with product details
    const enrichedItems = items.map(item => {
        const product = db.products.getById(item.productId);
        return {
            ...item,
            productName: product?.name,
            productSKU: product?.id, // Using ID as SKU for now
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
    const params = await props.params;
    try {
        const body = await request.json();
        const { status, items } = body;

        const list = db.productLists.getById(params.id);
        if (!list) {
            return NextResponse.json({ error: 'Product list not found' }, { status: 404 });
        }

        // Update status
        if (status) {
            db.productLists.update(list.id, { status });
        }

        // Update items (only if pending, or if logic allows)
        // For now, we'll assume full replacement of items if 'items' is provided
        if (items && Array.isArray(items)) {
            // Calculate new total quantity
            const totalQuantity = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
            db.productLists.update(list.id, { totalQuantity });

            // Remove old items
            db.productListItems.deleteByProductListId(list.id);

            // Add new items
            items.forEach((item: any) => {
                const newItem: ProductListItem = {
                    id: Math.random().toString(36).substr(2, 9),
                    productListId: list.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price || 0,
                };
                db.productListItems.add(newItem);
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating product list:', error);
        return NextResponse.json({ error: 'Failed to update product list' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { mockDb, ExhibitionProduct } from '@/services/mockDb';
import { requireRoles, PERMISSIONS } from '@/middleware/rbac';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = requireRoles(request, PERMISSIONS.EXHIBITION_READ);
    if (!authResult.authorized) {
        return authResult.response;
    }

    const { id: exhibitionId } = await params;

    // Get all products for this exhibition
    const exhibitionProducts = mockDb.getExhibitionProductsByExhibitionId(exhibitionId);

    // Enrich with product details
    const enrichedProducts = exhibitionProducts.map(ep => {
        const product = mockDb.getProductById(ep.productId);
        return {
            ...ep,
            productName: product?.name,
            productImage: product?.image,
            productUnit: product?.unit,
        };
    });

    return NextResponse.json(enrichedProducts);
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = requireRoles(request, PERMISSIONS.EXHIBITION_CREATE);
    if (!authResult.authorized) {
        return authResult.response;
    }

    try {
        const { id: exhibitionId } = await params;
        const body = await request.json();
        const { products } = body;

        if (products && Array.isArray(products)) {
            products.forEach((p: any) => {
                const newExhibitionProduct: ExhibitionProduct = {
                    id: Math.random().toString(36).substr(2, 9),
                    exhibitionId: exhibitionId,
                    productId: p.productId,
                    quantity: p.quantity,
                    price: p.price,
                    status: 'pending',
                    supplierId: 'current-user',
                };
                mockDb.addExhibitionProduct(newExhibitionProduct);
            });
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error('Error adding exhibition products:', error);
        return NextResponse.json({ error: 'Failed to add products' }, { status: 500 });
    }
}

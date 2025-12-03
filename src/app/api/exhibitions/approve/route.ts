import { NextResponse } from 'next/server';
import { mockDb } from '@/services/mockDb';
import { requireRoles, PERMISSIONS } from '@/middleware/rbac';

export async function GET(request: Request) {
    const authResult = requireRoles(request, PERMISSIONS.APPROVAL_READ);
    if (!authResult.authorized) {
        return authResult.response;
    }

    // Get all pending exhibition products
    const pendingProducts = mockDb.getPendingExhibitionProducts();

    // Enrich with exhibition and product details
    const enrichedPendingProducts = pendingProducts.map(ep => {
        const exhibition = mockDb.getExhibitionByExhibitionId(ep.exhibitionId);
        const product = mockDb.getProductById(ep.productId);
        return {
            ...ep,
            exhibitionName: exhibition?.name,
            productName: product?.name,
            productImage: product?.image,
        };
    });

    return NextResponse.json(enrichedPendingProducts);
}

export async function POST(request: Request) {
    const authResult = requireRoles(request, PERMISSIONS.APPROVAL_APPROVE);
    if (!authResult.authorized) {
        return authResult.response;
    }

    try {
        const body = await request.json();
        const { id, status } = body;

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const updatedProduct = mockDb.updateExhibitionProduct(id, { status });

        if (!updatedProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error('Error updating exhibition product status:', error);
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }
}

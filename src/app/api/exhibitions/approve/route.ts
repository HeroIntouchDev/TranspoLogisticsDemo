import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    // Get all pending exhibition products
    const allExhibitionProducts = db.exhibitionProducts.getAll();
    const pendingProducts = allExhibitionProducts.filter(ep => ep.status === 'pending');

    // Enrich with exhibition and product details
    const enrichedPendingProducts = pendingProducts.map(ep => {
        const exhibition = db.exhibitions.getAll().find(e => e.exhibitionId === ep.exhibitionId);
        const product = db.products.getById(ep.productId);
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
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const updatedProduct = db.exhibitionProducts.update(id, { status });

        if (!updatedProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error('Error updating exhibition product status:', error);
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }
}

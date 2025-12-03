import { NextResponse } from 'next/server';
import { db, ExhibitionProduct } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const exhibitionId = params.id;

    // Get all products for this exhibition
    const exhibitionProducts = db.exhibitionProducts.getByExhibitionId(exhibitionId);

    // Enrich with product details
    const enrichedProducts = exhibitionProducts.map(ep => {
        const product = db.products.getById(ep.productId);
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
    { params }: { params: { id: string } }
) {
    try {
        const exhibitionId = params.id;
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
                    supplierId: 'current-user', // Placeholder
                };
                db.exhibitionProducts.add(newExhibitionProduct);
            });
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error('Error adding exhibition products:', error);
        return NextResponse.json({ error: 'Failed to add products' }, { status: 500 });
    }
}

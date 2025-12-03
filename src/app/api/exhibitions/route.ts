import { NextResponse } from 'next/server';
import { db, Exhibition, ExhibitionProduct } from '@/lib/db';

export async function GET() {
    const exhibitions = db.exhibitions.getAll();
    return NextResponse.json(exhibitions);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, startDate, endDate, products } = body;

        const exhibitionId = `EX-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

        const newExhibition: Exhibition = {
            id: Math.random().toString(36).substr(2, 9),
            exhibitionId,
            name,
            description,
            startDate,
            endDate,
        };

        db.exhibitions.add(newExhibition);

        if (products && Array.isArray(products)) {
            products.forEach((p: any) => {
                const newExhibitionProduct: ExhibitionProduct = {
                    id: Math.random().toString(36).substr(2, 9),
                    exhibitionId: newExhibition.exhibitionId,
                    productId: p.productId,
                    quantity: p.quantity,
                    price: p.price,
                    status: 'pending',
                    supplierId: 'current-user', // Placeholder
                };
                db.exhibitionProducts.add(newExhibitionProduct);
            });
        }

        return NextResponse.json(newExhibition, { status: 201 });
    } catch (error) {
        console.error('Error creating exhibition:', error);
        return NextResponse.json({ error: 'Failed to create exhibition' }, { status: 500 });
    }
}

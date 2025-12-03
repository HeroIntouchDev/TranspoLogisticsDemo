import { NextResponse } from 'next/server';
import { mockDb, Exhibition, ExhibitionProduct } from '@/services/mockDb';
import { requireRoles, PERMISSIONS } from '@/middleware/rbac';

export async function GET(request: Request) {
    const authResult = requireRoles(request, PERMISSIONS.EXHIBITION_READ);
    if (!authResult.authorized) {
        return authResult.response;
    }

    const exhibitions = mockDb.getExhibitions();
    return NextResponse.json(exhibitions);
}

export async function POST(request: Request) {
    const authResult = requireRoles(request, PERMISSIONS.EXHIBITION_CREATE);
    if (!authResult.authorized) {
        return authResult.response;
    }

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
            status: 'PLANNING',
        };

        mockDb.addExhibition(newExhibition);

        if (products && Array.isArray(products)) {
            products.forEach((p: any) => {
                const newExhibitionProduct: ExhibitionProduct = {
                    id: Math.random().toString(36).substr(2, 9),
                    exhibitionId: newExhibition.exhibitionId,
                    productId: p.productId,
                    quantity: p.quantity,
                    price: p.price,
                    status: 'pending',
                    supplierId: 'current-user',
                };
                mockDb.addExhibitionProduct(newExhibitionProduct);
            });
        }

        return NextResponse.json(newExhibition, { status: 201 });
    } catch (error) {
        console.error('Error creating exhibition:', error);
        return NextResponse.json({ error: 'Failed to create exhibition' }, { status: 500 });
    }
}

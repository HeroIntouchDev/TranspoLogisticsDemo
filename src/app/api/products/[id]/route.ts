import { NextResponse } from 'next/server';
import { mockDb } from '@/services/mockDb';
import { requireRoles, PERMISSIONS } from '@/middleware/rbac';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = requireRoles(request, PERMISSIONS.PRODUCT_READ);
    if (!authResult.authorized) {
        return authResult.response;
    }

    const id = (await params).id;
    const product = mockDb.getProductById(id);
    if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = requireRoles(request, PERMISSIONS.PRODUCT_UPDATE);
    if (!authResult.authorized) {
        return authResult.response;
    }

    try {
        const id = (await params).id;
        const body = await request.json();
        const updatedProduct = mockDb.updateProduct(id, body);
        if (!updatedProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json(updatedProduct);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = requireRoles(request, PERMISSIONS.PRODUCT_DELETE);
    if (!authResult.authorized) {
        return authResult.response;
    }

    const id = (await params).id;
    const success = mockDb.deleteProduct(id);
    if (!success) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Product deleted' });
}

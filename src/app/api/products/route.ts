import { NextResponse } from 'next/server';
import { mockDb, Product } from '@/services/mockDb';
import { requireRoles, PERMISSIONS } from '@/middleware/rbac';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
    // Check read permission
    const authResult = requireRoles(request, PERMISSIONS.PRODUCT_READ);
    if (!authResult.authorized) {
        return authResult.response;
    }

    const products = mockDb.getProducts();
    return NextResponse.json(products);
}

export async function POST(request: Request) {
    // Check create permission
    const authResult = requireRoles(request, PERMISSIONS.PRODUCT_CREATE);
    if (!authResult.authorized) {
        return authResult.response;
    }

    try {
        const formData = await request.formData();
        const image = formData.get('image') as File | null;

        let imagePath = '/placeholder.png';

        if (image) {
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Ensure uploads directory exists
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            try {
                await mkdir(uploadDir, { recursive: true });
            } catch (e) {
                // Ignore error if directory exists
            }

            // Create unique filename
            const filename = `${Date.now()}-${image.name.replace(/\s/g, '-')}`;
            const filepath = path.join(uploadDir, filename);

            await writeFile(filepath, buffer);
            imagePath = `/uploads/${filename}`;
        }

        const newProduct: Product = {
            id: formData.get('id') as string || Math.floor(Math.random() * 1000000).toString(),
            name: formData.get('name') as string,
            category: formData.get('category') as string,
            buyingPrice: Number(formData.get('buyingPrice')),
            quantity: Number(formData.get('quantity')),
            unit: formData.get('unit') as string,
            thresholdValue: Number(formData.get('thresholdValue')),
            expiryDate: formData.get('expiryDate') as string,
            availability: formData.get('availability') as 'In-stock' | 'Out of stock' | 'Low stock',
            image: imagePath,
            sku: `SKU-${formData.get('id') || Math.floor(Math.random() * 1000000)}`,
            isApproved: false, // New products default to not approved
        };

        const createdProduct = mockDb.addProduct(newProduct);
        return NextResponse.json(createdProduct, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

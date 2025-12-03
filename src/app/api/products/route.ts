import { NextResponse } from 'next/server';
import { db, Product } from '@/lib/db';

export async function GET() {
    const products = db.products.getAll();
    return NextResponse.json(products);
}

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
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
        };

        const createdProduct = db.products.add(newProduct);
        return NextResponse.json(createdProduct, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

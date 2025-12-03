# 🔄 Migration Guide: From In-Memory to Real Database

This guide explains how to migrate from the in-memory mockDb to a real database (MongoDB, PostgreSQL, etc.) when ready for production.

## Overview

The current implementation uses an in-memory singleton (`mockDb`) for data storage. This guide shows how to add database persistence while maintaining the same API structure.

---

## Architecture Pattern: Repository/Adapter

### Current Setup
```
API Routes → mockDb (in-memory)
```

### Target Setup
```
API Routes → Database Adapter → Real Database (MongoDB/PostgreSQL)
```

---

## Step 1: Create Database Adapter Interface

Create `src/services/database.interface.ts`:

```typescript
// Define interface that both mockDb and real DB must implement
export interface IDatabase {
  // Products
  getProducts(): Product[];
  getProductById(id: string): Product | undefined;
  addProduct(product: Product): Product;
  updateProduct(id: string, updates: Partial<Product>): Product | null;
  deleteProduct(id: string): boolean;

  // Exhibitions
  getExhibitions(): Exhibition[];
  getExhibitionById(id: string): Exhibition | undefined;
  addExhibition(exhibition: Exhibition): Exhibition;
  
  // Exhibition Products
  getExhibitionProducts(): ExhibitionProduct[];
  getExhibitionProductsByExhibitionId(exhibitionId: string): ExhibitionProduct[];
  addExhibitionProduct(ep: ExhibitionProduct): ExhibitionProduct;
  updateExhibitionProduct(id: string, updates: Partial<ExhibitionProduct>): ExhibitionProduct | null;
  
  // Orders
  getOrders(): Order[];
  addOrder(order: Order): Order;
  
  // ... etc
}
```

---

## Step 2: Update MockDB to Implement Interface

Update `src/services/mockDb.ts`:

```typescript
import { IDatabase } from './database.interface';

export class MockDB implements IDatabase {
  // ... existing implementation
}
```

---

## Step 3: Create MongoDB Adapter (Example)

Create `src/services/mongoDb.ts`:

```typescript
import { MongoClient, Db } from 'mongodb';
import { IDatabase } from './database.interface';
import { Product, Exhibition, Order } from './mockDb';

export class MongoDB implements IDatabase {
  private client: MongoClient;
  private db: Db;

  constructor(connectionString: string) {
    this.client = new MongoClient(connectionString);
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db('transpo_logistic');
  }

  async getProducts(): Promise<Product[]> {
    return await this.db.collection('products').find({}).toArray();
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return await this.db.collection('products').findOne({ id });
  }

  async addProduct(product: Product): Promise<Product> {
    await this.db.collection('products').insertOne(product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const result = await this.db.collection('products')
      .findOneAndUpdate(
        { id },
        { $set: updates },
        { returnDocument: 'after' }
      );
    return result.value;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await this.db.collection('products').deleteOne({ id });
    return result.deletedCount > 0;
  }

  // ... implement other methods
}
```

---

## Step 4: Create Database Factory

Create `src/services/database.factory.ts`:

```typescript
import { IDatabase } from './database.interface';
import { MockDB } from './mockDb';
import { MongoDB } from './mongoDb';

export function createDatabase(): IDatabase {
  const dbType = process.env.DB_TYPE || 'mock';

  switch (dbType) {
    case 'mongodb':
      const mongoDb = new MongoDB(process.env.MONGODB_URI!);
      // Note: In real app, handle connection in middleware
      return mongoDb;
    
    case 'postgresql':
      // return new PostgresDB(process.env.POSTGRES_URI!);
      throw new Error('PostgreSQL not implemented yet');
    
    case 'mock':
    default:
      return MockDB.getInstance();
  }
}

// Export singleton instance
export const db = createDatabase();
```

---

## Step 5: Update API Routes

Update all API routes to use the factory:

```typescript
// Before
import { mockDb } from '@/services/mockDb';

// After
import { db } from '@/services/database.factory';

// Usage stays the same!
const products = db.getProducts();
```

---

## Step 6: Environment Configuration

Add to `.env`:

```bash
# Database Configuration
DB_TYPE=mock              # Options: mock, mongodb, postgresql

# MongoDB (if using)
MONGODB_URI=mongodb://localhost:27017/transpo_logistic

# PostgreSQL (if using)
# POSTGRES_URI=postgresql://user:pass@localhost:5432/transpo_logistic
```

---

## Step 7: Handle Async Operations

### Issue: MockDB is synchronous, real DBs are async

#### Solution A: Make Interface Async
```typescript
export interface IDatabase {
  getProducts(): Promise<Product[]>;
  // All methods return Promises
}
```

Then update mockDb:
```typescript
async getProducts(): Promise<Product[]> {
  return Promise.resolve([...this.data.products]);
}
```

And update API routes:
```typescript
// Before
const products = db.getProducts();

// After
const products = await db.getProducts();
```

#### Solution B: Sync Wrapper
Keep mockDb sync, wrap async DB calls:
```typescript
class MongoDBSyncWrapper implements IDatabase {
  private asyncDb: MongoDB;

  getProducts(): Product[] {
    // Use caching or throw error if not yet loaded
    return this.cache.products;
  }
}
```

---

## Step 8: Migration Script

Create `scripts/migrate-to-db.ts`:

```typescript
import { mockDb } from '@/services/mockDb';
import { MongoDB } from '@/services/mongoDb';

async function migrate() {
  const mongoDb = new MongoDB(process.env.MONGODB_URI!);
  await mongoDb.connect();

  console.log('Migrating products...');
  const products = mockDb.getProducts();
  for (const product of products) {
    await mongoDb.addProduct(product);
  }

  console.log('Migrating exhibitions...');
  const exhibitions = mockDb.getExhibitions();
  for (const exhibition of exhibitions) {
    await mongoDb.addExhibition(exhibition);
  }

  // ... migrate all data

  console.log('Migration complete!');
  process.exit(0);
}

migrate().catch(console.error);
```

Run with:
```bash
DB_TYPE=mongodb MONGODB_URI=mongodb://localhost:27017 ts-node scripts/migrate-to-db.ts
```

---

## Step 9: Testing Strategy

### Dual Testing
```typescript
// Test both implementations
describe('Database Tests', () => {
  const databases = [
    { name: 'MockDB', db: MockDB.getInstance() },
    { name: 'MongoDB', db: new MongoDB(TEST_URI) },
  ];

  databases.forEach(({ name, db }) => {
    describe(name, () => {
      test('should get products', async () => {
        const products = await db.getProducts();
        expect(products).toBeDefined();
      });
    });
  });
});
```

---

## Step 10: Rollout Strategy

### Phase 1: Development (Current)
```
DB_TYPE=mock
```
All developers use in-memory DB

### Phase 2: Staging
```
DB_TYPE=mongodb
MONGODB_URI=mongodb://staging-server
```
Test with real database

### Phase 3: Production
```
DB_TYPE=mongodb
MONGODB_URI=mongodb://prod-server
```
Deploy with confidence

---

## Example: Complete MongoDB Implementation

### Install Dependencies
```bash
npm install mongodb
npm install --save-dev @types/mongodb
```

### Update package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:mongo": "DB_TYPE=mongodb next dev",
    "migrate": "ts-node scripts/migrate-to-db.ts"
  }
}
```

### Connection Middleware
Create `src/lib/db-connection.ts`:
```typescript
import { db } from '@/services/database.factory';

export async function ensureDbConnection() {
  if (db instanceof MongoDB && !db.isConnected()) {
    await db.connect();
  }
}
```

Use in API routes:
```typescript
export async function GET(request: Request) {
  await ensureDbConnection();
  const products = await db.getProducts();
  return NextResponse.json(products);
}
```

---

## Benefits of This Approach

### ✅ Advantages
1. **No breaking changes** - API routes stay the same
2. **Easy rollback** - Switch `DB_TYPE=mock` to revert
3. **Testable** - Both implementations tested
4. **Gradual migration** - Move one entity at a time
5. **Zero downtime** - Deploy without disruption

### 🎯 Best Practices
1. **Keep interface simple** - Don't over-engineer
2. **Test both implementations** - Ensure parity
3. **Use environment variables** - Easy configuration
4. **Cache when possible** - Reduce DB load
5. **Monitor performance** - Track DB queries

---

## PostgreSQL Example

For PostgreSQL with Prisma:

### Install Prisma
```bash
npm install @prisma/client
npm install -D prisma
```

### Initialize Prisma
```bash
npx prisma init
```

### Define Schema
`prisma/schema.prisma`:
```prisma
model Product {
  id            String   @id
  name          String
  category      String
  buyingPrice   Int
  quantity      Int
  unit          String
  isApproved    Boolean  @default(false)
  // ... other fields
}
```

### Generate Client
```bash
npx prisma generate
```

### Create Adapter
```typescript
import { PrismaClient } from '@prisma/client';

export class PostgresDB implements IDatabase {
  private prisma = new PrismaClient();

  async getProducts() {
    return await this.prisma.product.findMany();
  }
  
  // ... implement interface
}
```

---

## Monitoring & Observability

### Add Logging
```typescript
class MongoDBWithLogging implements IDatabase {
  private db: MongoDB;

  async getProducts() {
    console.log('[DB] Fetching products...');
    const start = Date.now();
    const result = await this.db.getProducts();
    console.log(`[DB] Fetched ${result.length} products in ${Date.now() - start}ms`);
    return result;
  }
}
```

### Add Metrics
```typescript
import { metrics } from '@/lib/monitoring';

async getProducts() {
  metrics.increment('db.query.products');
  const result = await this.db.getProducts();
  metrics.gauge('db.products.count', result.length);
  return result;
}
```

---

## Summary

This migration guide provides:
1. **Interface-based design** for easy swapping
2. **Factory pattern** for database selection
3. **Migration scripts** for data transfer
4. **Testing strategy** for both implementations
5. **Rollout plan** for safe deployment

**Key Takeaway**: The adapter pattern allows you to switch from in-memory to real database with minimal code changes, maintaining the same API structure throughout.

---

## Need Help?

- Review existing `mockDb.ts` for reference implementation
- Check `database.interface.ts` for complete interface
- Use migration script to transfer data
- Test with `DB_TYPE=mock` first, then switch to real DB

**Ready when you are!** The current in-memory implementation provides a solid foundation for database migration.

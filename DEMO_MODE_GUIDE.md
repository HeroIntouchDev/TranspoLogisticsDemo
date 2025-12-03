# In-Memory Demo Mode - Implementation Guide

## Overview

This project has been refactored to support **In-Memory Demo Mode**, allowing deployment without a database. All data is stored in memory during the user session using a singleton pattern.

## Architecture Changes

### 1. New Services Layer

#### **`src/services/mockDb.ts`** - Singleton In-Memory Database
- **Purpose**: Central data store for all application data
- **Pattern**: Singleton to maintain state across API calls
- **Features**:
  - User management (RBAC)
  - Product management with approval flags
  - Exhibition and exhibition products
  - Orders with validation
  - Product lists and items
  - Packaging hierarchy (Item → Carton → Pallet)
  - Ingredients tracking

#### **`src/middleware/rbac.ts`** - Role-Based Access Control
- **Roles**: ADMIN, MANAGER, USER, VIEWER
- **Features**:
  - Authentication simulation
  - Permission checking
  - Role-based route protection
- **Usage**: Pass `x-user-id` header to simulate different users (defaults to `u3` - Staff)

### 2. Business Logic Implementation

#### **Critical Flow: Product → Exhibition → Approve → Order**

1. **Create Product** (`/api/products`)
   - Products default to `isApproved: false`
   - Available to ADMIN, MANAGER, USER roles

2. **Create Exhibition** (`/api/exhibitions`)
   - Exhibitions can contain products
   - Products in exhibitions start with `status: 'pending'`
   - Available to ADMIN, MANAGER roles

3. **Approve Products** (`/api/exhibitions/approve`)
   - Changes exhibition product status to `'approved'` or `'rejected'`
   - **CRITICAL**: Only approved products can be ordered
   - Available to ADMIN, MANAGER roles

4. **Create Order** (`/api/orders`)
   - **VALIDATION**: Checks if all products in order are approved for the exhibition
   - **REJECTS**: Orders with unapproved products
   - Available to ADMIN, MANAGER, USER roles

### 3. API Route Updates

All API routes have been refactored to:
- Use `mockDb` instead of file-based storage
- Include RBAC middleware for authorization
- Remove file system dependencies (except image uploads)
- Implement proper business logic validation

#### Updated Routes:
- ✅ `/api/products` - Product CRUD with RBAC
- ✅ `/api/products/[id]` - Individual product operations
- ✅ `/api/exhibitions` - Exhibition management
- ✅ `/api/exhibitions/[id]/products` - Exhibition product management
- ✅ `/api/exhibitions/approve` - Approval workflow
- ✅ `/api/orders` - Order creation with validation
- ✅ `/api/product-lists` - Product list management
- ✅ `/api/product-lists/[id]` - Individual list operations

## Data Structure

### Initial Seed Data

The mockDb is pre-loaded with:
- **4 Users** (Admin, Manager, Staff, Viewer)
- **3 Ingredients** (Organic Polymer, Color Pigment Blue, Stabilizer A)
- **6 Packaging Units** (Pallets, Cartons, Items)
- **5 Products** (Maggi, Bru, Red Bull, Bourn Vita, Horlicks)
- **3 Exhibitions** (test exibition, test2, AAAA)
- **4 Exhibition Products** (various approval states)
- **3 Historical Orders**
- **2 Product Lists** with items

## How to Use

### Development Mode

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test with different roles**:
   Add header to API requests:
   ```
   x-user-id: u1  # Admin
   x-user-id: u2  # Manager
   x-user-id: u3  # User (default)
   x-user-id: u4  # Viewer
   ```

3. **Test the approval flow**:
   ```bash
   # 1. Create a product (as USER)
   POST /api/products
   
   # 2. Create an exhibition with the product (as MANAGER)
   POST /api/exhibitions
   
   # 3. Approve the product (as MANAGER)
   GET /api/exhibitions/approve  # See pending
   POST /api/exhibitions/approve { "id": "xxx", "status": "approved" }
   
   # 4. Create an order (as USER)
   POST /api/orders { "exhibitionId": "EX-xxxx", "items": [...] }
   ```

### Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

3. **No database required!** All data is in-memory and resets on server restart.

## Role Permissions

| Operation | ADMIN | MANAGER | USER | VIEWER |
|-----------|-------|---------|------|--------|
| Create Product | ✅ | ✅ | ✅ | ❌ |
| Read Products | ✅ | ✅ | ✅ | ✅ |
| Update Product | ✅ | ✅ | ❌ | ❌ |
| Delete Product | ✅ | ❌ | ❌ | ❌ |
| Create Exhibition | ✅ | ✅ | ❌ | ❌ |
| Approve Products | ✅ | ✅ | ❌ | ❌ |
| Create Order | ✅ | ✅ | ✅ | ❌ |
| Update Order | ✅ | ✅ | ❌ | ❌ |

## Key Features

### ✅ Implemented

1. **In-Memory Storage** - No database connection required
2. **RBAC** - 4-tier role system with permission checks
3. **Approval Workflow** - Products must be approved before ordering
4. **Validation** - Business logic prevents invalid operations
5. **State Management** - Singleton pattern maintains consistency
6. **Type Safety** - Full TypeScript support
7. **Packaging Hierarchy** - Item → Carton → Pallet structure
8. **Ingredient Tracking** - Product composition with precision

### 🔄 Session Behavior

- **Data persists** during the server session
- **Data resets** when server restarts
- **Concurrent users** share the same data store
- **No persistence** to disk (except uploaded images)

## API Examples

### Get Products
```typescript
GET /api/products
Headers: { "x-user-id": "u3" }

Response: [
  {
    "id": "456567",
    "name": "Maggi",
    "category": "Instant food",
    "buyingPrice": 430,
    "quantity": 43,
    "unit": "Packets",
    "isApproved": true,
    ...
  }
]
```

### Approve Exhibition Product
```typescript
POST /api/exhibitions/approve
Headers: { "x-user-id": "u2" }  # Manager or Admin
Body: {
  "id": "cszttszpu",
  "status": "approved"
}

Response: {
  "id": "cszttszpu",
  "status": "approved",
  ...
}
```

### Create Order (with validation)
```typescript
POST /api/orders
Headers: { "x-user-id": "u3" }
Body: {
  "exhibitionId": "EX-2941",
  "items": [
    { "productId": "456567", "quantity": 10 }
  ]
}

# Success if product is approved
Response: { "id": "1234", "status": "DRAFT", ... }

# Error if product is not approved
Response: {
  "error": "Cannot create order with unapproved products",
  "details": "Product 'Bru' (ID: 456568) is not approved..."
}
```

## Files Modified

### New Files
- `src/services/mockDb.ts` - In-memory database singleton
- `src/middleware/rbac.ts` - RBAC middleware
- `DEMO_MODE_GUIDE.md` - This guide

### Modified Files
- `src/app/api/products/route.ts`
- `src/app/api/products/[id]/route.ts`
- `src/app/api/exhibitions/route.ts`
- `src/app/api/exhibitions/[id]/products/route.ts`
- `src/app/api/exhibitions/approve/route.ts`
- `src/app/api/orders/route.ts`
- `src/app/api/product-lists/route.ts`
- `src/app/api/product-lists/[id]/route.ts`

### Legacy Files (Not Used)
- `src/lib/db.ts` - Old file-based storage (kept for reference)
- `data.json` - Static data (data migrated to mockDb)

## Testing the Flow

### Complete Workflow Test

```bash
# 1. View all products
curl http://localhost:3000/api/products

# 2. View pending approvals
curl http://localhost:3000/api/exhibitions/approve

# 3. Approve a product (as Manager u2)
curl -X POST http://localhost:3000/api/exhibitions/approve \
  -H "Content-Type: application/json" \
  -H "x-user-id: u2" \
  -d '{"id":"cszttszpu","status":"approved"}'

# 4. Try to create order with unapproved product (should fail)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "x-user-id: u3" \
  -d '{"exhibitionId":"EX-2941","items":[{"productId":"456570","quantity":5}]}'

# 5. Create order with approved product (should succeed)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "x-user-id: u3" \
  -d '{"exhibitionId":"EX-2941","items":[{"productId":"456567","quantity":5}]}'
```

## Deployment Notes

### ✅ Safe for Deployment
- No database connection required
- No environment variables for DB needed
- Works on any Node.js hosting platform
- Stateless deployment friendly

### ⚠️ Limitations
- Data resets on server restart
- Not suitable for production with real users
- No data persistence between sessions
- Concurrent users share the same data

### 🎯 Perfect For
- Demo presentations
- POC/MVP showcases
- Development and testing
- Client previews
- Portfolio projects

## Troubleshooting

### Issue: RBAC errors
**Solution**: Ensure you're passing the correct `x-user-id` header

### Issue: "Product not approved" error
**Solution**: Go to `/approve` page and approve the product first

### Issue: Changes not persisting
**Solution**: This is expected - data resets on server restart

### Issue: Type errors
**Solution**: Ensure you're importing types from `@/services/mockDb` not `@/lib/db`

## Future Enhancements

Potential improvements for production:
1. Add Redis/session storage for persistence
2. Implement JWT-based authentication
3. Add database adapter pattern to swap mockDb with real DB
4. Implement audit logging
5. Add data export/import functionality

---

**Note**: This implementation is designed for demo purposes. For production use with real users and data persistence, integrate a proper database system.

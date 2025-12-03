# 🎯 Quick Reference - In-Memory Demo Mode

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 👥 Test Users

| User ID | Role | Username | Permissions |
|---------|------|----------|-------------|
| `u1` | ADMIN | admin | Full access |
| `u2` | MANAGER | manager | Create, Read, Approve, Update |
| `u3` | USER | staff | Create, Read |
| `u4` | VIEWER | viewer | Read only |

**Usage**: Add `x-user-id` header to requests (defaults to `u3`)

## 📊 Key API Endpoints

### Products
```bash
GET    /api/products              # List all products
POST   /api/products              # Create product
GET    /api/products/[id]         # Get product
PUT    /api/products/[id]         # Update product
DELETE /api/products/[id]         # Delete product (ADMIN only)
```

### Exhibitions
```bash
GET  /api/exhibitions                      # List exhibitions
POST /api/exhibitions                      # Create exhibition
GET  /api/exhibitions/[id]/products        # Get exhibition products
POST /api/exhibitions/[id]/products        # Add products to exhibition
```

### Approval
```bash
GET  /api/exhibitions/approve              # Get pending approvals
POST /api/exhibitions/approve              # Approve/reject product
     Body: { "id": "xxx", "status": "approved|rejected" }
```

### Orders
```bash
GET  /api/orders                           # List orders
POST /api/orders                           # Create order (validates approval)
     Body: { "exhibitionId": "EX-xxx", "items": [...] }
```

## 🔐 Role Permissions Quick View

| Action | ADMIN | MANAGER | USER | VIEWER |
|--------|:-----:|:-------:|:----:|:------:|
| View Products | ✅ | ✅ | ✅ | ✅ |
| Create Product | ✅ | ✅ | ✅ | ❌ |
| Update Product | ✅ | ✅ | ❌ | ❌ |
| Delete Product | ✅ | ❌ | ❌ | ❌ |
| Create Exhibition | ✅ | ✅ | ❌ | ❌ |
| Approve Products | ✅ | ✅ | ❌ | ❌ |
| Create Order | ✅ | ✅ | ✅ | ❌ |

## 🔄 Workflow Example

```bash
# 1. Create Product (as USER)
curl -X POST http://localhost:3000/api/products \
  -H "x-user-id: u3" \
  -F "name=New Product" \
  -F "category=Electronics" \
  -F "buyingPrice=500"

# 2. Create Exhibition (as MANAGER)
curl -X POST http://localhost:3000/api/exhibitions \
  -H "x-user-id: u2" \
  -H "Content-Type: application/json" \
  -d '{"name":"Tech Expo","products":[{"productId":"456567","quantity":10}]}'

# 3. View Pending Approvals
curl http://localhost:3000/api/exhibitions/approve

# 4. Approve Product (as MANAGER)
curl -X POST http://localhost:3000/api/exhibitions/approve \
  -H "x-user-id: u2" \
  -H "Content-Type: application/json" \
  -d '{"id":"cszttszpu","status":"approved"}'

# 5. Create Order (as USER)
curl -X POST http://localhost:3000/api/orders \
  -H "x-user-id: u3" \
  -H "Content-Type: application/json" \
  -d '{"exhibitionId":"EX-2941","items":[{"productId":"456567","quantity":5}]}'
```

## ⚙️ Key Features

### ✅ Implemented
- In-memory storage (no database)
- RBAC (4 roles)
- Product approval workflow
- Exhibition management
- Order validation
- Product lists
- Packaging hierarchy
- Ingredient tracking

### 🔒 Business Rules
1. **New products** default to `isApproved: false`
2. **Exhibition products** start with `status: 'pending'`
3. **Orders** require all products to be approved
4. **RBAC** enforces role-based permissions
5. **Data** resets on server restart

## 📝 Pre-loaded Data

- **5 Products**: Maggi, Bru, Red Bull, Bourn Vita, Horlicks
- **3 Exhibitions**: test exibition, test2, AAAA
- **4 Exhibition Products** (mixed approval states)
- **3 Historical Orders**
- **4 Users** (one per role)

## 🐛 Troubleshooting

### Issue: 401 Unauthorized
**Fix**: Add `x-user-id` header

### Issue: 403 Forbidden
**Fix**: Use appropriate role (e.g., MANAGER for approvals)

### Issue: Cannot create order
**Fix**: Approve products first via `/api/exhibitions/approve`

### Issue: Data not persisting
**Note**: This is expected - in-memory data resets on restart

## 📚 Documentation

- **Full Guide**: `DEMO_MODE_GUIDE.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Test Script**: `test-api.ps1`

## 🧪 Run Tests

```bash
# PowerShell
.\test-api.ps1

# Or manually test endpoints
curl http://localhost:3000/api/products
```

## 🎯 Core Files

```
src/
├── services/
│   └── mockDb.ts           # In-memory database
├── middleware/
│   └── rbac.ts             # Role-based access control
└── app/api/
    ├── products/           # Product management
    ├── exhibitions/        # Exhibition management
    │   └── approve/        # Approval workflow
    ├── orders/             # Order management
    └── product-lists/      # Product lists
```

## 💡 Tips

1. **Testing roles**: Change `x-user-id` header (u1-u4)
2. **Reset data**: Restart server
3. **Check approval**: GET `/api/exhibitions/approve`
4. **Validate flow**: Use test script
5. **No setup**: Just run and go!

---

**Ready to deploy!** 🚀 No database configuration needed.

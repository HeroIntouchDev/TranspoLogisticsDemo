/**
 * In-Memory Mock Database (Singleton Pattern)
 * This service provides a centralized, in-memory data store for demo deployment
 * without requiring an actual database connection.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// --- RBAC Types ---
export type UserRole = 'ADMIN' | 'MANAGER' | 'USER' | 'VIEWER';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  fullName: string;
}

// --- Packaging Hierarchy Types ---
export type PackagingType = 'ITEM' | 'CARTON' | 'PALLET';

export interface PackagingUnit {
  id: string;
  type: PackagingType;
  code: string;
  weight?: number;
  dimensions?: string;
  parentId?: string;
  childIds?: string[];
}

// --- Product & Ingredient Types ---
export interface Ingredient {
  id: string;
  name: string;
  precision: number;
  stockLevel: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  buyingPrice: number;
  quantity: number;
  unit: string;
  thresholdValue: number;
  expiryDate: string;
  availability: 'In-stock' | 'Out of stock' | 'Low stock';
  image?: string;
  sku?: string;
  description?: string;
  ingredients?: { ingredientId: string; amount: number }[];
  packagingId?: string;
  isApproved?: boolean;
}

// --- Exhibition Types ---
export interface Exhibition {
  id: string;
  exhibitionId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
}

export interface ExhibitionProduct {
  id: string;
  exhibitionId: string;
  productId: string;
  quantity: number;
  price?: number;
  status: 'pending' | 'approved' | 'rejected';
  supplierId: string;
  complianceNotes?: string;
}

// --- Order Types ---
export interface Order {
  id: string;
  exhibition?: string;
  exhibitionId?: string;
  orderValue?: number;
  quantity: number;
  unit: string;
  expectedDelivery?: string;
  status?: 'Delayed' | 'Received' | 'Returned' | 'Out for delivery' | 'Waiting for check' | 'DRAFT' | 'CONFIRMED' | 'SHIPPED';
  createdAt?: string;
  items?: { productId: string; quantity: number }[];
}

// --- Product List Types ---
export interface ProductList {
  id: string;
  exhibitionId: string;
  supplierId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  totalQuantity: number;
}

export interface ProductListItem {
  id: string;
  productListId: string;
  productId: string;
  quantity: number;
  price: number;
}

// ============================================================================
// IN-MEMORY DATA STORE
// ============================================================================

interface MockDatabase {
  users: User[];
  ingredients: Ingredient[];
  packaging: PackagingUnit[];
  products: Product[];
  exhibitions: Exhibition[];
  exhibitionProducts: ExhibitionProduct[];
  orders: Order[];
  productLists: ProductList[];
  productListItems: ProductListItem[];
}

// Initial seed data combining existing mock data
const INITIAL_DATA: MockDatabase = {
  // --- Users for RBAC ---
  users: [
    { id: 'u1', username: 'admin', role: 'ADMIN', fullName: 'Super Admin' },
    { id: 'u2', username: 'manager', role: 'MANAGER', fullName: 'Project Manager' },
    { id: 'u3', username: 'staff', role: 'USER', fullName: 'Operational Staff' },
    { id: 'u4', username: 'viewer', role: 'VIEWER', fullName: 'Read Only Viewer' },
  ],

  // --- Ingredients ---
  ingredients: [
    { id: 'ing1', name: 'Organic Polymer', precision: 0.01, stockLevel: 500 },
    { id: 'ing2', name: 'Color Pigment Blue', precision: 0.05, stockLevel: 120 },
    { id: 'ing3', name: 'Stabilizer A', precision: 0.1, stockLevel: 250 },
  ],

  // --- Packaging Hierarchy ---
  packaging: [
    { id: 'p1', type: 'PALLET', code: 'PAL-001', childIds: ['c1', 'c2'] },
    { id: 'c1', type: 'CARTON', code: 'CRT-A01', parentId: 'p1', childIds: ['i1', 'i2'] },
    { id: 'c2', type: 'CARTON', code: 'CRT-A02', parentId: 'p1', childIds: ['i3'] },
    { id: 'i1', type: 'ITEM', code: 'ITM-001', parentId: 'c1', weight: 0.5 },
    { id: 'i2', type: 'ITEM', code: 'ITM-002', parentId: 'c1', weight: 0.6 },
    { id: 'i3', type: 'ITEM', code: 'ITM-003', parentId: 'c2', weight: 0.55 },
  ],

  // --- Products (merged from data.json) ---
  products: [
    {
      id: '456567',
      name: 'Maggi',
      category: 'Instant food',
      buyingPrice: 430,
      quantity: 43,
      unit: 'Packets',
      thresholdValue: 12,
      expiryDate: '2022-12-11',
      availability: 'In-stock',
      image: '/placeholder.png',
      sku: 'SKU-456567',
      isApproved: true,
    },
    {
      id: '456568',
      name: 'Bru',
      category: 'Instant food',
      buyingPrice: 257,
      quantity: 22,
      unit: 'Packets',
      thresholdValue: 12,
      expiryDate: '2022-12-21',
      availability: 'Out of stock',
      image: '/placeholder.png',
      sku: 'SKU-456568',
      isApproved: false,
    },
    {
      id: '456569',
      name: 'Red Bull',
      category: 'Energy Drink',
      buyingPrice: 405,
      quantity: 36,
      unit: 'Packets',
      thresholdValue: 9,
      expiryDate: '2022-12-05',
      availability: 'In-stock',
      image: '/placeholder.png',
      sku: 'SKU-456569',
      isApproved: true,
    },
    {
      id: '456570',
      name: 'Bourn Vita',
      category: 'Health Drink',
      buyingPrice: 502,
      quantity: 14,
      unit: 'Packets',
      thresholdValue: 6,
      expiryDate: '2022-12-08',
      availability: 'Out of stock',
      image: '/placeholder.png',
      sku: 'SKU-456570',
      isApproved: false,
    },
    {
      id: '456571',
      name: 'Horlicks',
      category: 'Health Drink',
      buyingPrice: 530,
      quantity: 5,
      unit: 'Packets',
      thresholdValue: 5,
      expiryDate: '2023-01-09',
      availability: 'In-stock',
      image: '/placeholder.png',
      sku: 'SKU-456571',
      isApproved: true,
    },
  ],

  // --- Exhibitions (merged from data.json) ---
  exhibitions: [
    {
      id: 'oxurt5ywn',
      exhibitionId: 'EX-2941',
      name: 'test exibition',
      description: 'testtesttest',
      startDate: '2025-12-02',
      endDate: '2025-12-17',
      status: 'PLANNING',
    },
    {
      id: 'ui61d3cma',
      exhibitionId: 'EX-7516',
      name: 'test2',
      description: '',
      startDate: '2025-12-17',
      endDate: '2025-12-17',
      status: 'PLANNING',
    },
    {
      id: 'fs13x086f',
      exhibitionId: 'EX-7460',
      name: 'AAAA',
      description: '',
      startDate: '2025-12-03',
      endDate: '2025-12-06',
      status: 'ACTIVE',
    },
  ],

  // --- Exhibition Products (merged from data.json) ---
  exhibitionProducts: [
    {
      id: 'd7gyiq52d',
      exhibitionId: 'EX-2941',
      productId: '456567',
      quantity: 1,
      status: 'approved',
      supplierId: 'current-user',
    },
    {
      id: 'cszttszpu',
      exhibitionId: 'EX-2941',
      productId: '456568',
      quantity: 1,
      status: 'pending',
      supplierId: 'current-user',
    },
    {
      id: 'is0w5qty1',
      exhibitionId: 'EX-2941',
      productId: '456570',
      quantity: 1,
      status: 'pending',
      supplierId: 'current-user',
    },
    {
      id: '7cajr3r7o',
      exhibitionId: 'EX-2941',
      productId: '456571',
      quantity: 1,
      status: 'pending',
      supplierId: 'current-user',
    },
  ],

  // --- Orders (merged from data.json) ---
  orders: [
    {
      id: '7535',
      exhibition: 'Taste & Treat Festival',
      orderValue: 4306000,
      quantity: 43,
      unit: 'Packets',
      expectedDelivery: '2022-12-11',
      status: 'Delayed',
    },
    {
      id: '5724',
      exhibition: 'Flavors of the City',
      orderValue: 2557000,
      quantity: 22,
      unit: 'Packets',
      expectedDelivery: '2022-12-21',
      status: 'Received',
    },
    {
      id: '2775',
      exhibition: 'Street Bite Market',
      orderValue: 4075000,
      quantity: 36,
      unit: 'Packets',
      expectedDelivery: '2022-12-05',
      status: 'Returned',
    },
  ],

  // --- Product Lists (merged from data.json) ---
  productLists: [
    {
      id: 'a1e8x088e',
      exhibitionId: 'EX-2941',
      supplierId: 'current-user',
      status: 'pending',
      createdAt: '2025-12-03T03:05:05.799Z',
      totalQuantity: 12,
    },
    {
      id: 'r2is3icfx',
      exhibitionId: 'EX-7460',
      supplierId: 'current-user',
      status: 'pending',
      createdAt: '2025-12-03T03:06:14.423Z',
      totalQuantity: 3,
    },
  ],

  // --- Product List Items (merged from data.json) ---
  productListItems: [
    {
      id: '15ukio6ll',
      productListId: 'a1e8x088e',
      productId: '456567',
      quantity: 11,
      price: 430,
    },
    {
      id: 'y9leq73fw',
      productListId: 'a1e8x088e',
      productId: '456568',
      quantity: 1,
      price: 257,
    },
    {
      id: 'j2n0iuw1l',
      productListId: 'r2is3icfx',
      productId: '456567',
      quantity: 1,
      price: 430,
    },
    {
      id: 'r4zoefv9a',
      productListId: 'r2is3icfx',
      productId: '456568',
      quantity: 1,
      price: 257,
    },
    {
      id: 'i66klbiam',
      productListId: 'r2is3icfx',
      productId: '456569',
      quantity: 1,
      price: 405,
    },
  ],
};

// ============================================================================
// MOCK DB SINGLETON CLASS
// ============================================================================

export class MockDB {
  private static instance: MockDB;
  private data: MockDatabase;

  private constructor() {
    // Deep clone initial data to avoid mutations affecting the template
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  public static getInstance(): MockDB {
    if (!MockDB.instance) {
      MockDB.instance = new MockDB();
    }
    return MockDB.instance;
  }

  // Reset data (useful for testing)
  public reset(): void {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  // ============================================================================
  // USERS (RBAC)
  // ============================================================================

  getUsers() {
    return [...this.data.users];
  }

  getUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByUsername(username: string) {
    return this.data.users.find((u) => u.username === username);
  }

  // ============================================================================
  // INGREDIENTS
  // ============================================================================

  getIngredients() {
    return [...this.data.ingredients];
  }

  getIngredientById(id: string) {
    return this.data.ingredients.find((i) => i.id === id);
  }

  addIngredient(ingredient: Ingredient) {
    this.data.ingredients.push(ingredient);
    return ingredient;
  }

  updateIngredient(id: string, updates: Partial<Ingredient>) {
    const index = this.data.ingredients.findIndex((i) => i.id === id);
    if (index === -1) return null;
    this.data.ingredients[index] = { ...this.data.ingredients[index], ...updates };
    return this.data.ingredients[index];
  }

  // ============================================================================
  // PACKAGING
  // ============================================================================

  getPackaging() {
    return [...this.data.packaging];
  }

  getPackagingById(id: string) {
    return this.data.packaging.find((p) => p.id === id);
  }

  addPackaging(packaging: PackagingUnit) {
    this.data.packaging.push(packaging);
    return packaging;
  }

  // ============================================================================
  // PRODUCTS
  // ============================================================================

  getProducts() {
    return [...this.data.products];
  }

  getProductById(id: string) {
    return this.data.products.find((p) => p.id === id);
  }

  addProduct(product: Product) {
    this.data.products.push(product);
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>) {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.data.products[index] = { ...this.data.products[index], ...updates };
    return this.data.products[index];
  }

  deleteProduct(id: string) {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.data.products.splice(index, 1);
    return true;
  }

  // ============================================================================
  // EXHIBITIONS
  // ============================================================================

  getExhibitions() {
    return [...this.data.exhibitions];
  }

  getExhibitionById(id: string) {
    return this.data.exhibitions.find((e) => e.id === id);
  }

  getExhibitionByExhibitionId(exhibitionId: string) {
    return this.data.exhibitions.find((e) => e.exhibitionId === exhibitionId);
  }

  addExhibition(exhibition: Exhibition) {
    this.data.exhibitions.push(exhibition);
    return exhibition;
  }

  updateExhibition(id: string, updates: Partial<Exhibition>) {
    const index = this.data.exhibitions.findIndex((e) => e.id === id);
    if (index === -1) return null;
    this.data.exhibitions[index] = { ...this.data.exhibitions[index], ...updates };
    return this.data.exhibitions[index];
  }

  // ============================================================================
  // EXHIBITION PRODUCTS
  // ============================================================================

  getExhibitionProducts() {
    return [...this.data.exhibitionProducts];
  }

  getExhibitionProductById(id: string) {
    return this.data.exhibitionProducts.find((ep) => ep.id === id);
  }

  getExhibitionProductsByExhibitionId(exhibitionId: string) {
    return this.data.exhibitionProducts.filter((ep) => ep.exhibitionId === exhibitionId);
  }

  addExhibitionProduct(exhibitionProduct: ExhibitionProduct) {
    this.data.exhibitionProducts.push(exhibitionProduct);
    return exhibitionProduct;
  }

  updateExhibitionProduct(id: string, updates: Partial<ExhibitionProduct>) {
    const index = this.data.exhibitionProducts.findIndex((ep) => ep.id === id);
    if (index === -1) return null;
    this.data.exhibitionProducts[index] = { ...this.data.exhibitionProducts[index], ...updates };
    return this.data.exhibitionProducts[index];
  }

  // ============================================================================
  // ORDERS
  // ============================================================================

  getOrders() {
    return [...this.data.orders];
  }

  getOrderById(id: string) {
    return this.data.orders.find((o) => o.id === id);
  }

  addOrder(order: Order) {
    this.data.orders.push(order);
    return order;
  }

  updateOrder(id: string, updates: Partial<Order>) {
    const index = this.data.orders.findIndex((o) => o.id === id);
    if (index === -1) return null;
    this.data.orders[index] = { ...this.data.orders[index], ...updates };
    return this.data.orders[index];
  }

  // ============================================================================
  // PRODUCT LISTS
  // ============================================================================

  getProductLists() {
    return [...this.data.productLists];
  }

  getProductListById(id: string) {
    return this.data.productLists.find((pl) => pl.id === id);
  }

  getProductListsByExhibitionId(exhibitionId: string) {
    return this.data.productLists.filter((pl) => pl.exhibitionId === exhibitionId);
  }

  addProductList(productList: ProductList) {
    this.data.productLists.push(productList);
    return productList;
  }

  updateProductList(id: string, updates: Partial<ProductList>) {
    const index = this.data.productLists.findIndex((pl) => pl.id === id);
    if (index === -1) return null;
    this.data.productLists[index] = { ...this.data.productLists[index], ...updates };
    return this.data.productLists[index];
  }

  // ============================================================================
  // PRODUCT LIST ITEMS
  // ============================================================================

  getProductListItems() {
    return [...this.data.productListItems];
  }

  getProductListItemsByProductListId(productListId: string) {
    return this.data.productListItems.filter((pli) => pli.productListId === productListId);
  }

  addProductListItem(item: ProductListItem) {
    this.data.productListItems.push(item);
    return item;
  }

  deleteProductListItemsByProductListId(productListId: string) {
    this.data.productListItems = this.data.productListItems.filter(
      (item) => item.productListId !== productListId
    );
  }

  // ============================================================================
  // BUSINESS LOGIC HELPERS
  // ============================================================================

  /**
   * Approve an exhibition product (changes status to 'approved')
   */
  approveExhibitionProduct(exhibitionProductId: string) {
    const ep = this.data.exhibitionProducts.find((ep) => ep.id === exhibitionProductId);
    if (ep) {
      ep.status = 'approved';
      return ep;
    }
    return null;
  }

  /**
   * Reject an exhibition product (changes status to 'rejected')
   */
  rejectExhibitionProduct(exhibitionProductId: string) {
    const ep = this.data.exhibitionProducts.find((ep) => ep.id === exhibitionProductId);
    if (ep) {
      ep.status = 'rejected';
      return ep;
    }
    return null;
  }

  /**
   * Get only approved exhibition products for a specific exhibition
   * (Used for order creation - only approved products can be ordered)
   */
  getApprovedExhibitionProducts(exhibitionId: string) {
    return this.data.exhibitionProducts.filter(
      (ep) => ep.exhibitionId === exhibitionId && ep.status === 'approved'
    );
  }

  /**
   * Check if a product is approved for a specific exhibition
   */
  isProductApprovedForExhibition(exhibitionId: string, productId: string): boolean {
    const ep = this.data.exhibitionProducts.find(
      (ep) => ep.exhibitionId === exhibitionId && ep.productId === productId
    );
    return ep ? ep.status === 'approved' : false;
  }

  /**
   * Get all pending exhibition products (for approval page)
   */
  getPendingExhibitionProducts() {
    return this.data.exhibitionProducts.filter((ep) => ep.status === 'pending');
  }
}

// Export singleton instance for convenient access
export const mockDb = MockDB.getInstance();

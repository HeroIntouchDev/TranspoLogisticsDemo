// --- Phase 1 & 2: Role-Based Access Control (RBAC) ---
export type UserRole = 'ADMIN' | 'MANAGER' | 'USER' | 'VIEWER';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  fullName: string;
}

// --- Phase 1 & 2: Smart Packaging Hierarchy ---
// Packaging Hierarchy: Item -> Carton -> Pallet
export type PackagingType = 'ITEM' | 'CARTON' | 'PALLET';

export interface PackagingUnit {
  id: string;
  type: PackagingType;
  code: string; // QR Code content
  weight?: number;
  dimensions?: string;
  parentId?: string; // Links Carton to Pallet, Item to Carton
  childIds?: string[]; // Helper for traversal
}

// --- Phase 2: Master Product & Ingredient ---
export interface Ingredient {
  id: string;
  name: string;
  precision: number; // e.g., 2 decimal places
  stockLevel: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  ingredients: { ingredientId: string; amount: number }[];
  packagingId?: string; // Link to the root packaging unit (e.g., the Item box)
  mediaGallery?: string[]; // URLs for Phase 2
  isApproved: boolean; // General product approval
}

// --- Phase 1 & 2: Exhibition & Compliance ---
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ExhibitionProject {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
  // Products associated with this exhibition
  products: ExhibitionProduct[]; 
}

export interface ExhibitionProduct {
  productId: string;
  complianceStatus: ApprovalStatus; // Phase 2: Approve import step
  complianceNotes?: string;
  gapAnalysis?: {
    expectedQty: number;
    actualQty: number;
    discrepancy: boolean;
  };
}

// --- Phase 2: Tracking & Orders ---
export interface Order {
  id: string;
  exhibitionId: string;
  createdAt: string;
  items: { productId: string; quantity: number }[];
  status: 'DRAFT' | 'CONFIRMED' | 'SHIPPED';
}

// --- MOCK DATABASE (In-Memory Singleton Structure) ---
export const MOCK_DATA = {
  users: [
    { id: 'u1', username: 'admin', role: 'ADMIN', fullName: 'Super Admin' },
    { id: 'u2', username: 'manager', role: 'MANAGER', fullName: 'Project Manager' },
    { id: 'u3', username: 'staff', role: 'USER', fullName: 'Operational Staff' },
  ] as User[],

  ingredients: [
    { id: 'ing1', name: 'Organic Polymer', precision: 0.01, stockLevel: 500 },
    { id: 'ing2', name: 'Color Pigment Blue', precision: 0.05, stockLevel: 120 },
  ] as Ingredient[],

  packaging: [
    { id: 'p1', type: 'PALLET', code: 'PAL-001', childIds: ['c1', 'c2'] },
    { id: 'c1', type: 'CARTON', code: 'CRT-A01', parentId: 'p1', childIds: ['i1', 'i2'] },
    { id: 'i1', type: 'ITEM', code: 'ITM-001', parentId: 'c1' },
  ] as PackagingUnit[],

  products: [
    { 
      id: 'prod1', sku: 'SKU-001', name: 'Smart Widget A', description: 'Prototype A', 
      ingredients: [{ ingredientId: 'ing1', amount: 10 }], 
      isApproved: true 
    },
    { 
      id: 'prod2', sku: 'SKU-002', name: 'Smart Widget B', description: 'Prototype B (Pending)', 
      ingredients: [{ ingredientId: 'ing2', amount: 5 }], 
      isApproved: false 
    },
  ] as Product[],

  exhibitions: [
    {
      id: 'ex1', name: 'Tech Expo 2025', startDate: '2025-06-01', endDate: '2025-06-05', status: 'PLANNING',
      products: [
        { productId: 'prod1', complianceStatus: 'APPROVED', gapAnalysis: { expectedQty: 100, actualQty: 100, discrepancy: false } },
        { productId: 'prod2', complianceStatus: 'PENDING' } // This one cannot be ordered yet
      ]
    }
  ] as ExhibitionProject[],

  orders: [] as Order[]
};

// Helper Class to simulate DB calls
export class MockDB {
  private static instance: MockDB;
  private data = MOCK_DATA;

  private constructor() {}

  public static getInstance(): MockDB {
    if (!MockDB.instance) {
      MockDB.instance = new MockDB();
    }
    return MockDB.instance;
  }

  // Getters
  getUsers() { return this.data.users; }
  getProducts() { return this.data.products; }
  getExhibitions() { return this.data.exhibitions; }
  
  // Example Mutation
  approveExhibitionProduct(exhibitionId: string, productId: string) {
    const ex = this.data.exhibitions.find(e => e.id === exhibitionId);
    if (ex) {
      const prod = ex.products.find(p => p.productId === productId);
      if (prod) prod.complianceStatus = 'APPROVED';
    }
  }

  createOrder(order: Order) {
    this.data.orders.push(order);
    return order;
  }
}
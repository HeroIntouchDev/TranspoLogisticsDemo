/**
 * RBAC (Role-Based Access Control) Middleware
 * Provides authorization checks for API routes based on user roles
 */

import { NextResponse } from 'next/server';
import { mockDb, UserRole } from '@/services/mockDb';

export interface AuthContext {
  user: {
    id: string;
    username: string;
    role: UserRole;
    fullName: string;
  };
}

/**
 * Simulates user authentication
 * In a real app, this would decode JWT tokens or validate sessions
 * For demo purposes, we'll use a header or default user
 */
export function authenticateUser(request: Request): AuthContext | null {
  // Check for a user ID in headers (for demo purposes)
  const userId = request.headers.get('x-user-id') || 'u3'; // Default to staff user
  
  const user = mockDb.getUserById(userId);
  if (!user) {
    return null;
  }

  return { user };
}

/**
 * Check if user has required role
 */
export function hasRole(context: AuthContext | null, allowedRoles: UserRole[]): boolean {
  if (!context) return false;
  return allowedRoles.includes(context.user.role);
}

/**
 * Middleware to require authentication
 */
export function requireAuth(request: Request): { authorized: true; context: AuthContext } | { authorized: false; response: NextResponse } {
  const context = authenticateUser(request);
  
  if (!context) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { authorized: true, context };
}

/**
 * Middleware to require specific roles
 */
export function requireRoles(
  request: Request,
  allowedRoles: UserRole[]
): { authorized: true; context: AuthContext } | { authorized: false; response: NextResponse } {
  const authResult = requireAuth(request);
  
  if (!authResult.authorized) {
    return authResult;
  }

  if (!hasRole(authResult.context, allowedRoles)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Permission constants for different operations
 */
export const PERMISSIONS = {
  // Product operations
  PRODUCT_CREATE: ['ADMIN', 'MANAGER', 'USER'] as UserRole[],
  PRODUCT_READ: ['ADMIN', 'MANAGER', 'USER', 'VIEWER'] as UserRole[],
  PRODUCT_UPDATE: ['ADMIN', 'MANAGER'] as UserRole[],
  PRODUCT_DELETE: ['ADMIN'] as UserRole[],

  // Exhibition operations
  EXHIBITION_CREATE: ['ADMIN', 'MANAGER'] as UserRole[],
  EXHIBITION_READ: ['ADMIN', 'MANAGER', 'USER', 'VIEWER'] as UserRole[],
  EXHIBITION_UPDATE: ['ADMIN', 'MANAGER'] as UserRole[],

  // Approval operations
  APPROVAL_APPROVE: ['ADMIN', 'MANAGER'] as UserRole[],
  APPROVAL_READ: ['ADMIN', 'MANAGER', 'USER', 'VIEWER'] as UserRole[],

  // Order operations
  ORDER_CREATE: ['ADMIN', 'MANAGER', 'USER'] as UserRole[],
  ORDER_READ: ['ADMIN', 'MANAGER', 'USER', 'VIEWER'] as UserRole[],
  ORDER_UPDATE: ['ADMIN', 'MANAGER'] as UserRole[],
} as const;

/**
 * Helper to check specific permissions
 */
export function checkPermission(
  context: AuthContext | null,
  permission: UserRole[]
): boolean {
  return hasRole(context, permission);
}

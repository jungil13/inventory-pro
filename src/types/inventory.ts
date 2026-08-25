export type UserRole = 'admin' | 'manager' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  created_at: string;
  product_count?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface LocationItem {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export type ProductStatus = 'active' | 'inactive' | 'archived';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  description?: string;
  brand?: string;
  category_id?: string;
  supplier_id?: string;
  cost_price: number;
  selling_price: number;
  minimum_stock: number;
  maximum_stock: number;
  unit: string;
  image_url?: string;
  location?: string;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  // Computed / Joined
  category?: Category;
  supplier?: Supplier;
  quantity?: number;
}

export interface InventoryRecord {
  id: string;
  product_id: string;
  quantity: number;
  updated_at: string;
}

export type StockMovementType = 'stock_in' | 'stock_out' | 'adjustment';

export interface StockMovement {
  id: string;
  product_id: string;
  type: StockMovementType;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason?: string;
  reference?: string;
  supplier_id?: string;
  user_id?: string;
  notes?: string;
  created_at: string;
  // Joined
  product?: Product;
  supplier?: Supplier;
  user?: User;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  created_at: string;
  user?: User;
}

export interface DashboardMetrics {
  total_products: number;
  total_stock_items: number;
  low_stock_items: number;
  out_of_stock_items: number;
  total_stock_value: number;
  today_stock_in: number;
  today_stock_out: number;
}

export interface StockMovementPayload {
  product_id: string;
  type: 'stock_in' | 'stock_out';
  quantity: number;
  reason?: string;
  reference?: string;
  supplier_id?: string;
  user_id?: string;
  notes?: string;
}

export interface StockAdjustmentPayload {
  product_id: string;
  physical_count: number;
  reason: string;
  user_id?: string;
  notes?: string;
}

export interface SystemSettings {
  company_name: string;
  currency: string;
  allow_negative_stock: boolean;
  low_stock_global_threshold: number;
  beep_sound_enabled: boolean;
  beep_volume: number;
  scanner_debounce_ms: number;
}

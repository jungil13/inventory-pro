import { supabase } from "@/lib/supabase/client";
import {
  Product,
  Category,
  Supplier,
  User,
  StockMovement,
  AuditLog,
  DashboardMetrics,
  StockMovementPayload,
  StockAdjustmentPayload,
  SystemSettings,
} from "@/types/inventory";
 
const STORAGE_KEYS = {
  PRODUCTS: "inventorypro_products_v1",
  INVENTORY: "inventorypro_inventory_v1",
  CATEGORIES: "inventorypro_categories_v1",
  SUPPLIERS: "inventorypro_suppliers_v1",
  MOVEMENTS: "inventorypro_movements_v1",
  AUDIT_LOGS: "inventorypro_audit_logs_v1",
  USERS: "inventorypro_users_v1",
  SETTINGS: "inventorypro_settings_v1",
  CURRENT_USER: "inventorypro_current_user_v1",
};

// Initial Seed Data
const INITIAL_USERS: User[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "John Admin",
    email: "admin@inventorypro.com",
    role: "admin",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    created_at: "2026-08-01T08:00:00Z",
    updated_at: "2026-08-01T08:00:00Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Maria Santos",
    email: "maria@inventorypro.com",
    role: "manager",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    created_at: "2026-08-02T09:00:00Z",
    updated_at: "2026-08-02T09:00:00Z",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Mike Rivera",
    email: "mike@inventorypro.com",
    role: "staff",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    created_at: "2026-08-03T10:00:00Z",
    updated_at: "2026-08-03T10:00:00Z",
  },
];

const INITIAL_CATEGORIES: Category[] = [
  {
    id: "c1111111-1111-1111-1111-111111111111",
    name: "Beverages",
    description: "Soft drinks, juices, mineral water, and energy drinks",
    color: "#3b82f6",
    created_at: "2026-08-01T08:00:00Z",
  },
  {
    id: "c2222222-2222-2222-2222-222222222222",
    name: "Food & Snacks",
    description: "Instant noodles, snacks, canned goods, condiments",
    color: "#f59e0b",
    created_at: "2026-08-01T08:00:00Z",
  },
  {
    id: "c3333333-3333-3333-3333-333333333333",
    name: "Electronics",
    description: "Cables, peripherals, computer accessories",
    color: "#8b5cf6",
    created_at: "2026-08-01T08:00:00Z",
  },
  {
    id: "c4444444-4444-4444-4444-444444444444",
    name: "Office Supplies",
    description: "Paper, writing instruments, desk essentials",
    color: "#10b981",
    created_at: "2026-08-01T08:00:00Z",
  },
  {
    id: "c5555555-5555-5555-5555-555555555555",
    name: "Cleaning Supplies",
    description: "Detergents, disinfectants, wiping cloths",
    color: "#ec4899",
    created_at: "2026-08-01T08:00:00Z",
  },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "s1111111-1111-1111-1111-111111111111",
    name: "ABC Trading & Distribution Corp",
    contact_person: "Carlos Mendoza",
    phone: "+63 917 555 0101",
    email: "carlos@abctrading.ph",
    address: "128 Warehouse Row, Pasig City, Metro Manila",
    notes: "Primary beverage and FMCG supplier. Standard delivery 2 days.",
    created_at: "2026-08-01T08:00:00Z",
    updated_at: "2026-08-01T08:00:00Z",
  },
  {
    id: "s2222222-2222-2222-2222-222222222222",
    name: "Universal Food Mega Distro",
    contact_person: "Elena Cruz",
    phone: "+63 920 555 0202",
    email: "elena@universalfood.ph",
    address: "45 North Harbor Logistics Hub, Tondo, Manila",
    notes: "Food, noodles, and packaged goods distributor.",
    created_at: "2026-08-01T08:00:00Z",
    updated_at: "2026-08-01T08:00:00Z",
  },
  {
    id: "s3333333-3333-3333-3333-333333333333",
    name: "TechParts Asia Solutions",
    contact_person: "David Lee",
    phone: "+63 918 555 0303",
    email: "sales@techpartsasia.com",
    address: "Unit 802 Tech Plaza, Makati City",
    notes: "Cables, adapters, electronics.",
    created_at: "2026-08-01T08:00:00Z",
    updated_at: "2026-08-01T08:00:00Z",
  },
  {
    id: "s4444444-4444-4444-4444-444444444444",
    name: "Paper & Office Essentials Inc",
    contact_person: "Grace Tan",
    phone: "+63 919 555 0404",
    email: "gtan@paperoffice.ph",
    address: "88 Commercial Ave, Quezon City",
    notes: "Paper reams, office stationery supplies.",
    created_at: "2026-08-01T08:00:00Z",
    updated_at: "2026-08-01T08:00:00Z",
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1111111-1111-1111-1111-111111111111",
    name: "Coca-Cola 1.5L",
    sku: "COKE-15L",
    barcode: "4801234567890",
    description: "Refreshing Coca-Cola Original Taste 1.5 Liter PET Bottle",
    brand: "Coca-Cola",
    category_id: "c1111111-1111-1111-1111-111111111111",
    supplier_id: "s1111111-1111-1111-1111-111111111111",
    cost_price: 65.0,
    selling_price: 85.0,
    minimum_stock: 10,
    maximum_stock: 100,
    unit: "bottles",
    image_url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
    location: "Aisle 1, Rack B-01",
    status: "active",
    created_at: "2026-08-20T08:00:00Z",
    updated_at: "2026-08-24T08:00:00Z",
  },
  {
    id: "p2222222-2222-2222-2222-222222222222",
    name: "Pepsi 1.5L",
    sku: "PEPSI-15L",
    barcode: "4801234567891",
    description: "Pepsi Cola Refreshing Soda 1.5 Liter Bottle",
    brand: "PepsiCo",
    category_id: "c1111111-1111-1111-1111-111111111111",
    supplier_id: "s1111111-1111-1111-1111-111111111111",
    cost_price: 60.0,
    selling_price: 80.0,
    minimum_stock: 15,
    maximum_stock: 100,
    unit: "bottles",
    image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500",
    location: "Aisle 1, Rack B-02",
    status: "active",
    created_at: "2026-08-20T08:30:00Z",
    updated_at: "2026-08-24T09:15:00Z",
  },
  {
    id: "p3333333-3333-3333-3333-333333333333",
    name: "Lucky Me! Pancit Canton Original 80g",
    sku: "LM-PC-ORIG-80G",
    barcode: "4801234567892",
    description: "Instant fried noodles with savory original seasoning flavor",
    brand: "Monde Nissin",
    category_id: "c2222222-2222-2222-2222-222222222222",
    supplier_id: "s2222222-2222-2222-2222-222222222222",
    cost_price: 14.5,
    selling_price: 19.0,
    minimum_stock: 50,
    maximum_stock: 300,
    unit: "packs",
    image_url: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500",
    location: "Aisle 2, Bin C-05",
    status: "active",
    created_at: "2026-08-21T09:00:00Z",
    updated_at: "2026-08-21T09:00:00Z",
  },
  {
    id: "p4444444-4444-4444-4444-444444444444",
    name: "Braided USB Type-C Fast Charging Cable 1.5m",
    sku: "CBL-USBC-15M",
    barcode: "4801234567893",
    description: "Durable nylon braided 60W Power Delivery USB-C to USB-C charging cable",
    brand: "VoltLink",
    category_id: "c3333333-3333-3333-3333-333333333333",
    supplier_id: "s3333333-3333-3333-3333-333333333333",
    cost_price: 110.0,
    selling_price: 220.0,
    minimum_stock: 8,
    maximum_stock: 50,
    unit: "pcs",
    image_url: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500",
    location: "Electronics Cabinet E-01",
    status: "active",
    created_at: "2026-08-22T10:00:00Z",
    updated_at: "2026-08-24T12:00:00Z",
  },
  {
    id: "p5555555-5555-5555-5555-555555555555",
    name: "Ultra White A4 Copier Bond Paper (70gsm, 500 Sheets)",
    sku: "PAP-A4-70GSM",
    barcode: "4801234567894",
    description: "Premium smooth copy paper for laser and inkjet printing, 500 sheets ream",
    brand: "PaperPro",
    category_id: "c4444444-4444-4444-4444-444444444444",
    supplier_id: "s4444444-4444-4444-4444-444444444444",
    cost_price: 180.0,
    selling_price: 260.0,
    minimum_stock: 20,
    maximum_stock: 150,
    unit: "reams",
    image_url: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500",
    location: "Warehouse Storage Rack D-04",
    status: "active",
    created_at: "2026-08-23T11:00:00Z",
    updated_at: "2026-08-23T11:00:00Z",
  },
];

const INITIAL_INVENTORY: Record<string, number> = {
  "p1111111-1111-1111-1111-111111111111": 25,
  "p2222222-2222-2222-2222-222222222222": 12,
  "p3333333-3333-3333-3333-333333333333": 140,
  "p4444444-4444-4444-4444-444444444444": 4, // low stock!
  "p5555555-5555-5555-5555-555555555555": 45,
};

const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: "m1111111-1111-1111-1111-111111111111",
    product_id: "p1111111-1111-1111-1111-111111111111",
    type: "stock_in",
    quantity: 50,
    previous_quantity: 0,
    new_quantity: 50,
    reason: "Initial Stock Delivery",
    reference: "PO-2026-001",
    supplier_id: "s1111111-1111-1111-1111-111111111111",
    user_id: "11111111-1111-1111-1111-111111111111",
    notes: "Delivered intact by ABC Trading truck",
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "m2222222-2222-2222-2222-222222222222",
    product_id: "p1111111-1111-1111-1111-111111111111",
    type: "stock_out",
    quantity: 25,
    previous_quantity: 50,
    new_quantity: 25,
    reason: "Customer Retail Sales",
    reference: "SALES-2026-88",
    user_id: "33333333-3333-3333-3333-333333333333",
    notes: "Dispatched to retail display chiller",
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "m3333333-3333-3333-3333-333333333333",
    product_id: "p2222222-2222-2222-2222-222222222222",
    type: "stock_in",
    quantity: 20,
    previous_quantity: 0,
    new_quantity: 20,
    reason: "New Batch Stock In",
    reference: "PO-2026-004",
    supplier_id: "s1111111-1111-1111-1111-111111111111",
    user_id: "22222222-2222-2222-2222-222222222222",
    notes: "Standard delivery verified",
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "m4444444-4444-4444-4444-444444444444",
    product_id: "p2222222-2222-2222-2222-222222222222",
    type: "stock_out",
    quantity: 8,
    previous_quantity: 20,
    new_quantity: 12,
    reason: "Store Floor Transfer",
    reference: "SO-2026-012",
    user_id: "33333333-3333-3333-3333-333333333333",
    notes: "Transferred to beverage cooler",
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: "m5555555-5555-5555-5555-555555555555",
    product_id: "p4444444-4444-4444-4444-444444444444",
    type: "adjustment",
    quantity: -2,
    previous_quantity: 6,
    new_quantity: 4,
    reason: "Damaged Items (Crushed box in transit)",
    user_id: "11111111-1111-1111-1111-111111111111",
    notes: "Defective connector discovered during cycle count",
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "a1111111-1111-1111-1111-111111111111",
    user_id: "11111111-1111-1111-1111-111111111111",
    action: "STOCK_IN",
    entity_type: "inventory",
    entity_id: "p1111111-1111-1111-1111-111111111111",
    new_data: { quantity: 50, reference: "PO-2026-001" },
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "a2222222-2222-2222-2222-222222222222",
    user_id: "33333333-3333-3333-3333-333333333333",
    action: "STOCK_OUT",
    entity_type: "inventory",
    entity_id: "p1111111-1111-1111-1111-111111111111",
    new_data: { quantity: 25, reference: "SALES-2026-88" },
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "a3333333-3333-3333-3333-333333333333",
    user_id: "11111111-1111-1111-1111-111111111111",
    action: "STOCK_ADJUSTMENT",
    entity_type: "inventory",
    entity_id: "p4444444-4444-4444-4444-444444444444",
    old_data: { quantity: 6 },
    new_data: { quantity: 4, difference: -2, reason: "Damaged Items" },
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_SETTINGS: SystemSettings = {
  company_name: "Metro Logistics & Retail Enterprise",
  currency: "PHP",
  allow_negative_stock: false,
  low_stock_global_threshold: 10,
  beep_sound_enabled: true,
  beep_volume: 0.5,
  scanner_debounce_ms: 300,
};

type Listener = () => void;

class InventoryStore {
  private listeners: Set<Listener> = new Set();
  private isInitialized = false;
  public isHydrated = false;

  public async initFromSupabase() {
    if (this.isHydrated) return;
    try {
      const [
        { data: products },
        { data: categories },
        { data: suppliers },
        { data: users },
        { data: movements },
        { data: auditLogs },
        { data: settings },
        { data: inventory },
      ] = await Promise.all([
        supabase.from("products").select("*"),
        supabase.from("categories").select("*"),
        supabase.from("suppliers").select("*"),
        supabase.from("users").select("*"),
        supabase.from("stock_movements").select("*"),
        supabase.from("audit_logs").select("*"),
        supabase.from("system_settings").select("*").single(),
        supabase.from("inventory").select("*"),
      ]);

      if (products && products.length > 0) this.products = products;
      if (categories && categories.length > 0) this.categories = categories;
      if (suppliers && suppliers.length > 0) this.suppliers = suppliers;
      if (users && users.length > 0) this.users = users;
      if (movements && movements.length > 0) this.movements = movements;
      if (auditLogs && auditLogs.length > 0) this.auditLogs = auditLogs;
      if (settings) this.settings = settings;
      if (inventory && inventory.length > 0) {
        this.inventory = {};
        inventory.forEach((inv) => {
          this.inventory[inv.product_id] = inv.quantity;
        });
      }
      this.isHydrated = true;
      this.save();
    } catch (e) {
      console.error("Supabase load error:", e);
    }
  }

  private async syncToSupabase(table: string, action: 'insert' | 'update' | 'delete', data: any, matchId?: string) {
    try {
      if (action === 'insert') await supabase.from(table).insert(data);
      if (action === 'update') await supabase.from(table).update(data).match({ id: matchId });
      if (action === 'delete') await supabase.from(table).delete().match({ id: matchId });
    } catch (e) {
      console.error(`Supabase sync error on ${table}:`, e);
    }
  }

  private products: Product[] = [];
  private inventory: Record<string, number> = {};
  private categories: Category[] = [];
  private suppliers: Supplier[] = [];
  private movements: StockMovement[] = [];
  private auditLogs: AuditLog[] = [];
  private users: User[] = [];
  private settings: SystemSettings = INITIAL_SETTINGS;
  private currentUser: User = INITIAL_USERS[0];

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    } else {
      // In SSR, use initial seed
      this.products = INITIAL_PRODUCTS;
      this.inventory = INITIAL_INVENTORY;
      this.categories = INITIAL_CATEGORIES;
      this.suppliers = INITIAL_SUPPLIERS;
      this.movements = INITIAL_MOVEMENTS;
      this.auditLogs = INITIAL_AUDIT_LOGS;
      this.users = INITIAL_USERS;
      this.settings = INITIAL_SETTINGS;
      this.currentUser = null;
    }
  }

  public init() {
    if (this.isInitialized) return;
    try {
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const storedInventory = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const storedSuppliers = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      const storedMovements = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      const storedAuditLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const storedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

      this.products = storedProducts ? JSON.parse(storedProducts) : INITIAL_PRODUCTS;
      this.inventory = storedInventory ? JSON.parse(storedInventory) : INITIAL_INVENTORY;
      this.categories = storedCategories ? JSON.parse(storedCategories) : INITIAL_CATEGORIES;
      this.suppliers = storedSuppliers ? JSON.parse(storedSuppliers) : INITIAL_SUPPLIERS;
      this.movements = storedMovements ? JSON.parse(storedMovements) : INITIAL_MOVEMENTS;
      this.auditLogs = storedAuditLogs ? JSON.parse(storedAuditLogs) : INITIAL_AUDIT_LOGS;
      this.users = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;
      this.settings = storedSettings ? JSON.parse(storedSettings) : INITIAL_SETTINGS;
      this.currentUser = storedCurrentUser ? JSON.parse(storedCurrentUser) : null;

      this.save();
      this.isInitialized = true;
    } catch {
      this.products = INITIAL_PRODUCTS;
      this.inventory = INITIAL_INVENTORY;
      this.categories = INITIAL_CATEGORIES;
      this.suppliers = INITIAL_SUPPLIERS;
      this.movements = INITIAL_MOVEMENTS;
      this.auditLogs = INITIAL_AUDIT_LOGS;
      this.users = INITIAL_USERS;
      this.settings = INITIAL_SETTINGS;
      this.currentUser = null;
    }
  }

  private save() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(this.inventory));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(this.suppliers));
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(this.movements));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    } catch {
      // Storage quota safe
    }
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- CURRENT USER & AUTH ---
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(user: User | null) {
    this.currentUser = user;
    this.save();
  }

  public logout() { this.setCurrentUser(null); } public login(email: string): boolean { const user = this.users.find(u => u.email === email); if (user) { this.setCurrentUser(user); return true; } return false; } public getUsers(): User[] {
    return [...this.users];
  }

  public createUser(userData: Omit<User, "id" | "created_at" | "updated_at">): User {
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID ? crypto.randomUUID() : `u-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.save();
    this.syncToSupabase("users", "insert", newUser);
    return newUser;
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    const catMap = new Map(this.categories.map((c) => [c.id, c]));
    const supMap = new Map(this.suppliers.map((s) => [s.id, s]));

    return this.products.map((p) => ({
      ...p,
      category: p.category_id ? catMap.get(p.category_id) : undefined,
      supplier: p.supplier_id ? supMap.get(p.supplier_id) : undefined,
      quantity: this.inventory[p.id] ?? 0,
    }));
  }

  public getProductById(id: string): Product | null {
    const product = this.products.find((p) => p.id === id);
    if (!product) return null;

    const category = this.categories.find((c) => c.id === product.category_id);
    const supplier = this.suppliers.find((s) => s.id === product.supplier_id);
    const quantity = this.inventory[product.id] ?? 0;

    return {
      ...product,
      category,
      supplier,
      quantity,
    };
  }

  public findByBarcode(barcode: string): Product | null {
    const cleanCode = barcode.trim();
    const product = this.products.find((p) => p.barcode.trim() === cleanCode);
    if (!product) return null;
    return this.getProductById(product.id);
  }

  public findBySku(sku: string): Product | null {
    const cleanSku = sku.trim().toLowerCase();
    const product = this.products.find((p) => p.sku.trim().toLowerCase() === cleanSku);
    if (!product) return null;
    return this.getProductById(product.id);
  }

  public createProduct(data: Omit<Product, "id" | "created_at" | "updated_at">, initialQuantity: number = 0): {
    success: boolean;
    product?: Product;
    error?: string;
  } {
    // Check duplicates
    if (this.products.some((p) => p.barcode.trim() === data.barcode.trim())) {
      return { success: false, error: `A product with barcode "${data.barcode}" already exists.` };
    }
    if (this.products.some((p) => p.sku.trim().toLowerCase() === data.sku.trim().toLowerCase())) {
      return { success: false, error: `A product with SKU "${data.sku}" already exists.` };
    }

    const newId = crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}`;
    const newProduct: Product = {
      ...data,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.products.push(newProduct);
    this.inventory[newId] = Math.max(0, initialQuantity);

    // Initial movement if stock > 0
    if (initialQuantity > 0) {
      const movementId = crypto.randomUUID ? crypto.randomUUID() : `m-${Date.now()}`;
      this.movements.unshift({
        id: movementId,
        product_id: newId,
        type: "stock_in",
        quantity: initialQuantity,
        previous_quantity: 0,
        new_quantity: initialQuantity,
        reason: "Initial Stock on Creation",
        reference: "INIT-CREATE",
        supplier_id: data.supplier_id,
        user_id: this.currentUser.id,
        notes: "Product added with initial inventory count",
        created_at: new Date().toISOString(),
      });
    }

    // Audit log
    this.auditLogs.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `a-${Date.now()}`,
      user_id: this.currentUser.id,
      action: "CREATE_PRODUCT",
      entity_type: "product",
      entity_id: newId,
      new_data: { name: newProduct.name, sku: newProduct.sku, barcode: newProduct.barcode, initialQuantity },
      created_at: new Date().toISOString(),
    });

    this.save();
    this.syncToSupabase("products", "insert", newProduct);
    this.syncToSupabase("inventory", "insert", { product_id: newId, quantity: initialQuantity });
    if (initialQuantity > 0) {
      this.syncToSupabase("stock_movements", "insert", this.movements[0]);
    }
    this.syncToSupabase("audit_logs", "insert", this.auditLogs[0]);
    return { success: true, product: this.getProductById(newId)! };
  }

  public updateProduct(id: string, data: Partial<Product>): {
    success: boolean;
    product?: Product;
    error?: string;
  } {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return { success: false, error: "Product not found." };
    }

    // Check barcode uniqueness if changed
    if (data.barcode && data.barcode !== this.products[index].barcode) {
      if (this.products.some((p) => p.id !== id && p.barcode.trim() === data.barcode!.trim())) {
        return { success: false, error: `Barcode "${data.barcode}" is already assigned to another product.` };
      }
    }

    // Check SKU uniqueness if changed
    if (data.sku && data.sku.toLowerCase() !== this.products[index].sku.toLowerCase()) {
      if (this.products.some((p) => p.id !== id && p.sku.trim().toLowerCase() === data.sku!.trim().toLowerCase())) {
        return { success: false, error: `SKU "${data.sku}" is already assigned to another product.` };
      }
    }

    const oldProduct = { ...this.products[index] };
    this.products[index] = {
      ...this.products[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    // Audit log
    this.auditLogs.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `a-${Date.now()}`,
      user_id: this.currentUser.id,
      action: "UPDATE_PRODUCT",
      entity_type: "product",
      entity_id: id,
      old_data: oldProduct as unknown as Record<string, unknown>,
      new_data: data as unknown as Record<string, unknown>,
      created_at: new Date().toISOString(),
    });

    this.save();
    this.syncToSupabase("products", "update", this.products[index], id);
    this.syncToSupabase("audit_logs", "insert", this.auditLogs[0]);
    return { success: true, product: this.getProductById(id)! };
  }

  public deleteProduct(id: string): { success: boolean; error?: string } {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return { success: false, error: "Product not found." };

    const deleted = this.products[index];
    this.products.splice(index, 1);
    delete this.inventory[id];

    // Audit log
    this.auditLogs.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `a-${Date.now()}`,
      user_id: this.currentUser.id,
      action: "DELETE_PRODUCT",
      entity_type: "product",
      entity_id: id,
      old_data: { name: deleted.name, sku: deleted.sku, barcode: deleted.barcode },
      created_at: new Date().toISOString(),
    });

    this.save();
    this.syncToSupabase("products", "delete", null, id);
    this.syncToSupabase("audit_logs", "insert", this.auditLogs[0]);
    return { success: true };
  }

  // --- ATOMIC STOCK OPERATIONS ---
  public stockIn(payload: StockMovementPayload): {
    success: boolean;
    previousQuantity: number;
    newQuantity: number;
    movement?: StockMovement;
    error?: string;
  } {
    const product = this.products.find((p) => p.id === payload.product_id);
    if (!product) {
      return { success: false, previousQuantity: 0, newQuantity: 0, error: "Product not found" };
    }

    const qty = Math.floor(Number(payload.quantity));
    if (isNaN(qty) || qty <= 0) {
      return { success: false, previousQuantity: 0, newQuantity: 0, error: "Stock in quantity must be greater than 0" };
    }

    const prevQty = this.inventory[product.id] ?? 0;
    const newQty = prevQty + qty;
    this.inventory[product.id] = newQty;

    const movementId = crypto.randomUUID ? crypto.randomUUID() : `m-${Date.now()}`;
    const movement: StockMovement = {
      id: movementId,
      product_id: product.id,
      type: "stock_in",
      quantity: qty,
      previous_quantity: prevQty,
      new_quantity: newQty,
      reason: payload.reason || "Supplier Delivery / Stock In",
      reference: payload.reference || "",
      supplier_id: payload.supplier_id || product.supplier_id,
      user_id: payload.user_id || this.currentUser.id,
      notes: payload.notes || "",
      created_at: new Date().toISOString(),
    };

    this.movements.unshift(movement);

    this.auditLogs.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `a-${Date.now()}`,
      user_id: payload.user_id || this.currentUser.id,
      action: "STOCK_IN",
      entity_type: "inventory",
      entity_id: product.id,
      old_data: { quantity: prevQty },
      new_data: { quantity: newQty, added: qty, reference: payload.reference, movement_id: movementId },
      created_at: new Date().toISOString(),
    });

    this.save();
    this.syncToSupabase("inventory", "update", { quantity: newQty }, product.id);
    this.syncToSupabase("stock_movements", "insert", movement);
    this.syncToSupabase("audit_logs", "insert", this.auditLogs[0]);
    return {
      success: true,
      previousQuantity: prevQty,
      newQuantity: newQty,
      movement,
    };
  }

  public stockOut(payload: StockMovementPayload): {
    success: boolean;
    previousQuantity: number;
    newQuantity: number;
    movement?: StockMovement;
    error?: string;
  } {
    const product = this.products.find((p) => p.id === payload.product_id);
    if (!product) {
      return { success: false, previousQuantity: 0, newQuantity: 0, error: "Product not found" };
    }

    const qty = Math.floor(Number(payload.quantity));
    if (isNaN(qty) || qty <= 0) {
      return { success: false, previousQuantity: 0, newQuantity: 0, error: "Stock out quantity must be greater than 0" };
    }

    const prevQty = this.inventory[product.id] ?? 0;
    if (!this.settings.allow_negative_stock && prevQty < qty) {
      return {
        success: false,
        previousQuantity: prevQty,
        newQuantity: prevQty,
        error: `Insufficient stock! Current available is ${prevQty} ${product.unit}, requested removal is ${qty} ${product.unit}.`,
      };
    }

    const newQty = prevQty - qty;
    this.inventory[product.id] = newQty;

    const movementId = crypto.randomUUID ? crypto.randomUUID() : `m-${Date.now()}`;
    const movement: StockMovement = {
      id: movementId,
      product_id: product.id,
      type: "stock_out",
      quantity: qty,
      previous_quantity: prevQty,
      new_quantity: newQty,
      reason: payload.reason || "Dispatch / Sale",
      reference: payload.reference || "",
      supplier_id: payload.supplier_id,
      user_id: payload.user_id || this.currentUser.id,
      notes: payload.notes || "",
      created_at: new Date().toISOString(),
    };

    this.movements.unshift(movement);

    this.auditLogs.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `a-${Date.now()}`,
      user_id: payload.user_id || this.currentUser.id,
      action: "STOCK_OUT",
      entity_type: "inventory",
      entity_id: product.id,
      old_data: { quantity: prevQty },
      new_data: { quantity: newQty, deducted: qty, reason: payload.reason, reference: payload.reference, movement_id: movementId },
      created_at: new Date().toISOString(),
    });

    this.save();
    this.syncToSupabase("inventory", "update", { quantity: newQty }, product.id);
    this.syncToSupabase("stock_movements", "insert", movement);
    this.syncToSupabase("audit_logs", "insert", this.auditLogs[0]);
    return {
      success: true,
      previousQuantity: prevQty,
      newQuantity: newQty,
      movement,
    };
  }

  public adjustStock(payload: StockAdjustmentPayload): {
    success: boolean;
    previousQuantity: number;
    newQuantity: number;
    difference: number;
    movement?: StockMovement;
    error?: string;
  } {
    const product = this.products.find((p) => p.id === payload.product_id);
    if (!product) {
      return { success: false, previousQuantity: 0, newQuantity: 0, difference: 0, error: "Product not found" };
    }

    const physical = Math.floor(Number(payload.physical_count));
    if (isNaN(physical) || (!this.settings.allow_negative_stock && physical < 0)) {
      return { success: false, previousQuantity: 0, newQuantity: 0, difference: 0, error: "Physical count must be a non-negative number." };
    }

    const prevQty = this.inventory[product.id] ?? 0;
    const diff = physical - prevQty;

    this.inventory[product.id] = physical;

    const movementId = crypto.randomUUID ? crypto.randomUUID() : `m-${Date.now()}`;
    const movement: StockMovement = {
      id: movementId,
      product_id: product.id,
      type: "adjustment",
      quantity: diff,
      previous_quantity: prevQty,
      new_quantity: physical,
      reason: payload.reason || "Physical Cycle Count Adjustment",
      user_id: payload.user_id || this.currentUser.id,
      notes: payload.notes || "",
      created_at: new Date().toISOString(),
    };

    this.movements.unshift(movement);

    this.auditLogs.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `a-${Date.now()}`,
      user_id: payload.user_id || this.currentUser.id,
      action: "STOCK_ADJUSTMENT",
      entity_type: "inventory",
      entity_id: product.id,
      old_data: { quantity: prevQty },
      new_data: { quantity: physical, difference: diff, reason: payload.reason, notes: payload.notes, movement_id: movementId },
      created_at: new Date().toISOString(),
    });

    this.save();
    this.syncToSupabase("inventory", "update", { quantity: physical }, product.id);
    this.syncToSupabase("stock_movements", "insert", movement);
    this.syncToSupabase("audit_logs", "insert", this.auditLogs[0]);
    return {
      success: true,
      previousQuantity: prevQty,
      newQuantity: physical,
      difference: diff,
      movement,
    };
  }

  // --- MOVEMENTS & AUDIT ---
  public getMovements(limit?: number): StockMovement[] {
    const prodMap = new Map(this.products.map((p) => [p.id, p]));
    const userMap = new Map(this.users.map((u) => [u.id, u]));
    const supMap = new Map(this.suppliers.map((s) => [s.id, s]));

    const list = this.movements.map((m) => ({
      ...m,
      product: prodMap.get(m.product_id),
      user: m.user_id ? userMap.get(m.user_id) : undefined,
      supplier: m.supplier_id ? supMap.get(m.supplier_id) : undefined,
    }));

    return limit ? list.slice(0, limit) : list;
  }

  public getProductMovements(productId: string): StockMovement[] {
    const userMap = new Map(this.users.map((u) => [u.id, u]));
    const supMap = new Map(this.suppliers.map((s) => [s.id, s]));

    return this.movements
      .filter((m) => m.product_id === productId)
      .map((m) => ({
        ...m,
        user: m.user_id ? userMap.get(m.user_id) : undefined,
        supplier: m.supplier_id ? supMap.get(m.supplier_id) : undefined,
      }));
  }

  public getAuditLogs(limit: number = 50): AuditLog[] {
    const userMap = new Map(this.users.map((u) => [u.id, u]));
    return this.auditLogs.slice(0, limit).map((a) => ({
      ...a,
      user: a.user_id ? userMap.get(a.user_id) : undefined,
    }));
  }

  // --- CATEGORIES & SUPPLIERS ---
  public getCategories(): Category[] {
    return this.categories.map((c) => ({
      ...c,
      product_count: this.products.filter((p) => p.category_id === c.id).length,
    }));
  }

  public createCategory(name: string, description?: string, color?: string): Category {
    const newCat: Category = {
      id: crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}`,
      name,
      description,
      color: color || "#3b82f6",
      created_at: new Date().toISOString(),
    };
    this.categories.push(newCat);
    this.save();
    this.syncToSupabase("categories", "insert", newCat);
    return newCat;
  }

  public updateCategory(id: string, name: string, description?: string, color?: string): Category | null {
    const cat = this.categories.find((c) => c.id === id);
    if (!cat) return null;
    cat.name = name;
    if (description !== undefined) cat.description = description;
    if (color !== undefined) cat.color = color;
    this.save();
    this.syncToSupabase("categories", "update", cat, id);
    return cat;
  }

  public deleteCategory(id: string): boolean {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.categories.splice(index, 1);
    this.products.forEach((p) => {
      if (p.category_id === id) p.category_id = undefined;
    });
    this.save();
    this.syncToSupabase("categories", "delete", null, id);
    return true;
  }

  public getSuppliers(): Supplier[] {
    return this.suppliers.map((s) => ({
      ...s,
      product_count: this.products.filter((p) => p.supplier_id === s.id).length,
    }));
  }

  public createSupplier(data: Omit<Supplier, "id" | "created_at" | "updated_at">): Supplier {
    const newSup: Supplier = {
      ...data,
      id: crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.suppliers.push(newSup);
    this.save();
    this.syncToSupabase("suppliers", "insert", newSup);
    return newSup;
  }

  public updateSupplier(id: string, data: Partial<Supplier>): Supplier | null {
    const index = this.suppliers.findIndex((s) => s.id === id);
    if (index === -1) return null;
    this.suppliers[index] = {
      ...this.suppliers[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    this.save();
    this.syncToSupabase("suppliers", "update", this.suppliers[index], id);
    return this.suppliers[index];
  }

  public deleteSupplier(id: string): boolean {
    const index = this.suppliers.findIndex((s) => s.id === id);
    if (index === -1) return false;
    this.suppliers.splice(index, 1);
    this.products.forEach((p) => {
      if (p.supplier_id === id) p.supplier_id = undefined;
    });
    this.save();
    this.syncToSupabase("suppliers", "delete", null, id);
    return true;
  }

  // --- METRICS ---
  public getDashboardMetrics(): DashboardMetrics {
    const products = this.getProducts();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalProducts = products.length;
    let totalStockItems = 0;
    let lowStockItems = 0;
    let outOfStockItems = 0;
    let totalStockValue = 0;

    for (const p of products) {
      const qty = p.quantity ?? 0;
      totalStockItems += qty;
      totalStockValue += qty * p.cost_price;

      if (qty === 0) {
        outOfStockItems++;
      } else if (qty <= p.minimum_stock) {
        lowStockItems++;
      }
    }

    let todayStockIn = 0;
    let todayStockOut = 0;

    for (const m of this.movements) {
      const mDate = new Date(m.created_at);
      if (mDate >= today) {
        if (m.type === "stock_in") {
          todayStockIn += m.quantity;
        } else if (m.type === "stock_out") {
          todayStockOut += m.quantity;
        }
      }
    }

    return {
      total_products: totalProducts,
      total_stock_items: totalStockItems,
      low_stock_items: lowStockItems,
      out_of_stock_items: outOfStockItems,
      total_stock_value: totalStockValue,
      today_stock_in: todayStockIn,
      today_stock_out: todayStockOut,
    };
  }

  // --- SETTINGS ---
  public getSettings(): SystemSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<SystemSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.save();
    supabase.from("system_settings").update(newSettings).match({ id: 1 }).then();
  }

  public resetToDefaults() {
    this.products = INITIAL_PRODUCTS;
    this.inventory = INITIAL_INVENTORY;
    this.categories = INITIAL_CATEGORIES;
    this.suppliers = INITIAL_SUPPLIERS;
    this.movements = INITIAL_MOVEMENTS;
    this.auditLogs = INITIAL_AUDIT_LOGS;
    this.users = INITIAL_USERS;
    this.settings = INITIAL_SETTINGS;
    this.currentUser = INITIAL_USERS[0];
    this.save();
  }
}

export const inventoryStore = new InventoryStore();

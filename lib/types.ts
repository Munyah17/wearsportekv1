export type Role = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: Role;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  category_slug: string;
  name: string;
  description?: string;
  price: number; // USD
  compare_at_price?: number;
  images: string[];
  sizes: string[];
  stock: number;
  is_featured: boolean;
  is_customizable: boolean;
  /** flat fee for name+number printing — overrides the per-field settings fees */
  custom_fee?: number;
  is_active: boolean;
  badge?: string; // e.g. "NEW", "HOT", "-20%"
  created_at?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  cta_label?: string;
  cta_link?: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  eta?: string;
  is_active: boolean;
}

export interface PaymentMethod {
  id: string; // 'ecocash' | 'innbucks' | 'omari' | 'transfer' | 'card'
  label: string;
  hint?: string;
  is_active: boolean;
  sort_order: number;
}

export interface SiteSettings {
  site_name: string;
  tagline: string;
  contact_phone: string;
  contact_whatsapp: string;
  contact_email: string;
  address: string;
  about_title: string;
  about_body: string;
  footer_text: string;
  socials: { label: string; url: string }[];
  customisation_fee: number;
  customisation_name_fee: number;
  customisation_number_fee: number;
  announcement?: string;
  currency: string;
}

export interface CartItem {
  product: Product;
  size: string;
  qty: number;
  customName?: string;
  customNumber?: string;
  unitCustomFee: number; // snapshot of customisation fee at add time
}

export interface Order {
  id?: string;
  created_at?: string;
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_zone_id: string;
  delivery_address: string;
  delivery_fee: number;
  items: OrderItem[];
  subtotal: number;
  total: number;
  payment_method: string;
  paynow_reference?: string;
  paynow_poll_url?: string;
  status: 'awaiting_payment' | 'paid' | 'failed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  size: string;
  qty: number;
  unit_price: number;
  custom_name?: string;
  custom_number?: string;
  custom_fee: number;
}

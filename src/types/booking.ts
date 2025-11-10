
export interface RefundRequest {
  id: string;
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  booking_id?: string;
  booking?: Booking;
  customer_id?: string;
  amount: number;
  reason: string;
  admin_notes?: string;
  super_admin_notes?: string;
  status: 'pending' | 'approved_by_admin' | 'approved' | 'rejected' | 'refund_initiated' | 'refund_failed';
  created_at: string;
  updated_at: string;
  refund_id?: string;
  refund_status?: string;
  razorpay_response?: any;
}

export interface RoomAvailabilityEntry {
  id: string;
  room_id: string;
  date: string;
  status: string;
  booking_id?: string;
  source: string;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
  audit_log?: any[];
}

export type RoomCategoryType = 'Royal Deluxe' | 'Royal Executive' | 'Royal Suite';

export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  price_per_night: number; // This may be redundant but keep for compatibility
  image_url: string;
  is_available: boolean;
  status: string;
  capacity: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  category?: string; 
  category_type?: RoomCategoryType; // Updated to use the enum type
  breakfast_price?: number;
  created_at?: string;
  updated_at?: string;
  availability?: RoomAvailabilityEntry[];
}

export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_id?: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  adults?: number;
  children?: number;
  children_ages?: string; // String type to match database schema
  special_requests?: string;
  total_price: number;
  status: BookingStatus;
  payment_status?: PaymentStatus;
  booking_type: 'online' | 'offline';
  payment_id?: string;
  with_breakfast: boolean;
  room_count?: number;
  effective_adults?: string; // String type to match database schema
  extra_guests?: number;
  extra_guest_charges?: string; // String type to match database schema
  created_at?: string;
  updated_at?: string;
  room?: Room;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TableBooking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  date: string;
  time: string;
  guests: number;
  special_requests?: string;
  table_number?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  booking_type: 'online' | 'offline';
  payment_status?: string;
  created_at?: string;
  updated_at?: string;
}

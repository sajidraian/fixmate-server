// User roles
export type UserRole = "customer" | "technician" | "admin";

// Service approval status
export type ApprovalStatus = "pending" | "approved" | "rejected";

// Service mode
export type ServiceMode = "Home Visit" | "Shop Drop-off";

// Booking status
export type BookingStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in-progress"
  | "completed"
  | "cancelled";

// Payment status
export type PaymentStatus = "unpaid" | "paid";

// User interface
export interface IUser {
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  phone?: string;
  area?: string;
  bio?: string;
  createdAt?: Date;
}

// Service interface
export interface IService {
  title: string;
  category: string;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: ApprovalStatus;
  isAvailable: boolean;
  createdAt: Date;
}

// Booking interface
export interface IBooking {
  serviceId: string;
  serviceTitle: string;
  serviceImage: string;
  category: string;
  basePrice: number;

  technicianName: string;
  technicianEmail: string;

  customerName: string;
  customerEmail: string;
  customerPhone: string;

  address: string;
  preferredDate: Date;
  problemDescription: string;

  status: BookingStatus;
  finalAmount: number;
  paymentStatus: PaymentStatus;

  createdAt: Date;
}

// Payment interface
export interface IPayment {
  bookingId: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  technicianName: string;
  technicianEmail: string;
  amount: number;
  currency: "usd";
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: "paid";
  paidAt: Date;
}
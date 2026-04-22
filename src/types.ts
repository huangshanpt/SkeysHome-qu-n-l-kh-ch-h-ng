export type AppMode = 'agency' | 'retail';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  group: string; // Changed from enum to string for flexibility
  type: AppMode;
  createdAt: string;
  notes: string;
}

export interface AppConfig {
  customerGroups: string[];
  productCategories: string[];
  enabledModules: string[];
}

export interface Purchase {
  id: string;
  customerId: string;
  productName: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
}

export interface Campaign {
  id: string;
  title: string;
  content: string;
  channel: 'Email' | 'SMS' | 'Zalo';
  targetGroup: string;
  sentAt: string;
  status: 'Draft' | 'Scheduled' | 'Sent';
}

export interface AIExtractionResult {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

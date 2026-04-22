import { Customer, Purchase, Campaign, AppConfig, AppMode } from "../types";

const DEFAULT_CONFIG: AppConfig = {
  customerGroups: ["Vũ trụ", "Thân thiết", "Mới", "Tiềm năng", "VIP"],
  productCategories: ["Điện tử", "Gia dụng", "Phần mềm", "Dịch vụ"],
  enabledModules: ["Dashboard", "Customers", "Marketing", "Analytics"]
};

// Mock data updated with types
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "vana@gmail.com",
    phone: "0987654321",
    address: "Hà Nội",
    group: "Thân thiết",
    type: "retail",
    createdAt: new Date().toISOString(),
    notes: "Khách hàng VIP"
  },
  {
    id: "2",
    name: "Đại lý Hateco",
    email: "contact@hateco.com",
    phone: "0123456789",
    address: "TP. HCM",
    group: "Tiềm năng",
    type: "agency",
    createdAt: new Date().toISOString(),
    notes: "Đối tác chiến lược"
  }
];

export const crmService = {
  getAppMode(): AppMode | null {
    return localStorage.getItem('crm_app_mode') as AppMode | null;
  },

  setAppMode(mode: AppMode): void {
    localStorage.setItem('crm_app_mode', mode);
  },

  clearAppMode(): void {
    localStorage.removeItem('crm_app_mode');
    window.location.reload();
  },

  async getConfig(): Promise<AppConfig> {
    const stored = localStorage.getItem('crm_config');
    return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
  },

  async saveConfig(config: AppConfig): Promise<void> {
    localStorage.setItem('crm_config', JSON.stringify(config));
  },

  async getCustomers(mode?: AppMode): Promise<Customer[]> {
    const stored = localStorage.getItem('crm_customers');
    const all = stored ? JSON.parse(stored) : MOCK_CUSTOMERS;
    const currentMode = mode || this.getAppMode();
    return currentMode ? all.filter((c: Customer) => c.type === currentMode) : all;
  },

  async saveCustomer(customer: Customer): Promise<void> {
    const stored = localStorage.getItem('crm_customers');
    const customers = stored ? JSON.parse(stored) : MOCK_CUSTOMERS;
    const index = customers.findIndex((c: any) => c.id === customer.id);
    if (index >= 0) {
      customers[index] = customer;
    } else {
      customers.push(customer);
    }
    localStorage.setItem('crm_customers', JSON.stringify(customers));
  },

  async getPurchases(customerId?: string): Promise<Purchase[]> {
    const stored = localStorage.getItem('crm_purchases');
    // Using a more realistic mock or empty
    const all = stored ? JSON.parse(stored) : [];
    return customerId ? all.filter((p: Purchase) => p.customerId === customerId) : all;
  },

  async savePurchase(purchase: Purchase): Promise<void> {
    const purchases = await this.getPurchases();
    purchases.push(purchase);
    localStorage.setItem('crm_purchases', JSON.stringify(purchases));
  },

  async getCampaigns(): Promise<Campaign[]> {
    const stored = localStorage.getItem('crm_campaigns');
    return stored ? JSON.parse(stored) : [];
  },

  async saveCampaign(campaign: Campaign): Promise<void> {
    const campaigns = await this.getCampaigns();
    campaigns.push(campaign);
    localStorage.setItem('crm_campaigns', JSON.stringify(campaigns));
  }
};

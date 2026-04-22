import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError } from '../lib/errorHandlers';
import { Customer, Purchase, Campaign, AppConfig, AppMode } from "../types";

const DEFAULT_CONFIG: AppConfig = {
  customerGroups: ["Vũ trụ", "Thân thiết", "Mới", "Tiềm năng", "VIP"],
  productCategories: ["Điện tử", "Gia dụng", "Phần mềm", "Dịch vụ"],
  enabledModules: ["Dashboard", "Customers", "Marketing", "Analytics"]
};

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
    try {
      const user = auth.currentUser;
      if (!user) return DEFAULT_CONFIG;
      
      const configDoc = await getDoc(doc(db, 'config', user.uid));
      return configDoc.exists() ? configDoc.data() as AppConfig : DEFAULT_CONFIG;
    } catch (error) {
      console.warn("Failed to fetch config from Firestore, using default", error);
      return DEFAULT_CONFIG;
    }
  },

  async saveConfig(config: AppConfig): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) return;
      await setDoc(doc(db, 'config', user.uid), config);
    } catch (error) {
      handleFirestoreError(error, 'write', 'config');
    }
  },

  async getCustomers(mode?: AppMode): Promise<Customer[]> {
    try {
      const currentMode = mode || this.getAppMode();
      const user = auth.currentUser;
      
      let q = query(collection(db, 'customers'));
      if (currentMode) {
        q = query(collection(db, 'customers'), where('type', '==', currentMode));
      }
      
      // If we want to restrict by ownerId (recommended)
      if (user) {
        q = query(q, where('ownerId', '==', user.uid));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
    } catch (error) {
      handleFirestoreError(error, 'list', 'customers');
    }
  },

  async saveCustomer(customer: any): Promise<void> {
    try {
      const user = auth.currentUser;
      const data = {
        ...customer,
        ownerId: user?.uid || 'guest',
        updatedAt: new Date().toISOString()
      };

      if (customer.id && customer.id.length > 10) { // Simple check for auto-gen IDs vs mock IDs
        await setDoc(doc(db, 'customers', customer.id), data);
      } else {
        const { id, ...rest } = data;
        await addDoc(collection(db, 'customers'), rest);
      }
    } catch (error) {
      handleFirestoreError(error, 'write', 'customers');
    }
  },

  async getPurchases(customerId?: string): Promise<Purchase[]> {
    try {
      let q = query(collection(db, 'purchases'));
      if (customerId) {
        q = query(q, where('customerId', '==', customerId));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
    } catch (error) {
      handleFirestoreError(error, 'list', 'purchases');
    }
  },

  async savePurchase(purchase: any): Promise<void> {
    try {
      const { id, ...data } = purchase;
      await addDoc(collection(db, 'purchases'), data);
    } catch (error) {
      handleFirestoreError(error, 'write', 'purchases');
    }
  },

  async getCampaigns(): Promise<Campaign[]> {
    try {
      const snapshot = await getDocs(collection(db, 'campaigns'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
    } catch (error) {
      handleFirestoreError(error, 'list', 'campaigns');
    }
  },

  async saveCampaign(campaign: any): Promise<void> {
    try {
      const { id, ...data } = campaign;
      await addDoc(collection(db, 'campaigns'), data);
    } catch (error) {
      handleFirestoreError(error, 'write', 'campaigns');
    }
  }
};


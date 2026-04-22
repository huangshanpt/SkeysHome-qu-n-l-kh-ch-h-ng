import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  ChevronRight, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Facebook,
  MessageCircle,
  Link as LinkIcon,
  MoreVertical,
  History,
  Download,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { crmService } from '../services/crmService';
import { Customer, Purchase } from '../types';
import { formatCurrency, cn } from '../lib/utils';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('Tất cả');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    loadData();
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const cfg = await crmService.getConfig();
    setConfig(cfg);
  };

  const loadData = async () => {
    const [c, p] = await Promise.all([
      crmService.getCustomers(),
      crmService.getPurchases()
    ]);
    setCustomers(c);
    setPurchases(p);
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                         c.email.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = selectedGroup === 'Tất cả' || c.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const getCustomerPurchases = (id: string) => purchases.filter(p => p.customerId === id);

  const groups = config ? ['Tất cả', ...config.customerGroups] : ['Tất cả'];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-100px)] -m-6 lg:-m-8 border-l border-border bg-white shadow-xl">
      <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-primary">Khách Hàng</h1>
          <span className="text-[11px] font-bold text-text-muted bg-slate-100 px-2 py-0.5 rounded border border-border">
            {customers.length} Contacts
          </span>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Thêm khách hàng</span>
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* List Pane */}
        <aside className="w-80 border-r border-border bg-white flex flex-col shrink-0 overflow-hidden shadow-[4px_0_15px_-5px_rgba(0,0,0,0.05)]">
          <div className="p-4 border-b border-border bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="text" 
                placeholder="Tìm kiếm khách hàng..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-lg text-[13px] outline-none focus:ring-1 focus:ring-accent transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-1 mt-3 overflow-x-auto pb-1 no-scrollbar">
              {groups.map(group => (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={cn(
                    "whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                    selectedGroup === group ? "bg-accent text-white" : "bg-white border border-border text-text-muted hover:bg-slate-50"
                  )}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map(customer => (
                <div 
                  key={customer.id} 
                  onClick={() => setSelectedCustomer(customer)}
                  className={cn(
                    "p-4 cursor-pointer transition-all relative group",
                    selectedCustomer?.id === customer.id ? "bg-blue-50/50" : "hover:bg-slate-50"
                  )}
                >
                  {selectedCustomer?.id === customer.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-[13px] text-primary truncate max-w-[150px]">{customer.name}</p>
                    <span className={cn(
                      "badge",
                      customer.group === 'VIP' ? "badge-vip" : "badge-new"
                    )}>
                      {customer.group}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted truncate mb-2">{customer.email}</p>
                  <div className="flex items-center gap-2">
                     <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                       {customer.name.charAt(0)}
                     </div>
                     <span className="text-[10px] text-text-muted font-medium italic">{customer.phone}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-text-muted text-xs italic">
                Không tìm thấy khách hàng nào
              </div>
            )}
          </div>
        </aside>

        {/* Detail Pane */}
        <main className="flex-1 overflow-y-auto p-8 bg-bg relative">
          <AnimatePresence mode="wait">
            {selectedCustomer ? (
              <motion.div
                key={selectedCustomer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8 max-w-5xl"
              >
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-white border border-border flex items-center justify-center text-3xl font-bold text-accent shadow-sm border-b-4 border-b-accent/20">
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-primary tracking-tight">{selectedCustomer.name}</h2>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-text-muted text-[13px] flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> {selectedCustomer.email}
                        </p>
                        <span className="w-1 h-1 bg-border rounded-full" />
                        <p className="text-text-muted text-[13px] flex items-center gap-1.5 font-medium italic">
                          <Phone className="w-3.5 h-3.5" /> {selectedCustomer.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="btn-action shadow-sm">Sửa hồ sơ</button>
                    <button className="btn-primary shadow-lg shadow-blue-100">Gửi tin nhắn</button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Contact Info Card */}
                  <div className="card md:col-span-2 p-6">
                    <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-6 border-b border-border pb-3">Thông tin chi tiết</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                      <div className="space-y-1">
                        <p className="text-[11px] text-text-muted font-bold">Địa chỉ hiện tại</p>
                        <p className="text-[13px] font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-300" /> {selectedCustomer.address}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] text-text-muted font-bold">Ngày tham gia hệ thống</p>
                        <p className="text-[13px] font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-300" /> {new Date(selectedCustomer.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <p className="text-[11px] text-text-muted font-bold">Mạng xã hội</p>
                        <div className="flex gap-2">
                          <button className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                            <Facebook className="w-4 h-4" />
                          </button>
                          <button className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-all shadow-sm">
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button className="w-9 h-9 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-600 hover:text-white transition-all shadow-sm">
                            <LinkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[11px] text-text-muted font-bold">Ghi chú AI</p>
                         <p className="text-[13px] text-text-muted italic leading-relaxed">
                           "{selectedCustomer.notes || 'Không có ghi chú nào'}"
                         </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="card h-fit p-6 bg-slate-900 border-none">
                    <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-6">Chỉ số tài khoản</h3>
                    <div className="space-y-6">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] text-white/50 mb-1 font-bold">Tổng chi tiêu (LTV)</p>
                        <p className="text-2xl font-bold text-emerald-400">
                          {formatCurrency(getCustomerPurchases(selectedCustomer.id).reduce((acc, p) => acc + p.amount, 0))}
                        </p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] text-white/50 mb-1 font-bold">Số lượng đơn hàng</p>
                        <p className="text-2xl font-bold text-sky-400">
                          {getCustomerPurchases(selectedCustomer.id).length} Orders
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purchase History Table */}
                <div className="card !p-0 overflow-hidden">
                  <div className="p-5 border-b border-border bg-slate-50/50 flex items-center justify-between">
                     <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Lịch sử giao dịch mới nhất</h3>
                     <History className="w-4 h-4 text-text-muted opacity-50" />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[13px]">
                      <thead className="bg-slate-50/80 text-[10px] text-text-muted uppercase tracking-wider font-bold">
                        <tr className="text-left border-b border-border">
                          <th className="px-6 py-3">Ngày GD</th>
                          <th className="px-6 py-3">Tên sản phẩm</th>
                          <th className="px-6 py-3">Giá trị</th>
                          <th className="px-6 py-3">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {getCustomerPurchases(selectedCustomer.id).length > 0 ? (
                          getCustomerPurchases(selectedCustomer.id).map(purchase => (
                            <tr key={purchase.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 text-text-muted">{new Date(purchase.date).toLocaleDateString('vi-VN')}</td>
                              <td className="px-6 py-4 font-bold text-primary">{purchase.productName}</td>
                              <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(purchase.amount)}</td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                                  purchase.status === 'Completed' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                )}>
                                  {purchase.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-text-muted italic">
                              <ShoppingBag className="w-8 h-8 mx-auto mb-3 opacity-10" />
                              Khách hàng này chưa có bất kỳ giao dịch nào
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI Sentiment Footer */}
                <div className="card !bg-accent !text-white flex items-center gap-6 p-6 shadow-xl shadow-blue-100">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">Gợi ý AI cho người dùng</h3>
                    <p className="text-[14px] font-medium leading-relaxed">
                      Dựa trên hành vi mua sắm, khách hàng này thường quan tâm đến các sản phẩm công nghệ vào cuối tháng. Hãy thử gửi một bản tin Zalo cá nhân hóa vào ngày 25 tới.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-muted space-y-4">
                <div className="w-24 h-24 rounded-3xl bg-white border border-border flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                  <Users className="w-10 h-10 opacity-10" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary mb-1">Vui lòng chọn khách hàng</p>
                  <p className="text-xs italic">Xem chi tiết hồ sơ, lịch sử mua hàng và phân tích AI</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

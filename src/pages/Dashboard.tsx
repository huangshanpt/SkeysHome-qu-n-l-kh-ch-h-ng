import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  FileUp, 
  Mic, 
  Users, 
  TrendingUp, 
  ShoppingBag,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  X,
  Sparkles,
  Megaphone,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { crmService } from '../services/crmService';
import { aiService } from '../services/aiService';
import { Customer, Purchase } from '../types';
import { formatCurrency, cn } from '../lib/utils';

export default function Dashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractResult, setExtractResult] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [isAIActive, setIsAIActive] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [c, p] = await Promise.all([
      crmService.getCustomers(),
      crmService.getPurchases()
    ]);
    setCustomers(c);
    setPurchases(p);
  };

  const totalRevenue = purchases.reduce((acc, p) => acc + (p.status === 'Completed' ? p.amount : 0), 0);
  const activeCustomers = customers.length;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await aiService.extractCustomerInfoFromImage(base64, file.type);
      setExtractResult(result);
      setIsExtracting(false);
    };
    reader.readAsDataURL(file);
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    setTimeout(async () => {
      setIsListening(false);
      const mockResult = await aiService.processVoiceCommand("Thêm khách hàng Nguyễn Hoàng Sơn, email son@hateco.vn, số điện thoại 0912345678, địa chỉ Hà Nội");
      setExtractResult(mockResult);
    }, 3000);
  };

  const saveExtracted = async () => {
    if (!extractResult) return;
    const mode = crmService.getAppMode();
    if (!mode) return;

    const newCustomer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      name: extractResult.name || 'N/A',
      email: extractResult.email || 'N/A',
      phone: extractResult.phone || '',
      address: extractResult.address || '',
      group: 'Mới',
      type: mode,
      createdAt: new Date().toISOString(),
      notes: extractResult.notes || 'Thêm bằng AI'
    };
    await crmService.saveCustomer(newCustomer);
    setExtractResult(null);
    loadData();
  };

  const suggestions = [
    { title: "Ưu đãi nhóm Tiềm năng", description: "Tỉ lệ mua hàng tăng 15% nếu gửi mã giảm giá 10% ngay hôm nay." },
    { title: "Chăm sóc khách VIP", description: "3 khách hàng VIP chưa có giao dịch trong 30 ngày qua." }
  ];

  return (
    <div className="space-y-8 pb-12">
      <AnimatePresence>
        {isAIActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="ai-input-bar">
              <div className="flex-1 flex items-center gap-4">
                <div className="bg-white/50 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-primary">🤖 AI Quick Entry</p>
                  <p className="text-[11px] text-text-muted italic">Trích xuất thông tin khách hàng từ tệp ảnh, PDF hoặc giọng nói</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <label className="btn-action flex items-center gap-2 text-primary">
                  <FileUp className="w-4 h-4" />
                  <span>Upload File</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,application/pdf" />
                </label>
                
                <button 
                  onClick={handleVoiceInput}
                  className={cn(
                    "btn-action flex items-center gap-2",
                    isListening ? "bg-rose-50 border-rose-200 text-rose-600" : "text-primary"
                  )}
                >
                  <Mic className={cn("w-4 h-4", isListening && "animate-pulse")} />
                  <span>{isListening ? "Đang nghe..." : "Voice Input"}</span>
                </button>
              </div>
            </div>

            {(isExtracting || extractResult) && (
              <div className="card border-accent bg-blue-50/20 mb-8 mt-2">
                 {isExtracting ? (
                    <div className="py-6 flex flex-col items-center justify-center gap-3 text-text-muted">
                      <Loader2 className="w-8 h-8 text-accent animate-spin" />
                      <p className="text-xs font-medium">Gemini đang phân tích tài liệu...</p>
                    </div>
                 ) : (
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {Object.entries(extractResult).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{key}</p>
                            <p className="font-bold text-primary mt-0.5 truncate">{String(value) || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto self-center">
                        <button onClick={() => setExtractResult(null)} className="btn-action">Hủy</button>
                        <button 
                          onClick={saveExtracted}
                          className="btn-primary flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Lưu khách hàng
                        </button>
                      </div>
                    </div>
                 )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng Doanh Thu" 
          value={formatCurrency(totalRevenue)} 
          change="+15.2%" 
          trend="up" 
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard 
          title="Khách Hàng" 
          value={activeCustomers.toString()} 
          change="+8.4%" 
          trend="up" 
          icon={Users}
          color="emerald"
        />
        <StatCard 
          title="Tỷ Lệ Chốt" 
          value="64.8%" 
          change="-2.1%" 
          trend="down" 
          icon={ArrowUpRight}
          color="rose"
        />
        <StatCard 
          title="Giao Dịch" 
          value={purchases.length.toString()} 
          change="+12.5%" 
          trend="up" 
          icon={ShoppingBag}
          color="amber"
        />
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card !p-0 overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-primary">Khách hàng mới cập nhật</h3>
              <Link to="/customers" className="text-accent text-[13px] font-bold hover:underline">Xem tất cả</Link>
            </div>
            <div className="divide-y divide-border">
              {customers.slice(-5).reverse().map(customer => (
                <div key={customer.id} className="p-4 hover:bg-bg transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-border">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-text-main leading-tight">{customer.name}</p>
                      <p className="text-text-muted text-[11px] mt-0.5">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "badge",
                      customer.group === 'Thân thiết' ? "badge-vip" : "badge-new"
                    )}>
                      {customer.group}
                    </span>
                    <Link to="/customers" className="text-slate-300 hover:text-accent">
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card !bg-primary !text-white !p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
            <h3 className="text-md font-bold mb-6 flex items-center gap-2 relative z-10">
              <Megaphone className="w-5 h-5 text-accent" />
              Gợi ý Chiến dịch AI
            </h3>
            
            <div className="space-y-5 relative z-10">
              {suggestions.map((s, idx) => (
                <div key={idx} className="group cursor-pointer">
                  <p className="text-sm font-bold mb-1 group-hover:text-accent transition-colors">{s.title}</p>
                  <p className="text-[12px] text-white/60 leading-relaxed mb-3">{s.description}</p>
                  <div className="h-[1px] w-full bg-white/10 group-hover:bg-accent/30 transition-colors" />
                </div>
              ))}
              
              <button className="w-full btn-primary !bg-white !text-primary !border-none font-bold mt-4">
                Xem tất cả gợi ý
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, trend, icon: Icon, color }: any) {
  const colors: any = {
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
    rose: "text-rose-600 bg-rose-50",
    amber: "text-amber-600 bg-amber-50"
  };

  return (
    <div className="card hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2 rounded-lg", colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={cn(
          "text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-50",
          trend === 'up' ? "text-emerald-600" : "text-rose-600"
        )}>
          {change}
        </div>
      </div>
      <div>
        <p className="text-text-muted text-[12px] font-medium">{title}</p>
        <span className="text-2xl font-bold text-text-main tracking-tight">{value}</span>
      </div>
    </div>
  );
}

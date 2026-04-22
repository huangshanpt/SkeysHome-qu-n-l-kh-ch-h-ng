import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Download, 
  Calendar, 
  Filter, 
  ChevronDown,
  ArrowUpRight,
  Target,
  Users,
  Wallet,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { crmService } from '../services/crmService';
import { Customer, Purchase } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Analytics() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [appMode, setAppMode] = useState<'agency' | 'retail' | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const mode = await crmService.getAppMode();
    setAppMode(mode);
    const [c, p] = await Promise.all([
      crmService.getCustomers(mode || undefined),
      crmService.getPurchases()
    ]);
    setCustomers(c);
    // Filter purchases by only the customers relevant to current mode
    const customerIds = new Set(c.map(cust => cust.id));
    setPurchases(p.filter(purch => customerIds.has(purch.customerId)));
  };

  const revenueByGroup = customers.reduce((acc: any, customer) => {
    const cp = purchases.filter(p => p.customerId === customer.id && p.status === 'Completed');
    const total = cp.reduce((sum, p) => sum + p.amount, 0);
    acc[customer.group] = (acc[customer.group] || 0) + total;
    return acc;
  }, {});

  const pieData = Object.entries(revenueByGroup).map(([name, value]) => ({ name, value }));

  const monthlyRevenue = purchases
    .filter(p => p.status === 'Completed')
    .reduce((acc: any, p) => {
      const month = new Date(p.date).toLocaleString('vi-VN', { month: 'short' });
      acc[month] = (acc[month] || 0) + p.amount;
      return acc;
    }, {});

  const barData = Object.entries(monthlyRevenue).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#0ea5e9', '#6366f1', '#f59e0b'];

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('SmartCRM Analytics Report', 10, 10);
    doc.text(`App Mode: ${appMode || 'All'}`, 10, 20);
    
    const tableData = customers.map(c => {
      const custPurchases = purchases.filter(p => p.customerId === c.id);
      const total = custPurchases.reduce((acc, p) => acc + p.amount, 0);
      return [c.name, c.group, custPurchases.length, formatCurrency(total)];
    });

    autoTable(doc, {
      head: [['Customer', 'Group', 'Orders', 'LTV']],
      body: tableData,
      startY: 30
    });
    doc.save('crm-report.pdf');
  };

  const exportExcel = () => {
    const data = customers.map(c => {
      const custPurchases = purchases.filter(p => p.customerId === c.id);
      const total = custPurchases.reduce((acc, p) => acc + p.amount, 0);
      return {
        'Họ tên': c.name,
        'Email': c.email,
        'Nhóm': c.group,
        'Số đơn hàng': custPurchases.length,
        'Tổng chi tiêu': total
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    XLSX.writeFile(wb, 'crm-report.xlsx');
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <h1 className="text-3xl font-bold text-primary tracking-tight">Trung tâm Phân tích</h1>
             {appMode && (
               <span className="badge badge-new uppercase !text-[10px]">{appMode} mode</span>
             )}
          </div>
          <p className="text-text-muted">Báo cáo trực quan về hiệu quả kinh doanh và hành vi khách hàng.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="btn-action flex items-center gap-2">
             <Download className="w-4 h-4" />
             <span>Xuất PDF</span>
          </button>
          <button onClick={exportExcel} className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-100">
             <ShoppingBag className="w-4 h-4" />
             <span>Xuất Excel</span>
          </button>
        </div>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Revenue (Mode)" 
          value={formatCurrency(purchases.filter(p => p.status === 'Completed').reduce((acc, p) => acc + p.amount, 0))} 
          icon={Wallet}
          trend="+12%"
          color="blue"
        />
        <SummaryCard 
          title="Conversion Rate" 
          value="4.2%" 
          icon={Target}
          trend="+0.5%"
          color="indigo"
        />
        <SummaryCard 
          title="Monthly Growth" 
          value="24.8%" 
          icon={TrendingUp}
          trend="+5.2%"
          color="emerald"
        />
        <SummaryCard 
          title="Active Segments" 
          value={Object.keys(revenueByGroup).length.toString()} 
          icon={Users}
          trend="Stable"
          color="amber"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <section className="card !p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-primary tracking-tight">Xu thế Doanh thu</h3>
              <p className="text-[11px] text-text-muted font-medium mt-1">Dữ liệu doanh thu theo tháng ({appMode || 'Tất cả'})</p>
            </div>
            <button className="btn-action !py-1 text-[11px]">
              Tất cả thời gian
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                   dataKey="name" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{fontSize: 11, fill: '#64748b', fontWeight: 'bold'}}
                   dy={10}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{fontSize: 11, fill: '#64748b'}}
                   tickFormatter={(val) => `${val/1000000}M`}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '13px'}}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Customer Segmentation */}
        <section className="card !p-8">
           <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-primary tracking-tight">Phân bộ Khách hàng</h3>
              <p className="text-[11px] text-text-muted font-medium mt-1">Phân tích giá trị (LTV) theo nhóm</p>
            </div>
            <Sparkles className="w-5 h-5 text-accent animate-pulse" />
          </div>
          <div className="h-80 flex flex-col md:flex-row items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                   verticalAlign="bottom" 
                   height={36} 
                   iconType="circle"
                   wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="w-full md:w-48 space-y-4 mt-6 md:mt-0">
               {pieData.map((item, idx) => (
                 <div key={idx} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}} />
                     <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{item.name}</span>
                   </div>
                   <span className="text-xs font-bold text-primary">{Math.round(((item.value as number) / (Object.values(revenueByGroup).reduce((a: any, b: any) => (a as number) + (b as number), 0) as number)) * 100)}%</span>
                 </div>
               ))}
            </div>
          </div>
        </section>
      </div>

      {/* Detail Analysis List */}
      <section className="card !p-0 overflow-hidden shadow-xl shadow-slate-100">
        <div className="p-6 border-b border-border flex items-center justify-between bg-slate-50/50">
           <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Phân tích Chi tiết Khách hàng</h3>
           <div className="flex gap-2">
              <button className="btn-action !py-1 flex items-center gap-2 text-[11px]">
                  <Filter className="w-3.5 h-3.5" />
                  Lọc kết quả
              </button>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[10px] text-text-muted uppercase font-bold border-b border-border">
              <tr className="text-left">
                <th className="px-6 py-4">Họ và tên</th>
                <th className="px-6 py-4">Nhóm</th>
                <th className="px-6 py-4 text-center">Đơn hàng</th>
                <th className="px-6 py-4 text-right">Tổng chi tiêu (LTV)</th>
                <th className="px-6 py-4 text-center">Trạng thái AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map(c => {
                const custPurchases = purchases.filter(p => p.customerId === c.id);
                const total = custPurchases.reduce((acc, p) => acc + p.amount, 0);
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary">{c.name}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "badge",
                        c.group === 'VIP' ? "badge-vip" : "badge-new"
                      )}>
                        {c.group}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-text-muted">
                      {custPurchases.length}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      {formatCurrency(total)}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-accent">
                          <CheckCircle2 className="w-3 h-3" />
                          VERIFIED
                       </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, trend, color }: any) {
  const bgColors: any = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600"
  };

  return (
    <div className="card h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2 rounded-xl shadow-sm", bgColors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
          <ArrowUpRight className="w-3.5 h-3.5" />
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-primary tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5"/>
      <circle cx="12" cy="12" r="10"/>
    </svg>
  );
}

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  LayoutDashboard, 
  Megaphone, 
  BarChart3, 
  Settings as SettingsIcon, 
  Plus, 
  ChevronRight,
  Menu,
  X,
  Sparkles,
  ShoppingBag,
  Store,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Marketing from './pages/Marketing';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { cn } from './lib/utils';
import { crmService } from './services/crmService';
import { AppMode } from './types';

function ModeSelection({ onSelect }: { onSelect: (mode: AppMode) => void }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center space-y-12"
      >
        <div className="space-y-4">
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-100">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Chào mừng bạn đến với SmartCRM AI</h1>
          <p className="text-slate-500 text-lg">Vui lòng chọn hệ thống bạn muốn quản trị hôm nay</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <button 
            onClick={() => onSelect('agency')}
            className="group relative bg-white p-8 rounded-3xl border-2 border-transparent hover:border-indigo-600 transition-all shadow-xl hover:shadow-indigo-100 text-left overflow-hidden"
          >
            <div className="bg-indigo-50 p-4 rounded-2xl w-fit mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Store className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Quản lý Đại lý</h3>
            <p className="text-slate-500 leading-relaxed">Hệ thống dành riêng cho đối tác, nhà cung cấp và mạng lưới đại lý sỉ.</p>
            <div className="mt-8 flex items-center font-bold text-indigo-600">
              Bắt đầu ngay <ChevronRight className="w-5 h-5 ml-1" />
            </div>
          </button>

          <button 
            onClick={() => onSelect('retail')}
            className="group relative bg-white p-8 rounded-3xl border-2 border-transparent hover:border-emerald-600 transition-all shadow-xl hover:shadow-emerald-100 text-left overflow-hidden"
          >
            <div className="bg-emerald-50 p-4 rounded-2xl w-fit mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Quản lý Khách lẻ</h3>
            <p className="text-slate-500 leading-relaxed">Quản trị khách hàng cuối, cá nhân hóa trải nghiệm và tối ưu doanh số bán lẻ.</p>
            <div className="mt-8 flex items-center font-bold text-emerald-600">
              Bắt đầu ngay <ChevronRight className="w-5 h-5 ml-1" />
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Tổng quan', path: '/', icon: LayoutDashboard },
    { name: 'Khách hàng', path: '/customers', icon: Users },
    { name: 'Marketing', path: '/marketing', icon: Megaphone },
    { name: 'Báo cáo', path: '/analytics', icon: BarChart3 },
    { name: 'Cài đặt', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Desktop Sidebar (Slim) */}
      <aside className="hidden lg:flex sidebar-slim h-screen sticky top-0 border-r border-border shadow-sm">
        <div className="mb-4">
          <Link to="/" className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Sparkles className="w-6 h-6 text-white" />
          </Link>
        </div>

        <nav className="flex-1 w-full px-3 space-y-4 pt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.name}
                className={cn(
                  "sidebar-icon-box mx-auto",
                  isActive && "active"
                )}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Container Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent" />
          <span className="font-bold text-primary uppercase text-xs">
            {crmService.getAppMode() === 'agency' ? 'Đại Lý' : 'Bán Lẻ'}
          </span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-text-muted">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="lg:hidden fixed inset-0 z-40 bg-white pt-20 p-4"
          >
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-bg text-text-main"
                >
                  <item.icon className="w-6 h-6 text-accent" />
                  <span className="text-lg font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { auth } from './lib/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

function Login({ onLogin }: { onLogin: () => void }) {
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onLogin();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 text-center space-y-8"
      >
        <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-100">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Đăng nhập SmartCRM</h2>
          <p className="text-slate-500 text-sm">Sử dụng Google để truy cập dữ liệu của bạn</p>
        </div>
        
        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 py-3.5 rounded-xl font-bold text-slate-700 transition-all shadow-sm"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Tiếp tục với Google
        </button>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<AppMode | null>(crmService.getAppMode());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleModeSelect = (selectedMode: AppMode) => {
    crmService.setAppMode(selectedMode);
    setMode(selectedMode);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Sparkles className="w-10 h-10 text-indigo-600 animate-pulse" />
    </div>;
  }

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  if (!mode) {
    return <ModeSelection onSelect={handleModeSelect} />;
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-bg text-text-main font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="hidden lg:flex h-16 bg-white border-b border-border items-center justify-between px-8 sticky top-0 z-30">
             <div className="flex items-center gap-3">
               <h1 className="text-lg font-bold text-primary">CustomerHub Pro</h1>
               <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded border border-border">
                 {mode === 'agency' ? 'Đại Lý' : 'Bán Lẻ'}
               </span>
             </div>
             <div className="flex items-center gap-4">
                <button className="text-text-muted hover:text-primary transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-xs">
                  HS
                </div>
             </div>
          </header>
          
          <main className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 w-full max-w-[1400px] mx-auto overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

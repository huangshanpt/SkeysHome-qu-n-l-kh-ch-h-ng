import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Users, 
  Box, 
  Bell, 
  Globe, 
  Shield, 
  Trash2, 
  Plus, 
  Save,
  Grid,
  Monitor,
  RefreshCw,
  LogOut,
  ChevronRight,
  Database
} from 'lucide-react';
import { motion } from 'motion/react';
import { crmService } from '../services/crmService';
import { AppConfig } from '../types';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const cfg = await crmService.getConfig();
    setConfig(cfg);
  };

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    await crmService.saveConfig(config);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handleClearMode = () => {
    crmService.clearAppMode();
    navigate('/');
    window.location.reload();
  };

  const tabs = [
    { id: 'general', label: 'Cấu hình chung', icon: Globe },
    { id: 'modules', label: 'Phân loại & Module', icon: Grid },
    { id: 'notifications', label: 'Thông báo & Push', icon: Bell },
    { id: 'security', label: 'Bảo mật & Dữ liệu', icon: Shield },
  ];

  if (!config) return null;

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Cài đặt Hệ thống</h1>
          <p className="text-text-muted mt-1">Quản lý cấu hình, danh mục và tùy chỉnh trải nghiệm người dùng.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="card !p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                  activeTab === tab.id 
                    ? "bg-accent text-white shadow-md shadow-blue-100" 
                    : "text-text-muted hover:bg-slate-50 hover:text-primary"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            ))}
            
            <div className="pt-4 mt-4 border-t border-border">
              <button 
                onClick={handleClearMode}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Đổi chế độ (Agency/Retail)</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <div className="card !p-8 shadow-xl shadow-slate-100">
            {activeTab === 'general' && (
              <div className="space-y-8">
                <div className="border-b border-border pb-6">
                   <h2 className="text-xl font-bold text-primary mb-1">Cấu hình chung</h2>
                   <p className="text-xs text-text-muted">Thông tin cơ bản về doanh nghiệp và định dạng hệ thống.</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Tên doanh nghiệp</label>
                    <input 
                      type="text" 
                      placeholder="SmartCRM Solutions"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-border rounded-xl text-sm outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Ngôn ngữ mặc định</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-border rounded-xl text-sm outline-none">
                       <option>Tiếng Việt (VN)</option>
                       <option>English (US)</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Múi giờ</label>
                    <p className="text-sm font-medium text-primary bg-slate-50 p-2.5 border border-dashed border-border rounded-xl flex items-center gap-2">
                       <Monitor className="w-3.5 h-3.5 text-text-muted" />
                       (GMT+7) Bangkok, Hanoi, Jakarta
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'modules' && (
              <div className="space-y-8">
                <div className="border-b border-border pb-6">
                   <h2 className="text-xl font-bold text-primary mb-1">Phân loại & Module</h2>
                   <p className="text-xs text-text-muted">Tùy chỉnh danh mục khách hàng, sản phẩm và các tính năng kích hoạt.</p>
                </div>

                <div className="space-y-8">
                  {/* Customer Groups */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" />
                        Nhóm Khách hàng
                      </h3>
                      <button 
                        onClick={() => setConfig({...config, customerGroups: [...config.customerGroups, 'Nhóm mới']})}
                        className="btn-action !py-1 flex items-center gap-1.5 text-[10px]"
                      >
                        <Plus className="w-3 h-3" />
                        THÊM NHÓM
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {config.customerGroups.map((group, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-border rounded-xl group hover:border-accent transition-colors">
                          <input 
                            className="bg-transparent text-xs font-bold text-primary border-none p-0 w-full outline-none"
                            value={group}
                            onChange={(e) => {
                              const newGroups = [...config.customerGroups];
                              newGroups[idx] = e.target.value;
                              setConfig({...config, customerGroups: newGroups});
                            }}
                          />
                          <button 
                            onClick={() => {
                              const newGroups = config.customerGroups.filter((_, i) => i !== idx);
                              setConfig({...config, customerGroups: newGroups});
                            }}
                            className="text-text-muted hover:text-rose-600 ml-2 group-hover:block hidden"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Product Categories */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                        <Box className="w-4 h-4 text-accent" />
                        Danh mục Sản phẩm
                      </h3>
                      <button 
                        onClick={() => setConfig({...config, productCategories: [...config.productCategories, 'Mới']})}
                        className="btn-action !py-1 flex items-center gap-1.5 text-[10px]"
                      >
                        <Plus className="w-3 h-3" />
                        THÊM DANH MỤC
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {config.productCategories.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-border rounded-xl group hover:border-accent transition-colors">
                          <input 
                            className="bg-transparent text-xs font-bold text-primary border-none p-0 w-full outline-none"
                            value={cat}
                            onChange={(e) => {
                              const newCats = [...config.productCategories];
                              newCats[idx] = e.target.value;
                              setConfig({...config, productCategories: newCats});
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enabled Modules */}
                  <div>
                    <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                       <Grid className="w-4 h-4 text-accent" />
                       Kích hoạt Modules
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {['Marketing Hub', 'AI Extraction', 'Social Connect', 'Push Notifications', 'Advanced Analytics'].map(module => (
                        <label key={module} className={cn(
                          "flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all",
                          config.enabledModules.includes(module) ? "border-accent bg-blue-50/30" : "border-border bg-white"
                        )}>
                          <div className="flex items-center gap-3">
                             <div className={cn(
                               "w-8 h-8 rounded-lg flex items-center justify-center",
                               config.enabledModules.includes(module) ? "bg-accent text-white" : "bg-slate-100 text-text-muted"
                             )}>
                                <Monitor className="w-4 h-4" />
                             </div>
                             <span className="text-sm font-bold text-primary">{module}</span>
                          </div>
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 accent-accent"
                            checked={config.enabledModules.includes(module)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setConfig({...config, enabledModules: [...config.enabledModules, module]});
                              } else {
                                setConfig({...config, enabledModules: config.enabledModules.filter(m => m !== module)});
                              }
                            }}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="border-b border-border pb-6">
                   <h2 className="text-xl font-bold text-primary mb-1">Bảo mật & Dữ liệu</h2>
                   <p className="text-xs text-text-muted">Quản lý quyền truy cập và bảo trì cơ sở dữ liệu.</p>
                </div>
                
                <div className="grid gap-6">
                   <div className="p-6 bg-slate-50 border border-border rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="bg-white p-3 rounded-xl shadow-sm border border-border">
                            <Shield className="w-6 h-6 text-emerald-600" />
                         </div>
                         <div>
                            <p className="font-bold text-primary">Tình trạng bảo mật</p>
                            <p className="text-xs text-text-muted">Hệ thống đang được bảo vệ bởi AI Firewall.</p>
                         </div>
                      </div>
                      <span className="badge badge-vip">ACTIVE</span>
                   </div>

                   <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="bg-white p-3 rounded-xl shadow-sm border border-rose-100">
                            <Database className="w-6 h-6 text-rose-600" />
                         </div>
                         <div>
                            <p className="font-bold text-rose-900">Dữ liệu Local Storage</p>
                            <p className="text-xs text-rose-600/60">Dữ liệu hiện tại đang được lưu cục bộ trên trình duyệt.</p>
                         </div>
                      </div>
                      <button className="btn-action !text-rose-600 !border-rose-200 hover:bg-rose-100">XÓA TOÀN BỘ</button>
                   </div>
                </div>
              </div>
            )}
            
            {activeTab === 'notifications' && (
               <div className="h-64 flex flex-col items-center justify-center text-text-muted italic">
                  <Bell className="w-12 h-12 opacity-5 mb-4" />
                  <p className="text-sm">Phần cài đặt thông báo đang được nâng cấp...</p>
               </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

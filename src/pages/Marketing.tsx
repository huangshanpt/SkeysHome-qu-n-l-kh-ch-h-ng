import { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Mail, 
  MessageSquare, 
  Send, 
  History, 
  Plus, 
  Users, 
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { crmService } from '../services/crmService';
import { Campaign } from '../types';
import { cn } from '../lib/utils';

export default function Marketing() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [newCampaign, setNewCampaign] = useState({
    channel: 'Email',
    status: 'Draft',
    targetGroup: 'Tất cả',
    title: '',
    content: ''
  });

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
    const c = await crmService.getCampaigns();
    setCampaigns(c);
  };

  const handleSend = async () => {
    if (!newCampaign.title || !newCampaign.content) return;
    const campaign: Campaign = {
      id: Math.random().toString(36).substr(2, 9),
      title: newCampaign.title,
      content: newCampaign.content,
      channel: newCampaign.channel as any,
      targetGroup: newCampaign.targetGroup || 'Tất cả',
      sentAt: new Date().toISOString(),
      status: 'Sent'
    };
    await crmService.saveCampaign(campaign);
    setCampaigns(prev => [...prev, campaign]);
    setNewCampaign({ channel: 'Email', status: 'Draft', targetGroup: 'Tất cả', title: '', content: '' });
  };

  const channels = [
    { id: 'Email', icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'SMS', icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'Zalo', icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const groups = config ? ['Tất cả', ...config.customerGroups] : ['Tất cả'];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Marketing Center</h1>
          <p className="text-text-muted mt-1">Quản trị chiến dịch truyền thông đa kênh tập trung.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-action flex items-center gap-2">
             <History className="w-4 h-4" />
             <span>Lịch sử gửi</span>
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Create Campaign */}
        <section className="card !p-8 shadow-xl shadow-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-accent p-3 rounded-xl shadow-lg shadow-blue-100">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-primary tracking-tight">Chiến dịch mới</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">1. Chọn kênh truyền tải</label>
              <div className="grid grid-cols-3 gap-3">
                {channels.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => setNewCampaign({ ...newCampaign, channel: ch.id as any })}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                      newCampaign.channel === ch.id 
                        ? "border-accent bg-blue-50/30 shadow-sm ring-1 ring-accent" 
                        : "border-border shadow-sm hover:border-slate-300"
                    )}
                  >
                    <ch.icon className={cn("w-5 h-5", newCampaign.channel === ch.id ? "text-accent" : "text-text-muted")} />
                    <span className={cn("text-[11px] font-bold uppercase tracking-wider", newCampaign.channel === ch.id ? "text-accent" : "text-text-muted")}>
                      {ch.id}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">2. Đối tượng nhận tin</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm outline-none focus:ring-1 focus:ring-accent font-medium"
                value={newCampaign.targetGroup}
                onChange={(e) => setNewCampaign({ ...newCampaign, targetGroup: e.target.value })}
              >
                {groups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">3. Nội dung chiến dịch</label>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Tiêu đề (v.d: Mừng đại lễ giảm giá 50%)"
                  className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm outline-none focus:ring-1 focus:ring-accent"
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                />
                <textarea 
                  rows={5}
                  placeholder="Nội dung chi tiết..."
                  className="w-full px-4 py-4 bg-slate-50 border border-border rounded-xl text-sm outline-none focus:ring-1 focus:ring-accent leading-relaxed"
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                ></textarea>
              </div>
            </div>

            <button 
              onClick={handleSend}
              className="w-full btn-primary !py-4 flex items-center justify-center gap-3 shadow-xl shadow-blue-100 group"
            >
              <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              <span className="font-bold uppercase tracking-widest text-[13px]">Bắt đầu gửi ngay</span>
            </button>
          </div>
        </section>

        {/* Campaign Analytics / History */}
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-bold text-primary tracking-tight">Lịch sử Marketing</h2>
             <span className="badge badge-new">{campaigns.length} Tuyến tin</span>
          </div>
          
          <div className="space-y-4">
            {campaigns.length > 0 ? (
              campaigns.slice().reverse().map(campaign => (
                <div key={campaign.id} className="card hover:shadow-md transition-all border-l-4 border-l-accent">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-border flex items-center justify-center">
                        <Megaphone className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-primary truncate max-w-[200px]">{campaign.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{campaign.channel}</span>
                           <span className="w-1 h-1 bg-border rounded-full" />
                           <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{campaign.targetGroup}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[11px] text-text-muted font-bold">{new Date(campaign.sentAt).toLocaleDateString('vi-VN')}</p>
                       <p className="text-[10px] text-text-muted opacity-60 italic">{new Date(campaign.sentAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-border mb-4">
                    <p className="text-[13px] text-text-main leading-relaxed italic line-clamp-3">
                      "{campaign.content}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold">
                       <CheckCircle2 className="w-4 h-4" />
                       <span>Gửi toàn tất</span>
                    </div>
                    <button className="text-accent text-[11px] font-bold hover:underline underline-offset-4">Chi tiết chỉ số</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="card p-16 text-center text-text-muted border-dashed border-2 flex flex-col items-center justify-center">
                <History className="w-12 h-12 mb-4 opacity-5" />
                <p className="text-sm font-medium">Chưa có hoạt động marketing nào được ghi nhận</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

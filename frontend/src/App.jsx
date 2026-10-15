import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import StocksTab from './components/market/StocksTab';
import FnoIpoTab from './components/market/FnoIpoTab';
import MutualFundsTab from './components/market/MutualFundsTab';
import OperationsDashboard from './components/operations/OperationsDashboard';
import ComplianceReviewPanel from './components/compliance/ComplianceReviewPanel';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';
import PortfolioUploadModal from './components/upload/PortfolioUploadModal';
import { API_BASE_URL } from './config/api';
import {
  Activity, BarChart3, BriefcaseBusiness, ChevronDown, CircleUserRound,
  FileCheck2, Flame, LayoutDashboard, Leaf, LogIn, LogOut, Menu, Moon,
  PieChart, Plus, ServerCog, ShieldCheck, Sparkles, Sun, TrendingUp, Upload,
  WalletCards, X
} from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'AI Portfolio', group: 'Your money', icon: LayoutDashboard, accent: 'orange' },
  { id: 'stocks', label: 'Stocks', group: 'Markets', icon: TrendingUp, accent: 'green' },
  { id: 'fno_ipo', label: 'F&O & IPOs', group: 'Markets', icon: Flame, accent: 'orange' },
  { id: 'mutual_funds', label: 'Mutual Funds', group: 'Markets', icon: PieChart, accent: 'green' },
  { id: 'operations', label: 'Operations', group: 'Control room', icon: ServerCog, accent: 'green' },
  { id: 'compliance', label: 'Compliance', group: 'Control room', icon: FileCheck2, accent: 'orange' },
];

function AppContent() {
  const { user, isAuthenticated, logout, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState('PORT-1001');
  const [selectedBenchmark, setSelectedBenchmark] = useState('^NSEI');
  const [userRiskProfile, setUserRiskProfile] = useState('Aggressive Tech Growth');
  const [portfoliosList, setPortfoliosList] = useState([
    { portfolio_id: 'PORT-1001', investor_name: 'Mubarra - AI Growth', risk_profile: 'Aggressive Tech Growth' },
    { portfolio_id: 'PORT-1002', investor_name: 'Mubarra - Balanced', risk_profile: 'Moderate Bluechip' },
    { portfolio_id: 'PORT-1003', investor_name: 'Mubarra - High Beta', risk_profile: 'High Beta Consumer' },
  ]);
  const [authOpen, setAuthOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('zerodha_theme') || 'light');

  const fetchUserPortfolios = async () => {
    if (!isAuthenticated) return;
    try {
      const url = user?.id ? `${API_BASE_URL}/api/portfolios?user_id=${user.id}` : `${API_BASE_URL}/api/portfolios`;
      const res = await authFetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.portfolios?.length) {
          setPortfoliosList(json.portfolios);
          const own = json.portfolios.find(p => p.portfolio_id === `PORT-${user?.id}`) || json.portfolios[0];
          setSelectedPortfolio(own.portfolio_id);
          if (own.risk_profile) setUserRiskProfile(own.risk_profile);
        }
      }
    } catch (err) { console.warn('[Portfolio fetch warning]', err); }
  };

  useEffect(() => { fetchUserPortfolios(); }, [user, isAuthenticated]);
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('zerodha_theme', theme);
  }, [theme]);

  const go = (id) => {
    if (id === 'dashboard' && !isAuthenticated) setAuthOpen(true);
    else setActiveTab(id);
    setMobileOpen(false);
  };

  const handlePortfolio = (value) => {
    if (value === '__UPLOAD_NEW__') setUploadOpen(true);
    else {
      setSelectedPortfolio(value);
      const found = portfoliosList.find(p => p.portfolio_id === value);
      if (found?.risk_profile) setUserRiskProfile(found.risk_profile);
    }
  };

  const handleUploadSuccess = (id) => {
    setSelectedPortfolio(id);
    setActiveTab('dashboard');
    fetchUserPortfolios();
  };

  const current = NAV.find(n => n.id === activeTab) || NAV[0];
  const Icon = current.icon;

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="brand-lockup" onClick={() => go('dashboard')}>
          <div className="brand-mark"><Leaf size={21} strokeWidth={2.6} /></div>
          <div><div className="brand-name">Zerodha<span>AI</span></div><div className="brand-subtitle">Financial Intelligence</div></div>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">MS</div>
          <div className="profile-copy"><strong>{isAuthenticated ? (user?.email?.split('@')[0] || 'Mubarra') : 'Guest mode'}</strong><span>{isAuthenticated ? 'Investor workspace' : 'Explore market data'}</span></div>
        </div>

        <div className="nav-scroll">
          {['Your money', 'Markets', 'Control room'].map(group => (
            <div className="nav-group" key={group}>
              <div className="nav-label">{group}</div>
              {NAV.filter(item => item.group === group).map(item => {
                const I = item.icon;
                const active = activeTab === item.id;
                return <button key={item.id} onClick={() => go(item.id)} className={`nav-item ${active ? 'active' : ''} accent-${item.accent}`}><I size={18}/><span>{item.label}</span>{item.id === 'dashboard' && <span className="nav-ai">AI</span>}</button>;
              })}
            </div>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="ai-status"><span className="status-dot"/><div><strong>AI engine online</strong><small>Gemini insight layer</small></div></div>
          <div className="sidebar-footer"><ShieldCheck size={14}/><span>Non-execution financial intelligence</span></div>
        </div>
      </aside>

      {mobileOpen && <button className="mobile-overlay" onClick={() => setMobileOpen(false)} aria-label="Close menu"/>}

      <section className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={20}/></button>
            <div className="page-heading"><div className="eyebrow"><span className="live-dot"/> {current.group}</div><h1><Icon size={20}/>{current.label}</h1></div>
          </div>
          <div className="top-actions">
            <div className="market-chip"><Activity size={15}/><span>NIFTY 50</span><strong>Live</strong></div>
            <select value={selectedBenchmark} onChange={e => setSelectedBenchmark(e.target.value)} className="top-select" aria-label="Benchmark">
              <option value="^NSEI">NIFTY 50</option><option value="^BSESN">SENSEX</option><option value="^NSEBANK">BANKNIFTY</option>
            </select>
            {isAuthenticated && <div className="portfolio-picker"><WalletCards size={15}/><select value={selectedPortfolio} onChange={e => handlePortfolio(e.target.value)} aria-label="Portfolio">{portfoliosList.map(p => <option key={p.portfolio_id} value={p.portfolio_id}>{p.portfolio_id}</option>)}<option value="__UPLOAD_NEW__">+ Upload portfolio</option></select><ChevronDown size={13}/></div>}
            {isAuthenticated && <button className="icon-button upload-button" onClick={() => setUploadOpen(true)} title="Upload portfolio"><Upload size={17}/></button>}
            <button className="icon-button" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} title="Toggle theme">{theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}</button>
            {isAuthenticated ? <button className="user-pill" onClick={logout}><CircleUserRound size={17}/><span>{user?.email?.split('@')[0] || 'Mubarra'}</span><LogOut size={14}/></button> : <button className="signin-button" onClick={() => setAuthOpen(true)}><LogIn size={16}/> Sign in</button>}
          </div>
        </header>

        <div className="workspace">
          <div className="welcome-strip">
            <div><span className="welcome-kicker">SMART MONEY, SIMPLIFIED</span><h2>{isAuthenticated ? `Good to see you, ${user?.email?.split('@')[0] || 'Mubarra'} 👋` : 'Understand your portfolio at a glance'}</h2><p>Portfolio analytics, market context and Gemini-powered explanations in one clean workspace.</p></div>
            <div className="welcome-actions"><div className="risk-chip"><span>Risk profile</span><strong>{userRiskProfile}</strong></div>{isAuthenticated && <button className="primary-action" onClick={() => setUploadOpen(true)}><Plus size={17}/> Add portfolio</button>}</div>
          </div>

          <main className="content-area">
            {activeTab === 'stocks' && <StocksTab userRiskProfile={userRiskProfile} onNavigateToDashboard={() => go('dashboard')} />}
            {activeTab === 'fno_ipo' && <FnoIpoTab userRiskProfile={userRiskProfile} onNavigateToDashboard={() => go('dashboard')} />}
            {activeTab === 'mutual_funds' && <MutualFundsTab userRiskProfile={userRiskProfile} onNavigateToDashboard={() => go('dashboard')} />}
            {activeTab === 'dashboard' && <Dashboard portfolioId={selectedPortfolio} selectedBenchmark={selectedBenchmark} />}
            {activeTab === 'operations' && <OperationsDashboard />}
            {activeTab === 'compliance' && <ComplianceReviewPanel />}
          </main>
        </div>

        <footer className="app-footer"><div><ShieldCheck size={15}/><span>Zerodha AI • Decision-support only • No trade execution</span></div><span>Gemini AI · PostgreSQL/SQLite · Market data</span></footer>
      </section>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <PortfolioUploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onUploadSuccess={handleUploadSuccess} />
    </div>
  );
}

export default function App() { return <AuthProvider><AppContent /></AuthProvider>; }

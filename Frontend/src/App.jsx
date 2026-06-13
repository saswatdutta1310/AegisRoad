import React, { useState } from 'react';
import { 
  Building, LayoutDashboard, ShieldCheck, Map, Smartphone, Wrench, 
  Coins, Sparkles, BookOpen, LogIn, LogOut, User, Lock, Eye, Camera, AlertTriangle, Settings
} from 'lucide-react';
import { 
  INITIAL_CONTRACTS, 
  INITIAL_SLA_BREACHES 
} from './data';
import CommandCenter from './components/CommandCenter';
import SpendWatch from './components/SpendWatch';
import HazardExplorer from './components/HazardExplorer';
import DriverMobile from './components/DriverMobile';
import ContractorPortal from './components/ContractorPortal';
import AegisChat from './components/AegisChat';
import LandingPage from './components/LandingPage';
import AuthSystem from './components/AuthSystem';
import EdgeAI from './components/EdgeAI';
import CitizenReport from './components/CitizenReport';
import AlertSettings from './components/AlertSettings';
import DriveModeButton from './components/DriveMode/DriveModeButton';
import DriveMode from './components/DriveMode/DriveMode';
import { HazardProvider, useHazards } from './context/HazardContext';
import { SpendProvider, useSpend } from './context/SpendContext';

function AppShell() {
  const { hazards, addHazard, modifyHazard } = useHazards();
  const { contractors } = useSpend();
  
  const [activeTab, setActiveTab] = useState('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aegis_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleLogin = (user) => {
    setCurrentUser(user);
    if (user.role === 'government') setActiveTab('command');
    else if (user.role === 'contractor') setActiveTab('contractor');
    else if (user.role === 'worker') setActiveTab('driver');
    try {
      localStorage.setItem('aegis_auth_user', JSON.stringify(user));
    } catch (e) {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('landing');
    try {
      localStorage.removeItem('aegis_auth_user');
    } catch (e) {}
  };
  
  const [contracts, setContracts] = useState(INITIAL_CONTRACTS);
  const [slaBreaches, setSlaBreaches] = useState(INITIAL_SLA_BREACHES);

  const handleReportHazard = (newHazard) => {
    addHazard({
      ...newHazard, 
      road_name: newHazard.location || newHazard.road_name || 'Unknown road',
      cls: newHazard.cls || 'D40',
      lat: newHazard.coordinates?.lat ?? 16.4307,
      lng: newHazard.coordinates?.lng ?? 80.6241,
    });
  };

  const handleModifyHazard = (id, updates) => {
    modifyHazard(id, updates);
  };

  const handleUpdateSLABreach = (id, action) => {
    if (action === 'escalate') {
      setSlaBreaches(prev => prev.map(item => {
        if (item.id === id) {
          return { 
            ...item, 
            status: 'escalated',
            description: `${item.description} [ESC-LVL4: Dispatched direct email notifications to Municipal Chief Commissioner]`
          };
        }
        return item;
      }));
    } else if (action === 're-assign') {
      setSlaBreaches(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 're-assigned',
            description: `${item.description} [REASSIGNED: Revoked original repair license. Routing task to Apex Infrastruct]`
          };
        }
        return item;
      }));
    }
  };

  const navItems = [
    { id: 'landing',    label: 'Overview',    icon: <BookOpen size={13} />,      roles: null },
    { id: 'command',    label: 'Command',      icon: <LayoutDashboard size={13} />,roles: ['government'] },
    { id: 'spend',      label: 'SpendWatch',   icon: <Coins size={13} />,         roles: ['government'] },
    { id: 'explorer',   label: 'Hazard Map',   icon: <Map size={13} />,           roles: null },
    { id: 'edgeai',     label: 'Edge AI',      icon: <Camera size={13} />,        roles: null },
    { id: 'citizen',    label: 'Report',       icon: <AlertTriangle size={13} />, roles: [null, 'government'] },
    { id: 'driver',     label: 'Driver HUD',   icon: <Smartphone size={13} />,    roles: ['worker'] },
    { id: 'contractor', label: 'Contractor',   icon: <Building size={13} />,      roles: ['contractor'] },
    { id: 'settings',   label: 'Settings',     icon: <Settings size={13} />,      roles: null },
  ];

  const visibleNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    if (item.roles.includes(null)) {
      if (!currentUser) return true;
      if (item.roles.includes(currentUser?.role)) return true;
      return false;
    }
    return item.roles.includes(currentUser?.role);
  });

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F0E6] text-[#0D1E1B] flex flex-col font-sans selection:bg-[#C8D400] selection:text-[#072E24]">
      
      {/* ── NAV ─────────────────────────────────────────────── */}
      <header 
        className="sticky top-0 z-40 bg-white/93 backdrop-blur-[16px] border-b border-black/5"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-10 py-3.5 flex items-center justify-between gap-6">
          
          {/* Logo */}
          <button 
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: '#072E24', color: '#C8D400' }}
            >
              🛡
            </div>
            <span 
              className="text-[22px] font-black tracking-tight hidden sm:block"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#072E24', letterSpacing: '-0.5px' }}
            >
              Aegis<span style={{ color: '#C8D400' }}>Road</span>
            </span>
          </button>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-0.5 rounded-xl p-1" style={{ background: '#F4F0E6', border: '1px solid rgba(13,30,27,0.08)' }}>
            {visibleNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'text-[#072E24]'
                    : 'text-[#072E24]/50 hover:text-[#072E24]/80 hover:bg-[#EAE5D6]'
                }`}
                style={activeTab === item.id ? { background: '#C8D400' } : {}}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <DriveModeButton hazards={hazards} onNavigate={handleNavClick} />
          </nav>

          {/* Right side — always visible */}
          <div className="flex items-center gap-2 shrink-0">

            {/* ── DRIVE MODE BUTTON — visible on mobile too ── */}
            <div className="lg:hidden">
              <DriveModeButton hazards={hazards} onNavigate={handleNavClick} />
            </div>

            {/* Auth — hidden on very small screens, shown sm+ */}
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-2">
                <div 
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-tight border"
                  style={{ 
                    background: '#072E24', 
                    color: '#C8D400', 
                    borderColor: 'rgba(200,212,0,0.3)'
                  }}
                >
                  {currentUser.role === 'government' ? <ShieldCheck size={11} /> : currentUser.role === 'contractor' ? <Building size={11} /> : <Wrench size={11} />}
                  {currentUser.username}
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 rounded border text-[#072E24]/50 hover:text-[#072E24] hover:border-[#072E24]/30 transition-all cursor-pointer"
                  style={{ borderColor: 'rgba(13,30,27,0.15)' }}
                  title="Sign Out"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
                style={{ background: '#072E24', color: '#C8D400', fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                <LogIn size={12} />
                Login
              </button>
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileMenuOpen(p => !p)}
              className="lg:hidden p-2 rounded border transition-all cursor-pointer"
              style={{ borderColor: 'rgba(13,30,27,0.15)', color: '#072E24' }}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <div className="w-4 h-3 flex flex-col justify-between">
                <span className={`block h-0.5 bg-current transition-all duration-200 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 bg-current transition-all duration-200 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-current transition-all duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-black/5 bg-white">
            <div className="max-w-7xl mx-auto px-5 py-3 flex flex-col gap-1">

              {/* Nav items */}
              {visibleNavItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-left ${
                    activeTab === item.id
                      ? 'text-[#072E24]'
                      : 'text-[#072E24]/60 hover:text-[#072E24] hover:bg-[#F4F0E6]'
                  }`}
                  style={activeTab === item.id ? { background: '#C8D400' } : {}}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}

              {/* Auth row in mobile menu */}
              <div className="pt-2 border-t border-black/5 mt-1">
                {currentUser ? (
                  <div className="flex items-center justify-between px-1 py-1">
                    <div className="flex items-center gap-1.5">
                      {currentUser.role === 'government' ? <ShieldCheck size={12} className="text-[#072E24]" /> : currentUser.role === 'contractor' ? <Building size={12} className="text-[#072E24]" /> : <Wrench size={12} className="text-[#072E24]" />}
                      <span className="text-xs font-bold text-[#072E24]">
                        {currentUser.username} · {currentUser.role}
                      </span>
                    </div>
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="text-xs text-red-600 font-bold flex items-center gap-1 cursor-pointer px-2 py-1 rounded hover:bg-red-50"
                    >
                      <LogOut size={11} /> Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setIsAuthOpen(true); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider text-center cursor-pointer"
                    style={{ background: '#072E24', color: '#C8D400', fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    Login / Sign Up
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <main className="flex-1">
        {activeTab === 'drivemode' && (
          <DriveMode onClose={() => setActiveTab('landing')} />
        )}

        {activeTab !== 'drivemode' && activeTab === 'landing' && (
          <LandingPage 
            onNavigate={(tab) => setActiveTab(tab)} 
            stats={{
              activeHazards: hazards.filter(h => h.status !== 'completed').length,
              contractSum: contracts.reduce((sum, c) => sum + c.tenderValue, 0),
              compliances: 94.2,
              sensors: 1450
            }}
          />
        )}

        <div className="max-w-7xl mx-auto px-5 lg:px-10 py-8">
          {activeTab === 'command' && (
            <CommandCenter
              hazards={hazards}
              contracts={contracts}
              contractors={contractors}
              slaBreaches={slaBreaches}
              onReportHazard={handleReportHazard}
              onModifyHazard={handleModifyHazard}
              onUpdateSLABreach={handleUpdateSLABreach}
            />
          )}

          {activeTab === 'spend' && (
            <SpendWatch 
              contracts={contracts}
              contractors={contractors}
            />
          )}

          {activeTab === 'explorer' && (
            <HazardExplorer
              hazards={hazards}
              contracts={contracts}
              onReportHazard={handleReportHazard}
              onModifyHazard={handleModifyHazard}
              currentUser={currentUser}
            />
          )}
          
          {activeTab === 'edgeai' && (
            <EdgeAI />
          )}

          {activeTab === 'citizen' && (!currentUser || currentUser.role === 'government') && (
            <CitizenReport onReportHazard={handleReportHazard} />
          )}

          {activeTab === 'driver' && currentUser && currentUser.role === 'worker' && (
            <DriverMobile
              hazards={hazards}
              onReportHazard={handleReportHazard}
              currentUser={currentUser}
              onTriggerLogin={() => setIsAuthOpen(true)}
            />
          )}

          {activeTab === 'settings' && (
            <AlertSettings onBack={() => setActiveTab('landing')} />
          )}

          {activeTab === 'contractor' && (
            currentUser ? (
              <ContractorPortal
                hazards={hazards}
                contractors={contractors}
                onModifyHazard={handleModifyHazard}
                currentUser={currentUser}
                onTriggerLogin={() => setIsAuthOpen(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-white border border-black/8 rounded-2xl shadow-sm">
                <Lock size={44} className="mb-4" style={{ color: '#156B52' }} />
                <h2 className="text-2xl font-black uppercase mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#072E24' }}>Access Denied</h2>
                <p className="text-sm mb-6" style={{ color: 'rgba(13,30,27,0.5)' }}>You must be logged in to access the Contractor Portal.</p>
                <button 
                  onClick={() => setIsAuthOpen(true)} 
                  className="px-8 py-3 font-black text-sm uppercase tracking-wider rounded-xl cursor-pointer transition-all hover:scale-105"
                  style={{ background: '#C8D400', color: '#072E24', fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  Login Now →
                </button>
              </div>
            )
          )}
        </div>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer 
        className="border-t py-10 mt-8"
        style={{ background: '#072E24', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span 
            className="text-2xl font-black"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#C8D400' }}
          >
            AegisRoad
          </span>
          <div className="flex gap-6 text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>
            <button onClick={() => setActiveTab('landing')} className="hover:text-[#C8D400] transition-colors cursor-pointer">Overview</button>
            <button onClick={() => setActiveTab('explorer')} className="hover:text-[#C8D400] transition-colors cursor-pointer">Hazard Map</button>
            <button onClick={() => setActiveTab('citizen')} className="hover:text-[#C8D400] transition-colors cursor-pointer">Report</button>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>
            © 2026 AegisRoad Intelligence Inc.
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthSystem 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
      />

      {/* Floating chatbot */}
      <AegisChat 
        hazards={hazards} 
        contracts={contracts} 
      />
    </div>
  );
}

export default function App() {
  return (
    <HazardProvider>
      <SpendProvider>
        <AppShell />
      </SpendProvider>
    </HazardProvider>
  );
}
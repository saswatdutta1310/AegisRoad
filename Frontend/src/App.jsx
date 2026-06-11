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
import DriveModeButton from './components/DriveMode/DriveModeButton'; // ← NEW
import { HazardProvider, useHazards } from './context/HazardContext';
import { SpendProvider, useSpend } from './context/SpendContext';

function AppShell() {
  const { hazards, addHazard, modifyHazard } = useHazards();
  const { contractors } = useSpend();
  
  const [activeTab, setActiveTab] = useState('landing');
  
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

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 flex flex-col justify-between font-sans selection:bg-[#2ea014] selection:text-white">
      
      {/* Top Main Brand Header */}
      <header className="bg-[#0c1223] border-b border-slate-800/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-all flex-col lg:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-[#2ea014] flex items-center justify-center text-slate-950 relative">
                <ShieldCheck size={20} className="text-white" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0c1223]"></div>
              </div>
              <div>
                <h1 className="text-base font-black text-white leading-tight tracking-[0.05em] uppercase flex items-center gap-1">
                  AegisRoad <span className="text-[9px] bg-emerald-950 text-[#2ea014] border border-[#2ea014]/40 font-bold px-1.5 py-0.5 rounded ml-1 font-mono">v3.0</span>
                </h1>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mt-1 font-mono">Civil Pavement & Spend Safety</p>
              </div>
            </div>

            <div className="lg:hidden text-xs">
              {currentUser ? (
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ea014] animate-ping"></span>
                  <span className="font-mono text-[9px] uppercase tracking-tight text-slate-300">{currentUser.role}</span>
                </div>
              ) : (
                <span className="text-[9px] px-2 py-1 rounded bg-slate-950 text-slate-500 border border-slate-900 font-mono text-center">GUEST MODE</span>
              )}
            </div>
          </div>

          {/* Nav + Auth row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <nav className="flex flex-wrap bg-slate-950/80 p-0.5 rounded-lg border border-slate-800/60 gap-0.5 w-full sm:w-auto justify-center">
              
              <button
                id="nav-tab-landing"
                onClick={() => setActiveTab('landing')}
                className={`px-2.5 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === 'landing' 
                    ? 'bg-[#2ea014] text-white shadow font-extrabold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen size={11} />
                Overview
              </button>

              {(!currentUser || currentUser.role === 'government') && (
                <>
                  {currentUser && currentUser.role === 'government' && (
                    <>
                      <button
                        id="nav-tab-command"
                        onClick={() => setActiveTab('command')}
                        className={`px-2.5 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                          activeTab === 'command' 
                            ? 'bg-[#2ea014] text-white shadow font-extrabold' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <LayoutDashboard size={11} />
                        Command Center
                      </button>

                      <button
                        id="nav-tab-spend"
                        onClick={() => setActiveTab('spend')}
                        className={`px-2.5 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                          activeTab === 'spend' 
                            ? 'bg-[#2ea014] text-white shadow font-extrabold' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Formerly SpendWatch"
                      >
                        <Coins size={11} />
                        Spend Watch
                      </button>
                    </>
                  )}

                  <button
                    id="nav-tab-explorer"
                    onClick={() => setActiveTab('explorer')}
                    className={`px-2.5 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                      activeTab === 'explorer' 
                        ? 'bg-[#2ea014] text-white shadow font-extrabold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Public Transparency Map"
                  >
                    <Map size={11} />
                    {currentUser?.role === 'government' ? 'Hazard Map' : 'Public Map'}
                  </button>

                  <button
                    id="nav-tab-edgeai"
                    onClick={() => setActiveTab('edgeai')}
                    className={`px-2.5 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                      activeTab === 'edgeai' 
                        ? 'bg-[#2ea014] text-white shadow font-extrabold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Camera size={11} />
                    Edge AI
                  </button>

                  <button
                    id="nav-tab-citizen"
                    onClick={() => setActiveTab('citizen')}
                    className={`px-2.5 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                      activeTab === 'citizen' 
                        ? 'bg-[#2ea014] text-white shadow font-extrabold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <AlertTriangle size={11} />
                    Report Issue
                  </button>
                </>
              )}

              {currentUser && currentUser.role === 'worker' && (
                <button
                  id="nav-tab-driver"
                  onClick={() => setActiveTab('driver')}
                  className={`px-2.5 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                    activeTab === 'driver' 
                      ? 'bg-[#2ea014] text-white shadow font-extrabold' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone size={11} />
                  Driver Mobile
                </button>
              )}

              {currentUser && currentUser.role === 'contractor' && (
                <button
                  id="nav-tab-contractor"
                  onClick={() => setActiveTab('contractor')}
                  className={`px-2.5 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                    activeTab === 'contractor' 
                      ? 'bg-[#2ea014] text-white shadow font-extrabold' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building size={11} />
                  Contractor Portal
                </button>
              )}

              {/* ── SETTINGS BUTTON ── */}
              <button
                id="nav-tab-settings"
                onClick={() => setActiveTab('settings')}
                className={`px-2.5 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#2ea014] text-white shadow font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Alert Settings"
              >
                <Settings size={11} />
                Settings
              </button>

              {/* ── DRIVE MODE BUTTON ── always visible in navbar ── */}
              <DriveModeButton hazards={hazards} />

            </nav>

            {/* Auth section */}
            <div className="shrink-0 flex items-center gap-2 pl-2 border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-2 sm:pt-0 w-full sm:w-auto justify-center">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 rounded text-[9px] font-mono font-bold border flex items-center gap-1 ${
                    currentUser.role === 'contractor' 
                      ? 'bg-green-950/80 text-emerald-400 border-emerald-900' 
                      : currentUser.role === 'government' 
                        ? 'bg-sky-950/80 text-sky-400 border-sky-900' 
                        : 'bg-amber-950/80 text-amber-400 border-amber-900'
                  }`}>
                    {currentUser.role === 'contractor' ? <Building size={10} /> : currentUser.role === 'government' ? <ShieldCheck size={10} /> : <Wrench size={10} />}
                    <span className="uppercase tracking-tight">{currentUser.role === 'government' ? 'Officer' : currentUser.role}</span>
                  </div>
                  
                  <div className="hidden xl:flex flex-col text-right">
                    <span className="text-[10px] font-bold text-slate-100 max-w-[100px] truncate leading-tight">{currentUser.username}</span>
                    <span className="text-[8px] text-slate-400 font-mono leading-none truncate max-w-[100px]">{currentUser.orgName}</span>
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut size={11} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1 px-1.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse"></span>
                    Observer Mode
                  </span>
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="px-3 py-1.5 rounded bg-[#2ea014]/15 hover:bg-[#2ea014] border border-[#2ea014]/40 text-[#2ea014] hover:text-white font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 hover:scale-[1.01] cursor-pointer"
                  >
                    <LogIn size={10} />
                    Login / Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'landing' && (
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
            <div className="flex flex-col items-center justify-center h-64 bg-slate-900 border border-slate-800 rounded-xl">
              <Lock size={48} className="text-slate-600 mb-4" />
              <h2 className="text-xl font-bold text-slate-300 mb-2">Access Denied</h2>
              <p className="text-slate-500 mb-6">You must be logged in to access the Contractor Portal.</p>
              <button onClick={() => setIsAuthOpen(true)} className="px-6 py-2 bg-[#2ea014] text-white font-bold rounded-lg hover:bg-emerald-600 transition">
                Login Now
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#070b18] border-t border-slate-900 py-5 mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-xs font-mono">
          <p>© 2026 AegisRoad Intelligence Inc. Bound under municipal road safety & spend audit provisions.</p>
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
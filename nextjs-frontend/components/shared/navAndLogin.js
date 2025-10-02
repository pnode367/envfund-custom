import React, { useState, useEffect,isValidElement, cloneElement  } from 'react';
import {theme} from '@/lib/utils/theme';
import {
 BarChart2, FileText, Inbox, LogIn, LogOut, Menu, Bell, Search, Settings, Users, MessageSquare,
 FileCheck2,PieChart ,
  Zap,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  UserCircle ,
Globe
} from 'lucide-react'; // Make sure you have lucide-react installed


export function MobileHamburger({ isRTL = false, onClick }) {
  // Fixed floating button, only on <lg
  return (
    <button
      type="button"
      onClick={onClick}
      className={`lg:hidden fixed top-3 ${isRTL ? 'right-3' : 'left-3'} z-30 px-3 py-3 shadow-md className="flex items-center justify-between p-3 rounded-xl bg-green-800 text-white"`}
     
      aria-label="Open menu"
      title="Menu"
    >
      <Menu size={18} />
    </button>
  );
}

export function Sidebar({
  user = { role: 'applicant', username: 'Guest' },
  isOpen,                 // drawer visibility on <lg
  setIsOpen,              // setter for drawer
  collapsed,              // docked collapse state for lg+
  setCollapsed,
  activeView,
  setActiveView,
  setDetailView,
  openModal,
  t = (key) => key,
  language = 'en',
 
  mobileWidthClass = 'w-72', // Drawer width on mobile/tablet
}) {
  const navConfig = {
    applicant: [
      { key: 'dashboard', icon: <PieChart />, text: t('dashboard') },
      { key: 'applications', icon: <FileText />, text: t('applications') },
      { key: 'chat', icon: <MessageSquare />, text: t('chat') },
      { key: 'settings', icon: <Settings />, text: t('settings') },
    ],
    reviewer: [
      { key: 'dashboard', icon: <PieChart />, text: t('dashboard') },
      { key: 'assignments', icon: <Inbox />, text: 'Assigned Requests' },
      { key: 'settings', icon: <Settings />, text: t('settings') },
    ],
    editor: [
      { key: 'dashboard', icon: <PieChart />, text: t('dashboard') },
      { key: 'templates', icon: <FileCheck2 />, text: 'Manage Templates' },
      { key: 'settings', icon: <Settings />, text: t('settings') },
    ],
    admin: [
      { key: 'dashboard', icon: <PieChart />, text: t('dashboard') },
      { key: 'manage-applications', icon: <FileText />, text: t('manageApplications') },
      { key: 'manage-users', icon: <Users />, text: t('manageUsers') },
      { key: 'reports', icon: <BarChart2 />, text: t('reportsAndStats') },
      { key: 'integrations', icon: <Zap />, text: t('integrations') },
      { key: 'settings', icon: <Settings />, text: t('settings') },
    ],
  };

  const navItems = navConfig[user.role] || [];
  const isRTL = language === 'ar';

  // Lock body scroll while drawer is open (mobile/tablet)
  useEffect(() => {
    const body = document.body;
    if (isOpen) {
      const prev = body.style.overflow;
      body.style.overflow = 'hidden';
      return () => { body.style.overflow = prev; };
    }
  }, [isOpen]);

  const handleNavClick = (key) => {
    setDetailView && setDetailView(null);
    setActiveView(key);
    // auto-close drawer on small screens
    if (setIsOpen) setIsOpen(false);
  };

  const dockedWidth = collapsed ? 'lg:w-16' : 'lg:w-64';

  const renderIcon = (iconEl) =>
    isValidElement(iconEl)
      ? cloneElement(iconEl, { size: 22, className: 'shrink-0' })
      : <PieChart size={22} className="shrink-0" />;

  const sidePosBase = isRTL ? 'right-0 border-l' : 'left-0 border-r';

  return (
    <>
      {/* Floating hamburger (only shows on small screens) */}
      <MobileHamburger
        isRTL={isRTL}
        onClick={() => setIsOpen && setIsOpen(true)}
        theme={theme}
      />

      {/* Backdrop for mobile/tablet */}
      <div
        onClick={() => setIsOpen && setIsOpen(false)}
        className={`fixed inset-0 bg-black/40 transition-opacity lg:hidden z-40 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      />

      {/* Sidebar container */}
      <aside
        className={`
          fixed top-0 ${sidePosBase} h-full bg-white border-gray-200 z-50
          transition-transform duration-300 flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.05)]
          ${mobileWidthClass} ${dockedWidth}
          ${isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}
          lg:translate-x-0
        `}
        role="navigation"
        aria-label="Sidebar"
      >
        {/* Header */}
        <div
          className="relative flex items-center justify-center p-4 border-b h-16 bg-green-800"
        >
          {/* Logo (always show on mobile; hide when collapsed on lg) */}
          {(collapsed || typeof window !== 'undefined' && window.innerWidth < 1024) && (
            <img src={theme.logoUrl} alt="Logo" className="h-10 w-auto brightness-0 invert" />
          )}

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setCollapsed && setCollapsed(!collapsed)}
            className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 p-2 rounded hover:bg-white/10 text-white ${
              isRTL ? 'left-2' : 'right-2'
            }`}
            aria-label={collapsed ? 'Expand' : 'Collapse'}
            title={collapsed ? (t('expand') || 'Expand') : (t('collapse') || 'Collapse')}
            type="button"
          >
            {isRTL
              ? (collapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />)
              : (collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />)}
          </button>

          {/* Close (mobile/tablet) */}
          <button
            onClick={() => setIsOpen && setIsOpen(false)}
            className={`lg:hidden absolute top-1/2 -translate-y-1/2 p-2 rounded hover:bg-white/10 text-white ${
              isRTL ? 'right-2' : 'left-2'
            }`}
            aria-label={t('close') || 'Close'}
            title={t('close') || 'Close'}
            type="button"
          >
            {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto p-3 sm:p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeView === item.key;
              return (
                <li key={item.key}>
                  <button
    onClick={() => handleNavClick(item.key)}
    title={collapsed ? item.text : undefined}
    className={`w-full flex items-center ${
        collapsed ? 'justify-center' : 'justify-start'
    } gap-3 p-3 rounded-lg transition-colors text-sm font-medium
    ${isActive ? 'bg-green-800 text-white font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
    type="button"
>
    {renderIcon(item.icon)}
    {!collapsed && <span className="truncate">{item.text}</span>}
</button>
                    
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t">
          <div
            className="flex items-center justify-between p-3 rounded-xl"
            style={{ backgroundColor: theme.primary, color: 'white' }}
          >
            {!collapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-green-600">
                  <UserCircle size={24} />
                </div>
                <div className="flex flex-col text-sm">
                  <span className="font-semibold text-white">
                    {user.username || 'Nicola Web Design'}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={() => console.log('Logout clicked')}
              className={`p-2 rounded-full hover:bg-white/20 transition-colors ${
                collapsed ? 'w-full flex items-center justify-center' : ''
              }`}
              aria-label={t('logout') || 'Logout'}
              title={t('logout') || 'Logout'}
              type="button"
            >
              <LogOut size={20} />
            </button>
          </div>

          <button
            onClick={() => openModal && openModal('support')}
            title={collapsed ? t('supportCenter') : undefined}
            className={`mt-2 w-full flex items-center ${
              collapsed ? 'justify-center' : 'justify-start'
            } gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-100`}
            type="button"
          >
            <LifeBuoy size={20} className="shrink-0" />
            {!collapsed && <span>{t('supportCenter')}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export const Header = ({
  user,
  onLogout,
  onToggleSidebar,
  t,
  language,
  setLanguage,
  setActiveView,
  notifications,
}) => {
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;
  const toggleLanguage = () => setLanguage((lang) => (lang === "ar" ? "en" : "ar"));

  // Helpers
  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last || first || "?").toUpperCase();
  };

  const initials = getInitials(user?.name);
  const placeholder = `https://placehold.co/80x80/7f9cf5/ffffff?text=${encodeURIComponent(
    initials
  )}`;

  const [avatarSrc, setAvatarSrc] = useState(user?.avatarUrl || placeholder);

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20 h-16">
      <div className="flex justify-between items-center h-full px-4 sm:px-6 lg:p-8 relative">
        {/* Left: menu + search (desktop/tablet) */}
        <div className="flex items-center gap-4 flex-1 lg:flex-none">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <Menu />
          </button>

          {/* Search (hidden on xs) */}
          <div className="relative hidden sm:block">
            <Search
              className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
                language === "ar" ? "right-3" : "left-3"
              }`}
              size={20}
            />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              className={`bg-gray-100 rounded-full py-2 w-64 focus:outline-none focus:ring-2 focus:ring-green-600 ${
                language === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"
              }`}
            />
          </div>
        </div>

        {/* Mobile centered logo */}
        {/* <div className="absolute left-1/2 -translate-x-1/2 lg:hidden">
        <img src={theme.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />

        </div> */}

        {/* Right: language, notifications, profile, logout */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <Globe />
          </button>

          <div className="relative">
            <button
              onClick={() => setNotificationsOpen((o) => !o)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative"
            >
              <Bell />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div
                className={`absolute top-full mt-2 w-80 bg-white rounded-lg shadow-xl border z-30 ${
                  language === "ar" ? "left-0" : "right-0"
                }`}
              >
                <div className="p-3 font-bold border-b">{t("notifications")}</div>
                <div className="divide-y max-h-96 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 flex items-start gap-3 hover:bg-gray-50"
                    >
                      <div>{n.icon}</div>
                      <div>
                        <p className={`text-sm ${n.unread ? "font-bold" : ""}`}>
                          {n.text}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center bg-gray-50 border-t">
                  <a
                    href="#"
                    className={`text-sm font-semibold text-green-800`}
                  >
                    {t("viewAll")}
                  </a>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveView("settings")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img
              src={avatarSrc}
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover"
              onError={() => setAvatarSrc(placeholder)}
              referrerPolicy="no-referrer"
            />
            <div
              className={`text-sm hidden sm:block ${
                language === "ar" ? "text-right" : "text-left"
              }`}
            >
              <p className="font-semibold">{user.name}</p>
              <p className={`text-xs text-green-800 font-bold capitalize`}>
                {t(user.role)}
              </p>
            </div>
          </button>

          <button
            onClick={onLogout}
            title={t("logout")}
            className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600"
          >
            <LogOut />
          </button>
        </div>
      </div>
    </header>
  );
};
  export const LoginPage = ({ onLogin, onRegister, t, language, setLanguage }) => {
    const [mode, setMode] = useState('login');
  
    // Login state
    const [email, setEmail] = useState('applicant@ksu.edu.sa');
    const [password, setPassword] = useState('password123');
    const [role, setRole] = useState('applicant');
  
    const defaultCredentials = {
      applicant: 'applicant@ksu.edu.sa',
      reviewer: 'reviewer@ksu.edu.sa',
      editor:   'editor@ksu.edu.sa',
      admin:    'admin@ksu.edu.sa',
    };
  
    useEffect(() => {
      if (mode !== 'login') return;
      if (defaultCredentials[role]) {
        setEmail(defaultCredentials[role]);
        setPassword('password123');
      }
    }, [role, mode]);
  
    // Persist chosen language
    useEffect(() => {
      const saved = localStorage.getItem('ui:lang');
      if (saved && saved !== language && setLanguage) {
        setLanguage(saved);
      }
    }, []); // run once
  
    const handleLangChange = (e) => {
      const val = e.target.value;
      localStorage.setItem('ui:lang', val);
      setLanguage?.(val);
    };
  
    const handleLoginSubmit = (e) => {
      e.preventDefault();
      onLogin?.(email, role, password);
    };
  
    // Register state
    const [rName, setRName] = useState('');
    const [rEmail, setREmail] = useState('');
    const [rPassword, setRPassword] = useState('');
    const [rPhone, setRPhone] = useState('');
    const [rRole, setRRole] = useState('applicant');
  
    const handleRegisterSubmit = (e) => {
      e.preventDefault();
      if (!rName.trim() || !rEmail.trim() || !rPassword.trim()) {
        alert('Please fill all required fields.');
        return;
      }
      onRegister?.({
        name: rName.trim(),
        email: rEmail.trim(),
        password: rPassword,
        role: rRole,
        phone: rPhone.trim(),
      });
    };
  
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-gray-100 font-tajawal"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
          {/* Top row: language selector */}
          <div className={`flex items-center ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-gray-600" />
              <select
                value={language}
                onChange={handleLangChange}
                className="border rounded-md px-2 py-1 text-sm bg-white"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
  
          {/* Logo */}
          <div className="text-center">
            <div
              className="w-28 h-28 mx-auto bg-green-700"
              aria-label="Logo"
              style={{
                maskImage: `url(/assets/PNODE360.pptx.png)`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: `url(/assets/PNODE360.pptx.png)`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
              }}
            />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {t('grantManagementPlatform')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('forEnvironmentalSustainability')}
            </p>
          </div>
  
          {/* Tabs */}
          <div className="flex rounded-lg overflow-hidden border">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-center ${mode === 'login' ? 'bg-gray-100 font-semibold' : 'bg-white'}`}
            >
              {t('login')}
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-center ${mode === 'register' ? 'bg-gray-100 font-semibold' : 'bg-white'}`}
            >
              {t('register') || 'Register'}
            </button>
          </div>
  
          {/* Forms */}
          {mode === 'login' ? (
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div>
                <label className="font-medium">{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full mt-2 p-3 border rounded-lg"
                />
              </div>
  
              <div>
                <label className="font-medium">{t('password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full mt-2 p-3 border rounded-lg"
                />
              </div>
  
              <div>
                <label className="font-medium">{t('userType')}</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full mt-2 p-3 border rounded-lg bg-white"
                >
                  <option value="applicant">{t('applicant')}</option>
                  <option value="reviewer">{t('reviewer')}</option>
                  <option value="editor">{t('editor')}</option>
                  <option value="admin">{t('admin')}</option>
                </select>
              </div>
  
              <button
                type="submit"
                className={`w-full flex justify-center items-center gap-2 py-3 px-4 text-lg font-semibold rounded-lg text-white bg-${theme.primary} hover:bg-${theme.primaryHover} transition-all duration-300`}
              >
                <LogIn />
                {t('login')}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleRegisterSubmit}>
              <div>
                <label className="font-medium">{t('fullName') || 'Full Name'}</label>
                <input
                  type="text"
                  value={rName}
                  onChange={(e) => setRName(e.target.value)}
                  required
                  className="w-full mt-2 p-3 border rounded-lg"
                />
              </div>
  
              <div>
                <label className="font-medium">{t('email')}</label>
                <input
                  type="email"
                  value={rEmail}
                  onChange={(e) => setREmail(e.target.value)}
                  required
                  className="w-full mt-2 p-3 border rounded-lg"
                />
              </div>
  
              <div>
                <label className="font-medium">{t('password')}</label>
                <input
                  type="password"
                  value={rPassword}
                  onChange={(e) => setRPassword(e.target.value)}
                  required
                  className="w-full mt-2 p-3 border rounded-lg"
                />
              </div>
  
              <div>
                <label className="font-medium">{t('phone') || 'Phone (optional)'}</label>
                <input
                  type="tel"
                  value={rPhone}
                  onChange={(e) => setRPhone(e.target.value)}
                  className="w-full mt-2 p-3 border rounded-lg"
                />
              </div>
  
              <div>
                <label className="font-medium">{t('userType')}</label>
                <select
                  value={rRole}
                  onChange={(e) => setRRole(e.target.value)}
                  className="w-full mt-2 p-3 border rounded-lg bg-white"
                >
                  <option value="applicant">{t('applicant')}</option>
                  <option value="reviewer">{t('reviewer')}</option>
                  <option value="editor">{t('editor')}</option>
                  <option value="admin">{t('admin')}</option>
                </select>
              </div>
  
              <button
                type="submit"
                className={`w-full flex justify-center items-center gap-2 py-3 px-4 text-lg font-semibold rounded-lg text-white bg-${theme.primary} hover:bg-${theme.primaryHover} transition-all duration-300`}
              >
                {t('register') || 'Register'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  };
  
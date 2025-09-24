import React, { useState ,useEffect} from 'react';
import { mockUsers, mockNotifications,mockDocumentTemplates, mockApplications } from './utils/mockData';
import {useTranslation} from './utils/constants';
import {GrantFinancialsView,ApplicationDetailsView ,ApplicantDashboard ,MyApplicationsView,
    ReportsAndStatsView ,ChatView,AiAssistantModal,NewApplicationForm,SupportCenterModal,MilestoneDetailsModal} from './components/ApplicantDashboard';

import {DataRoomView, EditorDashboard,DocumentTemplatesView,IntegrationsView ,AssignReviewerModal
    ,AddUserModal ,AiReportGeneratorModal ,SendAnnouncementModal,SendMessageModal,TemplateFormModal} from './components/IntegrationView';

import {ReviewerEvaluationView, ReviewerDashboard ,AdminDashboard,ReviewerAssignmentsView,
    ApplicationManagementView,SettingsView ,UserManagementView  } from './components/DashboardView';
import {LoginPage,Sidebar,Header} from './components/navAndLogin';
export default function App() {
  const [user, setUser] = useState(null);
  const [apps, setApps] = useState([]); 
  const [assignments, setAssignments] = useState([]); 
  const [evaluations, setEvaluations] = useState([]); 
  const [appUpdates, setAppUpdates] = useState([]); 
  const [collapsed, setCollapsed] = useState(false);

  const [language, setLanguage] = useState('en');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [detailView, setDetailView] = useState(null); 
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [notifications, setNotifications] = useState(mockNotifications);
  const loadEvaluations = () => JSON.parse(localStorage.getItem('evaluations:all') || '[]');
  const saveEvaluations = (list) => localStorage.setItem('evaluations:all', JSON.stringify(list));
  const loadAppUpdates = () => JSON.parse(localStorage.getItem('appUpdates:all') || '[]');
  const saveAppUpdates = (list) => localStorage.setItem('appUpdates:all', JSON.stringify(list));
  const t = useTranslation(language);
  const [templates, setTemplates] = useState([]);
// ---- Users (registration) ----
const loadUsers = () => JSON.parse(localStorage.getItem('users:all') || '[]');   // array of user objects
const saveUsers = (list) => localStorage.setItem('users:all', JSON.stringify(list));
const [users, setUsers] = useState([]);


const getUserRecord = (email) => {
  // prefer locally registered users, else fall back to mocks
  const locals = loadUsers();
  const local = locals.find(u => u.email === email);
  return local || mockUsers[email];
};

// LOGIN: check against local (password required) or mock (use default)
const handleLogin = (email, role, password = 'password123') => {
  const record = getUserRecord(email);
  if (!record) return alert('Invalid credentials!');
  // role must match
  if (record.role !== role) return alert('Invalid credentials!');
  // password rules
  if (record._local) {
    // locally registered users must match their saved password hash (plain demo)
    if (record.password !== password) return alert('Invalid credentials!');
  } else {
    // mock users accept the demo password
    if (password !== 'password123') return alert('Invalid credentials!');
  }
  setUser(record);
  setActiveView('dashboard');
};

// REGISTER: create local user and persist
const handleRegister = ({ name, email, password, role = 'applicant', phone }) => {
  // prevent duplicates (including mocks)
  if (getUserRecord(email)) {
    alert('User already exists with this email.');
    return;
  }
  const newUser = {
    id: `U-${Date.now()}`,
    name: name?.trim() || email.split('@')[0],
    email: email.toLowerCase(),
    role,
    phone: phone || '',
    password,             // plain for demo only
    _local: true,
    createdAt: new Date().toISOString(),
    verified: false,
  };
  const all = loadUsers();
  const next = [newUser, ...all];
  saveUsers(next);

  // auto-login after register (optional; feels good)
  setUser(newUser);
  setActiveView('dashboard');
};

const loadTemplates = () =>
  JSON.parse(localStorage.getItem('templates:all') || '[]');

const saveTemplates = (list) =>
  localStorage.setItem('templates:all', JSON.stringify(list));
  const loadAllApps = () => {
    const saved = JSON.parse(localStorage.getItem('apps:all') || '[]');
    return saved;
  };
  const applyAppUpdates = (baseApps, updates) => {
    if (!updates?.length) return baseApps;
    const updById = new Map(updates.map(u => [u.applicationId, u]));
    return baseApps.map(a => {
      const u = updById.get(a.id);
      return u ? { ...a, status: u.status, lastDecisionBy: u.lastDecisionBy, decidedAt: u.decidedAt } : a;
    });
  };
  
  const saveAllApps = (list) => {
    localStorage.setItem('apps:all', JSON.stringify(list.filter(a => a._local)));
  };

  const loadAssignments = () => {
    return JSON.parse(localStorage.getItem('assignments:all') || '[]');
  };

  const saveAssignments = (list) => {
    localStorage.setItem('assignments:all', JSON.stringify(list));
  };

useEffect(() => {
    const locals = loadAllApps();
    const merged = [...mockApplications, ...locals];
  
    const byId = new Map();
    merged.forEach(a => byId.set(a.id, a));
    let finalList = Array.from(byId.values()).sort(
      (a, b) => new Date(b.submissionDate || b.createdAt) - new Date(a.submissionDate || a.createdAt)
    );
    const mockList = Object.values(mockUsers || {});  // built-in mocks
  const byEmail = new Map();
  [...mockList, ...locals].forEach(u => byEmail.set(u.email, u)); // local wins if same email
  setUsers(Array.from(byEmail.values()));
  
    // NEW: load and apply status overlays
    const upd = loadAppUpdates();
    setAppUpdates(upd);
    finalList = applyAppUpdates(finalList, upd);
    const localst = loadTemplates();
    const byIdt = new Map();
    [...mockDocumentTemplates, ...localst].forEach(t => byIdt.set(t.id, t));
    setTemplates(Array.from(byIdt.values()));
    setApps(finalList);
  
    setAssignments(loadAssignments());
    setEvaluations(loadEvaluations());
  }, [user?.email]);
  
  const handleSaveTemplate = (tpl) => {
    setTemplates(prev => {
      const rest = prev.filter(x => x.id !== tpl.id);
      const next = [tpl, ...rest];
  
      // persist only local ones (mock remain mocked)
      const localsOnly = next.filter(x => x._local);
      saveTemplates(localsOnly);
  
      return next;
    });
    closeModal(); // if opened from modal
  };
  
  const handleDeleteTemplate = (id) => {
    setTemplates(prev => {
      const next = prev.filter(x => x.id !== id);
      const localsOnly = next.filter(x => x._local);
      saveTemplates(localsOnly);
      return next;
    });
  };
  
  const handleSaveEvaluation = ({ applicationId, reviewerEmail, payload, submit = false }) => {
    // save evaluation (as in your current code)
    setEvaluations(prev => {
      const rest = prev.filter(e => !(e.applicationId === applicationId && e.reviewerEmail === reviewerEmail));
      const item = {
        id: `EV-${Date.now()}`,
        applicationId,
        reviewerEmail,
        status: submit ? 'submitted' : 'draft',
        updatedAt: new Date().toISOString(),
        ...payload, // { scores, total, recommendation, decision, aiAnalysis }
      };
      const next = [item, ...rest];
      saveEvaluations(next);
      return next;
    });
  
    // mark assignment done if submitted
    if (submit) {
      setAssignments(prev => {
        const next = prev.map(a =>
          a.applicationId === applicationId && a.reviewerEmail === reviewerEmail
            ? { ...a, completedAt: new Date().toISOString(), status: 'completed' }
            : a
        );
        saveAssignments(next);
        return next;
      });
  
      // ▼ NEW: update the application status overlay if reviewer made a decision
      const mapDecisionToStatus = (d) => {
        if (d === 'approve')  return 'approved';
        if (d === 'reject')   return 'rejected';
        if (d === 'revision') return 'revision-requested';
        return undefined;
      };
  
      const newStatus = mapDecisionToStatus(payload?.decision);
      if (newStatus) {
        setAppUpdates(prev => {
          const rest = prev.filter(u => u.applicationId !== applicationId);
          const item = {
            applicationId,
            status: newStatus,
            lastDecisionBy: reviewerEmail,
            decidedAt: new Date().toISOString(),
          };
          const next = [item, ...rest];
          saveAppUpdates(next);
          return next;
        });
  
        // Re-apply overlays to current apps so UI updates immediately
        setApps(prev => applyAppUpdates(prev, [
          ...appUpdates.filter(u => u.applicationId !== applicationId),
          { applicationId, status: newStatus }
        ]));
      }
    }
  };
  
  // Create new application (called by NewApplicationForm)
  const handleSaveApplication = (newApp) => {
    setApps(prev => {
      const next = [newApp, ...prev];
      // persist only _local ones
      const locals = next.filter(a => a._local);
      saveAllApps(locals);
      return next;
    });
  };


 const handleAssignReviewer = ({ applicationId, reviewerEmail, assignedBy }) => {
    setAssignments(prev => {
      // Avoid duplicate assignment; replace if exists
      const rest = prev.filter(a => !(a.applicationId === applicationId && a.reviewerEmail === reviewerEmail));
      const item = {
        id: `ASG-${Date.now()}`,
        applicationId,
        reviewerEmail,
        assignedBy,
        date: new Date().toISOString(),
      };
      const next = [item, ...rest];
      saveAssignments(next);
      return next;
    });
  };
  const handleAddUser = ({ name, email, role, phone, password }) => {
    const existing = loadUsers();
    if (existing.some(u => u.email.toLowerCase() === email.toLowerCase()) ||
        mockUsers[email]) {
      alert('A user with this email already exists.');
      return;
    }
    const newUser = {
      id: `U-${Date.now()}`,
      name: name?.trim() || email.split('@')[0],
      email: email.trim().toLowerCase(),
      role,
      phone: phone?.trim() || '',
      password: password || 'password123',  // demo only
      _local: true,
      createdAt: new Date().toISOString(),
      verified: false,
    };
    const next = [newUser, ...existing];
    saveUsers(next);
    // refresh unified list in state
    const merged = new Map([...Object.values(mockUsers)].map(u => [u.email, u]));
    next.forEach(u => merged.set(u.email, u));
    setUsers(Array.from(merged.values()));
    closeModal();
  };

  const reviewerAssignments = React.useMemo(() => {
    if (!user || user.role !== 'reviewer') return [];
    const mine = assignments.filter(a => a.reviewerEmail === user.email);
    const appById = new Map(apps.map(a => [a.id, a]));
    const evalByKey = new Map(
      evaluations
        .filter(e => e.reviewerEmail === user.email)
        .map(e => [`${e.applicationId}:${e.reviewerEmail}`, e])
    );
  
    return mine
      .map(a => {
        const application = appById.get(a.applicationId);
        if (!application) return null;
        const ev = evalByKey.get(`${a.applicationId}:${a.reviewerEmail}`);
        return {
          ...a,
          application,
          evaluation: ev || null, // {status: 'draft'|'submitted', total, decision, ...}
        };
      })
      .filter(Boolean);
  }, [assignments, apps, evaluations, user]);
  
//   const handleLogin = (email, role) => { const userData = mockUsers[email]; if (userData && userData.role === role) { setUser(userData); setActiveView('dashboard'); } else { alert('Invalid credentials!'); } };
  const handleLogout = () => { setUser(null); setDetailView(null); };

  const openModal = (modalName, data = null) => { setModalData(data); setActiveModal(modalName); }
  const closeModal = () => { setActiveModal(null); setModalData(null); }

  const updateNotifications = () => setNotifications({...mockNotifications});

  const renderContent = () => {
    const commonProps = { setActiveView, setDetailView, user, openModal, closeModal, t, language };
    if (detailView?.type === 'grant') return <GrantFinancialsView grantId={detailView.id} {...commonProps} />;
      if (detailView?.type === 'dataRoom') return <DataRoomView grantId={detailView.id} {...commonProps} />;
      if (detailView?.type === 'evaluation') {
        return (
          <ReviewerEvaluationView
            application={detailView.application}
            onSaveEvaluation={handleSaveEvaluation}
            user={user}
            {...commonProps}
          />
        );
      }
      
    if (detailView?.type === 'applicationDetails') return <ApplicationDetailsView application={detailView.application} {...commonProps} />;
      
      const role = user?.role;
      switch(role) {
          case 'applicant':
              switch(activeView) { case 'dashboard': return <ApplicantDashboard {...commonProps} />; case 'applications': return <MyApplicationsView apps={apps} {...commonProps} />; 
              ; case 'chat': return <ChatView {...commonProps} />; case 'settings': return <SettingsView user={user} {...commonProps} />; default: return <ApplicantDashboard {...commonProps} />; }
         case 'reviewer':
              switch (activeView) {
                  case 'assignments':  return <ReviewerAssignmentsView items={reviewerAssignments} {...commonProps} />;
                  default:             return <ReviewerDashboard items={reviewerAssignments} {...commonProps} />;
                }          
                case 'editor':
                    switch (activeView) {
                      case 'dashboard':
                        return <EditorDashboard templates={templates} {...commonProps} />;
                      case 'templates':
                        return (
                          <DocumentTemplatesView
                            templates={templates}
                            onCreate={() => openModal('templateForm', null)}
                            onEdit={(tpl) => openModal('templateForm', tpl)}
                            onDelete={handleDeleteTemplate}
                            {...commonProps}
                          />
                        );
                      case 'settings':
                        return <SettingsView user={user} {...commonProps} />;
                      default:
                        return <EditorDashboard templates={templates} {...commonProps} />;
                    }
                  
              case 'admin':
              switch(activeView) { 
                case 'dashboard':
      return <AdminDashboard apps={apps} {...commonProps} />;
    case 'manage-applications':
      return <ApplicationManagementView apps={apps} {...commonProps} />;
            
              case 'manage-users':
      return <UserManagementView users={users} openModal={openModal} t={t} {...commonProps} />;

              case 'reports': return <ReportsAndStatsView {...commonProps} />; 
              case 'integrations': return <IntegrationsView {...commonProps} />; 
              case 'settings': return <SettingsView user={user} {...commonProps} />;
               default: return <AdminDashboard {...commonProps} />; }
          default:
              return <LoginPage onLogin={handleLogin} t={t} language={language} />;
      }
  };

  return (
      <>
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap'); body, .font-tajawal { font-family: 'Tajawal', sans-serif; } @keyframes modal-pop-in { from { transform: scale(.95); opacity: 0; } to { transform: scale(1); opacity: 1; } } .animate-modal-pop-in { animation: modal-pop-in 0.2s ease-out forwards; }`}</style>
          <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="bg-gray-50 font-tajawal text-gray-800 min-h-screen">
              {user && <Sidebar user={user} isOpen={isSidebarOpen} collapsed={collapsed}           // NEW
    setCollapsed={setCollapsed}  activeView={activeView} setActiveView={setActiveView} setDetailView={setDetailView} openModal={openModal} t={t} language={language}/>}
            
              <div
  className={`transition-all duration-300 ${
    user && isSidebarOpen
      ? (language === 'ar'
          ? (collapsed ? 'lg:mr-16' : 'lg:mr-64')
          : (collapsed ? 'lg:ml-16' : 'lg:ml-64'))
      : (language === 'ar' ? 'lg:mr-0' : 'lg:ml-0')
  }`}
>
  {user && (
    <Header
      user={user}
      onLogout={handleLogout}
      onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
      openModal={openModal}
      t={t}
      language={language}
      setLanguage={setLanguage}
      setActiveView={setActiveView}
      notifications={notifications[user.role] || []}
    />
  )}
  <main className="p-4 sm:p-6 lg:p-8">
  {user
    ? renderContent()
    : <LoginPage onLogin={handleLogin} onRegister={handleRegister} t={t} language={language} />}
</main>

</div>

              {activeModal === 'aiAssistant' && <AiAssistantModal onClose={closeModal} t={t} />}
              {activeModal === 'newApplication' && <NewApplicationForm onClose={closeModal} t={t} currentUser={user}
          onSave={handleSaveApplication} 
/>}
              {activeModal === 'assignReviewer' && <AssignReviewerModal application={modalData} onClose={closeModal} t={t}  onAssign={handleAssignReviewer}   />}
              {activeModal === 'addUser' && <AddUserModal onClose={closeModal} onAdd={handleAddUser}  t={t} />}
              {activeModal === 'aiReport' && <AiReportGeneratorModal data={modalData} onClose={closeModal} t={t} />}
              {activeModal === 'support' && <SupportCenterModal onClose={closeModal} openModal={openModal} t={t} setActiveView={setActiveView}/>}
              {activeModal === 'milestoneDetails' && <MilestoneDetailsModal milestone={modalData} onClose={closeModal} t={t}/>}
              {activeModal === 'sendAnnouncement' && <SendAnnouncementModal onClose={closeModal} t={t} updateNotifications={updateNotifications} />}
              {activeModal === 'sendMessage' && <SendMessageModal user={modalData} onClose={closeModal} t={t} />}
              {activeModal === 'templateForm' && (
  <TemplateFormModal
    data={modalData}          
    onSave={handleSaveTemplate}
    onClose={closeModal}
    t={t}
  />
)}
          </div>
      </>
  );
}
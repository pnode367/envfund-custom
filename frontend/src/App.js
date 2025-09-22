import React, { useState } from 'react';
import {mockUsers,mockNotifications} from './utils/mockData';
import {useTranslation} from './utils/constants';
import {GrantFinancialsView,ApplicationDetailsView ,ApplicantDashboard ,MyApplicationsView,
    ReportsAndStatsView ,ChatView,AiAssistantModal,NewApplicationForm,SupportCenterModal,MilestoneDetailsModal} from './components/ApplicantDashboard';

import {DataRoomView, EditorDashboard,DocumentTemplatesView,IntegrationsView ,AssignReviewerModal
    ,AddUserModal ,AiReportGeneratorModal ,SendAnnouncementModal,SendMessageModal} from './components/IntegrationView';

import {ReviewerEvaluationView, ReviewerDashboard ,AdminDashboard,ReviewerAssignmentsView,
    ApplicationManagementView,SettingsView ,UserManagementView  } from './components/DashboardView';
import {LoginPage,Sidebar,Header} from './components/navAndLogin';
export default function App() {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('ar');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [detailView, setDetailView] = useState(null); 
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [notifications, setNotifications] = useState(mockNotifications);
  
  const t = useTranslation(language);

  const handleLogin = (email, role) => { const userData = mockUsers[email]; if (userData && userData.role === role) { setUser(userData); setActiveView('dashboard'); } else { alert('Invalid credentials!'); } };
  const handleLogout = () => { setUser(null); setDetailView(null); };

  const openModal = (modalName, data = null) => { setModalData(data); setActiveModal(modalName); }
  const closeModal = () => { setActiveModal(null); setModalData(null); }

  const updateNotifications = () => setNotifications({...mockNotifications});

  const renderContent = () => {
      const commonProps = { setActiveView, setDetailView, user, openModal, closeModal, t, language };
      if (detailView?.type === 'grant') return <GrantFinancialsView grantId={detailView.id} {...commonProps} />;
      if (detailView?.type === 'dataRoom') return <DataRoomView grantId={detailView.id} {...commonProps} />;
      if (detailView?.type === 'evaluation') return <ReviewerEvaluationView application={detailView.application} {...commonProps} />;
      if (detailView?.type === 'applicationDetails') return <ApplicationDetailsView application={detailView.application} {...commonProps} />;
      
      const role = user?.role;
      switch(role) {
          case 'applicant':
              switch(activeView) { case 'dashboard': return <ApplicantDashboard {...commonProps} />; case 'applications': return <MyApplicationsView {...commonProps} />; case 'chat': return <ChatView {...commonProps} />; case 'settings': return <SettingsView user={user} {...commonProps} />; default: return <ApplicantDashboard {...commonProps} />; }
          case 'reviewer':
              switch(activeView) { case 'dashboard': return <ReviewerDashboard {...commonProps} />; case 'assignments': return <ReviewerAssignmentsView {...commonProps} />; case 'settings': return <SettingsView user={user} {...commonProps} />; default: return <ReviewerDashboard {...commonProps} />; }
          case 'editor':
              switch(activeView) { case 'dashboard': return <EditorDashboard {...commonProps} />; case 'templates': return <DocumentTemplatesView {...commonProps} />; case 'settings': return <SettingsView user={user} {...commonProps} />; default: return <EditorDashboard {...commonProps} />; }
          case 'admin':
              switch(activeView) { case 'dashboard': return <AdminDashboard {...commonProps} />; case 'manage-applications': return <ApplicationManagementView {...commonProps} />; case 'manage-users': return <UserManagementView {...commonProps} />; case 'reports': return <ReportsAndStatsView {...commonProps} />; case 'integrations': return <IntegrationsView {...commonProps} />; case 'settings': return <SettingsView user={user} {...commonProps} />; default: return <AdminDashboard {...commonProps} />; }
          default:
              return <LoginPage onLogin={handleLogin} t={t} language={language} />;
      }
  };

  return (
      <>
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap'); body, .font-tajawal { font-family: 'Tajawal', sans-serif; } @keyframes modal-pop-in { from { transform: scale(.95); opacity: 0; } to { transform: scale(1); opacity: 1; } } .animate-modal-pop-in { animation: modal-pop-in 0.2s ease-out forwards; }`}</style>
          <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="bg-gray-50 font-tajawal text-gray-800 min-h-screen">
              {user && <Sidebar user={user} isOpen={isSidebarOpen} activeView={activeView} setActiveView={setActiveView} setDetailView={setDetailView} openModal={openModal} t={t} language={language}/>}
              <div className={`transition-all duration-300 ${user && isSidebarOpen ? (language === 'ar' ? 'lg:mr-64' : 'lg:ml-64') : (language === 'ar' ? 'lg:mr-0' : 'lg:ml-0')}`}>
                  {user && <Header user={user} onLogout={handleLogout} onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} openModal={openModal} t={t} language={language} setLanguage={setLanguage} setActiveView={setActiveView} notifications={notifications[user.role] || []} />}
                  <main className="p-4 sm:p-6 lg:p-8">{user ? renderContent() : <LoginPage onLogin={handleLogin} t={t} language={language} />}</main>
              </div>
              {activeModal === 'aiAssistant' && <AiAssistantModal onClose={closeModal} t={t} />}
              {activeModal === 'newApplication' && <NewApplicationForm onClose={closeModal} t={t} />}
              {activeModal === 'assignReviewer' && <AssignReviewerModal application={modalData} onClose={closeModal} t={t} />}
              {activeModal === 'addUser' && <AddUserModal onClose={closeModal} t={t} />}
              {activeModal === 'aiReport' && <AiReportGeneratorModal data={modalData} onClose={closeModal} t={t} />}
              {activeModal === 'support' && <SupportCenterModal onClose={closeModal} openModal={openModal} t={t} setActiveView={setActiveView}/>}
              {activeModal === 'milestoneDetails' && <MilestoneDetailsModal milestone={modalData} onClose={closeModal} t={t}/>}
              {activeModal === 'sendAnnouncement' && <SendAnnouncementModal onClose={closeModal} t={t} updateNotifications={updateNotifications} />}
              {activeModal === 'sendMessage' && <SendMessageModal user={modalData} onClose={closeModal} t={t} />}
          </div>
      </>
  );
}
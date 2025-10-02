'use client';

import React, { useState, useEffect } from 'react';
import { mockUsers, mockNotifications, mockDocumentTemplates, mockApplications } from '@/lib/utils/mockData';
import { useTranslation } from '@/lib/utils/constants';
import {
  GrantFinancialsView, ApplicationDetailsView, ApplicantDashboard, MyApplicationsView,
  ReportsAndStatsView, ChatView, AiAssistantModal, NewApplicationForm, SupportCenterModal, MilestoneDetailsModal
} from '@/components/shared/ApplicantDashboard';

import {
  DataRoomView, EditorDashboard, DocumentTemplatesView, IntegrationsView, AssignReviewerModal,
  AddUserModal, AiReportGeneratorModal, SendAnnouncementModal, SendMessageModal, TemplateFormModal
} from '@/components/shared/IntegrationView';

import {
  ReviewerEvaluationView, ReviewerDashboard, AdminDashboard, ReviewerAssignmentsView,
  ApplicationManagementView, SettingsView, UserManagementView
} from '@/components/shared/DashboardView';
import { LoginPage, Sidebar, Header, MobileHamburger } from '@/components/shared/navAndLogin';

export default function AppClient() {
  const [user, setUser] = useState(null);
  const [apps, setApps] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [appUpdates, setAppUpdates] = useState([]);
  const [collapsed, setCollapsed] = useState(false);

  const [language, setLanguage] = useState('en');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [detailView, setDetailView] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);

  const loadEvaluations = () => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('evaluations:all') || '[]');
    }
    return [];
  };
  
  const saveEvaluations = (list) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('evaluations:all', JSON.stringify(list));
    }
  };
  
  const loadAppUpdates = () => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('appUpdates:all') || '[]');
    }
    return [];
  };
  
  const saveAppUpdates = (list) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('appUpdates:all', JSON.stringify(list));
    }
  };
  
  const loadUsers = () => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('users:all') || '[]');
    }
    return [];
  };
  
  const saveUsers = (list) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('users:all', JSON.stringify(list));
    }
  };

  const t = useTranslation(language);

  const getUserRecord = (email) => {
    const locals = loadUsers();
    const local = locals.find(u => u.email === email);
    return local || mockUsers[email];
  };

  const handleLogin = (email, role, password = 'password123') => {
    const record = getUserRecord(email);
    if (!record) return alert('Invalid credentials!');
    
    if (record._local) {
      if (record.password !== password) {
        return alert('Incorrect password!');
      }
    }
    
    setUser(record);
    setDetailView(null);
  };

  const handleRegister = (name, email, role, phone = '', password = 'password123') => {
    const existing = loadUsers();
    if (existing.find(u => u.email === email) || mockUsers[email]) {
      return alert('User already exists!');
    }
    
    const newUser = {
      id: `user-${Date.now()}`,
      name: name?.trim() || email.split('@')[0],
      email: email.trim().toLowerCase(),
      role,
      phone: phone?.trim() || '',
      password: password || 'password123',
      _local: true,
      createdAt: new Date().toISOString(),
      verified: false,
    };
    
    const next = [newUser, ...existing];
    saveUsers(next);
    const merged = new Map([...Object.values(mockUsers)].map(u => [u.email, u]));
    next.forEach(u => merged.set(u.email, u));
    setUsers(Array.from(merged.values()));
    closeModal();
  };

  const handleLogout = () => {
    setUser(null);
    setDetailView(null);
  };

  const openModal = (modalName, data = null) => {
    setModalData(data);
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  const updateNotifications = () => setNotifications({ ...mockNotifications });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedApps = JSON.parse(localStorage.getItem('applications:all') || '[]');
      const mergedApps = [...mockApplications, ...savedApps.filter(a => a._local)];
      setApps(mergedApps);

      const savedAssignments = JSON.parse(localStorage.getItem('assignments:all') || '[]');
      setAssignments(savedAssignments);

      const savedEvals = loadEvaluations();
      setEvaluations(savedEvals);

      const savedUpdates = loadAppUpdates();
      setAppUpdates(savedUpdates);

      const savedTemplates = JSON.parse(localStorage.getItem('templates:all') || '[]');
      const mergedTemplates = [...mockDocumentTemplates, ...savedTemplates.filter(t => t._local)];
      setTemplates(mergedTemplates);

      const savedUsers = loadUsers();
      const mergedUsers = new Map([...Object.values(mockUsers)].map(u => [u.email, u]));
      savedUsers.forEach(u => mergedUsers.set(u.email, u));
      setUsers(Array.from(mergedUsers.values()));
    }
  }, []);

  const handleSubmitApplication = (appData) => {
    if (typeof window === 'undefined') return;
    
    const newApp = {
      ...appData,
      id: `APP-${Date.now()}`,
      status: 'review',
      createdAt: new Date().toISOString(),
      _local: true,
      applicantEmail: user?.email,
    };
    
    const existingApps = JSON.parse(localStorage.getItem('applications:all') || '[]');
    const updated = [newApp, ...existingApps];
    localStorage.setItem('applications:all', JSON.stringify(updated));
    setApps(prev => [newApp, ...prev]);
    closeModal();
  };

  const handleSaveEvaluation = (applicationId, evalData) => {
    if (typeof window === 'undefined') return;
    
    const existing = loadEvaluations();
    const key = `${applicationId}:${user.email}`;
    const index = existing.findIndex(e => e.applicationId === applicationId && e.reviewerEmail === user.email);
    
    const newEval = {
      applicationId,
      reviewerEmail: user.email,
      reviewerName: user.name,
      ...evalData,
      updatedAt: new Date().toISOString(),
    };
    
    if (index >= 0) {
      existing[index] = newEval;
    } else {
      existing.push(newEval);
    }
    
    saveEvaluations(existing);
    setEvaluations([...existing]);
    
    if (evalData.status === 'submitted' && evalData.decision) {
      const appIdx = apps.findIndex(a => a.id === applicationId);
      if (appIdx >= 0) {
        const updated = [...apps];
        updated[appIdx] = { ...updated[appIdx], status: evalData.decision };
        setApps(updated);
        
        const allApps = JSON.parse(localStorage.getItem('applications:all') || '[]');
        const appIdx2 = allApps.findIndex(a => a.id === applicationId);
        if (appIdx2 >= 0) {
          allApps[appIdx2] = { ...allApps[appIdx2], status: evalData.decision };
          localStorage.setItem('applications:all', JSON.stringify(allApps));
        }
      }
    }
    
    closeModal();
    setDetailView(null);
  };

  const handleDeleteTemplate = (templateId) => {
    if (typeof window === 'undefined') return;
    
    const existing = JSON.parse(localStorage.getItem('templates:all') || '[]');
    const filtered = existing.filter(t => t.id !== templateId);
    localStorage.setItem('templates:all', JSON.stringify(filtered));
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const handleCreateOrUpdateTemplate = (templateData) => {
    if (typeof window === 'undefined') return;
    
    const existing = JSON.parse(localStorage.getItem('templates:all') || '[]');
    
    if (templateData.id) {
      const idx = existing.findIndex(t => t.id === templateData.id);
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], ...templateData, updatedAt: new Date().toISOString() };
      }
    } else {
      const newTemplate = {
        ...templateData,
        id: `TPL-${Date.now()}`,
        createdAt: new Date().toISOString(),
        _local: true,
      };
      existing.push(newTemplate);
    }
    
    localStorage.setItem('templates:all', JSON.stringify(existing));
    const mergedTemplates = [...mockDocumentTemplates, ...existing.filter(t => t._local)];
    setTemplates(mergedTemplates);
    closeModal();
  };

  const handleDeleteUser = (userId) => {
    if (typeof window === 'undefined') return;
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    const existing = loadUsers();
    const filtered = existing.filter(u => u.id !== userId);
    saveUsers(filtered);
    
    const merged = new Map([...Object.values(mockUsers)].map(u => [u.email, u]));
    filtered.forEach(u => merged.set(u.email, u));
    setUsers(Array.from(merged.values()));
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
          evaluation: ev || null,
        };
      })
      .filter(Boolean);
  }, [assignments, apps, evaluations, user]);

  const renderContent = () => {
    const commonProps = { setActiveView, setDetailView, user, openModal, closeModal, t, language };
    
    if (detailView?.type === 'grant') {
      return <GrantFinancialsView grantId={detailView.id} {...commonProps} />;
    }
    if (detailView?.type === 'dataRoom') {
      return <DataRoomView grantId={detailView.id} {...commonProps} />;
    }
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
    if (detailView?.type === 'applicationDetails') {
      return <ApplicationDetailsView application={detailView.application} {...commonProps} />;
    }

    const role = user?.role;
    switch (role) {
      case 'applicant':
        switch (activeView) {
          case 'dashboard':
            return <ApplicantDashboard {...commonProps} />;
          case 'applications':
            return <MyApplicationsView apps={apps} {...commonProps} />;
          case 'chat':
            return <ChatView {...commonProps} />;
          case 'settings':
            return <SettingsView user={user} {...commonProps} />;
          default:
            return <ApplicantDashboard {...commonProps} />;
        }
      
      case 'reviewer':
        switch (activeView) {
          case 'assignments':
            return <ReviewerAssignmentsView items={reviewerAssignments} {...commonProps} />;
          default:
            return <ReviewerDashboard items={reviewerAssignments} {...commonProps} />;
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
        switch (activeView) {
          case 'dashboard':
            return <AdminDashboard apps={apps} users={users} {...commonProps} />;
          case 'manage-applications':
            return <ApplicationManagementView apps={apps} {...commonProps} />;
          case 'manage-users':
            return <UserManagementView users={users} openModal={openModal} t={t} {...commonProps} />;
          case 'reports':
            return <ReportsAndStatsView {...commonProps} />;
          case 'integrations':
            return <IntegrationsView {...commonProps} />;
          case 'settings':
            return <SettingsView user={user} {...commonProps} />;
          default:
            return <AdminDashboard apps={apps} users={users} {...commonProps} />;
        }
      
      default:
        return null;
    }
  };

  const renderModal = () => {
    const modalProps = { closeModal, t, language };
    
    switch (activeModal) {
      case 'newApplication':
        return (
          <NewApplicationForm
            {...modalProps}
            onSubmit={handleSubmitApplication}
          />
        );
      case 'aiAssistant':
        return <AiAssistantModal {...modalProps} />;
      case 'supportCenter':
        return <SupportCenterModal {...modalProps} />;
      case 'milestoneDetails':
        return <MilestoneDetailsModal {...modalProps} milestone={modalData} />;
      case 'assignReviewer':
        return (
          <AssignReviewerModal
            {...modalProps}
            application={modalData}
            onAssign={(appId, reviewerId) => {
              if (typeof window === 'undefined') return;
              const existing = JSON.parse(localStorage.getItem('assignments:all') || '[]');
              const newAssignment = {
                applicationId: appId,
                reviewerId,
                reviewerEmail: users.find(u => u.id === reviewerId)?.email,
                assignedAt: new Date().toISOString(),
              };
              const updated = [newAssignment, ...existing];
              localStorage.setItem('assignments:all', JSON.stringify(updated));
              setAssignments(updated);
              closeModal();
            }}
          />
        );
      case 'addUser':
        return (
          <AddUserModal
            {...modalProps}
            onCreate={handleRegister}
          />
        );
      case 'aiReportGenerator':
        return <AiReportGeneratorModal {...modalProps} />;
      case 'sendAnnouncement':
        return <SendAnnouncementModal {...modalProps} />;
      case 'sendMessage':
        return <SendMessageModal {...modalProps} />;
      case 'templateForm':
        return (
          <TemplateFormModal
            {...modalProps}
            template={modalData}
            onSave={handleCreateOrUpdateTemplate}
          />
        );
      default:
        return null;
    }
  };

  const isRTL = language === 'ar';

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {!user ? (
        <LoginPage
          onLogin={handleLogin}
          onRegister={handleRegister}
          t={t}
          language={language}
          setLanguage={setLanguage}
        />
      ) : (
        <>
          <Sidebar
            user={user}
            isOpen={isSidebarOpen}
            setIsOpen={setSidebarOpen}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            activeView={activeView}
            setActiveView={setActiveView}
            setDetailView={setDetailView}
            openModal={openModal}
            t={t}
            language={language}
          />

          <div
            className={`transition-all duration-300 ${
              isSidebarOpen
                ? (isRTL
                    ? (collapsed ? 'lg:mr-16' : 'lg:mr-64')
                    : (collapsed ? 'lg:ml-16' : 'lg:ml-64'))
                : (isRTL ? 'lg:mr-0' : 'lg:ml-0')
            }`}
          >
            <Header
              user={user}
              onLogout={handleLogout}
              onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
              t={t}
              language={language}
              setLanguage={setLanguage}
              setActiveView={setActiveView}
              notifications={notifications[user.role] || []}
            />
            
            <main className="p-4 sm:p-6 lg:p-8">
              {renderContent()}
            </main>
          </div>

          {activeModal && renderModal()}
        </>
      )}
    </div>
  );
}

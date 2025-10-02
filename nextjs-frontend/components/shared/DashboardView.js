
import React, { useState } from 'react';
import {  Mail, CheckCircle, Clock, FileText, Inbox, Edit, Users, Paperclip, Trash2, ArrowRight, UserPlus, DollarSign, Download, Eye, ArrowLeft, Annoyed, ThumbsUp, ThumbsDown, Megaphone, ShieldCheck } from 'lucide-react';
import {mockApplications,mockUsers,mockDataRoomFiles,evaluationTemplate,mockReviewAssignments} from '@/lib/utils/mockData';
import {theme} from '@/lib/utils/theme';
import {getStatusChip} from '@/lib/utils/getStatusChip';
import {StatCard} from './uiComponents';
import {callGemini} from './callGemini';
export const ReviewerDashboard = ({ t, user, items = [] }) => {
    const submitted = items.filter(x => x.evaluation?.status === 'submitted');
    const pending   = items.filter(x => !x.evaluation || x.evaluation.status !== 'submitted');
    const approved  = submitted.filter(x => x.evaluation?.decision === 'approve');
    const rejected  = submitted.filter(x => x.evaluation?.decision === 'reject');
    const revisions = submitted.filter(x => x.evaluation?.decision === 'revision');
  
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{t('welcome')}, {user?.name || 'Reviewer'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Requests to Review" value={pending.length} icon={<Inbox />} color="blue" />
          <StatCard title="Completed Reviews" value={submitted.length} icon={<CheckCircle />} color="green" />
          <StatCard title="Avg. Review Time" value="3.5 Days" icon={<Clock />} color="yellow" />
        </div>
  
        {/* Optional extra line */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Approved" value={approved.length} color="green" />
          <StatCard title="Rejected" value={rejected.length} color="red" />
          <StatCard title="Revisions Requested" value={revisions.length} color="yellow" />
        </div>
      </div>
    );
  };
  
  export const ReviewerAssignmentsView = ({ items = [], setDetailView, t }) => {
    const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '');
  
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold mb-6">{'All Assigned Applications'}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3">{t('appNumber')}</th>
                <th className="px-4 py-3">{t('projectTitle')}</th>
                <th className="px-4 py-3">{t('dateAssigned') || 'Date Assigned'}</th>
                <th className="px-4 py-3">{t('status') || 'Status'}</th> {/* NEW */}
                <th className="px-4 py-3">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono">{row.application.id}</td>
                  <td className="px-4 py-3 font-semibold">{row.application.title}</td>
                  <td className="px-4 py-3">{fmt(row.date)}</td>
  
                  {/* NEW STATUS CELL */}
                  <td className="px-4 py-3">
                    {row.evaluation?.status === 'submitted' ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        Submitted
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                        Draft
                      </span>
                    )}
                  </td>
  
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        setDetailView({ type: 'evaluation', application: row.application })
                      }
                      className="text-sm bg-blue-600 text-white font-semibold rounded-lg px-3 py-1 hover:bg-blue-700"
                    >
                      {t('startReview') || 'Start Review'}
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                    {t('noItems') || 'No assignments yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  
  export const ReviewerEvaluationView = ({
    application,
    user,                 // NEW: to get reviewerEmail
    setDetailView,
    t,
    language,
    onSaveEvaluation,     // NEW: handler from parent
  }) => {
    const [scores, setScores] = useState({});
    const [recommendation, setRecommendation] = useState('');
    const [decision, setDecision] = useState(null);
    const [activeTab, setActiveTab] = useState('evaluation');
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
  
    const files = mockDataRoomFiles[application.id] || [];
  
    const handleScoreChange = (criterionId, subCriterionId, score) =>
      setScores(prev => ({ ...prev, [`${criterionId}-${subCriterionId}`]: score }));
  
    const calculateTotal = () => {
      let total = 0;
      if (Object.keys(scores).length === 0) return '0.00';
      evaluationTemplate.forEach(c => {
        let criterionScore = 0;
        c.subCriteria.forEach(sc => {
          criterionScore += scores[`${c.id}-${sc.id}`] || 0;
        });
        total += (criterionScore / (c.subCriteria.length * 10)) * c.weight;
      });
      return total.toFixed(2);
    };
  
    const handleGenerateAnalysis = async () => {
      setIsGenerating(true);
      const criteriaText = evaluationTemplate
        .map(c => `${c.title}: ${c.subCriteria.map(sc => sc.text).join(', ')}`)
        .join('; ');
      const prompt = `As an expert grant reviewer, analyze the following project based on the provided criteria. Project Title: "${application.title}". Project Summary: "${application.summary}". Evaluation Criteria: "${criteriaText}". Provide a concise analysis highlighting potential strengths, weaknesses, and areas needing clarification. Structure your response with clear headings for Strengths, Weaknesses, and Clarifications.`;
      const result = await callGemini(prompt);
      setAiAnalysis(result);
      setIsGenerating(false);
    };
  
    const buildPayload = () => ({
      scores,
      total: Number(calculateTotal()),
      recommendation,
      decision,        // 'approve' | 'revision' | 'reject' | null
      aiAnalysis,
    });
  
    const saveDraft = () => {
      onSaveEvaluation?.({
        applicationId: application.id,
        reviewerEmail: user?.email,
        payload: buildPayload(),
        submit: false,
      });
    };
  
    const submitEvaluation = () => {
      onSaveEvaluation?.({
        applicationId: application.id,
        reviewerEmail: user?.email,
        payload: buildPayload(),
        submit: true,
      });
      setDetailView(null); // go back after submit
    };
  
    return (
      <div className="space-y-6">
        <button
          onClick={() => setDetailView(null)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          {language === 'ar' ? <ArrowRight size={16}/> : <ArrowLeft size={16}/>} {t('back')}
        </button>
  
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-3xl font-bold mb-1">
            {t('evaluationFor')} "{application.title}"
          </h2>
          <p className="text-gray-500">Grant ID: {application.id}</p>
        </div>
  
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('evaluation')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'evaluation'
                  ? 'border-green-800 text-green-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('evaluationFor')}
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-green-800 text-green-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('applicationDocuments')}
            </button>
          </nav>
        </div>
  
        {activeTab === 'evaluation' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-2">{t('aiAnalysis')}</h3>
              {aiAnalysis ? (
                <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                  {aiAnalysis}
                </div>
              ) : (
                <button
                  onClick={handleGenerateAnalysis}
                  disabled={isGenerating}
                  className="w-full flex justify-center items-center gap-2 py-2 px-4 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-all"
                >
                  {isGenerating ? t('generating') : t('generateAnalysis')}
                </button>
              )}
            </div>
  
            <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
              {evaluationTemplate.map(criterion => (
                <div key={criterion.id} className="border-b pb-4 last:border-b-0">
                  <h3 className="text-xl font-bold">
                    {criterion.title}{' '}
                    <span className="text-sm font-normal text-gray-500">
                      ({criterion.weight}% of total)
                    </span>
                  </h3>
  
                  {criterion.subCriteria.map(sub => (
                    <div key={sub.id} className="mt-4 ms-4">
                      <label className="block text-gray-700">{sub.text}</label>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm">0</span>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          defaultValue="0"
                          onChange={(e) =>
                            handleScoreChange(criterion.id, sub.id, parseInt(e.target.value, 10))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-800"
                        />
                        <span className="text-sm">10</span>
                        <span className="font-bold w-8 text-center">
                          {scores[`${criterion.id}-${sub.id}`] || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
  
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-4">{t('evaluationSummary')}</h3>
              <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
                <span className="font-bold text-lg">{t('totalScore')}</span>
                <span className="font-bold text-2xl text-green-800">{calculateTotal()}%</span>
              </div>
  
              <div className="mt-6">
                <label className="block font-bold text-lg mb-2">{t('recommendations')}</label>
                <textarea
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  rows="5"
                  placeholder="Provide detailed feedback and justification for your scores..."
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-800 focus:outline-none"
                />
              </div>
  
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-4">{t('evaluationDecision')}</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setDecision('approve')}
                    className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 ${
                      decision === 'approve' ? 'bg-green-600 text-white' : 'bg-green-100'
                    }`}
                  >
                    <ThumbsUp /> {t('approve')}
                  </button>
                  <button
                    onClick={() => setDecision('revision')}
                    className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 ${
                      decision === 'revision' ? 'bg-yellow-500 text-white' : 'bg-yellow-100'
                    }`}
                  >
                    <Annoyed /> {t('requestRevision')}
                  </button>
                  <button
                    onClick={() => setDecision('reject')}
                    className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 ${
                      decision === 'reject' ? 'bg-red-600 text-white' : 'bg-red-100'
                    }`}
                  >
                    <ThumbsDown /> {t('reject')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {activeTab === 'documents' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map(file => (
                <div key={file.id} className="border rounded-lg p-4 flex items-center justify-between hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <Paperclip className="text-gray-500" />
                    <div className="text-sm">
                      <p className="font-bold">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {file.type} - {file.uploaded}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
  
        <div className="flex justify-end gap-4">
          <button
            onClick={saveDraft}
            className="py-2 px-6 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300"
          >
            {t('saveDraft')}
          </button>
          <button
            onClick={submitEvaluation}
            className="py-2 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            {t('submitEvaluation')}
          </button>
        </div>
      </div>
    );
  };
  export const AdminDashboard = ({ openModal, t, apps = [], users = [] }) => {
    const totalApps = apps.length;
    const approvedApps = apps.filter(a => a.status === 'approved').length;
  
    // Sum funding if your app objects have totalFunding; fallback to 0
    const totalFunding = apps.reduce(
      (sum, a) => sum + (Number(a.totalFunding) || 0),
      0
    );
  
    const activeUsers = users.length; // unified list: mocks + registered (passed from parent)
  
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <button
            onClick={() => openModal('sendAnnouncement')}
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Megaphone size={18}/> {t('sendAnnouncement')}
          </button>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title={t('totalApplications')} value={totalApps} icon={<FileText />} color="blue" />
          <StatCard title={t('approvedGrants')} value={approvedApps} icon={<CheckCircle />} color="green" />
          <StatCard title={t('totalFunding')} value={`SAR ${totalFunding.toLocaleString()}`} icon={<DollarSign />} color="purple" />
          <StatCard title={t('activeUsers')} value={activeUsers} icon={<Users />} color="yellow" />
        </div>
      </div>
    );
  };
export const ApplicationManagementView = ({ apps = [], setDetailView, openModal, t }) => {
    const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '');
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold mb-6">{t('manageApplications')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3">{t('appNumber')}</th>
                <th className="px-4 py-3">{t('projectTitle')}</th>
                <th className="px-4 py-3">{t('applicant')}</th>
                <th className="px-4 py-3">{t('submissionDate')}</th>
                <th className="px-4 py-3">{t('status')}</th>
                <th className="px-4 py-3">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(app => (
                <tr key={app.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono">{app.id}</td>
                  <td className="px-4 py-3 font-semibold">{app.title}</td>
                  <td className="px-4 py-3">{app.applicant}</td>
                  <td className="px-4 py-3">{fmt(app.submissionDate || app.createdAt)}</td>
                  <td className="px-4 py-3">{getStatusChip(app.status, t)}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => openModal('assignReviewer', app)}
                      title="Assign Reviewer"
                      className="text-xs bg-gray-100 rounded-md p-2 hover:bg-gray-200"
                    >
                      <UserPlus size={14}/>
                    </button>
                    <button
                      onClick={() => setDetailView({ type: 'applicationDetails', application: app })}
                      title={t('viewDetails')}
                      className="text-xs bg-gray-100 rounded-md p-2 hover:bg-gray-200"
                    >
                      <Eye size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
              {apps.length === 0 && (
                <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={6}>{t('noItems') || 'No applications yet.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };export const UserManagementView = ({ users = [], openModal, t }) => {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t('manageUsers')}</h2>
          <button
            onClick={() => openModal('addUser')}
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <UserPlus size={18}/> {t('addUser') || 'Add User'}
          </button>
        </div>
  
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">{t('email')}</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.email} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{t(u.role)}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openModal('sendMessage', u)} className="text-xs bg-gray-100 rounded-md p-2 hover:bg-gray-200" title="Send Message">
                      <Mail size={14}/>
                    </button>
                    <button className="text-xs bg-gray-100 rounded-md p-2 hover:bg-gray-200" title="Edit User">
                      <Edit size={14}/>
                    </button>
                    <button className="text-xs bg-gray-100 rounded-md p-2 hover:bg-gray-200" title="Delete User">
                      <Trash2 size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={4}>{t('noItems') || 'No users found.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  export const SettingsView = ({ user, t }) => {
    const [activeTab, setActiveTab] = useState('profile');
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold">{t('settings')}</h2>
            <div className="border-b border-gray-200"><nav className="-mb-px flex space-x-8"><button onClick={() => setActiveTab('profile')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? `border-${theme.primary} text-${theme.primary}` : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t('profile')}</button><button onClick={() => setActiveTab('security')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'security' ? `border-${theme.primary} text-${theme.primary}` : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t('security')}</button><button onClick={() => setActiveTab('notifications')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'notifications' ? `border-${theme.primary} text-${theme.primary}` : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t('notificationPreferences')}</button></nav></div>
            
            {activeTab === 'profile' && <div className="bg-white p-8 rounded-2xl shadow-sm">
                <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="font-medium">Full Name</label><input type="text" defaultValue={user.name} className="w-full mt-2 p-3 border rounded-lg"/></div>
                        <div><label className="font-medium">{t('email')}</label><input type="email" defaultValue={user.email} className="w-full mt-2 p-3 border rounded-lg bg-gray-100" readOnly/></div>
                        {user.nationalId && <>
                          <div><label className="font-medium">{t('nationalId')}</label><input type="text" defaultValue={user.nationalId} className="w-full mt-2 p-3 border rounded-lg bg-gray-100" readOnly/></div>
                          <div><label className="font-medium">{t('dateOfBirth')}</label><input type="text" defaultValue={user.dob} className="w-full mt-2 p-3 border rounded-lg bg-gray-100" readOnly/></div>
                        </>}
                    </div>
                    {user.verified && <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg"><ShieldCheck size={20}/><span>{t('verifiedByNafath')}</span></div>}
                    <div className="pt-4 flex justify-end"><button type="submit" className={`py-2 px-6 bg-${theme.primary} text-white rounded-lg`}>{t('saveChanges')}</button></div>
                </form>
            </div>}
            {activeTab === 'security' && <div className="bg-white p-8 rounded-2xl shadow-sm"><form className="space-y-4"><div><label className="font-medium">New {t('password')}</label><input type="password" className="w-full mt-2 p-3 border rounded-lg"/></div><div className="pt-4 flex justify-end"><button type="submit" className={`py-2 px-6 bg-${theme.primary} text-white rounded-lg`}>Change Password</button></div></form></div>}
            {activeTab === 'notifications' && <div className="bg-white p-8 rounded-2xl shadow-sm"><p>Notification preferences settings...</p></div>}
        </div>
    );
};
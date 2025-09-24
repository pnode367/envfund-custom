import React, { useState } from 'react';
import { Edit, Send, Upload, Paperclip, PlusCircle, Trash2, ArrowRight, FileCheck2, Download, Eye, ArrowLeft } from 'lucide-react';
import {mockUsers,mockIntegrations,mockDataRoomFiles,sendGlobalAnnouncement } from '../utils/mockData';
import {theme} from '../utils/theme';
import {StatCard,Modal} from './uiComponents';
import {callGemini} from './callGemini';
export const IntegrationsView = ({ t }) => { return ( <div className="space-y-6"> <h2 className="text-2xl font-bold">{t('integrations')}</h2> <div className="bg-white p-6 rounded-2xl shadow-sm"> <div className="space-y-4">{mockIntegrations.map(int => ( <div key={int.id} className="border rounded-lg p-4 flex items-center justify-between"><div className="flex items-center gap-4">{int.icon}<div><p className="font-bold text-lg">{int.name}</p><p className="text-sm text-gray-500">{int.description}</p></div></div><div className="flex items-center gap-4"><span className={`text-xs font-bold px-2 py-1 rounded-full ${int.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>{int.status === 'active' ? 'Active' : 'Inactive'}</span><label className="inline-flex items-center cursor-pointer"><input type="checkbox" defaultChecked={int.status === 'active'} className="sr-only peer"/><div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div></label></div></div> ))}</div> </div> </div> ); };
export const EditorDashboard = ({ t, templates = [] }) => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{t('welcome')}, {mockUsers['editor@ksu.edu.sa'].name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Document Templates" value={templates.length} icon={<FileCheck2 />} color="blue" />
          <StatCard title="Reviews Required" value="3" icon={<Edit />} color="yellow" />
          <StatCard title="Outgoing Mail" value="25" icon={<Send />} color="green" />
        </div>
      </div>
    );
  };
  export const DocumentTemplatesView = ({ t, templates = [], onCreate, onEdit, onDelete }) => {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t('manageTemplates') || 'Manage Document Templates'}</h2>
          <button
            onClick={onCreate}
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <PlusCircle size={18}/> {t('createNewTemplate') || 'Create New Template'}
          </button>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(tpl => (
            <div key={tpl.id} className="border rounded-lg p-4 hover:shadow-md space-y-2 flex flex-col justify-between">
              <div>
                <p className="font-bold text-lg">{tpl.name}</p>
                <p className="text-sm text-gray-600">{tpl.description}</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => onEdit?.(tpl)}
                  className="text-xs bg-gray-100 rounded-md p-2 hover:bg-gray-200"
                  title={t('edit') || 'Edit'}
                >
                  <Edit size={14}/>
                </button>
                <button
                  onClick={() => onDelete?.(tpl.id)}
                  className="text-xs bg-gray-100 rounded-md p-2 hover:bg-gray-200"
                  title={t('delete') || 'Delete'}
                >
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          ))}
  
          {templates.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-10">
              {t('noItems') || 'No templates yet.'}
            </div>
          )}
        </div>
      </div>
    );
  };
  export const AssignReviewerModal = ({ application, onAssign, onClose, t }) => {
    const [reviewerEmail, setReviewerEmail] = useState(
      Object.values(mockUsers).find(u => u.role === 'reviewer')?.email || ''
    );
  
    const handleAssign = () => {
      if (!reviewerEmail) return;
      onAssign?.({
        applicationId: application.id,
        reviewerEmail,
        assignedBy: 'admin@ksu.edu.sa', // or currentUser.email if you track admins
      });
      onClose();
    };
  
    return (
      <Modal onClose={onClose} title={`${t('assignReviewer')} – ${application.id}`}>
        <div>
          <p className="mb-4">
            {t('selectReviewerFor')} <strong>{application.title}</strong>
          </p>
  
          <select
            className="w-full mt-2 p-3 border rounded-lg bg-white"
            value={reviewerEmail}
            onChange={(e) => setReviewerEmail(e.target.value)}
          >
            {Object.values(mockUsers)
              .filter((u) => u.role === 'reviewer')
              .map((r) => (
                <option key={r.email} value={r.email}>
                  {r.name} ({r.email})
                </option>
              ))}
          </select>
  
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-6 bg-gray-200 rounded-lg"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={handleAssign}
              className="py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('assign')}
            </button>
          </div>
        </div>
      </Modal>
    );
  };export const AddUserModal = ({ onClose, onAdd, t }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('applicant');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('password123'); // demo default
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!name.trim() || !email.trim()) {
        alert('Please fill name and email.');
        return;
      }
      onAdd?.({ name, email, role, phone, password });
    };
  
    return (
      <Modal onClose={onClose} title={t('addUser') || 'Add New User'}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="font-medium">{t('fullName') || 'Full Name'}</label>
            <input type="text" className="w-full mt-2 p-3 border rounded-lg"
                   value={name} onChange={(e) => setName(e.target.value)} required/>
          </div>
          <div>
            <label className="font-medium">{t('email')}</label>
            <input type="email" className="w-full mt-2 p-3 border rounded-lg"
                   value={email} onChange={(e) => setEmail(e.target.value)} required/>
          </div>
          <div>
            <label className="font-medium">Role</label>
            <select className="w-full mt-2 p-3 border rounded-lg bg-white"
                    value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="applicant">{t('applicant')}</option>
              <option value="reviewer">{t('reviewer')}</option>
              <option value="editor">{t('editor')}</option>
              <option value="admin">{t('admin')}</option>
            </select>
          </div>
          <div>
            <label className="font-medium">{t('phone') || 'Phone (optional)'}</label>
            <input type="tel" className="w-full mt-2 p-3 border rounded-lg"
                   value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="font-medium">{t('password')}</label>
            <input type="password" className="w-full mt-2 p-3 border rounded-lg"
                   value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
  
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-6 bg-gray-200 rounded-lg">
              {t('cancel')}
            </button>
            <button type="submit" className={`py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700`}>
              {t('add') || 'Add User'}
            </button>
          </div>
        </form>
      </Modal>
    );
  };
  export const AiReportGeneratorModal = ({ data, onClose, t }) => {
    const [report, setReport] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        const prompt = `Summarize the following grant application data for a management report. Applications over time data: ${JSON.stringify(data.appsData)}. Funding distribution by status data: ${JSON.stringify(data.fundingData)}. Highlight key trends, significant changes, and provide a brief analysis of the current situation.`;
        const result = await callGemini(prompt);
        setReport(result);
        setIsGenerating(false);
    };

    return (
        <Modal onClose={onClose} title={t('aiReportSummary')}>
            <div className="space-y-4">
                <button onClick={handleGenerate} disabled={isGenerating} className="w-full flex justify-center items-center gap-2 py-2 px-4 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-all">
                    {isGenerating ? t('generating') : t('generateSummary')}
                </button>
                <div className="p-4 bg-gray-50 rounded-lg min-h-[200px] whitespace-pre-wrap">
                    {report || <p className="text-gray-400">{t('reportSummaryPlaceholder')}</p>}
                </div>
            </div>
        </Modal>
    );
};
export const DataRoomView = ({ grantId, setDetailView, language, t }) => { const files = mockDataRoomFiles[grantId] || []; return (<div className="space-y-6"><button onClick={() => setDetailView(null)} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">{language === 'ar' ? <ArrowRight size={16}/> : <ArrowLeft size={16}/>} {t('back')}</button><div className="bg-white p-6 rounded-2xl shadow-sm"><div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">{t('dataRoom')}: {grantId}</h2><button className={`bg-${theme.primary} text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2`}><Upload size={18}/> Upload New File</button></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{files.map(file => (<div key={file.id} className="border rounded-lg p-4 flex items-center justify-between hover:shadow-md"><div className="flex items-center gap-3"><Paperclip className="text-gray-500"/><div className="text-sm"><p className="font-bold">{file.name}</p><p className="text-xs text-gray-500">{file.type} - {file.uploaded}</p></div></div><div className="flex gap-2"><button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"><Eye size={18}/></button><button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"><Download size={18}/></button></div></div>))}</div></div></div>); };
export const SendAnnouncementModal = ({ onClose, t, updateNotifications }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); sendGlobalAnnouncement(title, message); updateNotifications(); onClose(); };
    return (
        <Modal onClose={onClose} title={t('sendAnnouncement')}>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div><label className="font-medium">{t('announcementTitle')}</label><input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full mt-2 p-3 border rounded-lg"/></div>
                <div><label className="font-medium">{t('announcementMessage')}</label><textarea rows="4" value={message} onChange={e=>setMessage(e.target.value)} className="w-full mt-2 p-3 border rounded-lg"></textarea></div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="py-2 px-6 bg-gray-200 rounded-lg">{t('cancel')}</button>
                    <button type="submit" className={`py-2 px-6 bg-blue-600 text-white rounded-lg flex items-center gap-2`}><Send size={16}/> {t('sendToAllUsers')}</button>
                </div>
            </form>
        </Modal>
    );
};
export const SendMessageModal = ({ user, onClose, t }) => {
    return (
        <Modal onClose={onClose} title={`${t('sendMessage')} to ${user.name}`}>
            <form className="space-y-4">
                <div><label className="font-medium">{t('messageType')}</label><select className="w-full mt-2 p-3 border rounded-lg bg-white"><option value="email">{t('email')}</option><option value="sms">{t('sms')}</option></select></div>
                <div><label className="font-medium">Subject</label><input type="text" className="w-full mt-2 p-3 border rounded-lg"/></div>
                <div><label className="font-medium">Message</label><textarea rows="5" className="w-full mt-2 p-3 border rounded-lg"></textarea></div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="py-2 px-6 bg-gray-200 rounded-lg">{t('cancel')}</button>
                    <button type="submit" className={`py-2 px-6 bg-blue-600 text-white rounded-lg flex items-center gap-2`}><Send size={16}/> {t('submit')}</button>
                </div>
            </form>
        </Modal>
    );
}
 export const TemplateFormModal = ({ data, onSave, onClose, t }) => {
    const [name, setName] = useState(data?.name || '');
    const [description, setDescription] = useState(data?.description || '');
    const [content, setContent] = useState(data?.content || '');
    const handleSubmit = (e) => {
      e.preventDefault();
      onSave?.({
        id: data?.id || `TPL-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        content,
        _local: true,
        updatedAt: new Date().toISOString(),
      });
    };
    return (
      <Modal onClose={onClose} title={data ? t('editTemplate') || 'Edit Template' : t('createNewTemplate') || 'Create New Template'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="font-medium">{t('name') || 'Name'}</label>
            <input className="w-full mt-2 p-3 border rounded-lg" value={name} onChange={e=>setName(e.target.value)} required />
          </div>
          <div><label className="font-medium">{t('description') || 'Description'}</label>
            <input className="w-full mt-2 p-3 border rounded-lg" value={description} onChange={e=>setDescription(e.target.value)} />
          </div>
          <div><label className="font-medium">{t('templateBody') || 'Template Body'}</label>
            <textarea rows={8} className="w-full mt-2 p-3 border rounded-lg" value={content} onChange={e=>setContent(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="py-2 px-6 bg-gray-200 rounded-lg">{t('cancel')}</button>
            <button type="submit" className="py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {data ? t('saveChanges') || 'Save Changes' : t('create') || 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    );
  };
  
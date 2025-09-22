import React, { useState, useMemo } from 'react';
import { BarChart2, FileText, Send, Users, MessageSquare, PieChart, Upload, Paperclip, PlusCircle, Trash2, ArrowRight, UserPlus, DollarSign, Flag, Filter, BrainCircuit, Bot, Download, ArrowLeft } from 'lucide-react';
import {mockApplications,mockGrantDetails,mockUsers,mockChatHistory} from '../utils/mockData';
import {theme} from '../utils/theme';
import {getStatusChip} from '../helper/getStatusChip';
import {StatCard,SimpleBarChart,SimplePieChart,Modal} from './uiComponents';
import {callGemini} from './callGemini';
export const GrantFinancialsView = ({ grantId, setDetailView, openModal, t, language }) => { const grant = mockGrantDetails[grantId]; const application =
     mockApplications.find(app => app.id === grantId); const financialSummary = useMemo(() => { if (!grant) return { totalSpent: 0, remainingBudget: 0, spentPercentage: 0 }; 
     const totalSpent = grant.expenses.reduce((sum, item) => sum + item.amount, 0); const remainingBudget = grant.totalFunding - totalSpent; const spentPercentage = grant.totalFunding > 0 ? (totalSpent / grant.totalFunding) * 100 : 0; 
     return { totalSpent, remainingBudget, spentPercentage }; }, [grant]); if (!grant || !application) return <div>Grant not found</div>; const { totalSpent, remainingBudget, spentPercentage } = financialSummary; const getMilestoneStatusChip = (status) =>
         { const statuses = { completed: { text: 'Completed', color: 'bg-green-100 text-green-700' }, active: { text: 'Active', color: 'bg-blue-100 text-blue-700' }, pending: { text: 'Pending', color: 'bg-gray-100 text-gray-700' } }; const s = statuses[status];
      return <span className={`px-3 py-1 text-xs font-bold rounded-full ${s.color}`}>{s.text}</span>; }; return ( <div className="space-y-6"> <button onClick={() => setDetailView(null)} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
      {language === 'ar' ? <ArrowRight size={16}/> : <ArrowLeft size={16}/>} {t('back')}</button> <div className="bg-white p-6 rounded-2xl shadow-sm"><h2 className="text-3xl font-bold mb-1">{application.title}</h2><p className="text-gray-500">Financial & Milestones Overview | Grant ID: {grantId}</p></div> 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> <StatCard title="Total Grant" value={`SAR ${(grant.totalFunding || 0).toLocaleString()}`} icon={<DollarSign />} color="green" /> <StatCard title="Total Expenses" value={`SAR ${totalSpent.toLocaleString()}`} icon={<BarChart2 />} color="red" /> <StatCard title="Remaining Budget" value={`SAR ${remainingBudget.toLocaleString()}`} icon={<PieChart />} color="blue" /> </div> <div className="bg-white p-6 rounded-2xl shadow-sm"><h3 className="font-bold mb-2">Budget Spending</h3><div className="w-full bg-gray-200 rounded-full h-4"><div className={`bg-${theme.primary} h-4 rounded-full`} style={{ width: `${spentPercentage}%` }}></div></div><p className="text-center text-sm mt-2">{spentPercentage.toFixed(1)}% Spent</p></div> <div className="bg-white p-6 rounded-2xl shadow-sm"><h3 className="text-xl font-bold mb-4">Grant Milestones</h3><div className="space-y-4">{grant.milestones?.map(m => (<div key={m.id} className="border rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50"><div className="flex items-center gap-4"><div className={`p-3 rounded-full ${m.status === 'completed' ? 'bg-green-100 text-green-600' : m.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}><Flag size={20}/></div><div><p className="font-bold">{m.title}</p><p className="text-sm text-gray-500">Due: {m.deadline} | Amount: SAR {m.funds.toLocaleString()}</p></div></div><div className="flex items-center gap-4 self-end sm:self-center">{getMilestoneStatusChip(m.status)}<button onClick={() => openModal('milestoneDetails', m)} className="text-sm bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100">{t('details')}</button></div></div>))}</div></div> <div className="bg-white p-6 rounded-2xl shadow-sm"><h3 className="text-xl font-bold mb-4">Budget vs. Actuals</h3><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-100"><tr><th className="px-4 py-2">Category</th><th className="px-4 py-2">Allocated</th><th className="px-4 py-2">Spent</th><th className="px-4 py-2">Variance</th></tr></thead><tbody>{grant.budget?.map(item => { const spentOnCategory = grant.expenses.filter(e => e.category === item.category).reduce((s, e) => s + e.amount, 0); const variance = item.allocated - spentOnCategory; return (<tr key={item.category} className="border-b"><td className="px-4 py-2 font-medium">{item.category}</td><td className="px-4 py-2">SAR {item.allocated.toLocaleString()}</td><td className="px-4 py-2">SAR {spentOnCategory.toLocaleString()}</td><td className={`px-4 py-2 font-semibold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>SAR {variance.toLocaleString()}</td></tr>); })}</tbody></table></div></div> </div> ); };
export const ApplicantDashboard = ({ setDetailView, openModal, t }) => {
    const appsByStatus = mockApplications.reduce((acc, app) => { acc[app.status] = (acc[app.status] || 0) + 1; return acc; }, {});
    return (
        <div className="space-y-6">
            <div className={`bg-gradient-to-br from-green-800 to-green-600 text-white p-8 rounded-2xl shadow-lg`}>
                <h2 className="text-3xl font-bold">{t('welcome')}, {mockUsers['applicant@demo.com'].name}</h2>
                <p className="mt-2 opacity-80">Here is a summary of your activities and applications. Let's make a positive impact!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-bold mb-4">{t('trackStatus')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="border p-4 rounded-lg"><p className="text-3xl font-bold text-blue-600">{appsByStatus['review'] || 0}</p><p className="text-sm text-gray-500 mt-1">{t('review')}</p></div>
                        <div className="border p-4 rounded-lg"><p className="text-3xl font-bold text-yellow-600">{appsByStatus['revision'] || 0}</p><p className="text-sm text-gray-500 mt-1">{t('revision')}</p></div>
                        <div className="border p-4 rounded-lg"><p className="text-3xl font-bold text-green-600">{appsByStatus['approved'] || 0}</p><p className="text-sm text-gray-500 mt-1">{t('approved')}</p></div>
                        <div className="border p-4 rounded-lg"><p className="text-3xl font-bold text-red-600">{appsByStatus['rejected'] || 0}</p><p className="text-sm text-gray-500 mt-1">{t('rejected')}</p></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm space-y-3">
                     <h3 className="text-lg font-bold mb-2">{t('quickActions')}</h3>
                     <button onClick={() => openModal('newApplication')} className={`w-full text-start p-3 rounded-lg flex items-center gap-3 bg-${theme.lightBg} text-${theme.lightText} hover:opacity-90 font-semibold`}><PlusCircle size={20}/> {t('newApplication')}</button>
                     <button onClick={() => openModal('aiAssistant')} className="w-full text-start p-3 rounded-lg flex items-center gap-3 bg-blue-50 text-blue-700 hover:opacity-90 font-semibold"><BrainCircuit size={20}/> {t('aiAssistant')}</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-bold mb-4">{t('followActiveGrants')}</h3>
                <div className="space-y-4">
                    {mockApplications.filter(a => a.status === 'approved').map(grant => (
                        <div key={grant.id} className="border rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-gray-50">
                            <div><p className="font-bold">{grant.title}</p><p className="text-sm text-gray-500">{grant.id}</p></div>
                            <div className="flex justify-start md:justify-end gap-2">
                                <button onClick={() => setDetailView({ type: 'grant', id: grant.id })} className={`bg-${theme.primary} text-white font-bold py-2 px-3 rounded-lg text-sm`}>{t('financials')}</button>
                                <button onClick={() => setDetailView({ type: 'dataRoom', id: grant.id })} className="bg-gray-200 text-gray-800 font-bold py-2 px-3 rounded-lg text-sm">{t('dataRoom')}</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export const MyApplicationsView = ({ openModal, setDetailView, t }) => { return ( <div className="bg-white p-6 rounded-2xl shadow-sm"> <div className="flex justify-between items-center mb-6"> <h2 className="text-2xl font-bold">{t('myApplications')}</h2>
 <button onClick={() => openModal('newApplication')} className={`bg-${theme.primary} text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-${theme.primaryHover}`}>
    <PlusCircle size={18}/> {t('newApplication')}</button> </div> <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-100"><tr><th className="px-4 py-3">{t('appNumber')}</th><th className="px-4 py-3">{t('projectTitle')}</th>
    <th className="px-4 py-3">{t('submissionDate')}</th><th className="px-4 py-3">{t('status')}</th><th className="px-4 py-3">{t('actions')}</th>
    </tr></thead><tbody>{mockApplications.map(app => (<tr key={app.id} className="border-b hover:bg-gray-50"><td className="px-4 py-3 font-mono">{app.id}</td><td className="px-4 py-3 font-semibold">{app.title}</td>
    <td className="px-4 py-3">{app.submissionDate}</td><td className="px-4 py-3">{getStatusChip(app.status, t)}</td><td className="px-4 py-3"><button onClick={() => setDetailView({type: 'applicationDetails', application: app})} className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-1 hover:bg-gray-100">{t('viewDetails')}</button></td></tr>))}</tbody></table></div> </div> ); };
export const ChatView = ({ t, language }) => { const [activeChat, setActiveChat] = useState('support'); const [message, setMessage] = useState(''); const [history, setHistory] = useState(mockChatHistory); const handleSend = () => { if (!message.trim()) return; const newHistory = { ...history, [activeChat]: [...history[activeChat], { from: 'User', text: message, time: 'Now' }] }; setHistory(newHistory); setMessage(''); setTimeout(() => { const newHistoryWithReply = { ...newHistory, [activeChat]: [...newHistory[activeChat], { from: 'support', text: 'Thank you for your message. We will get back to you shortly.', time: 'Now' }] }; setHistory(newHistoryWithReply); }, 1000); }; return ( <div className="bg-white rounded-2xl shadow-sm h-[75vh] flex"> <div className={`w-1/3 ${language === 'ar' ? 'border-l' : 'border-r'}`}> <div className="p-4 border-b"><h2 className="font-bold text-lg">{t('chat')}</h2></div> <div className="p-2 space-y-1"> {Object.keys(history).map(chatId => ( <button key={chatId} onClick={() => setActiveChat(chatId)} className={`w-full text-left p-3 rounded-lg flex gap-3 items-center ${activeChat === chatId ? `bg-${theme.lightBg}` : 'hover:bg-gray-100'}`}> <div className="p-2 bg-gray-200 rounded-full"><Users size={20}/></div> <div> <p className="font-bold text-sm capitalize">{chatId.replace('-', ' ')}</p> <p className="text-xs text-gray-500 truncate">{history[chatId].slice(-1)[0].text}</p> </div> </button> ))} </div> </div> <div className="w-2/3 flex flex-col"> <div className="p-4 border-b flex items-center gap-3"><div className="p-2 bg-gray-200 rounded-full"><Users size={20}/></div><h3 className="font-bold capitalize">{activeChat.replace('-', ' ')}</h3></div> <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-50"> {history[activeChat].map((msg, i) => ( <div key={i} className={`flex items-start gap-3 ${msg.from === 'User' ? 'justify-end' : 'justify-start'}`}> <div className={`p-3 rounded-lg max-w-lg ${msg.from === 'User' ? `bg-${theme.secondary} text-white` : 'bg-white shadow-sm'}`}>{msg.text}</div> </div> ))} </div> <div className="p-4 border-t"><div className="relative"><input value={message} onChange={e => setMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Write your message..." className="w-full bg-gray-100 rounded-full py-3 focus:outline-none ps-4 pe-12"/><button onClick={handleSend} className={`absolute top-1/2 -translate-y-1/2 p-2 bg-${theme.primary} text-white rounded-full hover:bg-${theme.primaryHover} ${language === 'ar' ? 'left-3' : 'right-3'}`}><Send size={16}/></button></div></div> </div> </div> ); };
export const ReportsAndStatsView = ({ openModal, t }) => {
    const fundingData = [ { label: t('approved'), value: 75, color: '#16a34a' }, { label: t('review'), value: 20, color: '#2563eb' }, { label: t('rejected'), value: 5, color: '#dc2626' } ];
    const appsData = [ { label: 'Jan', value: 20 }, { label: 'Feb', value: 35 }, { label: 'Mar', value: 45 }, { label: 'Apr', value: 60 }, { label: 'May', value: 80 } ];
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">{t('reportsDashboard')}</h2></div>
            <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4">
                <label>{t('filterByDate')}:</label>
                <input type="date" className="border rounded-lg p-2" />
                <span>-</span>
                <input type="date" className="border rounded-lg p-2" />
                <button className={`bg-gray-800 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2`}><Filter size={16} /> Filter</button>
                <button onClick={() => openModal('aiReport', {fundingData, appsData})} className={`ms-auto bg-${theme.primary} text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2`}><BrainCircuit size={18}/> {t('generateReport')}</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SimpleBarChart data={appsData} title={t('applicationsOverTime')}/>
                <SimplePieChart data={fundingData} title={t('fundingDistributionByStatus')}/>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm"><h3 className="text-lg font-bold mb-4">Downloadable Reports</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[{name:'Monthly Performance Summary'},{name:'Approved Grants Report'},{name:'Project Type Analysis'}].map(report => 
                (<div key={report.name} className="border rounded-lg p-4 flex items-center justify-between hover:shadow-md"><div className="flex items-center gap-3"><FileText/><p className="font-semibold">{report.name}</p></div><button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"><Download size={18}/></button></div>))}</div></div>
        </div>
    );
};
export const MilestoneDetailsModal = ({ milestone, onClose, t }) => { return ( <Modal onClose={onClose} title={`${t('details')}: ${milestone.title}`}> <div className="space-y-4"> <div><h4 className="font-bold text-sm text-gray-500">Status</h4><p className="capitalize">{milestone.status}</p></div> <div><h4 className="font-bold text-sm text-gray-500">Deadline</h4><p>{milestone.deadline}</p></div> <div><h4 className="font-bold text-sm text-gray-500">Funds</h4><p>SAR {milestone.funds.toLocaleString()}</p></div> <div className="pt-4 border-t"> <h4 className="font-bold text-sm text-gray-500 mb-2">Documents</h4> {milestone.report ? <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline"><Paperclip size={16}/>{milestone.report}</a> : <p className="text-sm text-gray-400">No report submitted yet.</p>} {milestone.invoice ? <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline mt-2"><FileText size={16}/>{milestone.invoice}</a> : <p className="text-sm text-gray-400 mt-2">No invoice submitted yet.</p>} </div> <div className="pt-4 flex justify-end"> <button className={`bg-${theme.primary} text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2`}><Upload size={16}/> Upload Report</button> </div> </div> </Modal> ); };
export const SupportCenterModal = ({ onClose, openModal, t, setActiveView }) => { const handleLiveChat = () => { onClose(); setActiveView('chat'); }; return ( <Modal onClose={onClose} title={t('supportCenter')}> <div className="space-y-6"> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div onClick={() => {onClose(); openModal('aiAssistant')}} className="p-4 border rounded-lg text-center hover:bg-gray-50 cursor-pointer"><BrainCircuit className="mx-auto mb-2 text-green-700" size={32}/> <h3 className="font-bold">{t('aiAssistant')}</h3><p className="text-sm text-gray-500">For quick queries and document generation.</p></div> <div onClick={handleLiveChat} className="p-4 border rounded-lg text-center hover:bg-gray-50 cursor-pointer"><MessageSquare className="mx-auto mb-2 text-blue-600" size={32}/> <h3 className="font-bold">Live Chat</h3><p className="text-sm text-gray-500">Speak directly with our support team.</p></div> </div> <div><h3 className="font-bold text-lg mb-2">Frequently Asked Questions</h3><div className="space-y-2"><details className="p-2 border rounded-lg"><summary className="cursor-pointer font-medium">How do I submit a new grant application?</summary>
<p className="text-sm text-gray-600 pt-2">You can apply from the "My Applications" page by clicking the "New Application" button.</p>
</details><details className="p-2 border rounded-lg"><summary className="cursor-pointer font-medium">Where can I find reviewers' feedback on my application?</summary>
<p className="text-sm text-gray-600 pt-2">If your application status is "Revision", you will find the feedback on the application details page.</p></details></div></div> </div> </Modal> ); };
export const AiAssistantModal = ({ onClose, t }) => {
    const [messages, setMessages] = useState([{ from: 'ai', text: t('aiWelcome') }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if(!input.trim() || isLoading) return;
        const userMessage = { from: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const aiResponse = await callGemini(input);
        
        setMessages(prev => [...prev, { from: 'ai', text: aiResponse }]);
        setIsLoading(false);
    };
    return (
        <Modal onClose={onClose} title={t('aiAssistant')}>
            <div className="h-[60vh] flex flex-col">
                <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-50 rounded-lg">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex items-start gap-3 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.from === 'ai' && <div className="p-2 bg-green-200 text-green-800 rounded-full"><Bot size={20}/></div>}
                            <div className={`p-3 rounded-lg max-w-lg ${msg.from === 'user' ? `bg-blue-600 text-white` : 'bg-white shadow-sm'}`}>{msg.text}</div>
                        </div>
                    ))}
                    {isLoading && <div className="flex justify-start gap-3"><div className="p-2 bg-green-200 text-green-800 rounded-full"><Bot size={20}/></div><div className="p-3 rounded-lg bg-white shadow-sm">Thinking...</div></div>}
                    {messages.length === 1 && (
                        <div className="text-center text-sm text-gray-500 pt-4">
                            <p className="font-bold mb-2">{t('suggestedPrompts')}</p>
                            <div className="flex justify-center gap-2">
                                <button onClick={() => setInput(t('prompt1'))} className="bg-gray-200 p-2 rounded-lg">{t('prompt1')}</button>
                                <button onClick={() => setInput(t('prompt2'))} className="bg-gray-200 p-2 rounded-lg">{t('prompt2')}</button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t"><div className="relative"><input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask me anything..." className="w-full bg-gray-100 rounded-full py-3 focus:outline-none ps-4 pe-12"/><button onClick={handleSend} className="absolute top-1/2 -translate-y-1/2 p-2 bg-green-800 text-white rounded-full hover:bg-green-900 right-3"><Send size={16}/></button></div></div>
            </div>
        </Modal>
    );
};
export const NewApplicationForm = ({ onClose, t }) => {
    const [files, setFiles] = useState([]);
    const [summary, setSummary] = useState('');
    const [keywords, setKeywords] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const handleFileChange = (e) => { if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files)]); };

    const handleGenerateSummary = async () => {
        if (!keywords.trim()) return;
        setIsGenerating(true);
        const prompt = `Based on these keywords: "${keywords}", write a professional and compelling project summary for an environmental grant application. The summary should be approximately 150 words long and suitable for an official submission.`;
        const generatedSummary = await callGemini(prompt);
        setSummary(generatedSummary);
        setIsGenerating(false);
    };

    return (
        <Modal onClose={onClose} title={t('newApplication')}>
            <form className="space-y-4">
                <div><label className="font-medium">{t('projectTitle')}</label><input type="text" className="w-full mt-2 p-3 border rounded-lg"/></div>
                <div><label className="font-medium">{t('projectSummary')}</label><textarea rows="5" value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full mt-2 p-3 border rounded-lg"></textarea>
                <div className="p-2 bg-gray-50 rounded-b-lg space-y-2">
                    <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder={t('enterKeywords')} className="w-full p-2 border rounded-lg text-sm" />
                    <button type="button" onClick={handleGenerateSummary} disabled={isGenerating} className="w-full flex justify-center items-center gap-2 py-2 px-4 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-all">
                        {isGenerating ? t('generating') : t('generateWithAI')}
                    </button>
                </div>
                </div>
                <div><label className="font-medium">{t('requestedAmount')}</label><input type="number" placeholder="SAR" className="w-full mt-2 p-3 border rounded-lg"/></div>
                <div>
                    <label className="font-medium">{t('attachments')}</label>
                    <div className="mt-2 p-4 border-2 border-dashed rounded-lg text-center">
                        <Upload className="mx-auto text-gray-400" size={32}/>
                        <label htmlFor="file-upload" className="cursor-pointer text-blue-600 font-semibold"> {t('uploadFiles')} <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} /> </label>
                        <p className="text-xs text-gray-500">PDF, DOCX, XLSX up to 10MB</p>
                    </div>
                    <div className="mt-2 space-y-2">
                        {files.map((file, i) => <div key={i} className="flex items-center justify-between p-2 bg-gray-100 rounded"><span className="text-sm">{file.name}</span><button type="button" onClick={() => setFiles(files.filter(f => f.name !== file.name))}><Trash2 className="text-red-500" size={16}/></button></div>)}
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="py-2 px-6 bg-gray-200 rounded-lg">{t('cancel')}</button>
                    <button type="submit" className={`py-2 px-6 bg-${theme.primary} text-white rounded-lg`}>{t('submitApplication')}</button>
                </div>
            </form>
        </Modal>
    );
};
export const ApplicationDetailsView = ({ application, setDetailView, t, language, openModal }) => {
    const applicantUser = Object.values(mockUsers).find(u => u.name === application.applicant || u.role === 'applicant'); // Simplified mapping
    return (
        <div className="space-y-6">
            <button onClick={() => setDetailView(null)} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">{language === 'ar' ? <ArrowRight size={16}/> : <ArrowLeft size={16}/>} {t('back')}</button>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold mb-1">{application.title}</h2>
                        <p className="text-gray-500">ID: {application.id}</p>
                    </div>
                    {getStatusChip(application.status, t)}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="text-xl font-bold mb-4 border-b pb-2">{t('projectSummary')}</h3>
                        <p className="text-gray-600">{application.summary}</p>
                    </div>
                     <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="text-xl font-bold mb-4 border-b pb-2">{t('evaluationStatus')}</h3>
                        <p>Awaiting assignment to a reviewer.</p>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="text-xl font-bold mb-4">{t('applicantInfo')}</h3>
                        {applicantUser && <div className="space-y-2 text-sm">
                            <p><strong>Name:</strong> {applicantUser.name}</p>
                            <p><strong>Email:</strong> {applicantUser.email}</p>
                            <p><strong>Phone:</strong> {applicantUser.phone}</p>
                        </div>}
                    </div>
                     <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="text-xl font-bold mb-4">{t('fundingSummary')}</h3>
                        <p className="text-2xl font-bold">SAR {application.totalFunding.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="text-xl font-bold mb-4">{t('actions')}</h3>
                        <div className="space-y-2">
                            <button onClick={() => openModal('assignReviewer', application)} className="w-full flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><UserPlus size={16}/> {t('assignReviewer')}</button>
                            <button className="w-full flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><FileText size={16}/> View Documents</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export const getStatusChip = (status, t) => { const statuses = { approved: { text: t('approved'), 
    color: 'bg-green-100 text-green-700' }, revision: { text: t('revision'), color: 'bg-yellow-100 text-yellow-700' }, 
    review: { text: t('review'), color: 'bg-blue-100 text-blue-700' }, rejected: { text: t('rejected'), 
    color: 'bg-red-100 text-red-700' } }; const s = statuses[status]; if (!s) return null; return 
    <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${s.color}`}>{s.text}</span>;
     };

import React, {  } from 'react';
import {theme} from '../utils/theme';
export const StatCard = React.memo(({ title, value, icon, color }) => ( <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-lg transition-shadow"> <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>{React.cloneElement(icon, { size: 24 })}</div> <div><p className="text-sm text-gray-500">{title}</p><p className="text-2xl font-bold">{value}</p></div> </div> ));
export const Modal = React.memo(({ children, onClose, title }) => ( <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity"> <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] transform transition-transform scale-95 animate-modal-pop-in"> <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold">{title}</h2><button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-bold text-2xl">&times;</button></div> <div className="p-6 flex-grow overflow-y-auto">{children}</div> </div> </div> ));
export const SimpleBarChart = React.memo(({ data, title }) => ( <div className="bg-white p-6 rounded-2xl shadow-sm"> <h3 className="font-bold mb-4">{title}</h3> <div className="flex items-end justify-around h-64 gap-4 text-center"> {data.map(item => ( <div key={item.label} className="flex flex-col items-center justify-end w-full"> <div className="font-bold text-sm">{item.value}</div> <div className={`w-3/4 rounded-t-lg bg-${theme.primary} hover:opacity-80 transition-all duration-300`} style={{ height: `${item.value}%` }}></div> <div className="text-xs text-gray-500 mt-2">{item.label}</div> </div> ))} </div> </div> ));
export const SimplePieChart = React.memo(({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulative = 0;
    const gradientStops = data.map(item => {
        const stop = (cumulative + item.value) / total * 100;
        const result = `${item.color} ${cumulative / total * 100}% ${stop}%`;
        cumulative += item.value;
        return result;
    });
    const conicGradient = `conic-gradient(${gradientStops.join(', ')})`;
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold mb-4">{title}</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="w-48 h-48 rounded-full" style={{ background: conicGradient }}></div>
                <div className="space-y-2">
                    {data.map(item => (
                        <div key={item.label} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                            <span className="text-sm font-medium">{item.label}: {item.value} ({ (item.value / total * 100).toFixed(1) }%)</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

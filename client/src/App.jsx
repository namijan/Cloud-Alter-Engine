import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DocumentationPage from './DocumentationPage';
import { Upload, FileText, CheckCircle, AlertCircle, Play, Loader2, Database, Search, Layout, LogOut, ChevronDown, ChevronRight, RefreshCw, CheckSquare, Square, Zap, Globe, HardDrive, Eye, X, Shield, Activity, Maximize2, Minimize2, Trash2, ArrowRight, Folder, Check, HelpCircle } from 'lucide-react';

const ACC_THEME = {
    primary: '#0696D7',
    primaryHover: '#0584BD',
    success: '#047857',
    error: '#E53E3E',
    warning: '#D97706',
    bg: '#FFFFFF',
    sidebar: '#F9FAFB',
    tableHeader: '#F9FAFB',
    border: '#E0E0E0',
    text: '#222222',
    textSecondary: '#666666',
    pillBg: '#E1F5FE',
    pillText: '#01579B'
};

// --- APS Viewer Component ---
const APSViewer = ({ versionId, onClose }) => {
    const viewerContainer = useRef(null);
    const viewer = useRef(null);

    useEffect(() => {
        if (!versionId) return;

        const scriptId = 'aps-viewer-script';
        const styleId = 'aps-viewer-style';

        const initViewer = () => {
            if (!window.Autodesk) {
                console.error('[Viewer] Autodesk not defined');
                return;
            }

            const options = {
                env: 'AutodeskProduction',
                getAccessToken: async (onTokenReady) => {
                    try {
                        const res = await axios.get('/api/auth/token');
                        onTokenReady(res.data.access_token, res.data.expires_in);
                    } catch (e) {
                        console.error('[Viewer] Token Error:', e);
                    }
                }
            };

            window.Autodesk.Viewing.Initializer(options, () => {
                const div = viewerContainer.current;
                if (!div) return;

                if (viewer.current) {
                    viewer.current.finish();
                }

                viewer.current = new window.Autodesk.Viewing.GuiViewer3D(div);
                viewer.current.start();

                try {
                    // Safe Base64 for APS
                    const urn = btoa(unescape(encodeURIComponent(versionId))).replace(/=/g, '').replace(/\//g, '_').replace(/\+/g, '-');
                    const documentId = 'urn:' + urn;

                    window.Autodesk.Viewing.Document.load(documentId, (doc) => {
                        const viewables = doc.getRoot().getDefaultGeometry();
                        if (viewables) {
                            viewer.current.loadDocumentNode(doc, viewables);
                        } else {
                            console.error('[Viewer] No viewables found for this version');
                        }
                    }, (err) => {
                        console.error('[Viewer] Document Load Error:', err);
                    });
                } catch (e) {
                    console.error('[Viewer] URN Encoding Error:', e);
                }
            });
        };

        if (!document.getElementById(scriptId)) {
            const link = document.createElement('link');
            link.id = styleId;
            link.rel = 'stylesheet';
            link.href = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css';
            document.head.appendChild(link);

            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js';
            script.onload = initViewer;
            document.head.appendChild(script);
        } else {
            initViewer();
        }

        return () => {
            if (viewer.current) {
                viewer.current.finish();
                viewer.current = null;
            }
        };
    }, [versionId]);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 32px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${ACC_THEME.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Eye size={20} color={ACC_THEME.primary} />
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Cloud Asset Inspection</h3>
                </div>
                <button
                    onClick={onClose}
                    style={{ background: '#F3F4F6', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px' }}
                >
                    <X size={16} /> Close Preview
                </button>
            </div>
            <div ref={viewerContainer} style={{ flex: 1, position: 'relative', background: '#222' }} />
        </div>
    );
};



const ExcelPreviewModal = ({ showExcelPreview, setShowExcelPreview, excelPreviewData, previewLoading, getSelectedExcelDetails }) => {
    if (!showExcelPreview) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
            <div style={{ background: 'white', width: '90%', maxWidth: '1000px', maxHeight: '85vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                <div style={{ padding: '20px 32px', borderBottom: `1px solid ${ACC_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: ACC_THEME.sidebar }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Sync Data Inspector</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: ACC_THEME.textSecondary }}>Previewing: {getSelectedExcelDetails()?.name || 'Dataset'}</p>
                    </div>
                    <button onClick={() => setShowExcelPreview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', opacity: 0.5 }}>&times;</button>
                </div>

                <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                    {previewLoading ? (
                        <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                            <Loader2 className="animate-spin" size={32} color={ACC_THEME.primary} />
                            <p style={{ fontSize: '14px', color: ACC_THEME.textSecondary }}>Interrogating cloud data assets...</p>
                        </div>
                    ) : excelPreviewData && excelPreviewData.length > 0 ? (
                        <div style={{ border: `1px solid ${ACC_THEME.border}`, borderRadius: '4px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                <thead style={{ background: ACC_THEME.tableHeader, position: 'sticky', top: 0 }}>
                                    <tr>
                                        {Object.keys(excelPreviewData[0]).map(key => (
                                            <th key={key} style={{ padding: '12px 16px', borderBottom: `2px solid ${ACC_THEME.border}`, fontWeight: '700', textTransform: 'uppercase', fontSize: '11px', color: ACC_THEME.textSecondary }}>{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {excelPreviewData.map((row, i) => (
                                        <tr key={i} style={{ borderBottom: `1px solid ${ACC_THEME.border}` }}>
                                            {Object.values(row).map((val, j) => (
                                                <td key={j} style={{ padding: '12px 16px' }}>{String(val)}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', padding: '40px', color: ACC_THEME.textSecondary }}>No data rows found in this file.</p>
                    )}
                </div>

                <div style={{ padding: '16px 32px', borderTop: `1px solid ${ACC_THEME.border}`, display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowExcelPreview(false)} style={{ padding: '10px 24px', background: ACC_THEME.primary, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}>Done</button>
                </div>
            </div>
        </div>
    );
};




const StatusModal = ({ match, onClose }) => {
    if (!match) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', width: '700px', borderRadius: '8px', border: `1px solid ${ACC_THEME.border}`, padding: '0', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
                <div style={{ background: ACC_THEME.sidebar, padding: '24px', borderBottom: `1px solid ${ACC_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, color: ACC_THEME.text, fontSize: '18px', fontWeight: '600' }}>Engine Event Log: {match.matchedFile?.name}</h3>
                        <p style={{ margin: '4px 0 0 0', color: ACC_THEME.textSecondary, fontSize: '12px' }}>ID: {match.workItemId || 'UNINITIALIZED'}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: ACC_THEME.textSecondary, fontSize: '24px' }}>&times;</button>
                </div>

                <div style={{ background: '#F9FAFB', padding: '24px', maxHeight: '450px', overflowY: 'auto', borderBottom: `1px solid ${ACC_THEME.border}`, fontFamily: "'Roboto Mono', monospace" }}>
                    {match.logs?.map((log, i) => (
                        <div key={i} style={{ marginBottom: '8px', fontSize: '12px', color: '#444', display: 'flex', gap: '16px' }}>
                            <span style={{ color: ACC_THEME.primary, fontWeight: 'bold', minWidth: '80px' }}>{new Date(log.time).toLocaleTimeString()}</span>
                            <span style={{ flex: 1 }}>{log.message}</span>
                        </div>
                    ))}
                    {(!match.logs || match.logs.length === 0) && <p style={{ color: ACC_THEME.textSecondary, textAlign: 'center', padding: '40px' }}>Awaiting engine telemetry...</p>}
                </div>

                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end', background: 'white' }}>
                    <button onClick={onClose} style={{ padding: '10px 24px', background: ACC_THEME.primary, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Close Console</button>
                </div>
            </div>
        </div>
    );
};

const ActionPromptModal = ({ actionPrompt, selectedIndices, matches, setActionPrompt, enqueueJobs, setSelectedIndices }) => {
    if (!actionPrompt.show) return null;
    const { index, source, target } = actionPrompt;
    const count = selectedIndices.size;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
            <div style={{ background: 'white', width: '420px', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #f1f5f9', position: 'relative' }}>
                <button 
                    onClick={() => setActionPrompt({ show: false })}
                    style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                >
                    <X size={20} />
                </button>
                <div style={{ background: '#f0f9ff', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <Zap size={24} color={ACC_THEME.primary} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Smart Sync Dispatch</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
                    You have <b>{count}</b> items selected. Would you like to process only this row or all selected items?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button 
                        onClick={() => { enqueueJobs([index], source, target); setActionPrompt({ show: false }); }}
                        style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: '700', color: '#0f172a', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}
                    >
                        <ArrowRight size={18} /> Process only this item
                    </button>
                    <button 
                        onClick={() => { enqueueJobs(Array.from(selectedIndices), source, target); setActionPrompt({ show: false }); setSelectedIndices(new Set()); }}
                        style={{ padding: '14px', background: ACC_THEME.primary, border: 'none', borderRadius: '12px', fontWeight: '700', color: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}
                    >
                        <Play size={18} fill="white" /> Process all {count} selected
                    </button>
                </div>
            </div>
        </div>
    );
};

const JobQueuePanel = ({ jobQueue, isQueueExpanded, setIsQueueExpanded, removeJob }) => {
    if (jobQueue.length === 0) return null;
    
    const executingCount = jobQueue.filter(j => j.status === 'executing' || j.status === 'starting').length;
    const pendingCount = jobQueue.filter(j => j.status === 'pending').length;
    const failedInQueue = jobQueue.filter(j => j.status === 'failed').length;

    if (!isQueueExpanded) {
        return (
            <div 
                onClick={() => setIsQueueExpanded(true)}
                style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#0f172a', color: 'white', padding: '10px 20px', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', zIndex: 1000, border: '1px solid rgba(255,255,255,0.1)' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={16} color="#38bdf8" className={executingCount > 0 ? "animate-pulse" : ""} />
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>Engine Queue</span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
                    {executingCount > 0 && <span title="Processing" style={{ background: '#0ea5e9', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>{executingCount} ACTIVE</span>}
                    {pendingCount > 0 && <span title="Queued" style={{ background: '#64748b', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>{pendingCount} QUEUED</span>}
                    {failedInQueue > 0 && <span title="Incomplete" style={{ background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>{failedInQueue} ERROR</span>}
                </div>
                <Maximize2 size={12} style={{ opacity: 0.5 }} />
            </div>
        );
    }

    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', width: '380px', maxHeight: '480px', background: 'white', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', zIndex: 1000, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: '#0f172a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity size={18} color="#38bdf8" />
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>Live Engine Status</h4>
                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '800' }}>{jobQueue.length} TASKS</span>
                </div>
                <button onClick={() => setIsQueueExpanded(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Minimize2 size={16} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f8fafc' }}>
                {jobQueue.map(job => (
                    <div key={job.id} style={{ background: 'white', padding: '14px', borderRadius: '12px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ maxWidth: '80%' }}>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.fileName}</div>
                                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>{job.actionType}</div>
                            </div>
                            <button onClick={() => removeJob(job.id)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}><Trash2 size={14} /></button>
                        </div>
                        <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                            <div style={{ height: '100%', background: job.status === 'success' ? '#10b981' : (job.status === 'failed' ? '#ef4444' : '#0ea5e9'), width: `${job.progress}%`, transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '600' }}>
                            <span style={{ color: job.status === 'failed' ? '#ef4444' : '#64748b' }}>{job.message}</span>
                            <span style={{ color: '#94a3b8' }}>{job.progress}%</span>
                        </div>
                    </div>
                ))}
                {jobQueue.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        <Activity size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                        <div style={{ fontSize: '12px' }}>Queue Empty</div>
                    </div>
                )}
            </div>
        </div>
    );
};

const HistoryPanel = ({ jobHistory, setJobHistory, showHistory, setShowHistory, setSelectedDiffMatch, setShowDiffSummary }) => {
    if (!showHistory) return null;
    return (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '450px', height: '100vh', background: 'white', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px 32px', borderBottom: `1px solid ${ACC_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Operation History</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Persistent record of engine activities</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={() => { if(confirm('Clear all logs?')) setJobHistory([]); }}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                    >
                        CLEAR ALL
                    </button>
                    <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
                {jobHistory.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center' }}>
                        <Database size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>No historical logs found</div>
                        <div style={{ fontSize: '12px', marginTop: '8px' }}>Records will appear here after sync tasks complete</div>
                    </div>
                ) : (
                    jobHistory.map((job, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => {
                                if (job.lastSyncDiff) {
                                    setSelectedDiffMatch({ excelRow: { DrawingName: job.fileName }, lastSyncDiff: job.lastSyncDiff });
                                    setShowDiffSummary(true);
                                }
                            }}
                            style={{ padding: '16px', borderRadius: '12px', background: '#fff', border: '1px solid #f1f5f9', marginBottom: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: job.lastSyncDiff ? 'pointer' : 'default' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>{new Date(job.completedAt).toLocaleString()}</div>
                                <div style={{ fontSize: '9px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px', background: job.status === 'success' ? '#ecfdf5' : '#fef2f2', color: job.status === 'success' ? '#059669' : '#dc2626' }}>
                                    {job.status.toUpperCase()}
                                </div>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>{job.fileName}</div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>Action: {job.actionType}</div>
                            {job.status === 'failed' && (
                                <div style={{ fontSize: '11px', color: '#dc2626', background: '#fff1f2', padding: '8px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                                    <b>Reason:</b> {job.message}
                                </div>
                            )}
                            {job.lastSyncDiff && (
                                <div style={{ fontSize: '10px', color: ACC_THEME.primary, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                                    <Eye size={12} /> VIEW DELTA SUMMARY
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};



const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Resource Management
    const [hubs, setHubs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [excelFiles, setExcelFiles] = useState([]);

    // Selection State
    const [selectedHub, setSelectedHub] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedExcel, setSelectedExcel] = useState('');

    // Operation State
    const [status, setStatus] = useState('Engine Standby');
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [showDiffSummary, setShowDiffSummary] = useState(false);
    const [selectedDiffMatch, setSelectedDiffMatch] = useState(null);
    const [activeUrn, setActiveUrn] = useState(null);
    const [selectedIndices, setSelectedIndices] = useState(new Set());
    const [isInitializing, setIsInitializing] = useState(true);
    const [folderList, setFolderList] = useState([]);
    const [selectedFolderIds, setSelectedFolderIds] = useState(new Set());
    const [expandedFolderIds, setExpandedFolderIds] = useState(new Set());
    const [isRefreshingFolders, setIsRefreshingFolders] = useState(false);

    // Excel Preview State
    const [excelPreviewData, setExcelPreviewData] = useState(null);
    const [showExcelPreview, setShowExcelPreview] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [isRefreshingExcel, setIsRefreshingExcel] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [diffData, setDiffData] = useState(null);
    const [activeSyncIdx, setActiveSyncIdx] = useState(null);
    const [selectedForPush, setSelectedForPush] = useState([]);


    // Job Queue State
    const [jobQueue, setJobQueue] = useState([]);
    const [jobHistory, setJobHistory] = useState([]);
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [showDocumentation, setShowDocumentation] = useState(false);
    const [actionPrompt, setActionPrompt] = useState({ show: false, index: null, source: '', target: '' });
     const [syncMode, setSyncMode] = useState('full'); // 'full' or 'acc'
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [isQueueExpanded, setIsQueueExpanded] = useState(false);


    useEffect(() => {
        checkProfile();
    }, []);
    
    useEffect(() => {
        console.log('[DEBUG State]', { 
            selectedHub, 
            selectedProject, 
            selectedExcel, 
            loading, 
            matchesCount: matches.length,
            isInitializing
        });
    }, [selectedHub, selectedProject, selectedExcel, loading, matches, isInitializing]);

    // Persistence Effect - DISABLED per user request
    /*
    useEffect(() => {
        localStorage.setItem('cloud_alter_queue', JSON.stringify(jobQueue.filter(j => j.status === 'pending' || j.status === 'executing')));
    }, [jobQueue]);

    useEffect(() => {
        localStorage.setItem('cloud_alter_history', JSON.stringify(jobHistory));
    }, [jobHistory]);
    */

    // ... (rest of helper functions same, but adding fetchExcelPreview)
    const fetchExcelPreview = async () => {
        if (!selectedProject || !selectedExcel) return;
        setPreviewLoading(true);
        setShowExcelPreview(true);
        try {
            const res = await axios.get(`/api/acc/excel-data?projectId=${selectedProject}&versionId=${selectedExcel}`);
            setExcelPreviewData(res.data);
        } catch (e) {
            console.error('Preview Error:', e);
        } finally {
            setPreviewLoading(false);
        }
    };

    // --- Job Queue Logic ---

    const handleActionClick = (index, source, target) => {
        if (selectedIndices.size > 1 && selectedIndices.has(index)) {
            setActionPrompt({ show: true, index, source, target });
        } else {
            enqueueJobs([index], source, target);
        }
    };

    const enqueueJobs = (indicesArray, source, target) => {
        const newJobs = indicesArray.map(idx => {
            const match = matches[idx];
            let actionName = `${source.toUpperCase()} \u2192 ${target.toUpperCase()}`;
            if (source === 'excel' && target === 'drawing') actionName = 'SPREADSHEET \u2192 (DWG + ACC)';
            if (source === 'acc' && target === 'drawing') actionName = syncMode === 'full' ? 'ACC \u2192 (DWG + EXCEL)' : 'ACC \u2192 DWG';
            
            return {
                id: Math.random().toString(36).substr(2, 9),
                fileName: match.excelRow?.DrawingName || match.matchedFile?.name || 'Unknown',
                actionType: actionName,
                status: 'pending',
                progress: 0,
                message: 'In Queue',
                payload: { source, target, match, index: idx }
            };
        });
        setJobQueue(prev => [...prev, ...newJobs]);
        setIsQueueExpanded(true);
    };

    const executeJob = async (job) => {
        console.log('[Execute Job] Starting:', job);
        const updateJob = (updates) => setJobQueue(prev => prev.map(j => j.id === job.id ? { ...j, ...updates } : j));
        const { source, target, match, index } = job.payload;

        try {
            if (target === 'drawing') {
                updateJob({ progress: 10, message: 'Extracting source data...' });
                let sourceValues = match.excelRow;
                let activeDiff = [];
                
                if (source === 'acc') {
                    updateJob({ progress: 15, message: 'Capturing ACC Data...' });
                    const previewRes = await axios.post('/api/automation/preview-sync', {
                        projectId: selectedProject,
                        drawingVersionId: match.matchedFile.versionId,
                        excelVersionId: syncMode === 'full' ? selectedExcel : null,
                        drawingName: match.excelRow?.DrawingName || match.matchedFile?.name,
                        sourceType: 'acc',
                        targetType: syncMode === 'full' ? 'excel' : 'drawing' 
                    });
                    console.log('[Execute Job] ACC Source Data:', previewRes.data.sourceData);
                    sourceValues = { ...match.excelRow, ...previewRes.data.sourceData };
                    activeDiff = previewRes.data.diff;
                } else if (source === 'excel') {
                    // Pre-fetch diff for summary
                    const previewRes = await axios.post('/api/automation/preview-sync', {
                        projectId: selectedProject,
                        drawingVersionId: match.matchedFile.versionId,
                        excelVersionId: selectedExcel,
                        drawingName: match.excelRow?.DrawingName || match.matchedFile?.name,
                        sourceType: 'excel',
                        targetType: 'acc' // Just to get the diff against ACC
                    });
                    activeDiff = previewRes.data.diff;
                }

                updateJob({ progress: 30, message: 'Launching Engine...' });
                const res = await axios.post('/api/automation/update', {
                    projectId: selectedProject,
                    versionId: match.matchedFile.versionId,
                    excelVersionId: selectedExcel,
                    drawingName: match.excelRow?.DrawingName || match.matchedFile?.name,
                    excelRow: sourceValues,
                    sourceType: source
                });

                // PARALLEL SYNC: Dispatch secondary update immediately
                if (source === 'excel') {
                    console.log('[Parallel Sync] Dispatching ACC Attribute update...');
                    axios.post('/api/automation/acc-push', {
                        projectId: selectedProject,
                        versionId: match.matchedFile.versionId,
                        attributes: sourceValues
                    }).catch(err => console.error('[Parallel Sync Error] ACC Push failed:', err));
                } else if (source === 'acc' && syncMode === 'full') {
                    console.log('[Parallel Sync] Dispatching Spreadsheet update...');
                    const updates = activeDiff.filter(d => d.changed).map(d => ({ key: d.key, proposed: d.source }));
                    axios.post('/api/automation/commit-extract', {
                        projectId: selectedProject,
                        excelVersionId: selectedExcel,
                        drawingName: match.excelRow?.DrawingName || match.matchedFile?.name,
                        updates
                    }).then(() => fetchExcelFiles(selectedHub, selectedProject, Array.from(selectedFolderIds)))
                      .catch(err => console.error('[Parallel Sync Error] Spreadsheet update failed:', err));
                }

                pollJobStatus(job.id, res.data.workItemId, match.matchedFile?.versionId, activeDiff, source);
                updateJob({ workItemId: res.data.workItemId });
                setLoading(false); // Allow next job to start
            } else {
                updateJob({ progress: 20, message: 'Interrogating Metadata...' });
                const previewRes = await axios.post('/api/automation/preview-sync', {
                    projectId: selectedProject,
                    drawingVersionId: match.matchedFile.versionId,
                    excelVersionId: selectedExcel,
                    drawingName: match.excelRow?.DrawingName || match.matchedFile?.name,
                    sourceType: source === 'drawing' ? 'drawing' : source,
                    targetType: target
                });

                const activeDiff = previewRes.data.diff;

                if (target === 'acc') {
                    updateJob({ progress: 60, message: 'Updating ACC Attributes...' });
                    await axios.post('/api/automation/acc-push', {
                        projectId: selectedProject,
                        versionId: match.matchedFile.versionId,
                        attributes: previewRes.data.sourceData
                    });
                } else if (target === 'excel') {
                    updateJob({ progress: 60, message: 'Committing to Spreadsheet...' });
                    const updates = previewRes.data.diff.filter(d => d.changed).map(d => ({ key: d.key, proposed: d.source }));
                    await axios.post('/api/automation/commit-extract', {
                        projectId: selectedProject,
                        excelVersionId: selectedExcel,
                        drawingName: match.excelRow?.DrawingName || match.matchedFile?.name,
                        updates
                    });
                    await fetchExcelFiles(selectedHub, selectedProject, Array.from(selectedFolderIds));
                }
                
                updateJob({ progress: 100, status: 'success', message: 'Sync Complete', lastSyncDiff: activeDiff });
                
                setMatches(prev => prev.map(m => (m.matchedFile?.versionId === match.matchedFile?.versionId) ? { ...m, status: 'success', lastSyncDiff: activeDiff } : m));

                setTimeout(() => {
                    setJobQueue(prev => {
                        const targetJob = prev.find(j => j.id === job.id);
                        if (targetJob) setJobHistory(h => [{ ...targetJob, status: 'success', completedAt: new Date().toISOString() }, ...h]);
                        return prev.filter(j => j.id !== job.id);
                    });
                }, 2000);
            }
        } catch (e) {
            // ... (error handling same as before)
            const errorMsg = e.response?.data?.error || e.response?.data || e.message;
            const finalizedError = typeof errorMsg === 'string' ? errorMsg : (JSON.stringify(errorMsg) || 'System Error');
            updateJob({ progress: 100, status: 'failed', message: finalizedError });
            setTimeout(() => {
                setJobQueue(prev => {
                    const targetJob = prev.find(j => j.id === job.id);
                    if (targetJob) setJobHistory(h => [{ ...targetJob, status: 'failed', message: finalizedError, completedAt: new Date().toISOString() }, ...h]);
                    return prev.filter(j => j.id !== job.id);
                });
            }, 3000);
            setMatches(prev => prev.map(m => (m.matchedFile?.versionId === match.matchedFile?.versionId) ? { ...m, status: 'failed' } : m));
        }
    };

    const pollJobStatus = (jobId, workItemId, targetMatchId, activeDiff, originalSource) => {
        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`/api/automation/status/${workItemId}`);
                const { status, newVersion } = res.data;

                if (status === 'finished' || status === 'failed' || status === 'cancelled') {
                    clearInterval(interval);
                    const finalStatus = status === 'finished' ? 'success' : 'failed';
                    const finalMsg = finalStatus === 'success' ? 'Update Success' : 'Engine Failed';
                    
                    if (finalStatus === 'success') {
                        setMatches(prev => prev.map(m => (m.matchedFile?.versionId === targetMatchId) ? { ...m, status: 'success', lastSyncDiff: activeDiff } : m));
                    }

                    setJobQueue(prev => prev.map(j => j.id === jobId ? { ...j, status: finalStatus, progress: 100, message: finalMsg, lastSyncDiff: activeDiff } : j));
                    
                    setTimeout(() => {
                        setJobQueue(prev => {
                            const targetJob = prev.find(j => j.id === jobId);
                            if (targetJob) setJobHistory(h => [{ ...targetJob, status: finalStatus, message: finalMsg, completedAt: new Date().toISOString() }, ...h]);
                            return prev.filter(j => j.id !== jobId);
                        });
                    }, 3000);

                    if (status === 'finished') {
                        setMatches(prev => prev.map(m => {
                            if (m.matchedFile?.versionId === targetMatchId) {
                                return { 
                                    ...m, 
                                    status: 'success', 
                                    matchedFile: { ...m.matchedFile, version: newVersion || m.matchedFile.version },
                                    lastSyncDiff: activeDiff 
                                };
                            }
                            return m;
                        }));
                    }
                } else {
                    const prog = status === 'committing' ? 90 : (status === 'inprogress' ? 60 : 40);
                    const msg = status === 'committing' ? 'Finalizing Cloud Write...' : (status === 'inprogress' ? 'Transmitting CAD Data...' : 'Preparing Engine...');
                    setJobQueue(prev => prev.map(j => j.id === jobId ? { ...j, progress: prog, message: msg } : j));
                }
            } catch (e) {
                clearInterval(interval);
                setJobQueue(prev => prev.map(j => j.id === jobId ? { ...j, status: 'failed', progress: 100, message: 'Network Timeout' } : j));
            }
        }, 3000);
    };

    useEffect(() => {
        const executingJobs = jobQueue.filter(j => j.status === 'executing');
        const executingCount = executingJobs.length;
        if (executingCount >= 3) return;

        // Resource Locking: Only one job can write to Excel at a time to prevent version conflicts
        const isExcelLockActive = executingJobs.some(j => j.payload.target === 'excel');

        const pendingJobs = jobQueue.filter(j => j.status === 'pending');
        if (pendingJobs.length === 0) return;

        let startCount = 3 - executingCount;
        const jobsToStart = [];
        let excelInBatch = isExcelLockActive;

        for (const job of pendingJobs) {
            if (jobsToStart.length >= startCount) break;
            
            if (job.payload.target === 'excel') {
                if (!excelInBatch) {
                    jobsToStart.push(job);
                    excelInBatch = true;
                }
                // If excel is already locked, this job stays in 'pending' for the next cycle
            } else {
                jobsToStart.push(job);
            }
        }

        if (jobsToStart.length === 0) return;

        setJobQueue(prev => prev.map(j => jobsToStart.find(s => s.id === j.id) ? { ...j, status: 'executing', message: 'Starting...' } : j));
        jobsToStart.forEach(job => executeJob(job));
    }, [jobQueue]);

    const removeJob = (id) => setJobQueue(prev => prev.filter(j => j.id !== id));


    const getSelectedExcelDetails = () => {
        return excelFiles.find(f => f.versionId === selectedExcel);
    };

    // --- UI Components ---
    const checkProfile = async () => {
        try {
            const res = await axios.get('/api/auth/profile');
            if (res.data.status === 'Logged In') {
                setIsLoggedIn(true);
                setUser(res.data);
                initDiscovery();
            }
        } catch (e) {
            console.error("Auth check failed", e);
        } finally {
            setIsAuthChecking(false);
        }
    };

    const initDiscovery = async () => {
        try {
            const hubsRes = await axios.get('/api/acc/hubs');
            const hubs = hubsRes.data;
            setHubs(hubs);

            const prefRes = await axios.get('/api/user/preferences');
            const prefs = prefRes.data;

            if (prefs.hubId) {
                setSelectedHub(prefs.hubId);
                const projRes = await axios.get(`/api/acc/projects?hubId=${prefs.hubId}`);
                setProjects(projRes.data);

                if (prefs.projectId) {
                    setSelectedProject(prefs.projectId);
                    fetchFolders(prefs.hubId, prefs.projectId, false);
                }
            } else if (hubs.length === 1) {
                // Auto-select if only one hub exists
                const singleHubId = hubs[0].id;
                setSelectedHub(singleHubId);
                const projRes = await axios.get(`/api/acc/projects?hubId=${singleHubId}`);
                setProjects(projRes.data);
            }
            } catch (e) {
            console.error('Discovery Init Error:', e);
        } finally {
            setIsInitializing(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIndices.size === matches.filter(m => m.matchedFile).length && matches.length > 0) {
            setSelectedIndices(new Set());
        } else {
            const all = new Set();
            matches.forEach((m, i) => { if (m.matchedFile) all.add(i); });
            setSelectedIndices(all);
        }
    };

    // Remove duplicate useEffect for checkProfile

    useEffect(() => {
        if (!isInitializing && selectedHub) {
            fetchProjects(selectedHub);
            savePreference({ hubId: selectedHub, projectId: '', excelVersionId: '' });
            setSelectedProject('');
            setExcelFiles([]);
            setSelectedExcel('');
            setMatches([]);
        }
    }, [selectedHub]);

    const prevProject = useRef('');
    useEffect(() => {
        if (!isInitializing && selectedProject) {
            if (selectedProject !== prevProject.current) {
                fetchFolders(selectedHub, selectedProject, true); // CLEAR selection on project change
                setSelectedExcel(''); // Only clear if project actually changed
                setMatches([]);
                prevProject.current = selectedProject;
            }
        }
    }, [selectedProject]);

    useEffect(() => {
        if (!isInitializing && selectedProject) {
            fetchExcelFiles(selectedHub, selectedProject, Array.from(selectedFolderIds));
        }
    }, [selectedFolderIds]);

    const fetchFolders = async (hubId, projectId, forceClear = false) => {
        if (!hubId || !projectId) return;
        setIsRefreshingFolders(true);
        try {
            const res = await axios.get(`/api/acc/folders?hubId=${hubId}&projectId=${projectId}`);
            setFolderList(res.data);
            if (forceClear) setSelectedFolderIds(new Set()); 
        } catch (e) { console.error("Folders fetch failed", e); }
        setIsRefreshingFolders(false);
    };

    const toggleFolder = (folderId, isBlocked) => {
        if (isBlocked) return;
        const newSet = new Set(selectedFolderIds);
        if (newSet.has(folderId)) newSet.delete(folderId);
        else newSet.add(folderId);
        setSelectedFolderIds(newSet);
    };

    const toggleExpand = (folderId, e) => {
        e.stopPropagation();
        const newSet = new Set(expandedFolderIds);
        if (newSet.has(folderId)) newSet.delete(folderId);
        else newSet.add(folderId);
        setExpandedFolderIds(newSet);
    };

    const FolderTreeItem = ({ folder, depth = 0, isBlocked = false }) => {
        const isSelected = selectedFolderIds.has(folder.id);
        const isExpanded = expandedFolderIds.has(folder.id);
        const hasChildren = folder.children && folder.children.length > 0;
        const effectiveSelected = isBlocked || isSelected;

        return (
            <div style={{ marginLeft: depth > 0 ? '12px' : 0 }}>
                <div 
                    onClick={() => toggleFolder(folder.id, isBlocked)}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '4px 6px', 
                        cursor: isBlocked ? 'not-allowed' : 'pointer', 
                        borderRadius: '4px',
                        marginBottom: '1px',
                        background: effectiveSelected ? 'rgba(6, 150, 215, 0.1)' : 'transparent',
                        borderLeft: effectiveSelected ? `2px solid ${isBlocked ? '#CBD5E1' : ACC_THEME.primary}` : '2px solid transparent',
                        opacity: isBlocked ? 0.7 : 1
                    }}
                >
                    <div onClick={(e) => toggleExpand(folder.id, e)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px' }}>
                        {hasChildren ? (
                            isExpanded ? <ChevronDown size={12} color="#64748B" /> : <ChevronRight size={12} color="#64748B" />
                        ) : <div style={{ width: 12 }} />}
                    </div>
                    <div style={{ 
                        width: '14px', 
                        height: '14px', 
                        borderRadius: '3px', 
                        border: `1px solid ${effectiveSelected ? (isBlocked ? '#CBD5E1' : ACC_THEME.primary) : '#CBD5E1'}`,
                        background: effectiveSelected ? (isBlocked ? '#CBD5E1' : ACC_THEME.primary) : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {effectiveSelected && <Check size={10} color="white" />}
                    </div>
                    <Folder size={14} color={effectiveSelected ? (isBlocked ? '#64748B' : ACC_THEME.primary) : '#64748B'} />
                    <span style={{ 
                        fontSize: '12px', 
                        color: effectiveSelected ? (isBlocked ? '#64748B' : ACC_THEME.primary) : ACC_THEME.text, 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        fontWeight: effectiveSelected ? '700' : '400',
                        fontStyle: isBlocked ? 'italic' : 'normal'
                    }}>
                        {folder.attributes?.name || folder.attributes?.displayName || folder.name} {isBlocked && <span style={{ fontSize: '10px', fontWeight: '400', opacity: 0.6 }}>(Inherited)</span>}
                    </span>
                </div>
                {isExpanded && hasChildren && (
                    <div style={{ borderLeft: depth === 0 ? 'none' : `1px solid #E2E8F0`, marginLeft: '7px' }}>
                        {folder.children.map(child => <FolderTreeItem key={child.id} folder={child} depth={depth + 1} isBlocked={effectiveSelected} />)}
                    </div>
                )}
            </div>
        );
    };

    const fetchProjects = async (hubId) => {
        try {
            const res = await axios.get(`/api/acc/projects?hubId=${hubId}`);
            setProjects(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchExcelFiles = async (hubId, projectId, folderIds = []) => {
        if (!projectId || !hubId) return;
        setIsRefreshingExcel(true);
        try {
            // Force 1s delay for visual feedback
            await new Promise(r => setTimeout(r, 1000));
            const folderIdsStr = folderIds.join(',');
            const res = await axios.get(`/api/acc/excel-files?projectId=${projectId}&hubId=${hubId}&folderIds=${folderIdsStr}`);
            const newFiles = res.data;
            setExcelFiles(newFiles);

            // Auto-update selectedExcel if the current file has a new version
            if (selectedExcel) {
                const currentFile = newFiles.find(f => f.versionId === selectedExcel);
                if (!currentFile) {
                    // Find by base URN if versionId changed
                    const oldBaseId = selectedExcel.split('?')[0];
                    const updatedFile = newFiles.find(f => f.id === oldBaseId || f.versionId.startsWith(oldBaseId));
                    if (updatedFile) {
                        console.log(`[UI] Auto-pivoting to new Excel version: ${updatedFile.versionId}`);
                        setSelectedExcel(updatedFile.versionId);
                    } else {
                        setSelectedExcel('');
                    }
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsRefreshingExcel(false);
        }
    };

    const savePreference = async (prefs) => {
        try {
            await axios.post('/api/user/preferences', prefs);
        } catch (e) { console.error('Pref Save Error:', e); }
    };

    const startMatching = async (isRefresh = false, overrideExcelVersionId = null) => {
        console.log('[Frontend] Starting Match. isRefresh:', isRefresh);
        const targetExcelId = overrideExcelVersionId || selectedExcel;
        if (!selectedProject || (syncMode === 'full' && !targetExcelId)) {
            console.warn('[Frontend] Cannot start matching: missing requirements', { selectedProject, targetExcelId, syncMode });
            return;
        }
        setLoading(true);
        setStatus(isRefresh === true ? 'Synchronizing project state...' : 'Orchestrating asset alignment...');

        // Don't clear the UI for a simple refresh to avoid flickering
        if (!isRefresh) {
            setMatches([]);
            setSelectedIndices(new Set());
        }

        try {
            const res = await axios.post('/api/automation/match', {
                hubId: selectedHub,
                projectId: selectedProject,
                excelVersionId: targetExcelId,
                folderIds: Array.from(selectedFolderIds)
            });
            const sortedMatches = (res.data.matches || []).map(m => ({ ...m, status: 'idle' })).sort((a, b) => {
                const aVal = a.matchedFile?.name || '';
                const bVal = b.matchedFile?.name || '';
                return aVal.localeCompare(bVal);
            });
            setMatches(sortedMatches);
            setSortConfig({ key: 'cloud', direction: 'asc' });
            setStatus(`Console Synced. Found ${ (res.data.matches || []).filter(m => m.matchStatus === 'Found' || m.matchStatus === 'ACC Direct').length } identified variants.`);
        } catch (e) {
            setStatus('Alignment failed: ' + e.message);
        } finally {
            setLoading(false);
        }
    };
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        
        const sorted = [...matches].sort((a, b) => {
            let aVal, bVal;
            if (key === 'drawing') aVal = a.excelRow?.DrawingName || '';
            if (key === 'drawing') bVal = b.excelRow?.DrawingName || '';
            if (key === 'cloud') aVal = a.matchedFile?.name || '';
            if (key === 'cloud') bVal = b.matchedFile?.name || '';
            if (key === 'version') aVal = Number(a.matchedFile?.version || 0);
            if (key === 'version') bVal = Number(b.matchedFile?.version || 0);
            if (key === 'status') aVal = a.status;
            if (key === 'status') bVal = b.status;

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setMatches(sorted);
    };

    const triggerACCPush = async (match, index) => {
        setMatches(prev => { const next = [...prev]; next[index].status = 'starting'; return next; });
        try {
            const previewRes = await axios.post('/api/automation/preview-sync', {
                projectId: selectedProject,
                drawingVersionId: match.matchedFile.versionId,
                excelVersionId: selectedExcel,
                drawingName: match.excelRow?.DrawingName || match.matchedFile?.name,
                sourceType: 'acc',
                targetType: 'drawing'
            });
            const accValues = previewRes.data.sourceData || {};
            await triggerUpdate({ ...match, excelRow: { ...match.excelRow, ...accValues } }, index);
        } catch (e) {
            console.error("Native ACC push failed", e);
            setMatches(prev => { const next = [...prev]; next[index].status = 'failed'; return next; });
        }
    };

    // Legacy status modal removed



    const DiffSummaryModal = ({ match, onClose }) => {
        if (!match) return null;
        
        // We calculate the diff based on match.lastSyncDiff if it exists, 
        // or we try to reconstruct it from source/target data.
        const diffData = match.lastSyncDiff || [];

        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '20px' }}>
                <div style={{ background: 'white', width: '100%', maxWidth: '850px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ padding: '32px', background: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                <div style={{ background: '#f0f9ff', padding: '6px', borderRadius: '8px' }}>
                                    <Zap size={20} color={ACC_THEME.primary} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Sync Analytics Summary</h3>
                            </div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '13px', fontWeight: '500' }}>{match.excelRow?.DrawingName || match.matchedFile?.name || 'Unknown Drawing'} • Delta Report</p>
                        </div>
                        <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f8fafc', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Property</th>
                                    <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source (Old)</th>
                                    <th style={{ textAlign: 'left', padding: '16px 12px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target (New)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {diffData.length > 0 ? diffData.map((d, i) => (
                                    <tr key={i} style={{ background: d.changed ? '#f8fafc' : 'transparent', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px 12px', borderRadius: '12px 0 0 12px', borderTop: '1px solid transparent', borderBottom: '1px solid transparent' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>{d.key}</div>
                                        </td>
                                        <td style={{ padding: '16px 12px' }}>
                                            <div style={{ fontSize: '12px', color: '#64748b', textDecoration: d.changed ? 'line-through' : 'none', opacity: d.changed ? 0.6 : 1 }}>{d.source || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>empty</span>}</div>
                                        </td>
                                        <td style={{ padding: '16px 12px', borderRadius: '0 12px 12px 0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ fontSize: '12px', fontWeight: '600', color: d.changed ? ACC_THEME.primary : '#64748b' }}>
                                                    {d.target || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>empty</span>}
                                                </div>
                                                {d.changed && <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '6px', fontSize: '9px', fontWeight: '900' }}>MODIFIED</span>}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" style={{ padding: '60px', textAlign: 'center' }}>
                                            <div style={{ opacity: 0.4, marginBottom: '12px' }}><Database size={40} /></div>
                                            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>No delta data available for this operation.</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ padding: '32px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button 
                            onClick={onClose}
                            style={{ padding: '12px 24px', background: ACC_THEME.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(6, 150, 215, 0.3)' }}
                        >
                            Accept & Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };


    const toggleSelect = (index) => {
        setSelectedIndices(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };


    if (isAuthChecking) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAFBFC', fontFamily: "'Inter', sans-serif" }}>
                <div style={{ background: 'white', padding: '40px', borderRadius: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #f1f5f9' }}>
                    <div style={{ background: ACC_THEME.primary, padding: '16px', borderRadius: '16px', marginBottom: '24px', animation: 'pulse 2s infinite' }}>
                        <Zap size={48} color="white" fill="white" />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', marginBottom: '8px' }}>Authorizing Engine Session</h2>
                    <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Negotiating secure handshake with Autodesk...</p>
                    <div style={{ width: '200px', height: '4px', background: '#f1f5f9', borderRadius: '2px', marginTop: '32px', overflow: 'hidden' }}>
                        <div style={{ width: '40%', height: '100%', background: ACC_THEME.primary, borderRadius: '2px', animation: 'loading-bar 1.5s infinite ease-in-out' }}></div>
                    </div>
                </div>
                <style>{`
                    @keyframes loading-bar {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(250%); }
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.7; }
                    }
                `}</style>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFBFC', fontFamily: "'Inter', sans-serif" }}>
                {showDocumentation && <DocumentationPage onClose={() => setShowDocumentation(false)} />}
                <div style={{ width: '100%', maxWidth: '440px', padding: '40px', background: 'white', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{ display: 'inline-flex', background: ACC_THEME.primary, padding: '12px', borderRadius: '12px', marginBottom: '24px' }}>
                            <Zap size={32} color="white" fill="white" />
                        </div>
                        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: '0 0 12px' }}>DWG Cloud Alter</h1>
                        <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '500', lineHeight: '1.5' }}>Enterprise Titleblock Automation & Cloud Synchronization</p>
                    </div>

                    <button
                        onClick={() => window.location.href = `/api/auth/login?v=${Date.now()}`}
                        style={{ width: '100%', padding: '16px', background: ACC_THEME.primary, color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'transform 0.2s, background 0.2s', boxShadow: `0 4px 14px 0 ${ACC_THEME.primary}40` }}
                    >
                        Sign in to Hub Control <ArrowRight size={18} />
                    </button>

                    <div style={{ marginTop: '32px', borderTop: '1px solid #f1f5f9', paddingTop: '24px', textAlign: 'center' }}>
                        <div 
                            onClick={() => setShowDocumentation(true)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: ACC_THEME.primary, fontSize: '13px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                        >
                            <HelpCircle size={16} />
                            <span>Operations Manual</span>
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: ACC_THEME.bg, color: ACC_THEME.text, fontFamily: "'Inter', 'Segoe UI', sans-serif", overflow: 'hidden' }}>
            {showDocumentation && <DocumentationPage onClose={() => setShowDocumentation(false)} />}
            {selectedMatch && <StatusModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />}
            {showDiffSummary && <DiffSummaryModal match={selectedDiffMatch} onClose={() => { setShowDiffSummary(false); setSelectedDiffMatch(null); }} />}
            {activeUrn && <APSViewer versionId={activeUrn} onClose={() => setActiveUrn(null)} />}

            {actionPrompt.show && (
                <ActionPromptModal 
                    actionPrompt={actionPrompt} 
                    selectedIndices={selectedIndices}
                    matches={matches}
                    setActionPrompt={setActionPrompt}
                    enqueueJobs={enqueueJobs}
                    setSelectedIndices={setSelectedIndices}
                />
            )}
            <JobQueuePanel 
                jobQueue={jobQueue} 
                isQueueExpanded={isQueueExpanded} 
                setIsQueueExpanded={setIsQueueExpanded}
                removeJob={removeJob}
            />
            {showHistory && (
                <HistoryPanel 
                    jobHistory={jobHistory} 
                    setJobHistory={setJobHistory}
                    showHistory={showHistory}
                    setShowHistory={setShowHistory}
                    setSelectedDiffMatch={setSelectedDiffMatch}
                    setShowDiffSummary={setShowDiffSummary}
                />
            )}
            <ExcelPreviewModal showExcelPreview={showExcelPreview} setShowExcelPreview={setShowExcelPreview} excelPreviewData={excelPreviewData} previewLoading={previewLoading} getSelectedExcelDetails={getSelectedExcelDetails} />

            <div style={{ width: '300px', background: ACC_THEME.sidebar, borderRight: `1px solid ${ACC_THEME.border}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px', borderBottom: `1px solid ${ACC_THEME.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: ACC_THEME.primary, padding: '6px', borderRadius: '6px' }}>
                        <Zap size={22} color="white" />
                    </div>
                    <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '700', color: ACC_THEME.text }}>DWG Cloud Alter</h2>
                </div>

                <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: ACC_THEME.textSecondary, marginBottom: '8px', textTransform: 'uppercase' }}>Available Hubs</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={selectedHub}
                                style={{ width: '100%', padding: '10px 12px', background: 'white', color: ACC_THEME.text, borderRadius: '4px', border: `1px solid ${ACC_THEME.border}`, fontSize: '13px', appearance: 'none', cursor: 'pointer' }}
                                onChange={(e) => setSelectedHub(e.target.value)}
                            >
                                <option value="">Select a hub...</option>
                                {hubs.map(h => <option key={h.id} value={h.id}>{h.attributes?.name || h.name || h.id}</option>)}
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: ACC_THEME.textSecondary }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: ACC_THEME.textSecondary, marginBottom: '8px', textTransform: 'uppercase' }}>Target Projects</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={selectedProject}
                                disabled={!selectedHub}
                                style={{ width: '100%', padding: '10px 12px', background: selectedHub ? 'white' : '#F3F4F6', color: ACC_THEME.text, borderRadius: '4px', border: `1px solid ${ACC_THEME.border}`, fontSize: '13px', appearance: 'none', cursor: selectedHub ? 'pointer' : 'not-allowed' }}
                                onChange={(e) => setSelectedProject(e.target.value)}
                            >
                                <option value="">Select a project...</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.attributes?.name || p.name || p.id}</option>)}
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: ACC_THEME.textSecondary }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase' }}>Folder Scope (Required)</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {selectedProject && (
                                    <button 
                                        onClick={() => fetchFolders(selectedHub, selectedProject, false)} 
                                        style={{ background: 'none', border: 'none', color: ACC_THEME.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', padding: 0 }}
                                    >
                                        <RefreshCw size={10} className={isRefreshingFolders ? 'animate-spin' : ''} /> REFRESH
                                    </button>
                                )}
                            </div>
                        </div>
                        <div style={{ background: '#FFFFFF', borderRadius: '4px', border: `1px solid ${ACC_THEME.border}`, height: '250px', overflowY: 'auto', padding: '6px', position: 'relative' }}>
                            {!selectedProject ? (
                                <div style={{ fontSize: '12px', color: ACC_THEME.textSecondary, textAlign: 'center', padding: '40px 16px' }}>Select a project first</div>
                            ) : isRefreshingFolders ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="animate-pulse" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '16px', height: '16px', borderRadius: '3px', background: '#F1F5F9' }} />
                                            <div style={{ width: '16px', height: '16px', borderRadius: '3px', background: '#F1F5F9' }} />
                                            <div style={{ height: '12px', flex: 1, borderRadius: '4px', background: '#F1F5F9' }} />
                                        </div>
                                    ))}
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Loader2 className="animate-spin" size={24} color={ACC_THEME.primary} />
                                    </div>
                                </div>
                            ) : folderList.length === 0 ? (
                                <div style={{ fontSize: '12px', color: ACC_THEME.textSecondary, textAlign: 'center', padding: '40px 16px' }}>No folders found</div>
                            ) : (
                                folderList.map(folder => (
                                    <FolderTreeItem key={folder.id} folder={folder} />
                                ))
                            )}
                        </div>
                        <div style={{ fontSize: '10px', color: ACC_THEME.success, marginTop: '6px', fontStyle: 'italic', fontWeight: '700' }}>
                            {isRefreshingFolders ? "🔍 Discovering folder hierarchy..." : (selectedFolderIds.size === 0 ? "" : `${selectedFolderIds.size} folders selected`)}
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px', padding: '12px', background: 'rgba(6, 150, 215, 0.05)', borderRadius: '8px', border: '1px solid rgba(6, 150, 215, 0.1)', opacity: selectedFolderIds.size === 0 ? 0.5 : 1, pointerEvents: selectedFolderIds.size === 0 ? 'none' : 'auto', transition: 'opacity 0.3s' }}>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: ACC_THEME.primary, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                            Engine Connectivity Mode {selectedFolderIds.size === 0 && <span style={{ color: '#94a3b8', marginLeft: '4px' }}>(SELECT FOLDER FIRST)</span>}
                        </label>
                        <div style={{ display: 'flex', background: '#E2E8F0', borderRadius: '6px', padding: '2px', position: 'relative', height: '32px' }}>
                            <div 
                                onClick={() => setSyncMode('full')}
                                style={{ 
                                    flex: 1, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontSize: '9px', 
                                    letterSpacing: '0.5px',
                                    fontWeight: '800', 
                                    zIndex: 1, 
                                    cursor: 'pointer', 
                                    color: syncMode === 'full' ? 'white' : '#64748B',
                                    transition: 'color 0.3s',
                                    textTransform: 'uppercase'
                                }}
                            >
                                ACC + EXCEL
                            </div>
                            <div 
                                onClick={() => setSyncMode('acc')}
                                style={{ 
                                    flex: 1, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontSize: '9px', 
                                    letterSpacing: '0.5px',
                                    fontWeight: '800', 
                                    zIndex: 1, 
                                    cursor: 'pointer', 
                                    color: syncMode === 'acc' ? 'white' : '#64748B',
                                    transition: 'color 0.3s',
                                    textTransform: 'uppercase'
                                }}
                            >
                                ONLY ACC
                            </div>
                            <div style={{ 
                                position: 'absolute', 
                                top: '2px', 
                                left: syncMode === 'full' ? '2px' : 'calc(50% + 1px)', 
                                width: 'calc(50% - 3px)', 
                                height: 'calc(100% - 4px)', 
                                background: ACC_THEME.primary, 
                                borderRadius: '4px', 
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }} />
                        </div>
                    </div>

                    {syncMode === 'full' && (
                        <>
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ 
                                        display: 'block', 
                                        fontSize: '11px', 
                                        fontWeight: '700', 
                                        color: selectedFolderIds.size === 0 ? '#999' : ACC_THEME.textSecondary, 
                                        textTransform: 'uppercase' 
                                    }}>
                                        Source Data (Excel)
                                    </label>
                                    <button
                                        onClick={() => fetchExcelFiles(selectedHub, selectedProject, Array.from(selectedFolderIds))}
                                        disabled={!selectedProject || isRefreshingExcel || selectedFolderIds.size === 0}
                                        style={{ background: 'none', border: 'none', color: (isRefreshingExcel || selectedFolderIds.size === 0) ? '#999' : ACC_THEME.primary, cursor: (selectedProject && !isRefreshingExcel && selectedFolderIds.size > 0) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800' }}
                                    >
                                        <RefreshCw size={12} className={isRefreshingExcel ? 'animate-spin' : ''} style={{ animationDuration: '0.8s' }} />
                                        {isRefreshingExcel ? <span style={{ color: '#666' }}>SYNCING...</span> : 'REFRESH'}
                                    </button>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={selectedExcel}
                                        disabled={!selectedProject || selectedFolderIds.size === 0}
                                        style={{ 
                                            width: '100%', 
                                            padding: '10px 12px', 
                                            background: (selectedProject && selectedFolderIds.size > 0) ? 'white' : '#F3F4F6', 
                                            color: ACC_THEME.text, 
                                            borderRadius: '4px', 
                                            border: `1px solid ${ACC_THEME.border}`, 
                                            fontSize: '13px', 
                                            appearance: 'none', 
                                            cursor: (selectedProject && selectedFolderIds.size > 0) ? 'pointer' : 'not-allowed' 
                                        }}
                                        onChange={(e) => setSelectedExcel(e.target.value)}
                                    >
                                        <option value="">{selectedFolderIds.size === 0 ? "Select folders first..." : "Select data source..."}</option>
                                        {excelFiles.map(f => <option key={f.id} value={f.versionId}>{f.name} (V{f.version})</option>)}
                                    </select>
                                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: ACC_THEME.textSecondary }} />
                                </div>
                            </div>

                            {selectedExcel && (
                                <div style={{ marginBottom: '32px', padding: '16px', background: 'white', border: `1px solid ${ACC_THEME.border}`, borderRadius: '6px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '10px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase', marginBottom: '4px' }}>Source Version</div>
                                            <div style={{ fontSize: '14px', fontWeight: '800', color: ACC_THEME.text }}>
                                                V{getSelectedExcelDetails()?.version || '1'}
                                                <span style={{ marginLeft: '8px', fontSize: '10px', color: ACC_THEME.success, background: '#E6FFFA', padding: '2px 6px', borderRadius: '4px' }}>Verified</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={fetchExcelPreview}
                                            style={{ padding: '6px 10px', background: '#F8F9FA', border: `1px solid ${ACC_THEME.border}`, borderRadius: '4px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <FileText size={12} /> View Table
                                        </button>
                                    </div>
                                    <div style={{ fontSize: '11px', color: ACC_THEME.textSecondary, lineHeight: '1.4' }}>
                                        Use visual inspection to verify fields before engine synchronization.
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div style={{ marginTop: (syncMode === 'full' && selectedExcel) ? '0' : '32px' }}>
                        <button
                            onClick={() => {
                                console.log('[UI] Sync Clicked. State:', { selectedExcel, selectedProject, loading, syncMode });
                                startMatching();
                            }}
                            disabled={!selectedProject || (syncMode === 'full' && !selectedExcel) || loading}
                            style={{ width: '100%', padding: '12px', background: (selectedProject && (syncMode === 'acc' || selectedExcel) && !loading) ? ACC_THEME.primary : '#E5E7EB', color: 'white', border: 'none', borderRadius: '4px', cursor: (selectedProject && (syncMode === 'acc' || selectedExcel) && !loading) ? 'pointer' : 'not-allowed', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                            Sync Console
                        </button>
                        {syncMode === 'full' && !selectedExcel && selectedProject && (
                            <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '8px', textAlign: 'center', fontWeight: '700' }}>
                                PLEASE SELECT AN EXCEL FILE ABOVE
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ padding: '16px 24px', borderTop: `1px solid ${ACC_THEME.border}`, background: '#f8f9fa' }}>
                    <div 
                        onClick={() => setShowDocumentation(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', color: ACC_THEME.primary, fontSize: '11px', fontWeight: '800', cursor: 'pointer', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                    >
                        <HelpCircle size={14} />
                        <span>Operations Manual</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '11px', fontWeight: '600' }}>
                            <Shield size={14} />
                            <span>powered by APS</span>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                            v2.1.0 stable
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <header style={{ padding: '12px 32px', borderBottom: `1px solid ${ACC_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', minHeight: '64px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h1 style={{ fontSize: '18px', margin: 0, fontWeight: '500' }}>DWG Cloud Alter Engine / Assets</h1>
                        <span style={{ fontSize: '12px', color: ACC_THEME.textSecondary, borderLeft: `1px solid ${ACC_THEME.border}`, paddingLeft: '16px' }}> {status}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        {matches.length > 0 && (
                            <button
                                onClick={() => startMatching(true)}
                                disabled={loading}
                                style={{ padding: '8px 16px', background: 'white', color: ACC_THEME.text, border: `1px solid ${ACC_THEME.border}`, borderRadius: '4px', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: loading ? 'not-allowed' : 'pointer' }}
                            >
                                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Console
                            </button>
                        )}
                        
                        <button
                            onClick={() => setShowHistory(true)}
                            style={{ 
                                padding: '8px 16px', 
                                background: 'white', 
                                color: ACC_THEME.text, 
                                border: `1px solid ${ACC_THEME.border}`, 
                                borderRadius: '4px', 
                                fontWeight: '600', 
                                fontSize: '12px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                        >
                            <Activity size={14} color={ACC_THEME.primary} /> 
                            Operation History
                            {jobHistory.length > 0 && (
                                <span style={{ 
                                    position: 'absolute', 
                                    top: '-8px', 
                                    right: '-8px', 
                                    background: ACC_THEME.error, 
                                    color: 'white', 
                                    fontSize: '10px', 
                                    padding: '2px 6px', 
                                    borderRadius: '10px', 
                                    fontWeight: '800',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}>
                                    {jobHistory.length}
                                </span>
                            )}
                        </button>

                        <div
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', position: 'relative' }}
                        >
                            {user?.picture ? (
                                <img src={user.picture} style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1px solid ${ACC_THEME.border}`, objectFit: 'cover' }} alt="avatar" />
                            ) : (
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: ACC_THEME.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#1e293b' }}>{user?.name || 'Loading...'}</div>
                            </div>
                            <ChevronDown size={14} style={{ color: ACC_THEME.textSecondary }} />

                            {showProfileMenu && (
                                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '200px', background: 'white', borderRadius: '4px', border: `1px solid ${ACC_THEME.border}`, padding: '4px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', zIndex: 100 }}>
                                    <div style={{ padding: '12px', borderBottom: `1px solid ${ACC_THEME.border}`, marginBottom: '4px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '700' }}>{user?.name}</div>
                                        <div style={{ fontSize: '10px', color: ACC_THEME.textSecondary }}>{user?.email}</div>
                                    </div>
                                    <button onClick={() => window.location.href = '/api/auth/logout'} style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: ACC_THEME.error, display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                                        <LogOut size={14} /> End Active Session
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main style={{ height: 'calc(100vh - 64px)', flex: '1 1 auto', display: 'flex', flexDirection: 'column', background: '#FFFFFF', position: 'relative' }}>
                    {matches.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAFBFC', height: '100%', width: '100%' }}>
                            <div style={{ textAlign: 'center', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ background: 'white', padding: '40px', borderRadius: '50%', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', border: `1px solid ${ACC_THEME.border}`, width: '180px', height: '180px' }}>
                                    <Database size={80} style={{ color: ACC_THEME.textSecondary, opacity: 0.3 }} />
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: '900', color: ACC_THEME.text, margin: '0 0 16px' }}>Engine Standby</h3>
                                <p style={{ fontSize: '16px', color: ACC_THEME.textSecondary, lineHeight: '1.6', margin: 0 }}>
                                    The automation engine is ready. Select a project and excel source from the sidebar to establish a connection.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ border: `1px solid ${ACC_THEME.border}`, borderRadius: '4px', background: 'white' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: ACC_THEME.tableHeader }}>
                                        <th style={{ padding: '14px 24px', borderBottom: `1px solid ${ACC_THEME.border}`, width: '40px' }}>
                                            <div onClick={toggleSelectAll} style={{ cursor: 'pointer', color: selectedIndices.size > 0 ? ACC_THEME.primary : ACC_THEME.textSecondary }}>
                                                {selectedIndices.size === matches.filter(m => m.matchedFile).length && matches.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                            </div>
                                        </th>
                                        {syncMode === 'full' ? (
                                            <>
                                                <th onClick={() => handleSort('drawing')} style={{ padding: '14px 24px', borderBottom: `1px solid ${ACC_THEME.border}`, fontSize: '12px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase', cursor: 'pointer' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        Descriptor
                                                        {sortConfig.key === 'drawing' && (sortConfig.direction === 'asc' ? <ChevronRight size={12} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />)}
                                                    </div>
                                                </th>
                                                <th onClick={() => handleSort('cloud')} style={{ padding: '14px 24px', borderBottom: `1px solid ${ACC_THEME.border}`, fontSize: '12px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase', cursor: 'pointer' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        Linked Cloud Variant
                                                        {sortConfig.key === 'cloud' && (sortConfig.direction === 'asc' ? <ChevronRight size={12} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />)}
                                                    </div>
                                                </th>
                                            </>
                                        ) : (
                                            <th onClick={() => handleSort('cloud')} style={{ padding: '14px 24px', borderBottom: `1px solid ${ACC_THEME.border}`, fontSize: '12px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase', cursor: 'pointer' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    Identified Asset
                                                    {sortConfig.key === 'cloud' && (sortConfig.direction === 'asc' ? <ChevronRight size={12} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />)}
                                                </div>
                                            </th>
                                        )}
                                        {syncMode === 'full' && (
                                            <th onClick={() => handleSort('version')} style={{ padding: '14px 24px', borderBottom: `1px solid ${ACC_THEME.border}`, fontSize: '12px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase', width: '120px', cursor: 'pointer' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    File Version
                                                    {sortConfig.key === 'version' && (sortConfig.direction === 'asc' ? <ChevronRight size={12} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />)}
                                                </div>
                                            </th>
                                        )}
                                        <th style={{ padding: '14px 24px', borderBottom: `1px solid ${ACC_THEME.border}`, fontSize: '12px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase', textAlign: 'center' }}>Modify</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matches.map((m, idx) => (
                                        <tr key={idx} style={{ borderBottom: `1px solid ${ACC_THEME.border}`, background: selectedIndices.has(idx) ? '#F1F5F9' : 'transparent' }}>
                                            <td style={{ padding: '14px 24px' }}>
                                                <div
                                                    onClick={() => m.matchedFile && toggleSelect(idx)}
                                                    style={{ cursor: m.matchedFile ? 'pointer' : 'not-allowed', color: selectedIndices.has(idx) ? ACC_THEME.primary : ACC_THEME.textSecondary, opacity: m.matchedFile ? 1 : 0.2 }}
                                                >
                                                    {selectedIndices.has(idx) ? <CheckSquare size={18} /> : <Square size={18} />}
                                                </div>
                                            </td>
                                            {syncMode === 'full' && (
                                                <td style={{ padding: '14px 24px' }}>
                                                    <div
                                                        onClick={() => m.matchedFile && setActiveUrn(m.matchedFile.versionId)}
                                                        style={{ fontWeight: '600', color: m.matchedFile ? ACC_THEME.primary : ACC_THEME.text, cursor: m.matchedFile ? 'pointer' : 'default', fontSize: '14px' }}
                                                    >
                                                        {m.excelRow?.DrawingName}
                                                    </div>
                                                </td>
                                            )}
                                            <td style={{ padding: '14px 24px' }}>
                                                {m.matchedFile ? (
                                                    <div>
                                                        <div
                                                            onClick={() => setActiveUrn(m.matchedFile.versionId)}
                                                            style={{ color: ACC_THEME.text, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}
                                                        >
                                                            {m.matchedFile.name}
                                                        </div>
                                                        <div style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                            <Folder size={10} /> {m.matchedFile.folderPath || 'Project Root'}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                                                            {syncMode === 'full' && (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>SOURCE: ACC</span>
                                                                    <Database size={10} color="#0696D7" />
                                                                </div>
                                                            )}
                                                            <div 
                                                                onClick={(e) => { 
                                                                    e.stopPropagation(); 
                                                                    if (m.lastSyncDiff) {
                                                                        setSelectedDiffMatch(m);
                                                                        setShowDiffSummary(true);
                                                                    } else {
                                                                        setSelectedMatch(m);
                                                                    }
                                                                }}
                                                                style={{
                                                                    fontSize: '9px',
                                                                    fontWeight: '800',
                                                                    color: m.status === 'success' || m.status === 'extracted' ? '#059669' : m.status === 'failed' ? '#dc2626' : m.status === 'idle' ? '#94a3b8' : '#2563eb',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    textTransform: 'uppercase',
                                                                    cursor: 'pointer',
                                                                    background: m.status !== 'idle' ? '#f1f5f9' : 'transparent',
                                                                    padding: m.status !== 'idle' ? '2px 8px' : '0',
                                                                    borderRadius: '6px'
                                                                }}
                                                            >
                                                                {(m.status === 'executing' || m.status === 'starting' || m.status === 'finalizing' || m.status === 'extracting') && <Loader2 size={10} className="animate-spin" />}
                                                                {m.status === 'idle' ? '' : (
                                                                    m.status === 'starting' ? 'Preparing' :
                                                                    m.status === 'executing' ? 'Syncing' :
                                                                    m.status === 'finalizing' ? 'Writing' :
                                                                    m.status === 'extracting' ? 'Reading' :
                                                                    m.status === 'extracted' ? 'Success' :
                                                                    m.status === 'success' ? 'Synced' :
                                                                    m.status === 'failed' ? 'Failed' : ''
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ color: ACC_THEME.error, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                                                        <AlertCircle size={14} /> DISCONNECTED
                                                    </div>
                                                )}
                                            </td>
                                            {syncMode === 'full' && (
                                                <td style={{ padding: '14px 24px' }}>
                                                    {m.matchedFile ? (
                                                        <span style={{ 
                                                            fontSize: '11px', 
                                                            background: '#f1f5f9', 
                                                            color: '#475569', 
                                                            padding: '4px 10px', 
                                                            borderRadius: '6px', 
                                                            fontWeight: '800',
                                                            border: '1px solid #e2e8f0',
                                                            fontFamily: 'Roboto Mono, monospace'
                                                        }}>
                                                            V{m.matchedFile.version || '1'}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                            )}
                                            <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    {syncMode === 'full' && (
                                                        <button
                                                            disabled={!m.matchedFile || m.status !== 'idle' && m.status !== 'success'}
                                                            onClick={(e) => { e.stopPropagation(); handleActionClick(idx, 'excel', 'drawing'); }}
                                                            style={{ 
                                                                padding: '8px 14px', 
                                                                borderRadius: '8px', 
                                                                background: 'white', 
                                                                border: `1px solid ${ACC_THEME.border}`, 
                                                                color: '#0f172a', 
                                                                fontWeight: '800', 
                                                                fontSize: '10px', 
                                                                cursor: m.matchedFile ? 'pointer' : 'not-allowed', 
                                                                transition: 'all 0.2s',
                                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px'
                                                            }}
                                                            title="Update Drawing & ACC Attributes from Spreadsheet"
                                                        >
                                                            <FileText size={12} color={ACC_THEME.primary} /> FROM SPREADSHEET
                                                        </button>
                                                    )}
                                                    <button
                                                        disabled={!m.matchedFile || m.status !== 'idle' && m.status !== 'success'}
                                                        onClick={(e) => { e.stopPropagation(); handleActionClick(idx, 'acc', 'drawing'); }}
                                                        style={{ 
                                                            padding: '8px 14px', 
                                                            borderRadius: '8px', 
                                                            background: 'white', 
                                                            border: `1px solid ${ACC_THEME.border}`, 
                                                            color: '#0f172a', 
                                                            fontWeight: '800', 
                                                            fontSize: '10px', 
                                                            cursor: m.matchedFile ? 'pointer' : 'not-allowed', 
                                                            transition: 'all 0.2s',
                                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}
                                                        title={syncMode === 'acc' ? "Update Drawing from ACC Attributes" : "Update Drawing & Spreadsheet from ACC Attributes"}
                                                    >
                                                        <Shield size={12} color="#059669" /> FROM ACC ATTRIBUTES
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>

                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Roboto+Mono&display=swap');
                    html, body, #root { height: 100vh!important; margin: 0!important; padding: 0!important; overflow: hidden!important; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .animate-spin { animation: spin 1s linear infinite; }
                    ::-webkit-scrollbar { width: 8px; }
                    ::-webkit-scrollbar-track { background: #F3F4F6; }
                    ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 4px; }
                `}</style>
            </div>
        </div>
    );
};

export default App;

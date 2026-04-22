import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertCircle, Play, Loader2, Database, Search, Layout, LogOut, ChevronDown, RefreshCw, CheckSquare, Square, Zap, Globe, HardDrive, Eye, X, Shield } from 'lucide-react';

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
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Cloud Asset Inspection Mode</h3>
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



const UnifiedSyncModal = ({ syncModalConfig, setSyncModalConfig, selectedProject, selectedExcel, triggerUpdate, fetchExcelFiles, startMatching }) => {
    const { show, mode, source, target, match, index } = syncModalConfig;
    if (!show || !match) return null;

    const [previewData, setPreviewData] = useState(null);
    const [isFetching, setIsFetching] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState('pending'); // pending, syncing, success, error

    useEffect(() => {
        fetchPreview();
    }, [mode]);

    const fetchPreview = async () => {
        setIsFetching(true);
        try {
            const res = await axios.post('/api/automation/preview-sync', {
                projectId: selectedProject,
                drawingVersionId: match.matchedFile.versionId,
                excelVersionId: selectedExcel,
                drawingName: match.excelRow.DrawingName,
                sourceType: source,
                targetType: target
            });
            setPreviewData(res.data);
        } catch (e) {
            console.error('Preview Error:', e);
        } finally {
            setIsFetching(false);
        }
    };

    const handleExecuteSync = async () => {
        setIsSyncing(true);
        setSyncStatus('syncing');
        try {
            if (target === 'drawing') {
                // Logic for DA Push (Spreadsheet -> Drawing or ACC Attributes -> Drawing)
                // Ensure we merge ACC Attributes attributes dynamically while retaining DA routing params like BlockName and LayoutName
                const sourceValues = source === 'excel' ? match.excelRow : { ...match.excelRow, ...previewData.sourceData };
                const newVersionId = await triggerUpdate({ ...match, excelRow: sourceValues }, index);

                // If source was ACC, we might also want to update the local match state?
                // For now, DA engine handled the drawing update.
            } else if (target === 'acc') {
                // Drawing -> ACC Attributes
                const attributesToPush = previewData.sourceData; // Extracted Drawing data
                await axios.post('/api/automation/push-attributes', {
                    projectId: selectedProject,
                    versionId: match.matchedFile.versionId,
                    attributes: attributesToPush
                });
            } else if (target === 'excel') {
                // Drawing -> Excel
                const updates = previewData.diff.filter(d => d.changed).map(d => ({ key: d.key, proposed: d.source }));
                await axios.post('/api/automation/commit-extract', {
                    projectId: selectedProject,
                    excelVersionId: selectedExcel,
                    drawingName: match.excelRow.DrawingName,
                    updates
                });
                // Refresh excel and matches
                fetchExcelFiles(selectedProject);
                startMatching(true);
            }
            setSyncStatus('success');
            // Re-match after a short delay to ensure backend cache is ready
            setTimeout(() => startMatching(true), 1000);
        } catch (e) {
            setSyncStatus('error');
        } finally {
            setIsSyncing(false);
        }
    };

    const getSourceLabel = (s) => s === 'excel' ? 'Spreadsheet' : (s === 'acc' ? 'ACC Attributes' : 'Drawing Data');
    const getTargetLabel = (t) => t === 'drawing' ? 'AutoCAD Drawing' : (t === 'excel' ? 'Spreadsheet' : 'ACC Attributes');

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500 }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.95)', width: '90%', maxWidth: '850px', maxHeight: '85vh', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.5)' }}>
                {/* Header */}
                <div style={{ padding: '24px 32px', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderBottom: `1px solid ${ACC_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#1a1a1a' }}>Stage Synchronization</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: ACC_THEME.textSecondary }}>{getSourceLabel(source)} &rarr; {getTargetLabel(target)} for {match.excelRow.DrawingName}</p>
                    </div>
                    {!isSyncing && <button onClick={() => setSyncModalConfig(c => ({ ...c, show: false }))} style={{ background: 'white', border: '1px solid #e0e0e0', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}><X size={18} /></button>}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
                    {isFetching ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: '60px' }}>
                            <RefreshCw size={40} className="animate-spin" color={ACC_THEME.primary} style={{ opacity: 0.3 }} />
                            <p style={{ marginTop: '20px', fontSize: '14px', color: '#999', fontWeight: '600' }}>Interrogating Data Clusters...</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ flex: 1, padding: '16px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}>
                                    <div style={{ fontSize: '10px', color: '#999', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Source Channel</div>
                                    <div style={{ fontWeight: '700', color: ACC_THEME.primary }}>{getSourceLabel(source)}</div>
                                </div>
                                <div style={{ flex: 1, padding: '16px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}>
                                    <div style={{ fontSize: '10px', color: '#999', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Target Destination</div>
                                    <div style={{ fontWeight: '700', color: ACC_THEME.primary }}>{getTargetLabel(target)}</div>
                                </div>
                                <div style={{ flex: 1, padding: '16px', background: syncStatus === 'success' ? '#ECFDF5' : (syncStatus === 'error' ? '#FDE8E8' : '#f8f9fa'), borderRadius: '12px', border: '1px solid #eee' }}>
                                    <div style={{ fontSize: '10px', color: '#999', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Action Status</div>
                                    <div style={{ fontWeight: '700', color: syncStatus === 'success' ? '#059669' : (syncStatus === 'error' ? '#D32F2F' : '#666') }}>
                                        {syncStatus === 'pending' && 'Awaiting Confirmation'}
                                        {syncStatus === 'syncing' && 'In Transmission...'}
                                        {syncStatus === 'success' && 'Synchronization Complete'}
                                        {syncStatus === 'error' && 'Process Interrupted'}
                                    </div>
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa' }}>
                                        <th style={{ padding: '12px 16px', borderBottom: '2px solid #eee', textAlign: 'left' }}>Attribute Tag</th>
                                        <th style={{ padding: '12px 16px', borderBottom: '2px solid #eee', textAlign: 'left' }}>{target === 'drawing' ? 'Value to Push' : 'Source Value'}</th>
                                        {target !== 'drawing' && <th style={{ padding: '12px 16px', borderBottom: '2px solid #eee', textAlign: 'left' }}>Target State</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData?.diff.map((row, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: (row.changed || target === 'drawing') ? '#FFFBEB' : 'transparent' }}>
                                            <td style={{ padding: '10px 16px', fontWeight: '600' }}>{row.key}</td>
                                            <td style={{ padding: '10px 16px', color: (row.changed || target === 'drawing') ? '#B45309' : '#666' }}>{row.source || <span style={{ opacity: 0.3 }}>&mdash;</span>}</td>
                                            {target !== 'drawing' && (
                                                <td style={{ padding: '10px 16px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {row.target || <span style={{ opacity: 0.3 }}>&mdash;</span>}
                                                    {row.changed && <span style={{ fontSize: '8px', background: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>PENDING CHANGE</span>}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '24px 32px', background: 'white', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        disabled={isSyncing}
                        onClick={() => setSyncModalConfig(c => ({ ...c, show: false }))}
                        style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid #e0e0e0', background: 'white', cursor: isSyncing ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px' }}
                    >
                        {syncStatus === 'success' ? 'FINISH' : 'CANCEL'}
                    </button>
                    {syncStatus !== 'success' && (
                        <button
                            disabled={isSyncing || isFetching}
                            onClick={handleExecuteSync}
                            style={{
                                padding: '10px 32px',
                                borderRadius: '10px',
                                border: 'none',
                                background: isSyncing ? '#eee' : ACC_THEME.primary,
                                color: 'white',
                                cursor: (isSyncing || isFetching) ? 'not-allowed' : 'pointer',
                                fontWeight: '800',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: isSyncing ? 'none' : '0 10px 20px -5px rgba(6, 150, 215, 0.3)'
                            }}
                        >
                            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                            {isSyncing ? 'TRANSMITTING...' : 'DISPATCH SYNCHRONIZATION'}
                        </button>
                    )}
                </div>
            </div>
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
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Source Data Inspector</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: ACC_THEME.textSecondary }}>Previewing: {getSelectedExcelDetails()?.name || 'Dataset'}</p>
                    </div>
                    <button onClick={() => setShowExcelPreview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', opacity: 0.5 }}>&times;</button>
                </div>

                <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                    {previewLoading ? (
                        <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                            <Loader2 className="animate-spin" size={32} color={ACC_THEME.primary} />
                            <p style={{ fontSize: '14px', color: ACC_THEME.textSecondary }}>Interrogating spreadsheet data...</p>
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

// ... (rest of App logic remains but integrated)



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
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('Engine Standby');
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [activeUrn, setActiveUrn] = useState(null);
    const [selectedIndices, setSelectedIndices] = useState(new Set());
    const [isInitializing, setIsInitializing] = useState(true);

    // Excel Preview State
    const [excelPreviewData, setExcelPreviewData] = useState(null);
    const [showExcelPreview, setShowExcelPreview] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [isRefreshingExcel, setIsRefreshingExcel] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [diffData, setDiffData] = useState(null);
    const [activeSyncIdx, setActiveSyncIdx] = useState(null);
    const [selectedForPush, setSelectedForPush] = useState([]);
    const [syncModalConfig, setSyncModalConfig] = useState({ show: false, mode: '', source: '', target: '', match: null, index: null });

    useEffect(() => {
        checkAuth();
    }, []);

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

    const [bulkSyncConfig, setBulkSyncConfig] = useState({ show: false, selected: [] });

    const bulkUpdate = () => {
        const indices = Array.from(selectedIndices);
        const selected = indices.map(idx => ({ index: idx, match: matches[idx] })).filter(m => m.match.matchedFile);
        if (selected.length === 0) return;
        setBulkSyncConfig({ show: true, selected });
    };

    const confirmBulkSync = async (sourceType) => {
        const { selected } = bulkSyncConfig;
        setBulkSyncConfig({ show: false, selected: [] });
        setSelectedIndices(new Set()); // Clear selection

        for (const item of selected) {
            try {
                if (sourceType === 'excel') {
                    await triggerUpdate(item.match, item.index);
                } else if (sourceType === 'acc') {
                    await triggerACCPush(item.match, item.index);
                }
            } catch (e) {
                console.error(`Bulk update failed for ${item.match.excelRow.DrawingName}`, e);
            }
        }
    };

    const BulkSyncChoiceModal = () => {
        if (!bulkSyncConfig.show) return null;
        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                <div style={{ background: 'white', width: '450px', borderRadius: '16px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ background: '#E0F2FE', padding: '10px', borderRadius: '12px' }}>
                            <Zap size={24} color={ACC_THEME.primary} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Bulk Synchronization</h3>
                    </div>
                    <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                        Choose the data source for updating the title blocks of the <b>{bulkSyncConfig.selected.length}</b> selected drawings.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            onClick={() => confirmBulkSync('excel')}
                            style={{ padding: '16px', background: 'white', border: `1px solid ${ACC_THEME.border}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}
                            onMouseOver={e => e.currentTarget.style.borderColor = ACC_THEME.primary}
                            onMouseOut={e => e.currentTarget.style.borderColor = ACC_THEME.border}
                        >
                            <FileText size={20} color={ACC_THEME.primary} />
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '14px' }}>Update from Spreadsheet</div>
                                <div style={{ fontSize: '11px', color: '#999' }}>Sync AutoCAD tags using values from the matched Excel rows.</div>
                            </div>
                        </button>
                        <button
                            onClick={() => confirmBulkSync('acc')}
                            style={{ padding: '16px', background: 'white', border: `1px solid ${ACC_THEME.border}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}
                            onMouseOver={e => e.currentTarget.style.borderColor = ACC_THEME.primary}
                            onMouseOut={e => e.currentTarget.style.borderColor = ACC_THEME.border}
                        >
                            <Database size={20} color={ACC_THEME.primary} />
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '14px' }}>Update from ACC Attributes</div>
                                <div style={{ fontSize: '11px', color: '#999' }}>Sync AutoCAD tags directly from Docs platform custom attributes.</div>
                            </div>
                        </button>
                    </div>
                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => setBulkSyncConfig({ show: false, selected: [] })}
                            style={{ padding: '10px 20px', background: 'none', border: 'none', color: '#999', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const openSyncModal = (match, index, source, target) => {
        setSyncModalConfig({
            show: true,
            mode: `${source}To${target}`,
            source,
            target,
            match,
            index
        });
    };

    const getSelectedExcelDetails = () => {
        return excelFiles.find(f => f.versionId === selectedExcel);
    };

    // --- UI Components ---
    const checkAuth = async () => {
        try {
            const res = await axios.get('/api/auth/profile');
            if (res.data.status === 'Logged In') {
                setIsLoggedIn(true);
                setUser(res.data);
                initDiscovery();
            } else {
                setIsLoggedIn(false);
                setIsInitializing(false);
            }
        } catch (e) {
            setIsLoggedIn(false);
            setIsInitializing(false);
        }
    };

    const initDiscovery = async () => {
        try {
            const hubsRes = await axios.get('/api/acc/hubs');
            setHubs(hubsRes.data);

            const prefRes = await axios.get('/api/user/preferences');
            const prefs = prefRes.data;

            if (prefs.hubId) {
                setSelectedHub(prefs.hubId);
                const projRes = await axios.get(`/api/acc/projects?hubId=${prefs.hubId}`);
                setProjects(projRes.data);

                if (prefs.projectId) {
                    setSelectedProject(prefs.projectId);
                    const excelRes = await axios.get(`/api/acc/excel-files?projectId=${prefs.projectId}`);
                    setExcelFiles(excelRes.data);

                    if (prefs.excelVersionId) {
                        setSelectedExcel(prefs.excelVersionId);
                    }
                }
            }
        } catch (e) {
            console.error('Discovery Init Error:', e);
        } finally {
            setIsInitializing(false);
        }
    };

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

    useEffect(() => {
        if (!isInitializing && selectedProject) {
            fetchExcelFiles(selectedProject);
            savePreference({ projectId: selectedProject, excelVersionId: '' });
            setSelectedExcel('');
            setMatches([]);
        }
    }, [selectedProject]);

    const fetchProjects = async (hubId) => {
        try {
            const res = await axios.get(`/api/acc/projects?hubId=${hubId}`);
            setProjects(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchExcelFiles = async (projectId) => {
        if (!projectId) return;
        setIsRefreshingExcel(true);
        try {
            // Force 1.5s delay to make spin very obvious
            await new Promise(r => setTimeout(r, 1500));
            const res = await axios.get(`/api/acc/excel-files?projectId=${projectId}`);
            const newFiles = res.data;
            setExcelFiles(newFiles);

            // Auto-update selectedExcel if the current file has a new version
            if (selectedExcel) {
                const currentFile = newFiles.find(f => f.versionId === selectedExcel);
                if (!currentFile) {
                    // Find by name if versionId changed
                    const oldFileName = excelFiles.find(f => f.versionId === selectedExcel)?.name;
                    const updatedFile = newFiles.find(f => f.name === oldFileName);
                    if (updatedFile) {
                        console.log(`[UI] Auto-pivoting to new Excel version: ${updatedFile.versionId}`);
                        setSelectedExcel(updatedFile.versionId);
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

    const startMatching = async (isRefresh = false) => {
        if (!selectedExcel || !selectedProject) return;
        setLoading(true);
        setStatus(isRefresh ? 'Synchronizing project state...' : 'Orchestrating asset alignment...');

        // Don't clear the UI for a simple refresh to avoid flickering
        if (!isRefresh) {
            setMatches([]);
            setSelectedIndices(new Set());
        }

        try {
            const res = await axios.post('/api/automation/match', {
                hubId: selectedHub,
                projectId: selectedProject,
                excelVersionId: selectedExcel
            });
            setMatches(res.data.map(m => ({ ...m, status: 'idle' })));
            setStatus(`Console Synced. Found ${res.data.filter(m => m.matchedFile).length} identified variants.`);
        } catch (e) {
            setStatus('Alignment failed: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const triggerACCPush = async (match, index) => {
        setMatches(prev => { const next = [...prev]; next[index].status = 'starting'; return next; });
        try {
            const previewRes = await axios.post('/api/automation/preview-sync', {
                projectId: selectedProject,
                drawingVersionId: match.matchedFile.versionId,
                excelVersionId: selectedExcel,
                drawingName: match.excelRow.DrawingName,
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

    const triggerUpdate = (match, index) => {
        return new Promise(async (resolve, reject) => {
            if (!match.matchedFile) return resolve();

            setMatches(prev => {
                const next = [...prev];
                next[index].status = 'starting';
                next[index].logs = [{ time: new Date().toISOString(), message: 'Transmitting update instructions...' }];
                return next;
            });

            try {
                const res = await axios.post('/api/automation/update', {
                    projectId: selectedProject,
                    versionId: match.matchedFile.versionId,
                    excelVersionId: selectedExcel,
                    excelRow: match.excelRow
                });

                const workItemId = res.data.workItemId;
                setMatches(prev => {
                    const next = [...prev];
                    next[index].workItemId = workItemId;
                    next[index].status = 'executing';
                    return next;
                });

                pollStatus(workItemId, index, (finalStatus, finalVersionId) => {
                    if (finalStatus === 'success') resolve(finalVersionId);
                    else reject(new Error('Push failed during execution'));
                });
            } catch (e) {
                setMatches(prev => {
                    const next = [...prev];
                    next[index].status = 'failed';
                    next[index].logs.push({ time: new Date().toISOString(), message: 'Transmission Error: ' + e.message });
                    return next;
                });
                reject(e);
            }
        });
    };

    const triggerOmniSync = async (match, index) => {
        if (!match.matchedFile) return;

        setMatches(prev => {
            const next = [...prev];
            next[index].status = 'extracting';
            next[index].logs = [{ time: new Date().toISOString(), message: 'Interrogating Metadata' }];
            return next;
        });

        try {
            const res = await axios.post('/api/automation/preview-extract', {
                projectId: selectedProject,
                drawingVersionId: match.matchedFile.versionId,
                excelVersionId: selectedExcel,
                drawingName: match.excelRow.DrawingName
            });

            setDiffData({
                drawingName: match.excelRow.DrawingName,
                rows: res.data.diff
            });
            setActiveSyncIdx(index);
            setShowReviewModal(true);

            setMatches(prev => {
                const next = [...prev];
                next[index].status = 'idle';
                next[index].logs.push({ time: new Date().toISOString(), message: 'Preview generated. Awaiting user review...' });
                return next;
            });
        } catch (e) {
            setMatches(prev => {
                const next = [...prev];
                next[index].status = 'failed';
                const errMsg = e.response?.data?.developerMessage || e.response?.data?.message || (typeof e.response?.data === 'string' ? e.response?.data : JSON.stringify(e.response?.data)) || e.message;
                next[index].logs.push({ time: new Date().toISOString(), message: 'Extraction Error: ' + errMsg });
                return next;
            });
        }
    };

    const confirmReverseUpdate = async () => {
        const index = activeSyncIdx;
        const match = matches[index];
        setShowReviewModal(false);

        setMatches(prev => {
            const next = [...prev];
            next[index].status = 'finalizing';
            next[index].logs.push({ time: new Date().toISOString(), message: 'Review approved. Finalizing Excel write-back...' });
            return next;
        });

        try {
            const commitRes = await axios.post('/api/automation/commit-extract', {
                projectId: selectedProject,
                excelVersionId: selectedExcel,
                drawingName: match.excelRow.DrawingName,
                updates: diffData.rows.filter(r => r.changed)
            });

            setMatches(prev => {
                const next = [...prev];
                next[index].status = 'extracted';
                next[index].logs.push({ time: new Date().toISOString(), message: 'Success! Excel version ' + commitRes.data.newExcelVersion + ' created and committed to ACC.' });
                return next;
            });

            setTimeout(() => fetchExcelFiles(selectedProject), 2000);
        } catch (e) {
            setMatches(prev => {
                const next = [...prev];
                next[index].status = 'failed';
                next[index].logs.push({ time: new Date().toISOString(), message: 'Commit Error: ' + (e.response?.data || e.message) });
                return next;
            });
        }
    };

    const pollStatus = async (id, index, callback) => {
        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`/api/automation/status/${id}`);
                const { status, logs, committed, downloadUrl, newVersion } = res.data;

                if (status === 'finished' || status === 'failed' || status === 'cancelled') {
                    clearInterval(interval);

                    setMatches(prev => {
                        const newMatches = [...prev];
                        const baseId = newMatches[index].matchedFile.versionId.split('?version=')[0];
                        const finalVersionId = newVersion ? `${baseId}?version=${newVersion}` : newMatches[index].matchedFile.versionId;

                        let displayStatus = status === 'finished' ? 'success' : status;
                        newMatches[index].status = displayStatus;
                        newMatches[index].logs = logs;
                        newMatches[index].committed = committed;
                        if (newVersion) {
                            newMatches[index].matchedFile.version = newVersion;
                            newMatches[index].matchedFile.versionId = finalVersionId;
                            if (activeUrn && activeUrn.includes(baseId)) setActiveUrn(finalVersionId);
                        }
                        newMatches[index].downloadUrl = downloadUrl;

                        // Trigger callback with correct values
                        if (callback) callback(status === 'finished' ? 'success' : 'failed', finalVersionId);

                        return newMatches;
                    });
                } else {
                    setMatches(prev => {
                        const newMatches = [...prev];
                        let displayStatus = status === 'inprogress' ? 'executing' : (status === 'committing' ? 'finalizing' : status);
                        newMatches[index].status = displayStatus;
                        newMatches[index].logs = logs;
                        newMatches[index].committed = committed;
                        newMatches[index].downloadUrl = downloadUrl;
                        return newMatches;
                    });
                }
            } catch (e) {
                clearInterval(interval);
                if (callback) callback('failed');
            }
        }, 3000);
    };



    const toggleSelect = (index) => {
        setSelectedIndices(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIndices.size === matches.filter(m => m.matchedFile).length && matches.length > 0) {
            setSelectedIndices(new Set());
        } else {
            const next = new Set();
            matches.forEach((m, i) => m.matchedFile && next.add(i));
            setSelectedIndices(next);
        }
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

    if (!isLoggedIn) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' }}>
                <div style={{ background: 'white', padding: '60px', borderRadius: '8px', border: `1px solid ${ACC_THEME.border}`, width: '400px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ background: ACC_THEME.primary, width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <Globe size={32} color="white" />
                    </div>
                    <h1 style={{ color: ACC_THEME.text, margin: '0 0 8px', fontSize: '24px', fontWeight: '700' }}>Cloud Alter Engine</h1>
                    <p style={{ color: ACC_THEME.textSecondary, margin: '0 0 40px', fontSize: '14px' }}>Enterprise Automation Console</p>
                    <button
                        onClick={() => window.location.href = `/api/auth/login?v=${Date.now()}`}
                        style={{ width: '100%', padding: '14px', background: ACC_THEME.primary, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
                    >
                        Sign in to Hub Control
                    </button>

                </div>
            </div>
        );
    }
    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: ACC_THEME.bg, color: ACC_THEME.text, fontFamily: "'Inter', 'Segoe UI', sans-serif", overflow: 'hidden' }}>
            {selectedMatch && <StatusModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />}
            {activeUrn && <APSViewer versionId={activeUrn} onClose={() => setActiveUrn(null)} />}
            <BulkSyncChoiceModal />
            <UnifiedSyncModal
                syncModalConfig={syncModalConfig}
                setSyncModalConfig={setSyncModalConfig}
                selectedProject={selectedProject}
                selectedExcel={selectedExcel}
                triggerUpdate={triggerUpdate}
                fetchExcelFiles={fetchExcelFiles}
                startMatching={startMatching}
            /><ExcelPreviewModal showExcelPreview={showExcelPreview} setShowExcelPreview={setShowExcelPreview} excelPreviewData={excelPreviewData} previewLoading={previewLoading} getSelectedExcelDetails={getSelectedExcelDetails} />

            {/* Sidebar */}
            <div style={{ width: '300px', background: ACC_THEME.sidebar, borderRight: `1px solid ${ACC_THEME.border}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px', borderBottom: `1px solid ${ACC_THEME.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: ACC_THEME.primary, padding: '6px', borderRadius: '6px' }}>
                        <Zap size={22} color="white" />
                    </div>
                    <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '700', color: ACC_THEME.text }}>Cloud Alter</h2>
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
                                {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
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
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: ACC_THEME.textSecondary }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase' }}>Source Data (Excel)</label>
                            <button
                                onClick={() => fetchExcelFiles(selectedProject)}
                                disabled={!selectedProject || isRefreshingExcel}
                                style={{ background: 'none', border: 'none', color: isRefreshingExcel ? '#999' : ACC_THEME.primary, cursor: (selectedProject && !isRefreshingExcel) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800' }}
                            >
                                <RefreshCw size={12} className={isRefreshingExcel ? 'animate-spin' : ''} style={{ animationDuration: '0.8s' }} />
                                {isRefreshingExcel ? <span style={{ color: '#666' }}>SYNCING...</span> : 'REFRESH'}
                            </button>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={selectedExcel}
                                disabled={!selectedProject}
                                style={{ width: '100%', padding: '10px 12px', background: selectedProject ? 'white' : '#F3F4F6', color: ACC_THEME.text, borderRadius: '4px', border: `1px solid ${ACC_THEME.border}`, fontSize: '13px', appearance: 'none', cursor: selectedProject ? 'pointer' : 'not-allowed' }}
                                onChange={(e) => setSelectedExcel(e.target.value)}
                            >
                                <option value="">Select data source...</option>
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

                    <div style={{ marginTop: selectedExcel ? '0' : '32px' }}>
                        <button
                            onClick={startMatching}
                            disabled={!selectedExcel || loading}
                            style={{ width: '100%', padding: '12px', background: selectedExcel ? ACC_THEME.primary : '#E5E7EB', color: 'white', border: 'none', borderRadius: '4px', cursor: selectedExcel ? 'pointer' : 'not-allowed', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                            Sync Console
                        </button>
                    </div>
                </div>

                {/* Footer Branding Area */}
                <div style={{ padding: '16px 24px', borderTop: `1px solid ${ACC_THEME.border}`, background: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '11px', fontWeight: '600' }}>
                        <Shield size={14} />
                        <span>powered by Autodesk Platform Services</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                        v2.0.4 stable
                    </div>
                </div>
            </div>

            {/* Content area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <header style={{ padding: '12px 32px', borderBottom: `1px solid ${ACC_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', minHeight: '64px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h1 style={{ fontSize: '18px', margin: 0, fontWeight: '500' }}>Cloud Alter Engine / Assets</h1>
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

                        {selectedIndices.size > 0 && (
                            <button
                                onClick={bulkUpdate}
                                style={{ padding: '8px 20px', background: ACC_THEME.primary, color: 'white', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                            >
                                <Play size={14} fill="white" /> Dispatch Updates ({selectedIndices.size})
                            </button>
                        )}

                        <div
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', position: 'relative' }}
                        >
                            <img src={user?.picture} style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1px solid ${ACC_THEME.border}` }} alt="avatar" />
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
                                        <th style={{ padding: '14px 24px', borderBottom: `1px solid ${ACC_THEME.border}`, fontSize: '12px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase' }}>Descriptor</th>
                                        <th style={{ padding: '14px 24px', borderBottom: `1px solid ${ACC_THEME.border}`, fontSize: '12px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase' }}>Linked Cloud Variant</th>
                                        <th style={{ padding: '14px 24px', borderBottom: `1px solid ${ACC_THEME.border}`, fontSize: '12px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase', width: '180px' }}>Sync Status</th>
                                        <th style={{ padding: '14px 24px', borderBottom: `1px solid ${ACC_THEME.border}`, fontSize: '12px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase', textAlign: 'center' }}>Modify Drawing</th>
                                        <th style={{ padding: '14px 24px', borderBottom: `1px solid ${ACC_THEME.border}`, fontSize: '12px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase', textAlign: 'center' }}>Modify Source</th>
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
                                            <td style={{ padding: '14px 24px' }}>
                                                <div
                                                    onClick={() => m.matchedFile && setActiveUrn(m.matchedFile.versionId)}
                                                    style={{ fontWeight: '600', color: m.matchedFile ? ACC_THEME.primary : ACC_THEME.text, cursor: m.matchedFile ? 'pointer' : 'default', fontSize: '14px' }}
                                                >
                                                    {m.excelRow.DrawingName}
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 24px' }}>
                                                {m.matchedFile ? (
                                                    <div>
                                                        <div
                                                            onClick={() => setActiveUrn(m.matchedFile.versionId)}
                                                            style={{ color: ACC_THEME.text, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}
                                                        >
                                                            {m.matchedFile.name}
                                                            <span style={{ fontSize: '10px', background: ACC_THEME.pillBg, color: ACC_THEME.pillText, padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                                                                V{m.matchedFile.version || '1'}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>SOURCE: ACC Attributes</span>
                                                            <Database size={12} color="#0696D7" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ color: ACC_THEME.error, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                                                        <AlertCircle size={14} /> DISCONNECTED
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '14px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        padding: '6px 14px',
                                                        borderRadius: '6px',
                                                        fontSize: '10px',
                                                        fontWeight: '800',
                                                        background: m.status === 'success' || m.status === 'extracted' ? '#DEF7EC' : m.status === 'failed' ? '#FDE8E8' : m.status === 'idle' ? '#F3F4F6' : '#E1EFFE',
                                                        color: m.status === 'success' || m.status === 'extracted' ? '#03543F' : m.status === 'failed' ? '#9B1C1C' : m.status === 'idle' ? '#4B5563' : '#1E429F',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em'
                                                    }}>
                                                        {(m.status === 'executing' || m.status === 'starting' || m.status === 'finalizing' || m.status === 'extracting') && <Loader2 size={12} className="animate-spin" />}
                                                        {m.status === 'idle' && 'IDLE'}
                                                        {m.status === 'starting' && 'Preparing Engine'}
                                                        {m.status === 'executing' && 'Transmitting CAD Data'}
                                                        {m.status === 'finalizing' && 'Committing to Cloud'}
                                                        {m.status === 'extracting' && 'Interrogating Metadata'}
                                                        {m.status === 'extracted' && 'Capture Success'}
                                                        {m.status === 'success' && 'Update Complete'}
                                                        {m.status === 'failed' && 'Sync Interrupted'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button
                                                        disabled={!m.matchedFile || m.status !== 'idle' && m.status !== 'success'}
                                                        onClick={(e) => { e.stopPropagation(); triggerUpdate({ ...m, excelRow: m.excelRow }, idx); }}
                                                        style={{ padding: '6px 10px', borderRadius: '4px', background: 'white', border: `1px solid ${ACC_THEME.border}`, color: ACC_THEME.text, fontWeight: '700', fontSize: '9px', cursor: m.matchedFile ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                                                        title="Push Spreadsheet values into Drawing"
                                                    >
                                                        FROM SPREADSHEET
                                                    </button>
                                                    <button
                                                        disabled={!m.matchedFile || m.status !== 'idle' && m.status !== 'success'}
                                                        onClick={(e) => { e.stopPropagation(); triggerACCPush(m, idx); }}
                                                        style={{ padding: '6px 10px', borderRadius: '4px', background: 'white', border: `1px solid ${ACC_THEME.border}`, color: ACC_THEME.text, fontWeight: '700', fontSize: '9px', cursor: m.matchedFile ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                                                        title="Push ACC Attribute values into Drawing"
                                                    >
                                                        FROM ACC ATTRIBUTES
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button
                                                        disabled={!m.matchedFile || m.status !== 'idle' && m.status !== 'success'}
                                                        onClick={() => openSyncModal(m, idx, 'drawing', 'excel')}
                                                        style={{ padding: '6px 10px', borderRadius: '4px', background: ACC_THEME.primary, border: 'none', color: 'white', fontWeight: '700', fontSize: '9px', cursor: m.matchedFile ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                                                        title="Update Spreadsheet from Drawing data"
                                                    >
                                                        UPDATE SPREADSHEET
                                                    </button>
                                                    <button
                                                        disabled={!m.matchedFile || m.status !== 'idle' && m.status !== 'success'}
                                                        onClick={() => openSyncModal(m, idx, 'drawing', 'acc')}
                                                        style={{ padding: '6px 10px', borderRadius: '4px', background: ACC_THEME.primary, border: 'none', color: 'white', fontWeight: '700', fontSize: '9px', cursor: m.matchedFile ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                                                        title="Update ACC Attributes from Drawing data"
                                                    >
                                                        UPDATE ACC ATTRIBUTES
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
            </div >

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Roboto+Mono\u0026display=swap');

        html, body, #root {
            height: 100vh!important;
            margin: 0!important;
            padding: 0!important;
            overflow: hidden!important;
        }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate - spin { animation: spin 1s linear infinite; }
                :: -webkit - scrollbar { width: 8px; }
                :: -webkit - scrollbar - track { background: #F3F4F6; }
                :: -webkit - scrollbar - thumb { background: #D1D5DB; border - radius: 4px; }
`}</style>
        </div >
    );
};

export default App;

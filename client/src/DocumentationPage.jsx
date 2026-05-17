import React from 'react';
import { 
    Zap, 
    BookOpen, 
    Settings, 
    Database, 
    RefreshCw, 
    Shield, 
    ArrowRight, 
    CheckCircle2, 
    Layers, 
    Cloud, 
    FileSpreadsheet,
    Activity,
    ChevronRight,
    Terminal,
    Target,
    HelpCircle,
    Eye,
    History,
    X,
    ExternalLink,
    Info,
    Copy
} from 'lucide-react';

const DocumentationPage = ({ onClose }) => {
    const ACC_THEME = {
        primary: '#0696D7',
        sidebar: '#F8F9FA',
        border: '#E5E7EB',
        text: '#1E293B',
        textSecondary: '#64748B',
        bg: '#FAFBFC',
        success: '#10B981',
        error: '#EF4444'
    };

    const CLIENT_ID = import.meta.env.VITE_APS_CLIENT_ID || "ZroG86fKk5oQ0g8RI2V05pydMh7BpawS2JiV1ZAQPtU3F6rF";

    const Section = ({ icon: Icon, title, children }) => (
        <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(6, 150, 215, 0.1)', padding: '8px', borderRadius: '8px' }}>
                    <Icon size={20} color={ACC_THEME.primary} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: ACC_THEME.text, margin: 0 }}>{title}</h2>
            </div>
            <div style={{ fontSize: '15px', lineHeight: '1.6', color: ACC_THEME.textSecondary }}>
                {children}
            </div>
        </div>
    );

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Client ID copied to clipboard!");
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ width: '100%', maxWidth: '900px', height: '90vh', background: 'white', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', animation: 'modalSlideUp 0.4s ease-out' }}>
                
                {/* Header */}
                <header style={{ padding: '24px 40px', borderBottom: `1px solid ${ACC_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Zap size={22} color={ACC_THEME.primary} fill={ACC_THEME.primary} />
                        <h1 style={{ fontSize: '18px', fontWeight: '800', color: ACC_THEME.text, margin: 0, letterSpacing: '-0.3px' }}>DWG Cloud Alter • Operations Manual</h1>
                    </div>
                    <button 
                        onClick={onClose}
                        style={{ padding: '8px', background: '#F1F5F9', border: 'none', borderRadius: '50%', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <X size={20} />
                    </button>
                </header>

                {/* Content Container */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '40px 60px' }}>
                    
                    <div style={{ marginBottom: '48px' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', marginBottom: '12px', letterSpacing: '-1px' }}>Getting Started with DWG Cloud Alter</h1>
                        <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.5' }}>
                            A comprehensive guide to titleblock synchronization and cloud asset management for ACC, BIM 360, and Forma projects.
                        </p>
                    </div>

                    <Section icon={Shield} title="Step 0: Hub Integration & Account Provisioning">
                        <p>To see your projects and hubs in the dashboard, you must first authorize <b>DWG Cloud Alter</b> in your Autodesk Account Admin portal. This is a one-time setup for your company hub.</p>
                        
                        <div style={{ background: '#F8FAFC', border: `1px solid ${ACC_THEME.border}`, borderRadius: '16px', padding: '24px', marginTop: '20px' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>Instructions for Account Admins:</h4>
                            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', margin: 0 }}>
                                <li>Log in to your **Autodesk Account Admin** (Forma/ACC).</li>
                                <li>Navigate to the <b>Settings</b> or <b>Custom Integrations</b> tab.</li>
                                <li>Click <b>"Add Custom Integration"</b>.</li>
                                <li>Ensure "Account Administration" and "Document Management" are selected.</li>
                                <li>When prompted for the <b>Client ID</b>, copy and paste the ID below:</li>
                            </ol>

                            <div style={{ marginTop: '24px', background: 'white', border: `1px solid ${ACC_THEME.border}`, borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: '800', color: ACC_THEME.primary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>APS Client ID</span>
                                    <code style={{ fontSize: '14px', fontWeight: '700', color: '#334155', fontFamily: 'monospace' }}>{CLIENT_ID}</code>
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(CLIENT_ID)}
                                    style={{ padding: '8px 16px', background: ACC_THEME.primary, color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <Copy size={14} /> Copy ID
                                </button>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: ACC_THEME.textSecondary, fontSize: '13px', background: '#EFF6FF', padding: '12px', borderRadius: '8px', border: '1px solid #DBEAFE' }}>
                                <Info size={16} color={ACC_THEME.primary} />
                                <span><b>Pro Tip:</b> Name the integration "DWG Cloud Alter" to make it easy for your team to identify.</span>
                            </div>
                        </div>
                    </Section>

                    <Section icon={Settings} title="1. Project Connection">
                        <p>After provisioning, follow these steps to connect the engine:</p>
                        <ul style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><b>Select Hub:</b> Choose the Hub where your project is hosted.</li>
                            <li><b>Select Project:</b> Pick the project containing the target drawings.</li>
                            <li><b>Define Folder Scope:</b> Select the folders in the tree. The engine recursively scans all checked folders for DWG assets.</li>
                        </ul>
                    </Section>

                    <Section icon={Layers} title="2. Operation Modes">
                        <p>Choose the workflow that fits your data source:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                            <div style={{ padding: '20px', border: `1px solid ${ACC_THEME.border}`, borderRadius: '16px', background: '#F8FAFC' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <FileSpreadsheet size={18} color={ACC_THEME.primary} />
                                    <h4 style={{ margin: 0, fontWeight: '800' }}>ACC + Excel</h4>
                                </div>
                                <p style={{ fontSize: '13px', margin: 0 }}>Sync titleblocks using an Excel spreadsheet as the source of truth. Drawings are matched by their Number.</p>
                            </div>
                            <div style={{ padding: '20px', border: `1px solid ${ACC_THEME.border}`, borderRadius: '16px', background: '#F8FAFC' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <Cloud size={18} color={ACC_THEME.success} />
                                    <h4 style={{ margin: 0, fontWeight: '800' }}>ONLY ACC</h4>
                                </div>
                                <p style={{ fontSize: '13px', margin: 0 }}>Directly sync drawing attributes using the cloud interface metadata, removing the need for external files.</p>
                            </div>
                        </div>
                    </Section>

                    <Section icon={Activity} title="3. Discovery & Matching">
                        <p>Click <b>"Sync Console"</b> to begin. The engine will:</p>
                        <ul style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li>Scan all selected folders for DWG files.</li>
                            <li>Automatically link source data to cloud assets.</li>
                            <li>Populate the data grid with versions and current sync status.</li>
                        </ul>
                    </Section>

                    <Section icon={RefreshCw} title="4. Preview & Sync to Cloud">
                        <p>Use the "Modify" actions in the table to review and push updates:</p>
                        <ul style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><b>Review Changes:</b> Click "Modify" to see a side-by-side comparison of current titleblock values vs. new source data.</li>
                            <li><b>Attribute Selection:</b> You can selectively choose which attributes (Date, Checked By, etc.) to update.</li>
                            <li><b>Sync to Drawing:</b> Executing the sync creates a new version of the DWG in the cloud with the updated titleblock metadata.</li>
                        </ul>
                    </Section>

                    <Section icon={History} title="5. Audit History">
                        <p>Track every operation in the <b>History</b> panel. You can review the <b>Delta Summary</b> for any past session to see a precise log of every attribute that was updated.</p>
                    </Section>

                    <div style={{ borderTop: `1px solid ${ACC_THEME.border}`, marginTop: '48px', paddingTop: '32px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <Shield size={14} />
                            <span>DWG Cloud Alter • v2.2.0 Stable</span>
                        </div>
                    </div>

                </div>
            </div>
            <style>{`
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default DocumentationPage;

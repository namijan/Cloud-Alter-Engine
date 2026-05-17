import React from 'react';
import { 
    Zap, 
    X, 
    Shield, 
    CheckCircle2, 
    Layers, 
    Activity, 
    FileText 
} from 'lucide-react';

const ReleaseNotesPage = ({ onClose }) => {
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

    const Section = ({ icon: Icon, title, children }) => (
        <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(6, 150, 215, 0.1)', padding: '8px', borderRadius: '8px' }}>
                    <Icon size={20} color={ACC_THEME.primary} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: ACC_THEME.text, margin: 0 }}>{title}</h2>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.6', color: ACC_THEME.textSecondary, paddingLeft: '40px' }}>
                {children}
            </div>
        </div>
    );

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ width: '100%', maxWidth: '800px', height: '85vh', background: 'white', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', animation: 'modalSlideUp 0.4s ease-out' }}>
                
                {/* Header */}
                <header style={{ padding: '24px 40px', borderBottom: `1px solid ${ACC_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText size={22} color={ACC_THEME.primary} fill={ACC_THEME.primary} />
                        <h1 style={{ fontSize: '18px', fontWeight: '800', color: ACC_THEME.text, margin: 0, letterSpacing: '-0.3px' }}>DWG Cloud Alter • Release Notes</h1>
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
                    
                    <div style={{ marginBottom: '48px', borderBottom: `1px solid ${ACC_THEME.border}`, paddingBottom: '32px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', color: ACC_THEME.primary, padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', marginBottom: '16px', letterSpacing: '0.5px' }}>
                            <Zap size={14} fill={ACC_THEME.primary} /> VERSION 2.2.0 STABLE
                        </div>
                        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', marginBottom: '12px', letterSpacing: '-1px' }}>What's New in v2.2.0</h1>
                        <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                            This update focuses on radically streamlining the user workflow, removing friction during synchronization tasks, and resolving critical stability issues that affected platform rendering.
                        </p>
                    </div>

                    <Section icon={Activity} title="Workflow & UX Streamlining">
                        <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><b>Direct Synchronization:</b> We have completely removed the intrusive "Sync Review" modal. Synchronization tasks are now triggered instantly upon clicking the "FROM SPREADSHEET" or "FROM ACC ATTRIBUTES" buttons.</li>
                            <li><b>Smart Multi-Dispatch:</b> When modifying items, the system now intelligently detects if you have multiple assets selected. It will seamlessly prompt you to choose between processing just the single row or executing a batch run across all selected items, preventing accidental mass-updates.</li>
                            <li><b>Context-Aware Telemetry:</b> The Engine Event Queue and Status Indicators have been refined. When operating in "ONLY ACC" mode, all telemetry correctly reflects direct cloud-to-drawing syncs and completely omits mentions of Excel, ensuring logs are accurate to the active mode.</li>
                        </ul>
                    </Section>

                    <Section icon={Layers} title="Stability & Architecture">
                        <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><b>Structural Repair (Blank Screen Fix):</b> Resolved a critical React architectural flaw where malformed code blocks caused the application to crash into a blank white screen during complex interactions. The render cycle is now stable.</li>
                            <li><b>Restored Core Logic:</b> Fixed an issue where the application would fail to fetch Hubs and Projects after sign-in. The folder discovery tree and background queue monitoring have been fully restored and optimized.</li>
                        </ul>
                    </Section>

                    <Section icon={CheckCircle2} title="Documentation & Branding">
                        <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><b>Consistent Terminology:</b> All instances of generic branding have been replaced with the official <b>"DWG Cloud Alter"</b> nomenclature across the sign-in page, main interface, and documentation.</li>
                            <li><b>Operations Manual Update:</b> The built-in documentation (accessible via the Lightbox) has been thoroughly updated. References to legacy systems (BIM 360) have been replaced with modern equivalents (Forma/ACC).</li>
                            <li><b>Dynamic Provisioning:</b> The Operations Manual now dynamically serves the correct APS Client ID based on the deployed environment (External Production vs. Local Development), ensuring zero friction during client onboarding.</li>
                        </ul>
                    </Section>

                    <div style={{ borderTop: `1px solid ${ACC_THEME.border}`, marginTop: '48px', paddingTop: '32px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <Shield size={14} />
                            <span>DWG Cloud Alter • Engine Ready</span>
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

export default ReleaseNotesPage;

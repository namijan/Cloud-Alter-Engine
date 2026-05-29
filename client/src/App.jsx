import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DocumentationPage from './DocumentationPage';
import ReleaseNotesPage from './ReleaseNotesPage';
import { Upload, FileText, CheckCircle, AlertCircle, Play, Loader2, Database, Search, Layout, LogOut, ChevronDown, ChevronRight, RefreshCw, CheckSquare, Square, Zap, Globe, HardDrive, Eye, X, Shield, Activity, Maximize2, Minimize2, Trash2, ArrowRight, Folder, Check, HelpCircle, Star, MessageSquare, Printer } from 'lucide-react';

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

const TRANSLATIONS = {
    en: {
        title: "Enterprise Titleblock Automation & Cloud Synchronization",
        tagline: "Synchronize Autodesk Construction Cloud drawings and spreadsheets in real time",
        engineStandby: "Engine Standby",
        engineReady: "The automation engine is ready. Select a project and excel source from the sidebar to establish a connection.",
        availableHubs: "Available Hubs",
        targetProjects: "Target Projects",
        folderScope: "Folder Scope (Required)",
        availableSpreadsheets: "Source Data (Excel)",
        syncMode: "Synchronization Strategy",
        fullSync: "Full Sync (Bi-directional)",
        accSync: "Lite Mode (Extract Only)",
        descriptor: "Descriptor",
        linkedCloud: "Linked Cloud Variant",
        identifiedAsset: "Identified Asset",
        fileVersion: "File Version",
        modify: "Modify",
        fromSpreadsheet: "FROM SPREADSHEET",
        fromAccAttributes: "FROM ACC ATTRIBUTES",
        disconnected: "DISCONNECTED",
        operationsLog: "Operations Log",
        detailedHistory: "Detailed history of sync executions",
        clearAll: "CLEAR ALL",
        noHistory: "No historical logs found",
        recordsAppear: "Records will appear here after sync tasks complete",
        feedbackButton: "Share Feedback",
        feedbackTitle: "Send Us Your Thoughts",
        feedbackSubtitle: "Help us shape the future of Titleblock Automation",
        category: "Category",
        rating: "Your Experience",
        comment: "Detailed Notes",
        screenshot: "Attach a Screenshot (Drag & Drop or Click)",
        submitFeedback: "Send Feedback",
        feedbackSuccess: "Thank you! Your feedback has been recorded.",
        viewFeedbackHub: "Admin: Feedback Hub",
        feedbackHubTitle: "Feedback & Insights Registry",
        feedbackHubSubtitle: "Real-time user feedback telemetry",
        language: "Language",
        sourceVersion: "Source Version",
        verified: "Verified",
        viewTable: "View Table",
        visualInspectionNote: "Use visual inspection to verify fields before engine synchronization.",
        syncConsole: "Sync Console",
        selectExcelWarning: "PLEASE SELECT AN EXCEL FILE ABOVE",
        manual: "Operations Manual",
        whatsNew: "Release Notes",
        poweredByAPS: "powered by APS",
        selectFoldersFirst: "Select folders first...",
        selectDataSource: "Select data source...",
        endActiveSession: "End Active Session",
        signInHubControl: "Sign in to Hub Control",
        refreshConsole: "Refresh Console",
        operationHistory: "Operation History",
        persistentRecord: "Persistent record of engine activities",
        statusPreparing: "Preparing",
        statusSyncing: "Syncing",
        statusWriting: "Writing",
        statusReading: "Reading",
        statusSuccess: "Success",
        statusSynced: "Synced",
        statusFailed: "Failed",
        sourceAcc: "SOURCE: ACC",
        viewDeltaSummary: "VIEW DELTA SUMMARY",
        engineEventLog: "Engine Event Log",
        idLabel: "ID",
        awaitingTelemetry: "Awaiting engine telemetry...",
        closeConsole: "Close Console",
        smartPlotDispatch: "Smart Plot Dispatch",
        smartSyncDispatch: "Smart Sync Dispatch",
        itemsSelectedQuestion: "You have {count} items selected. Would you like to process only this row or all selected items?",
        processOnlyThis: "Process only this item",
        processAllSelected: "Process all {count} selected",
        liveEngineStatus: "Live Engine Status",
        tasksCount: "{count} TASKS",
        activeCount: "{count} ACTIVE",
        queuedCount: "{count} QUEUED",
        errorCount: "{count} ERROR",
        queueEmpty: "Queue Empty",
        engineQueue: "Engine Queue",
        spreadsheetUpdate: "Spreadsheet Update",
        accAttributesUpdate: "ACC Attributes Update",
        errorLabel: "Error",
        syncAnalyticsSummary: "Sync Analytics Summary",
        deltaReport: "Delta Report",
        blockLabel: "BLOCK",
        propertyHeader: "Property",
        sourceOldHeader: "Source (Old)",
        targetNewHeader: "Target (New)",
        emptyLabel: "empty",
        modifiedLabel: "MODIFIED",
        noDeltaData: "No delta data available for this operation.",
        acceptAndClose: "Accept & Close",
        telemetryPacketDispatched: "Dispatched telemetry packet to feedback database.",
        bugReport: "Bug Report",
        featureRequest: "Feature Request",
        generalFeedback: "General Feedback",
        praiseLove: "Praise & Love",
        poor: "Poor",
        fair: "Fair",
        good: "Good",
        veryGood: "Very Good",
        excellent: "Excellent",
        feedbackPlaceholder: "Tell us what you experienced, what needs improvement, or what works great...",
        selectOrDropScreenshot: "Select or drop a screenshot file",
        fileSpecs: "PNG, JPG, or GIF up to 5MB",
        submitting: "Submitting...",
        adminPassgate: "Admin Passcode Gate",
        passgateDescription: "Enter the secure backend passcode to decrypt and unlock the product feedback registry and diagnostic logs.",
        invalidPasscode: "Invalid passcode. Access Denied.",
        verifying: "Verifying...",
        unlockRegistry: "Unlock Registry",
        avgRating: "Avg Rating",
        reviewsCount: "{count} reviews",
        telemetryFilter: "Telemetry Filter",
        allTelemetry: "All Telemetry",
        bugReports: "Bug Reports",
        featureRequests: "Feature Requests",
        noTelemetry: "No telemetry data in category",
        telemetryRenderNote: "Feedback matches will render here dynamically",
        attachedScreenshot: "Attached Screenshot",
        deleteFeedbackEntry: "Delete feedback entry",
        statusSyncProjectState: "Synchronizing project state...",
        statusOrchestrateAsset: "Orchestrating asset alignment...",
        statusConsoleSynced: "Console Synced. Found {count} identified variants.",
        statusAlignmentFailed: "Alignment failed: {message}",
        stableLabel: "stable",
        loading: "Loading...",
        discoveringFolders: "🔍 Discovering folder hierarchy...",
        foldersSelected: "{count} folders selected",
        engineConnectivityMode: "Engine Connectivity Mode",
        selectFolderFirst: "(SELECT FOLDER FIRST)",
        accPlusExcel: "ACC + EXCEL",
        onlyAcc: "ONLY ACC",
        syncingText: "SYNCING...",
        refreshText: "REFRESH",
        refreshFeedbacks: "Refresh Registry"
    },
    es: {
        title: "Automatización de Bloques de Título y Sincronización en la Nube",
        tagline: "Sincronice planos y hojas de cálculo de Autodesk Construction Cloud en tiempo real",
        engineStandby: "Motor en Espera",
        engineReady: "El motor de automatización está listo. Seleccione un proyecto y una fuente de Excel para establecer conexión.",
        availableHubs: "Hubs Disponibles",
        targetProjects: "Proyectos Objetivo",
        folderScope: "Alcance de Carpeta (Requerido)",
        availableSpreadsheets: "Datos de Origen (Excel)",
        syncMode: "Estrategia de Sincronización",
        fullSync: "Sincronización Completa (Bidireccional)",
        accSync: "Modo Lite (Solo Extracción)",
        descriptor: "Descriptor",
        linkedCloud: "Variante de Nube Vinculada",
        identifiedAsset: "Activo Identificado",
        fileVersion: "Versión de Archivo",
        modify: "Modificar",
        fromSpreadsheet: "DESDE EXCEL",
        fromAccAttributes: "DESDE ACC",
        disconnected: "DESCONECTADO",
        operationsLog: "Registro de Operaciones",
        detailedHistory: "Historial detallado de ejecuciones",
        clearAll: "BORRAR TODO",
        noHistory: "No se encontraron registros",
        recordsAppear: "Los registros aparecerán aquí después de la sincronización",
        feedbackButton: "Enviar Comentarios",
        feedbackTitle: "Envíenos sus Comentarios",
        feedbackSubtitle: "Ayúdenos a mejorar la Automatización de Bloques de Título",
        category: "Categoría",
        rating: "Su Experiencia",
        comment: "Notas Detalladas",
        screenshot: "Adjuntar Captura (Arrastrar o Clic)",
        submitFeedback: "Enviar Comentarios",
        feedbackSuccess: "¡Gracias! Sus comentarios han sido registrados.",
        viewFeedbackHub: "Admin: Centro de Comentarios",
        feedbackHubTitle: "Registro de Comentarios e Insights",
        feedbackHubSubtitle: "Telemetría de comentarios en tiempo real",
        language: "Idioma",
        sourceVersion: "Versión de Origen",
        verified: "Verificado",
        viewTable: "Ver Tabla",
        visualInspectionNote: "Use la inspección visual para verificar los campos antes de la sincronización del motor.",
        syncConsole: "Sincronizar Consola",
        selectExcelWarning: "POR FAVOR SELECCIONE UN ARCHIVO DE EXCEL ARRIBA",
        manual: "Manual de Operaciones",
        whatsNew: "Notas de Lanzamiento",
        poweredByAPS: "potenciado por APS",
        selectFoldersFirst: "Seleccione carpetas primero...",
        selectDataSource: "Seleccione origen de datos...",
        endActiveSession: "Cerrar Sesión Activa",
        signInHubControl: "Iniciar Sesión en Control del Hub",
        refreshConsole: "Actualizar Consola",
        operationHistory: "Historial de Operaciones",
        persistentRecord: "Registro persistente de las actividades del motor",
        statusPreparing: "Preparando",
        statusSyncing: "Sincronizando",
        statusWriting: "Escribiendo",
        statusReading: "Leyendo",
        statusSuccess: "Éxito",
        statusSynced: "Sincronizado",
        statusFailed: "Fallido",
        sourceAcc: "ORIGEN: ACC",
        viewDeltaSummary: "VER RESUMEN DE DELTA",
        engineEventLog: "Registro de Eventos del Motor",
        idLabel: "ID",
        awaitingTelemetry: "Esperando telemetría del motor...",
        closeConsole: "Cerrar Consola",
        smartPlotDispatch: "Envío de Trazado Inteligente",
        smartSyncDispatch: "Envío de Sincronización Inteligente",
        itemsSelectedQuestion: "Tiene {count} elementos seleccionados. ¿Desea procesar solo esta fila o todos los elementos seleccionados?",
        processOnlyThis: "Procesar solo este elemento",
        processAllSelected: "Procesar los {count} seleccionados",
        liveEngineStatus: "Estado del Motor en Vivo",
        tasksCount: "{count} TAREAS",
        activeCount: "{count} ACTIVO",
        queuedCount: "{count} EN COLA",
        errorCount: "{count} ERRORES",
        queueEmpty: "Cola Vacía",
        engineQueue: "Cola del Motor",
        spreadsheetUpdate: "Actualización de Excel",
        accAttributesUpdate: "Actualización de Atributos ACC",
        errorLabel: "Error",
        syncAnalyticsSummary: "Resumen Analítico de Sincronización",
        deltaReport: "Informe Delta",
        blockLabel: "BLOQUE",
        propertyHeader: "Propiedad",
        sourceOldHeader: "Origen (Viejo)",
        targetNewHeader: "Destino (Nuevo)",
        emptyLabel: "vacío",
        modifiedLabel: "MODIFICADO",
        noDeltaData: "No hay datos delta disponibles para esta operación.",
        acceptAndClose: "Aceptar y Cerrar",
        telemetryPacketDispatched: "Paquete de telemetría enviado a la base de datos de comentarios.",
        bugReport: "Informe de Error",
        featureRequest: "Solicitud de Función",
        generalFeedback: "Comentario General",
        praiseLove: "Elogios y Amor",
        poor: "Malo",
        fair: "Aceptable",
        good: "Bueno",
        veryGood: "Muy Bueno",
        excellent: "Excelente",
        feedbackPlaceholder: "Cuéntenos su experiencia, qué necesita mejorar o qué funciona genial...",
        selectOrDropScreenshot: "Seleccione o arrastre un archivo de captura de pantalla",
        fileSpecs: "PNG, JPG o GIF hasta 5MB",
        submitting: "Enviando...",
        adminPassgate: "Puerta de Contraseña de Administrador",
        passgateDescription: "Ingrese la contraseña segura de backend para descifrar y desbloquear el registro de comentarios y los registros de diagnóstico.",
        invalidPasscode: "Contraseña inválida. Acceso denegado.",
        verifying: "Verificando...",
        unlockRegistry: "Desbloquear Registro",
        avgRating: "Calificación Promedio",
        reviewsCount: "{count} opiniones",
        telemetryFilter: "Filtro de Telemetría",
        allTelemetry: "Toda la Telemetría",
        bugReports: "Informes de Errores",
        featureRequests: "Solicitudes de Funciones",
        noTelemetry: "No hay datos de telemetría en esta categoría",
        telemetryRenderNote: "Los comentarios coincidentes se representarán aquí dinámicamente",
        attachedScreenshot: "Captura de Pantalla Adjunta",
        deleteFeedbackEntry: "Eliminar comentario",
        statusSyncProjectState: "Sincronizando estado del proyecto...",
        statusOrchestrateAsset: "Orquestando la alineación de activos...",
        statusConsoleSynced: "Consola Sincronizada. Se encontraron {count} variantes identificadas.",
        statusAlignmentFailed: "Alineación fallida: {message}",
        stableLabel: "estable",
        loading: "Cargando...",
        discoveringFolders: "🔍 Descubriendo la jerarquía de carpetas...",
        foldersSelected: "{count} carpetas seleccionadas",
        engineConnectivityMode: "Modo de conectividad del motor",
        selectFolderFirst: "(SELECCIONE LA CARPETA PRIMERO)",
        accPlusExcel: "ACC + EXCEL",
        onlyAcc: "SOLO ACC",
        syncingText: "SINCRONIZANDO...",
        refreshText: "ACTUALIZAR",
        refreshFeedbacks: "Actualizar registro"
    },
    fr: {
        title: "Automatisation des Cartouches & Synchro Cloud",
        tagline: "Synchronisez vos dessins et feuilles de calcul Autodesk Construction Cloud en temps réel",
        engineStandby: "Moteur en Veille",
        engineReady: "Le moteur d'automatisation est prêt. Sélectionnez un projet et une source Excel dans la barre latérale pour vous connecter.",
        availableHubs: "Hubs Disponibles",
        targetProjects: "Projets Cibles",
        folderScope: "Dossiers Cibles (Requis)",
        availableSpreadsheets: "Données de Source (Excel)",
        syncMode: "Stratégie de Synchronisation",
        fullSync: "Synchro Complète (Bidirectionnelle)",
        accSync: "Mode Lite (Extraction Uniquement)",
        descriptor: "Descripteur",
        linkedCloud: "Variante Cloud Liée",
        identifiedAsset: "Élément Identifié",
        fileVersion: "Version du Fichier",
        modify: "Modifier",
        fromSpreadsheet: "DEPUIS EXCEL",
        fromAccAttributes: "DEPUIS ACC",
        disconnected: "DECONNECTE",
        operationsLog: "Journal des Opérations",
        detailedHistory: "Historique détaillé des exécutions",
        clearAll: "EFFACER TOUT",
        noHistory: "Aucun historique trouvé",
        recordsAppear: "Les enregistrements apparaîtront après la synchronisation",
        feedbackButton: "Donner votre avis",
        feedbackTitle: "Envoyez-nous vos avis",
        feedbackSubtitle: "Aidez-nous à façonner l'automatisation des cartouches",
        category: "Catégorie",
        rating: "Votre Expérience",
        comment: "Notes Détaillées",
        screenshot: "Ajouter une Capture (Glisser ou Cliquer)",
        submitFeedback: "Envoyer",
        feedbackSuccess: "Merci! Vos commentaires ont été enregistrés.",
        viewFeedbackHub: "Admin: Centre de Commentaires",
        feedbackHubTitle: "Registre des retours et analyses",
        feedbackHubSubtitle: "Télémétrie des retours utilisateurs en temps réel",
        language: "Langue",
        sourceVersion: "Version Source",
        verified: "Vérifié",
        viewTable: "Voir le Tableau",
        visualInspectionNote: "Utilisez l'inspection visuelle pour vérifier les champs avant la synchronisation du moteur.",
        syncConsole: "Synchroniser la Console",
        selectExcelWarning: "VEUILLEZ SÉLECTIONNER UN FICHIER EXCEL CI-DESSUS",
        manual: "Manuel d'Utilisation",
        whatsNew: "Notes de Version",
        poweredByAPS: "propulsé par APS",
        selectFoldersFirst: "Sélectionnez d'abord les dossiers...",
        selectDataSource: "Sélectionnez la source de données...",
        endActiveSession: "Fin de la Session Active",
        signInHubControl: "Se connecter au Contrôle du Hub",
        refreshConsole: "Actualiser la Console",
        operationHistory: "Journal des Opérations",
        persistentRecord: "Enregistrement persistant des activités du moteur",
        statusPreparing: "Préparation",
        statusSyncing: "Synchronisation",
        statusWriting: "Écriture",
        statusReading: "Lecture",
        statusSuccess: "Succès",
        statusSynced: "Synchronisé",
        statusFailed: "Échoué",
        sourceAcc: "SOURCE: ACC",
        viewDeltaSummary: "VOIR LE RÉSUMÉ DELTA",
        engineEventLog: "Journal des Événements du Moteur",
        idLabel: "ID",
        awaitingTelemetry: "Attente de la télémétrie du moteur...",
        closeConsole: "Fermer la Console",
        smartPlotDispatch: "Envoi de Tracé Intelligent",
        smartSyncDispatch: "Envoi de Synchro Intelligente",
        itemsSelectedQuestion: "Vous avez {count} éléments sélectionnés. Voulez-vous traiter uniquement cette ligne ou tous les éléments sélectionnés ?",
        processOnlyThis: "Traiter uniquement cet élément",
        processAllSelected: "Traiter les {count} sélectionnés",
        liveEngineStatus: "État du Moteur en Direct",
        tasksCount: "{count} TÂCHES",
        activeCount: "{count} ACTIFS",
        queuedCount: "{count} EN FILE",
        errorCount: "{count} ERREURS",
        queueEmpty: "File d'attente Vide",
        engineQueue: "File du Moteur",
        spreadsheetUpdate: "Mise à jour Excel",
        accAttributesUpdate: "Mise à jour des Attributs ACC",
        errorLabel: "Erreur",
        syncAnalyticsSummary: "Résumé Analytique de Synchro",
        deltaReport: "Rapport Delta",
        blockLabel: "BLOC",
        propertyHeader: "Propriété",
        sourceOldHeader: "Source (Ancien)",
        targetNewHeader: "Cible (Nouveau)",
        emptyLabel: "vide",
        modifiedLabel: "MODIFIÉ",
        noDeltaData: "Aucune donnée delta disponible pour cette opération.",
        acceptAndClose: "Accepter & Fermer",
        telemetryPacketDispatched: "Paquet de télémétrie envoyé à la base de données de retours.",
        bugReport: "Rapport de Bug",
        featureRequest: "Demande de Fonctionnalité",
        generalFeedback: "Avis Général",
        praiseLove: "Éloges & Amour",
        poor: "Médiocre",
        fair: "Passable",
        good: "Bon",
        veryGood: "Très Bon",
        excellent: "Excellent",
        feedbackPlaceholder: "Dites-nous ce que vous avez vécu, ce qui doit être amélioré ou ce qui fonctionne très bien...",
        selectOrDropScreenshot: "Sélectionnez ou déposez une capture d'écran",
        fileSpecs: "PNG, JPG ou GIF jusqu'à 5 Mo",
        submitting: "Envoi en cours...",
        adminPassgate: "Porte de Mot de Passe Admin",
        passgateDescription: "Saisissez le mot de passe sécurisé du backend pour décrypter et déverrouiller le registre des retours et les journaux de diagnostic.",
        invalidPasscode: "Mot de passe invalide. Accès refusé.",
        verifying: "Vérification...",
        unlockRegistry: "Déverrouiller le Registre",
        avgRating: "Note Moyenne",
        reviewsCount: "{count} avis",
        telemetryFilter: "Filtre de Télémétrie",
        allTelemetry: "Toutes les Télémétries",
        bugReports: "Rapports de Bugs",
        featureRequests: "Demandes de Fonctionnalités",
        noTelemetry: "Aucune donnée de télémétrie dans cette catégorie",
        telemetryRenderNote: "Les retours correspondants s'afficheront ici dynamiquement",
        attachedScreenshot: "Capture d'Écran Attachée",
        deleteFeedbackEntry: "Supprimer le retour",
        statusSyncProjectState: "Synchronisation de l'état du projet...",
        statusOrchestrateAsset: "Orchestration de l'alignement des éléments...",
        statusConsoleSynced: "Console synchronisée. {count} variantes identifiées trouvées.",
        statusAlignmentFailed: "Échec de l'alignement: {message}",
        stableLabel: "stable",
        loading: "Chargement...",
        discoveringFolders: "🔍 Découverte de la hiérarchie des dossiers...",
        foldersSelected: "{count} dossiers sélectionnés",
        engineConnectivityMode: "Mode de connectivité du moteur",
        selectFolderFirst: "(SÉLECTIONNEZ D'ABORD LE DOSSIER)",
        accPlusExcel: "ACC + EXCEL",
        onlyAcc: "ACC UNIQUEMENT",
        syncingText: "SYNCHRONISATION...",
        refreshText: "ACTUALISER",
        refreshFeedbacks: "Actualiser le registre"
    },
    de: {
        title: "Schriftkopf-Automatisierung & Cloud-Synchronisierung",
        tagline: "Schriftkopf-Automatisierung & Cloud-Synchronisierung",
        engineStandby: "System im Standby",
        engineReady: "Die Automatisierungs-Engine ist bereit. Wählen Sie ein Projekt und eine Excel-Quelle aus der Seitenleiste.",
        availableHubs: "Verfügbare Hubs",
        targetProjects: "Zielprojekte",
        folderScope: "Ordnerbereich (Erforderlich)",
        availableSpreadsheets: "Quelldaten (Excel)",
        syncMode: "Synchronisationsstrategie",
        fullSync: "Vollständige Synch (Bidirektional)",
        accSync: "Lite-Modus (Nur Extraktion)",
        descriptor: "Beschreibung",
        linkedCloud: "Verknüpfte Cloud-Variante",
        identifiedAsset: "Identifiziertes Element",
        fileVersion: "Dateiversion",
        modify: "Bearbeiten",
        fromSpreadsheet: "AUS TABELLE",
        fromAccAttributes: "AUS ACC",
        disconnected: "GETRENNT",
        operationsLog: "Betriebsprotokoll",
        detailedHistory: "Detaillierter Verlauf der Synchronisationen",
        clearAll: "ALLES LÖSCHEN",
        noHistory: "Kein Verlauf vorhanden",
        recordsAppear: "Einträge erscheinen nach erfolgreichem Abgleich",
        feedbackButton: "Feedback geben",
        feedbackTitle: "Senden Sie uns Ihr Feedback",
        feedbackSubtitle: "Helfen Sie uns, die Schriftkopf-Automatisierung zu verbessern",
        category: "Kategorie",
        rating: "Ihre Erfahrung",
        comment: "Detaillierte Notizen",
        screenshot: "Screenshot anhängen (Drag & Drop oder Klick)",
        submitFeedback: "Feedback senden",
        feedbackSuccess: "Vielen Dank! Ihr Feedback wurde registriert.",
        viewFeedbackHub: "Admin: Feedback-Zentrale",
        feedbackHubTitle: "Feedback & Insights Register",
        feedbackHubSubtitle: "Echtzeit-Benutzerfeedback-Telemetrie",
        language: "Sprache",
        sourceVersion: "Quellversion",
        verified: "Verifiziert",
        viewTable: "Tabelle anzeigen",
        visualInspectionNote: "Nutzen Sie die visuelle Prüfung zur Verifizierung vor dem Motor-Abgleich.",
        syncConsole: "Synchronisationskonsole",
        selectExcelWarning: "BITTE WÄHLEN SIE OBEN EINE EXCEL-DATEI AUS",
        manual: "Bedienungshandbuch",
        whatsNew: "Versionshinweise",
        poweredByAPS: "unterstützt durch APS",
        selectFoldersFirst: "Wählen Sie zuerst Ordner...",
        selectDataSource: "Wählen Sie eine Datenquelle...",
        endActiveSession: "Aktive Sitzung beenden",
        signInHubControl: "Am Hub-Steuerpult anmelden",
        refreshConsole: "Konsole aktualisieren",
        operationHistory: "Betriebsprotokoll",
        persistentRecord: "Dauerhaftes Protokoll der Motoraktivitäten",
        statusPreparing: "Vorbereitung",
        statusSyncing: "Synchronisierung",
        statusWriting: "Schreiben",
        statusReading: "Lesen",
        statusSuccess: "Erfolgreich",
        statusSynced: "Abgeglichen",
        statusFailed: "Fehlgeschlagen",
        sourceAcc: "QUELLE: ACC",
        viewDeltaSummary: "DELTA-ZUSAMMENFASSUNG ANZEIGEN",
        engineEventLog: "Motor-Ereignisprotokoll",
        idLabel: "ID",
        awaitingTelemetry: "Warte auf Motor-Telemetrie...",
        closeConsole: "Konsole schließen",
        smartPlotDispatch: "Intelligenter Plot-Versand",
        smartSyncDispatch: "Intelligenter Sync-Versand",
        itemsSelectedQuestion: "Sie haben {count} Elemente ausgewählt. Möchten Sie nur diese Zeile oder alle ausgewählten Elemente verarbeiten?",
        processOnlyThis: "Nur dieses Element verarbeiten",
        processAllSelected: "Alle {count} ausgewählten verarbeiten",
        liveEngineStatus: "Live-Motorstatus",
        tasksCount: "{count} AUFGABEN",
        activeCount: "{count} AKTIV",
        queuedCount: "{count} IN WARTESCHLANGE",
        errorCount: "{count} FEHLER",
        queueEmpty: "Warteschlange leer",
        engineQueue: "Motor-Warteschlange",
        spreadsheetUpdate: "Tabellen-Aktualisierung",
        accAttributesUpdate: "ACC-Attribut-Aktualisierung",
        errorLabel: "Fehler",
        syncAnalyticsSummary: "Synchronisations-Analyse Zusammenfassung",
        deltaReport: "Delta-Bericht",
        blockLabel: "BLOCK",
        propertyHeader: "Eigenschaft",
        sourceOldHeader: "Quelle (Alt)",
        targetNewHeader: "Ziel (Neu)",
        emptyLabel: "leer",
        modifiedLabel: "GEÄNDERT",
        noDeltaData: "Keine Delta-Daten für diesen Vorgang verfügbar.",
        acceptAndClose: "Akzeptieren & Schließen",
        telemetryPacketDispatched: "Telemetrie-Paket an Feedback-Datenbank gesendet.",
        bugReport: "Fehlerbericht",
        featureRequest: "Funktionsanfrage",
        generalFeedback: "Allgemeines Feedback",
        praiseLove: "Lob & Anerkennung",
        poor: "Schlecht",
        fair: "Mittelmäßig",
        good: "Gut",
        veryGood: "Sehr Gut",
        excellent: "Ausgezeichnet",
        feedbackPlaceholder: "Teilen Sie uns Ihre Erfahrungen mit, was verbessert werden muss oder was hervorragend funktioniert...",
        selectOrDropScreenshot: "Screenshot-Datei auswählen oder hierher ziehen",
        fileSpecs: "PNG, JPG oder GIF bis zu 5MB",
        submitting: "Wird übermittelt...",
        adminPassgate: "Admin-Passwortsperre",
        passgateDescription: "Geben Sie das sichere Backend-Passwort ein, um das Feedback-Register und die Diagnoseprotokolle zu entschlüsseln.",
        invalidPasscode: "Ungültiges Passwort. Zugriff verweigert.",
        verifying: "Wird überprüft...",
        unlockRegistry: "Register freischalten",
        avgRating: "Durchschnitt",
        reviewsCount: "{count} Bewertungen",
        telemetryFilter: "Telemetriefilter",
        allTelemetry: "Alle Telemetriedaten",
        bugReports: "Fehlerberichte",
        featureRequests: "Funktionsanfragen",
        noTelemetry: "Keine Telemetriedaten in dieser Kategorie",
        telemetryRenderNote: "Passendes Feedback wird hier dynamisch angezeigt",
        attachedScreenshot: "Angehängter Screenshot",
        deleteFeedbackEntry: "Feedback löschen",
        statusSyncProjectState: "Projektschnittstelle wird synchronisiert...",
        statusOrchestrateAsset: "Element-Alineierung wird orchestriert...",
        statusConsoleSynced: "Konsole abgeglichen. {count} identifizierte Varianten gefunden.",
        statusAlignmentFailed: "Abgleich fehlgeschlagen: {message}",
        stableLabel: "stable",
        loading: "Laden...",
        discoveringFolders: "🔍 Ordnerhierarchie wird ermittelt...",
        foldersSelected: "{count} Ordner ausgewählt",
        engineConnectivityMode: "Verbindungsmodus der Engine",
        selectFolderFirst: "(ZUERST ORDNER WÄHLEN)",
        accPlusExcel: "ACC + EXCEL",
        onlyAcc: "NUR ACC",
        syncingText: "SYNCHRONISIERUNG...",
        refreshText: "AKTUALISIEREN",
        refreshFeedbacks: "Registrierung aktualisieren"
    },
    ja: {
        title: "図面タイトルブロック自動化 & クラウド同期",
        tagline: "Autodesk Construction Cloud図面とスプレッドシートをリアルタイムに双方向同期",
        engineStandby: "エンジン待機中",
        engineReady: "自動化エンジンの準備が完了しました。サイドバーからプロジェクトとExcelソースを選択して接続を確立してください。",
        availableHubs: "利用可能なハブ",
        targetProjects: "対象プロジェクト",
        folderScope: "対象フォルダ（必須）",
        availableSpreadsheets: "ソースデータ（Excel）",
        syncMode: "同期ストラテジー",
        fullSync: "完全同期（双方向）",
        accSync: "ライトモード（抽出のみ）",
        descriptor: "識別子",
        linkedCloud: "リンクされたクラウドモデル",
        identifiedAsset: "識別された資産",
        fileVersion: "ファイルバージョン",
        modify: "変更",
        fromSpreadsheet: "スプレッドシートから同期",
        fromAccAttributes: "ACC属性から同期",
        disconnected: "接続切断",
        operationsLog: "操作ログ履歴",
        detailedHistory: "実行タスクの同期履歴詳細",
        clearAll: "すべて消去",
        noHistory: "履歴レコードが見つかりません",
        recordsAppear: "タスク完了後にレコードが表示されます",
        feedbackButton: "フィードバックを送る",
        feedbackTitle: "ご意見をお聞かせください",
        feedbackSubtitle: "製品の改善にぜひご協力ください",
        category: "カテゴリ",
        rating: "評価",
        comment: "詳細内容",
        screenshot: "スクリーンショット添付（ドラッグ＆ドロップまたはクリック）",
        submitFeedback: "送信する",
        feedbackSuccess: "ありがとうございます。フィードバックを記録しました。",
        viewFeedbackHub: "管理者用: フィードバック一覧",
        feedbackHubTitle: "フィードバック＆インサイトレジストリ",
        feedbackHubSubtitle: "ユーザー体験リアルタイム集計",
        language: "言語",
        sourceVersion: "ソースバージョン",
        verified: "検証済み",
        viewTable: "テーブル表示",
        visualInspectionNote: "エンジン同期を実行する前に、目視にて各フィールドを検証してください。",
        syncConsole: "同期コンソール起動",
        selectExcelWarning: "上部でEXCELファイルを選択してください",
        manual: "操作説明マニュアル",
        whatsNew: "リリースノート履歴",
        poweredByAPS: "powered by APS",
        selectFoldersFirst: "先にフォルダを選択してください...",
        selectDataSource: "データソースを選択してください...",
        endActiveSession: "アクティブセッションの終了",
        signInHubControl: "ハブコントロールにサインイン",
        refreshConsole: "コンソール更新",
        operationHistory: "操作ログ履歴",
        persistentRecord: "同期タスクの永続履歴ログ",
        statusPreparing: "準備中",
        statusSyncing: "同期中",
        statusWriting: "書き込み中",
        statusReading: "読み込み中",
        statusSuccess: "成功",
        statusSynced: "同期完了",
        statusFailed: "失敗",
        sourceAcc: "データソース: ACC",
        viewDeltaSummary: "差分レポートを表示",
        engineEventLog: "エンジンイベントログ",
        idLabel: "ID",
        awaitingTelemetry: "エンジンのテレメトリ接続を待機中...",
        closeConsole: "コンソールを閉じる",
        smartPlotDispatch: "スマートプロット配信",
        smartSyncDispatch: "スマート同期配信",
        itemsSelectedQuestion: "{count} 個のアイテムが選択されています。この行のみ処理しますか、それとも選択されたすべてのアイテムを処理しますか？",
        processOnlyThis: "この行のみ処理する",
        processAllSelected: "選択したすべての {count} 件を処理する",
        liveEngineStatus: "ライブエンジンステータス",
        tasksCount: "{count} 件のタスク",
        activeCount: "{count} 件実行中",
        queuedCount: "{count} 件待機中",
        errorCount: "{count} 件エラー",
        queueEmpty: "待機キューは空です",
        engineQueue: "エンジン処理キュー",
        spreadsheetUpdate: "スプレッドシート更新",
        accAttributesUpdate: "ACC属性値更新",
        errorLabel: "エラー原因",
        syncAnalyticsSummary: "同期アナリティクス概要",
        deltaReport: "差分レポート",
        blockLabel: "ブロック",
        propertyHeader: "プロパティ項目",
        sourceOldHeader: "同期前 (旧)",
        targetNewHeader: "同期後 (新)",
        emptyLabel: "空値",
        modifiedLabel: "変更あり",
        noDeltaData: "この操作に対する差分データは存在しません。",
        acceptAndClose: "承認して閉じる",
        telemetryPacketDispatched: "フィードバックDBへのテレメトリ送信が完了しました。",
        bugReport: "バグ報告",
        featureRequest: "機能要望",
        generalFeedback: "一般的なご意見",
        praiseLove: "称賛と応援",
        poor: "悪い",
        fair: "普通",
        good: "良い",
        veryGood: "非常に良い",
        excellent: "素晴らしい",
        feedbackPlaceholder: "体験したこと、改善が必要な点、または気に入った機能などをご記入ください...",
        selectOrDropScreenshot: "スクリーンショットファイルを選択またはドラッグ＆ドロップしてください",
        fileSpecs: "5MB以下のPNG、JPG、またはGIF形式",
        submitting: "送信中...",
        adminPassgate: "管理者パスコード認証",
        passgateDescription: "バックエンドのセキュアパスコードを入力して、フィードバック一覧と診断ログのロックを解除してください。",
        invalidPasscode: "パスコードが正しくありません。アクセスが拒否されました。",
        verifying: "検証中...",
        unlockRegistry: "ロック解除",
        avgRating: "平均評価",
        reviewsCount: "{count} 件のレビュー",
        telemetryFilter: "テレメトリフィルター",
        allTelemetry: "すべてのテレメトリ",
        bugReports: "バグ報告一覧",
        featureRequests: "機能要望一覧",
        noTelemetry: "このカテゴリにテレメトリデータはありません",
        telemetryRenderNote: "収集されたフィードバックデータがリアルタイムで表示されます",
        attachedScreenshot: "添付スクリーンショット",
        deleteFeedbackEntry: "フィードバックを削除する",
        statusSyncProjectState: "プロジェクトステートを同期中...",
        statusOrchestrateAsset: "アセットの配置を構築中...",
        statusConsoleSynced: "コンソール同期完了。{count} 個の識別されたバリアントを発見しました。",
        statusAlignmentFailed: "同期アライメント失敗: {message}",
        stableLabel: "安定版",
        loading: "読み込み中...",
        discoveringFolders: "🔍 フォルダ構成を検出中...",
        foldersSelected: "{count} 個のフォルダが選択されました",
        engineConnectivityMode: "エンジン接続モード",
        selectFolderFirst: "(先にフォルダを選択してください)",
        accPlusExcel: "ACC + EXCEL",
        onlyAcc: "ACC のみ",
        syncingText: "同期中...",
        refreshText: "更新",
        refreshFeedbacks: "レジストリを更新"
    },
    zh: {
        title: "企业级图纸标题栏自动填充与云同步系统",
        tagline: "实时双向同步 Autodesk Construction Cloud 图纸与电子表格数据",
        engineStandby: "引擎准备就绪",
        engineReady: "自动化引擎正处于待命状态。请在侧边栏选择项目与 Excel 数据源以建立同步链接。",
        availableHubs: "可用企业中心",
        targetProjects: "目标项目列表",
        folderScope: "同步文件夹范围 (必选)",
        availableSpreadsheets: "源数据文件 (Excel)",
        syncMode: "数据同步策略",
        fullSync: "完整同步 (双向写入)",
        accSync: "极速模式 (仅提取)",
        descriptor: "描述项",
        linkedCloud: "已连接的云图纸",
        identifiedAsset: "已识别的云资产",
        fileVersion: "文件版本",
        modify: "操作修改",
        fromSpreadsheet: "同步自表格",
        fromAccAttributes: "同步自云属性",
        disconnected: "未连接",
        operationsLog: "系统运行日志",
        detailedHistory: "已完成 Graves任务历史详情",
        clearAll: "清空所有记录",
        noHistory: "暂无运行记录",
        recordsAppear: "完成同步任务后将在此展示历史记录",
        feedbackButton: "意见反馈",
        feedbackTitle: "发送您的反馈与建议",
        feedbackSubtitle: "帮助我们持续优化标题栏自动填充体验",
        category: "反馈类别",
        rating: "您的使用体验",
        comment: "详细建议",
        screenshot: "上传截图证明 (支持拖拽或点击上传)",
        submitFeedback: "提交反馈",
        feedbackSuccess: "非常感谢！您的宝贵意见已成功记录。",
        viewFeedbackHub: "管理员: 反馈看板",
        feedbackHubTitle: "用户反馈与产品洞察总览",
        feedbackHubSubtitle: "实时收集与监控用户运行体验",
        language: "语言切换",
        sourceVersion: "数据源版本",
        verified: "已验证",
        viewTable: "查看数据表",
        visualInspectionNote: "请在启动引擎同步前使用可视化视图核对字段。",
        syncConsole: "启动同步控制台",
        selectExcelWarning: "请在上方选择 Excel 数据源文件",
        manual: "系统操作手册",
        whatsNew: "版本更新日志",
        poweredByAPS: "基于 APS 技术构建",
        selectFoldersFirst: "请先选择文件夹范围...",
        selectDataSource: "请选择 Excel 数据源...",
        endActiveSession: "结束当前会话",
        signInHubControl: "登录到中心控制台",
        refreshConsole: "刷新控制台",
        operationHistory: "系统运行日志",
        persistentRecord: "同步任务完成历史归档",
        statusPreparing: "引擎准备中",
        statusSyncing: "正在同步中",
        statusWriting: "正在写入中",
        statusReading: "正在读取中",
        statusSuccess: "执行成功",
        statusSynced: "完成同步",
        statusFailed: "执行失败",
        sourceAcc: "数据源: ACC",
        viewDeltaSummary: "查看属性差分报告",
        engineEventLog: "引擎运行日志明细",
        idLabel: "任务标识ID",
        awaitingTelemetry: "正在等待引擎实时遥测数据...",
        closeConsole: "关闭控制台",
        smartPlotDispatch: "智能打印分发",
        smartSyncDispatch: "智能同步分发",
        itemsSelectedQuestion: "您当前已选中 {count} 个项。请问是仅处理当前行，还是批量处理所有选中项？",
        processOnlyThis: "仅处理当前单行",
        processAllSelected: "批量处理全部 {count} 个选中项",
        liveEngineStatus: "引擎实时运行状态",
        tasksCount: "共 {count} 个任务",
        activeCount: "{count} 个执行中",
        queuedCount: "{count} 个排队中",
        errorCount: "{count} 个失败",
        queueEmpty: "当前运行队列为空",
        engineQueue: "同步任务队列",
        spreadsheetUpdate: "Excel 表格同步",
        accAttributesUpdate: "ACC 图纸属性同步",
        errorLabel: "错误原因",
        syncAnalyticsSummary: "数据同步分析概要",
        deltaReport: "属性差分对比报告",
        blockLabel: "图纸图块",
        propertyHeader: "图纸属性项",
        sourceOldHeader: "云端旧值 (旧)",
        targetNewHeader: "数据源新值 (新)",
        emptyLabel: "空值",
        modifiedLabel: "已被修改",
        noDeltaData: "此操作未产生任何属性差分对比数据。",
        acceptAndClose: "确认并关闭",
        telemetryPacketDispatched: "已成功将用户遥测数据分发至意见反馈数据库。",
        bugReport: "程序故障报告",
        featureRequest: "新功能建议",
        generalFeedback: "一般性意见",
        praiseLove: "产品称赞与致谢",
        poor: "极差",
        fair: "一般",
        good: "良好",
        veryGood: "优秀",
        excellent: "完美",
        feedbackPlaceholder: "请详述您的使用体验、需要改进的地方，或者您喜欢的功能...",
        selectOrDropScreenshot: "点击选择或拖拽屏幕截图至此",
        fileSpecs: "支持 5MB 以内的 PNG、JPG 或 GIF 格式",
        submitting: "正在提交数据...",
        adminPassgate: "管理员安全密钥通道",
        passgateDescription: "请输入安全的后台管理密码以解密并解锁用户反馈列表和系统诊断日志。",
        invalidPasscode: "安全密钥错误。拒绝访问。",
        verifying: "正在验证密钥...",
        unlockRegistry: "解锁管理员控制台",
        avgRating: "平均综合评分",
        reviewsCount: "{count} 条用户评价",
        telemetryFilter: "遥测类别过滤",
        allTelemetry: "全部用户反馈",
        bugReports: "程序故障日志",
        featureRequests: "功能建议列表",
        noTelemetry: "此分类下暂无任何反馈遥测记录",
        telemetryRenderNote: "实时收集的用户反馈与故障日志将在此动态呈递",
        attachedScreenshot: "附带的屏幕截图",
        deleteFeedbackEntry: "删除该反馈记录",
        statusSyncProjectState: "正在同步项目全局状态...",
        statusOrchestrateAsset: "正在构建资产对齐矩阵...",
        statusConsoleSynced: "控制台对齐完毕。共识别出 {count} 个资产变体。",
        statusAlignmentFailed: "资产对齐同步失败: {message}",
        stableLabel: "稳定版",
        loading: "正在加载...",
        discoveringFolders: "🔍 正在检索文件夹层级结构...",
        foldersSelected: "已选中 {count} 个文件夹",
        engineConnectivityMode: "引擎连接模式",
        selectFolderFirst: "(请先选择文件夹)",
        accPlusExcel: "ACC + EXCEL",
        onlyAcc: "仅限 ACC",
        syncingText: "正在同步...",
        refreshText: "刷新",
        refreshFeedbacks: "刷新注册表"
    },
    hi: {
        title: "एंटरप्राइज टाइटल ब्लॉक ऑटोमेशन और क्लाउड सिंक्रनाइज़ेशन",
        tagline: "Autodesk Construction Cloud ड्रॉइंग और स्प्रेडशीट को रीयल-टाइम में सिंक करें",
        engineStandby: "इंजन स्टैंडबाय पर है",
        engineReady: "ऑटोमेशन engine तैयार है। कनेक्शन स्थापित करने के लिए साइडबार से एक प्रोजेक्ट और एक्सेल स्रोत चुनें।",
        availableHubs: "उपलब्ध हब",
        targetProjects: "लक्षित परियोजनाएं",
        folderScope: "फ़ोल्डर दायरा (आवश्यक)",
        availableSpreadsheets: "स्रोत डेटा (एक्सेल)",
        syncMode: "सिंक्रनाइज़ेशन रणनीति",
        fullSync: "पूर्ण सिंक (द्वि-दिशात्मक)",
        accSync: "लाइट मोड (केवल निष्कर्षण)",
        descriptor: "विवरणक",
        linkedCloud: "संबद्ध क्लाउड संस्करण",
        identifiedAsset: "पहचाना गया एसेट",
        fileVersion: "फ़ाइल संस्करण",
        modify: "बदलाव करें",
        fromSpreadsheet: "स्प्रेडशीट से सिंक करें",
        fromAccAttributes: "ACC से सिंक करें",
        disconnected: "डिस्कनेक्टेड",
        operationsLog: "ऑपरेशन लॉग",
        detailedHistory: "सिंक निष्पादन का विस्तृत इतिहास",
        clearAll: "सभी साफ़ करें",
        noHistory: "कोई लॉग इतिहास नहीं मिला",
        recordsAppear: "सिंक कार्य पूरे होने के बाद यहाँ रिकॉर्ड दिखाई देंगे",
        feedbackButton: "प्रतिक्रिया दें",
        feedbackTitle: "अपनी प्रतिक्रिया साझा करें",
        feedbackSubtitle: "ऑटोमेशन को बेहतर बनाने में हमारी सहायता करें",
        category: "श्रेणी",
        rating: "आपका अनुभव",
        comment: "विवृत विवरण",
        screenshot: "स्क्रीनशॉट संलग्न करें (ड्रैग और ड्रॉप या क्लिक करें)",
        submitFeedback: "प्रतिक्रिया भेजें",
        feedbackSuccess: "धन्यवाद! आपकी प्रतिक्रिया दर्ज कर ली गई है।",
        viewFeedbackHub: "एडमिन: प्रतिक्रिया हब",
        feedbackHubTitle: "प्रतिक्रिया एवं इनसाइट्स रजिस्ट्री",
        feedbackHubSubtitle: "रीयल-टाइम उपयोगकर्ता प्रतिक्रिया टेलीमेट्री",
        language: "भाषा",
        sourceVersion: "स्रोत संस्करण",
        verified: "सत्यापित",
        viewTable: "तालिका देखें",
        visualInspectionNote: "इंजन सिंक्रनाइज़ेशन से पहले फ़ील्ड को सत्यापित करने के लिए दृश्य निरीक्षण का उपयोग करें।",
        syncConsole: "सिंक कंसोल चालू करें",
        selectExcelWarning: "कृपया ऊपर एक एक्सेल फ़ाइल चुनें",
        manual: "ऑपरेशनल मैनुअल",
        whatsNew: "रिलीज़ नोट्स",
        poweredByAPS: "APS द्वारा संचालित",
        selectFoldersFirst: "पहले फ़ोल्डर चुनें...",
        selectDataSource: "डेटा स्रोत चुनें...",
        endActiveSession: "सक्रिय सत्र समाप्त करें",
        signInHubControl: "हब कंट्रोल में साइन इन करें",
        refreshConsole: "कंसोल रीफ़्रेश करें",
        operationHistory: "ऑपरेशन इतिहास",
        persistentRecord: "इंजन गतिविधियों का स्थायी रिकॉर्ड",
        statusPreparing: "तैयारी",
        statusSyncing: "सिंक हो रहा है",
        statusWriting: "लिखा जा रहा है",
        statusReading: "पढ़ा जा रहा है",
        statusSuccess: "सफलता",
        statusSynced: "सिंक किया गया",
        statusFailed: "विफल",
        sourceAcc: "स्रोत: ACC",
        viewDeltaSummary: "डेल्टा सारांश देखें",
        engineEventLog: "इंजन इवेंट लॉग",
        idLabel: "आईडी",
        awaitingTelemetry: "इंजन टेलीमेट्री की प्रतीक्षा है...",
        closeConsole: "कंसोल बंद करें",
        smartPlotDispatch: "स्मार्ट प्लॉट प्रेषण",
        smartSyncDispatch: "स्मार्ट सिंक प्रेषण",
        itemsSelectedQuestion: "आपने {count} आइटम चुने हैं। क्या आप केवल इस पंक्ति को या सभी चयनित आइटमों को संसाधित करना चाहते हैं?",
        processOnlyThis: "केवल इस आइटम को संसाधित करें",
        processAllSelected: "सभी {count} चयनित संसाधित करें",
        liveEngineStatus: "लाइव इंजन स्थिति",
        tasksCount: "{count} कार्य",
        activeCount: "{count} सक्रिय",
        queuedCount: "{count} कतार में",
        errorCount: "{count} त्रुटि",
        queueEmpty: "कतार खाली है",
        engineQueue: "इंजन कतार",
        spreadsheetUpdate: "स्प्रेडशीट अपडेट",
        accAttributesUpdate: "ACC विशेषताएँ अपडेट",
        errorLabel: "त्रुटि",
        syncAnalyticsSummary: "सिंक विश्लेषिकी सारांश",
        deltaReport: "डेल्टा रिपोर्ट",
        blockLabel: "ब्लॉक",
        propertyHeader: "विशेषता",
        sourceOldHeader: "स्रोत (पुराना)",
        targetNewHeader: "लक्ष्य (नया)",
        emptyLabel: "खाली",
        modifiedLabel: "संशोधित",
        noDeltaData: "इस ऑपरेशन के लिए कोई डेल्टा डेटा उपलब्ध नहीं है।",
        acceptAndClose: "स्वीकार करें और बंद करें",
        telemetryPacketDispatched: "प्रतिक्रिया डेटाबेस में टेलीमेट्री पैकेट भेज दिया गया है।",
        bugReport: "बग रिपोर्ट",
        featureRequest: "सुविधा अनुरोध",
        generalFeedback: "सामान्य प्रतिक्रिया",
        praiseLove: "प्रशंसा और प्यार",
        poor: "खराब",
        fair: "ठीक-ठाक",
        good: "अच्छा",
        veryGood: "बहुत अच्छा",
        excellent: "उत्कृष्ट",
        feedbackPlaceholder: "हमें बताएं कि आपने क्या अनुभव किया, किसमें सुधार की आवश्यकता है, या क्या बहुत अच्छा काम करता है...",
        selectOrDropScreenshot: "स्क्रीनशॉट फ़ाइल चुनें या यहाँ छोड़ें",
        fileSpecs: "PNG, JPG या GIF 5MB तक",
        submitting: "भेजा जा रहा है...",
        adminPassgate: "एडमिन पासकोड गेट",
        passgateDescription: "प्रतिक्रिया रजिस्ट्री और डायग्नोस्टिक लॉग को अनलॉक करने के लिए सुरक्षित पासकोड दर्ज करें।",
        invalidPasscode: "अमान्य पासकोड। पहुंच अस्वीकृत।",
        verifying: "सत्यापित किया जा रहा है...",
        unlockRegistry: "रजिस्ट्री अनलॉक करें",
        avgRating: "औसत रेटिंग",
        reviewsCount: "{count} समीक्षाएं",
        telemetryFilter: "टेलीमेट्री फ़िल्टर",
        allTelemetry: "सभी टेलीमेट्री",
        bugReports: "बग रिपोर्ट्स",
        featureRequests: "सुविधा अनुरोध",
        noTelemetry: "इस श्रेणी में कोई टेलीमेट्री डेटा नहीं है",
        telemetryRenderNote: "प्रतिक्रिया मिलान यहाँ गतिशील रूप से रेंडर होंगे",
        attachedScreenshot: "संलग्न स्क्रीनशॉट",
        deleteFeedbackEntry: "प्रतिक्रिया हटाएं",
        statusSyncProjectState: "परियोजना स्थिति को सिंक किया जा रहा है...",
        statusOrchestrateAsset: "एसेट संरेखण का समन्वय किया जा रहा है...",
        statusConsoleSynced: "कंसोल सिंक किया गया। {count} पहचाने गए वेरिएंट मिले।",
        statusAlignmentFailed: "संरेखण विफल रहा: {message}",
        stableLabel: "स्थिर",
        loading: "लोड हो रहा है...",
        discoveringFolders: "🔍 फ़ोल्डर पदानुक्रम की खोज की जा रही है...",
        foldersSelected: "{count} फ़ोल्डर चयनित",
        engineConnectivityMode: "इंजन कनेक्टिविटी मोड",
        selectFolderFirst: "(पहले फ़ोल्डर का चयन करें)",
        accPlusExcel: "ACC + एक्सेल",
        onlyAcc: "केवल ACC",
        syncingText: "सिंक हो रहा है...",
        refreshText: "रीफ़्रेश",
        refreshFeedbacks: "रजिस्ट्री रीफ़्रेश करें"
    }
};

// --- APS Viewer Component ---
const APSViewer = ({ versionId, onClose, t }) => {
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
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{t('cloudAssetInspection') || 'Cloud Asset Inspection'}</h3>
                </div>
                <button
                    onClick={onClose}
                    style={{ background: '#F3F4F6', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px' }}
                >
                    <X size={16} /> {t('closePreview') || 'Close Preview'}
                </button>
            </div>
            <div ref={viewerContainer} style={{ flex: 1, position: 'relative', background: '#222' }} />
        </div>
    );
};



const ExcelPreviewModal = ({ 
    showExcelPreview, 
    setShowExcelPreview, 
    excelPreviewData, 
    previewLoading, 
    getSelectedExcelDetails,
    selectedProject,
    selectedHub,
    selectedFolderIds,
    selectedExcel,
    setSelectedExcel,
    fetchExcelFiles,
    fetchExcelPreview
}) => {
    if (!showExcelPreview) return null;

    const [isEditing, setIsEditing] = useState(false);
    const [gridData, setGridData] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [saveError, setSaveError] = useState('');
    const [newVersionInfo, setNewVersionInfo] = useState(null);

    useEffect(() => {
        if (excelPreviewData) {
            setGridData(JSON.parse(JSON.stringify(excelPreviewData)));
            setNewVersionInfo(null);
            setIsEditing(false);
            setSaveError('');
            setSaveStatus('');
        }
    }, [excelPreviewData, showExcelPreview]);

    const handleCellChange = (rowIndex, key, value) => {
        setGridData(prev => prev.map((row, idx) => {
            if (idx === rowIndex) {
                return { ...row, [key]: value };
            }
            return row;
        }));
    };

    const handleCancel = () => {
        if (window.confirm("Any changes you made will be lost. Are you sure you want to cancel?")) {
            setGridData(JSON.parse(JSON.stringify(excelPreviewData)));
            setIsEditing(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError('');
        setSaveStatus('Connecting to Autodesk Cloud Storage...');
        try {
            await new Promise(r => setTimeout(r, 800));
            setSaveStatus('Writing updated Excel data structures...');
            
            await new Promise(r => setTimeout(r, 600));
            setSaveStatus('Initiating secure S3 upload tunnel...');
            
            const res = await axios.post('/api/acc/save-excel', {
                projectId: selectedProject,
                excelVersionId: selectedExcel,
                rows: gridData
            });
            
            setSaveStatus('Finalizing document version registration...');
            await new Promise(r => setTimeout(r, 800));
            
            setNewVersionInfo(res.data);
            
            setSaveStatus('Refreshing UI registry...');
            await fetchExcelFiles(selectedHub, selectedProject, Array.from(selectedFolderIds));
            
            setSelectedExcel(res.data.newVersionId);
            
            setSaveStatus('Completed!');
        } catch (e) {
            console.error('Save Excel Error:', e);
            setSaveError(e.response?.data?.error || e.message || 'Unknown network error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
            {/* Main Modal Panel */}
            <div style={{ background: 'white', width: '90%', maxWidth: '1000px', maxHeight: '85vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
                
                {/* Save Overlay / Status Lightbox */}
                {(isSaving || saveStatus || newVersionInfo || saveError) && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px' }}>
                        <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', border: '1px solid #f1f5f9', padding: '32px', textAlign: 'center' }}>
                            <div style={{ 
                                background: saveError ? 'rgba(239, 68, 68, 0.1)' : newVersionInfo ? 'rgba(16, 185, 129, 0.1)' : 'rgba(6, 150, 215, 0.1)', 
                                width: '64px', 
                                height: '64px', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                margin: '0 auto 24px', 
                                border: `1px solid ${saveError ? 'rgba(239, 68, 68, 0.2)' : newVersionInfo ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 150, 215, 0.2)'}` 
                            }}>
                                {saveError ? (
                                    <span style={{ fontSize: '32px' }}>⚠️</span>
                                ) : newVersionInfo ? (
                                    <CheckCircle size={32} color="#10b981" />
                                ) : (
                                    <Loader2 size={32} className="animate-spin" color={ACC_THEME.primary} />
                                )}
                            </div>

                            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                                {saveError ? 'Save Failed' : newVersionInfo ? 'Version Saved!' : 'Syncing changes'}
                            </h3>
                            
                            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748b', fontWeight: '600', lineHeight: '1.5' }}>
                                {saveError ? 'An error occurred during version creation.' : saveStatus}
                            </p>

                            {saveError && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px', color: '#ef4444', fontSize: '12px', fontWeight: '600', textAlign: 'left', marginBottom: '24px', overflowX: 'auto', fontFamily: 'monospace' }}>
                                    {saveError}
                                </div>
                            )}

                            {newVersionInfo && (
                                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '16px', color: '#065f46', fontSize: '13px', fontWeight: '700', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div>Dataset: {getSelectedExcelDetails()?.name}</div>
                                    <div style={{ fontSize: '16px', fontWeight: '900' }}>Active Version: V{newVersionInfo.newVersionNumber}</div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                {saveError && (
                                    <button 
                                        onClick={() => { setSaveError(''); setIsSaving(false); setSaveStatus(''); }} 
                                        style={{ padding: '12px 24px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                        Back to Editor
                                    </button>
                                )}
                                {newVersionInfo && (
                                    <button 
                                        onClick={() => {
                                            setNewVersionInfo(null);
                                            setIsEditing(false);
                                            setShowExcelPreview(false);
                                        }} 
                                        style={{ padding: '12px 32px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '850', cursor: 'pointer', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}
                                    >
                                        Close Inspector
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div style={{ padding: '20px 32px', borderBottom: `1px solid ${ACC_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: ACC_THEME.sidebar }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Sync Data Inspector {isEditing ? '(Edit Mode)' : ''}</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: ACC_THEME.textSecondary }}>Previewing: {getSelectedExcelDetails()?.name || 'Dataset'}</p>
                    </div>
                    <button onClick={() => {
                        if (isEditing) {
                            if (!window.confirm("Any changes you made will be lost. Are you sure you want to exit?")) return;
                        }
                        setShowExcelPreview(false);
                    }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', opacity: 0.5 }}>&times;</button>
                </div>

                {/* Body Table */}
                <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                    {previewLoading ? (
                        <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                            <Loader2 className="animate-spin" size={32} color={ACC_THEME.primary} />
                            <p style={{ fontSize: '14px', color: ACC_THEME.textSecondary }}>Interrogating cloud data assets...</p>
                        </div>
                    ) : gridData && gridData.length > 0 ? (
                        <div style={{ border: `1px solid ${ACC_THEME.border}`, borderRadius: '4px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                <thead style={{ background: ACC_THEME.tableHeader, position: 'sticky', top: 0, zIndex: 10 }}>
                                    <tr>
                                        {Object.keys(gridData[0] || {}).map(key => (
                                            <th key={key} style={{ padding: '12px 16px', borderBottom: `2px solid ${ACC_THEME.border}`, fontWeight: '700', textTransform: 'uppercase', fontSize: '11px', color: ACC_THEME.textSecondary, background: '#f1f5f9' }}>{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {gridData.map((row, i) => (
                                        <tr key={i} style={{ borderBottom: `1px solid ${ACC_THEME.border}`, background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                                            {Object.keys(row).map((key, j) => {
                                                const val = row[key];
                                                return (
                                                    <td key={j} style={{ padding: isEditing ? '6px 8px' : '12px 16px' }}>
                                                        {isEditing ? (
                                                            <input 
                                                                type="text"
                                                                value={String(val !== undefined && val !== null ? val : '')}
                                                                onChange={(e) => handleCellChange(i, key, e.target.value)}
                                                                style={{ 
                                                                    width: '100%', 
                                                                    padding: '8px 10px', 
                                                                    border: '1px solid #cbd5e1', 
                                                                    borderRadius: '6px', 
                                                                    fontSize: '13px', 
                                                                    outline: 'none', 
                                                                    transition: 'border-color 0.15s, box-shadow 0.15s',
                                                                    background: 'white' 
                                                                }}
                                                                onFocus={(e) => { e.target.style.borderColor = ACC_THEME.primary; e.target.style.boxShadow = `0 0 0 3px rgba(6, 150, 215, 0.15)`; }}
                                                                onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                                                            />
                                                        ) : (
                                                            String(val !== undefined && val !== null ? val : '')
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', padding: '40px', color: ACC_THEME.textSecondary }}>No data rows found in this file.</p>
                    )}
                </div>

                {/* Footer Buttons */}
                <div style={{ padding: '16px 32px', borderTop: `1px solid ${ACC_THEME.border}`, display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc' }}>
                    {isEditing ? (
                        <>
                            <button 
                                onClick={handleCancel} 
                                style={{ padding: '10px 20px', background: 'white', border: `1px solid ${ACC_THEME.border}`, color: '#475569', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'all 0.15s' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave} 
                                style={{ padding: '10px 24px', background: ACC_THEME.primary, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(6, 150, 215, 0.2)' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#057da3'}
                                onMouseLeave={(e) => e.currentTarget.style.background = ACC_THEME.primary}
                            >
                                <Database size={14} /> Save
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={() => setIsEditing(true)} 
                                style={{ padding: '10px 20px', background: 'white', border: `1px solid ${ACC_THEME.primary}`, color: ACC_THEME.primary, borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(6, 150, 215, 0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                                Edit
                            </button>
                            <button 
                                onClick={() => setShowExcelPreview(false)} 
                                style={{ padding: '10px 24px', background: '#475569', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#475569'}
                            >
                                Done
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};




const StatusModal = ({ match, onClose, t }) => {
    if (!match) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', width: '700px', borderRadius: '8px', border: `1px solid ${ACC_THEME.border}`, padding: '0', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
                <div style={{ background: ACC_THEME.sidebar, padding: '24px', borderBottom: `1px solid ${ACC_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, color: ACC_THEME.text, fontSize: '18px', fontWeight: '600' }}>{t('engineEventLog') || 'Engine Event Log'}: {match.matchedFile?.name}</h3>
                        <p style={{ margin: '4px 0 0 0', color: ACC_THEME.textSecondary, fontSize: '12px' }}>{t('idLabel') || 'ID'}: {match.workItemId || 'UNINITIALIZED'}</p>
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
                    {(!match.logs || match.logs.length === 0) && <p style={{ color: ACC_THEME.textSecondary, textAlign: 'center', padding: '40px' }}>{t('awaitingTelemetry') || 'Awaiting engine telemetry...'}</p>}
                </div>

                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end', background: 'white' }}>
                    <button onClick={onClose} style={{ padding: '10px 24px', background: ACC_THEME.primary, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{t('closeConsole') || 'Close Console'}</button>
                </div>
            </div>
        </div>
    );
};

const ActionPromptModal = ({ 
    actionPrompt, 
    selectedIndices, 
    matches, 
    setActionPrompt, 
    enqueueJobs, 
    enqueuePrintJobs, 
    enqueueBulkPrintJob, 
    setSelectedIndices,
    t
}) => {
    if (!actionPrompt.show) return null;
    const { index, source, target, type } = actionPrompt;
    const count = selectedIndices.size;
    const isPrint = type === 'print';

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
            <div style={{ background: 'white', width: '420px', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #f1f5f9', position: 'relative' }}>
                <button 
                    onClick={() => setActionPrompt({ show: false })}
                    style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background 0.2s' }}
                >
                    <X size={20} />
                </button>
                <div style={{ background: isPrint ? '#fff1f2' : '#f0f9ff', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    {isPrint ? <Printer size={24} color="#EF4444" /> : <Zap size={24} color={ACC_THEME.primary} />}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                    {isPrint ? (t('smartPlotDispatch') || 'Smart Plot Dispatch') : (t('smartSyncDispatch') || 'Smart Sync Dispatch')}
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
                    {t('itemsSelectedQuestion').replace('{count}', count)}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button 
                        onClick={() => { 
                            if (isPrint) {
                                enqueuePrintJobs([index]);
                            } else {
                                enqueueJobs([index], source, target);
                            }
                            setActionPrompt({ show: false }); 
                        }}
                        style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: '700', color: '#0f172a', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}
                    >
                        <ArrowRight size={18} /> {isPrint ? (t('printOnlyThis') || 'Print only this drawing') : (t('processOnlyThis') || 'Process only this item')}
                    </button>
                    <button 
                        onClick={() => { 
                            if (isPrint) {
                                enqueueBulkPrintJob(Array.from(selectedIndices));
                            } else {
                                enqueueJobs(Array.from(selectedIndices), source, target);
                            }
                            setActionPrompt({ show: false }); 
                            setSelectedIndices(new Set()); 
                        }}
                        style={{ padding: '14px', background: isPrint ? '#EF4444' : ACC_THEME.primary, border: 'none', borderRadius: '12px', fontWeight: '700', color: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}
                    >
                        {isPrint ? <Printer size={18} color="white" /> : <Play size={18} fill="white" />} {isPrint ? `Print all ${count} selected` : (t('processAllSelected').replace('{count}', count))}
                    </button>
                </div>
            </div>
        </div>
    );
};

const JobQueuePanel = ({ jobQueue, isQueueExpanded, setIsQueueExpanded, removeJob, t }) => {
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
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{t('engineQueue') || 'Engine Queue'}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
                    {executingCount > 0 && <span title="Processing" style={{ background: '#0ea5e9', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>{t('activeCount').replace('{count}', executingCount)}</span>}
                    {pendingCount > 0 && <span title="Queued" style={{ background: '#64748b', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>{t('queuedCount').replace('{count}', pendingCount)}</span>}
                    {failedInQueue > 0 && <span title="Incomplete" style={{ background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>{t('errorCount').replace('{count}', failedInQueue)}</span>}
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
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{t('liveEngineStatus') || 'Live Engine Status'}</h4>
                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '800' }}>{t('tasksCount').replace('{count}', jobQueue.length)}</span>
                </div>
                <button onClick={() => setIsQueueExpanded(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Minimize2 size={16} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f8fafc' }}>
                {jobQueue.map(job => (
                    <div key={job.id} style={{ background: 'white', padding: '14px', borderRadius: '12px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ maxWidth: '80%' }}>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.fileName}</div>
                                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>{job.actionType === 'excel' ? (t('spreadsheetUpdate') || 'Spreadsheet Update') : (t('accAttributesUpdate') || 'ACC Attributes Update')}</div>
                            </div>
                            <button onClick={() => removeJob(job.id)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}><Trash2 size={14} /></button>
                        </div>
                        <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                            <div style={{ height: '100%', background: job.status === 'success' ? '#10b981' : (job.status === 'failed' ? '#ef4444' : '#0ea5e9'), width: `${job.progress}%`, transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '600' }}>
                            <span style={{ color: job.status === 'failed' ? '#ef4444' : '#64748b' }}>
                                {job.message === 'Preparing' ? t('statusPreparing') : 
                                 job.message === 'Syncing' ? t('statusSyncing') : 
                                 job.message === 'Writing' ? t('statusWriting') : 
                                 job.message === 'Reading' ? t('statusReading') : 
                                 job.message === 'Success' ? t('statusSuccess') : 
                                 job.message === 'Synced' ? t('statusSynced') : 
                                 job.message === 'Failed' ? t('statusFailed') : job.message}
                            </span>
                            <span style={{ color: '#94a3b8' }}>{job.progress}%</span>
                        </div>
                    </div>
                ))}
                {jobQueue.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        <Activity size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                        <div style={{ fontSize: '12px' }}>{t('queueEmpty') || 'Queue Empty'}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

const HistoryPanel = ({ jobHistory, clearJobHistory, deleteHistoryItem, showHistory, setShowHistory, setSelectedDiffMatch, setShowDiffSummary, t, lang }) => {
    if (!showHistory) return null;
    return (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '450px', height: '100vh', background: 'white', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px 32px', borderBottom: `1px solid ${ACC_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{t('operationHistory')}</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>{t('persistentRecord')}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={clearJobHistory}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                    >
                        {t('clearAll')}
                    </button>
                    <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
                {jobHistory.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center' }}>
                        <Database size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{t('noHistory')}</div>
                        <div style={{ fontSize: '12px', marginTop: '8px' }}>{t('recordsAppear')}</div>
                    </div>
                ) : (
                    (() => {
                        const grouped = jobHistory.reduce((acc, job) => {
                            const dateStr = new Date(job.completedAt).toLocaleDateString(lang, { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            });
                            if (!acc[dateStr]) acc[dateStr] = [];
                            acc[dateStr].push(job);
                            return acc;
                        }, {});

                        return Object.entries(grouped).map(([dateLabel, jobs]) => (
                            <div key={dateLabel} style={{ marginBottom: '24px' }}>
                                <div style={{ 
                                    fontSize: '11px', 
                                    fontWeight: '850', 
                                    color: '#475569', 
                                    textTransform: 'uppercase', 
                                    letterSpacing: '0.7px', 
                                    marginBottom: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    borderBottom: '1px solid #e2e8f0',
                                    paddingBottom: '8px',
                                    fontFamily: 'system-ui, sans-serif'
                                }}>
                                    <span style={{ background: '#cbd5e1', color: '#1e293b', padding: '1px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: '900' }}>{jobs.length}</span>
                                    {dateLabel}
                                </div>
                                {jobs.map((job, idx) => {
                                    const blockName = job.payload?.match?.excelRow?.BlockName || job.payload?.match?.matchedFile?.BlockName || '';
                                    return (
                                        <div 
                                            key={`${dateLabel}_${job.id || 'job'}_${idx}`} 
                                            onClick={() => {
                                                if (job.lastSyncDiff) {
                                                    setSelectedDiffMatch({ 
                                                        excelRow: { 
                                                            DrawingName: job.fileName,
                                                            BlockName: blockName
                                                        }, 
                                                        lastSyncDiff: job.lastSyncDiff 
                                                    });
                                                    setShowDiffSummary(true);
                                                }
                                            }}
                                            style={{ 
                                                padding: '16px', 
                                                borderRadius: '16px', 
                                                background: '#fff', 
                                                border: '1px solid #e2e8f0', 
                                                marginBottom: '12px', 
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)', 
                                                cursor: job.lastSyncDiff ? 'pointer' : 'default', 
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'relative'
                                            }}
                                            onMouseEnter={(e) => { 
                                                if (job.lastSyncDiff) {
                                                    e.currentTarget.style.transform = 'translateY(-2px)'; 
                                                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.08)'; 
                                                    e.currentTarget.style.borderColor = ACC_THEME.primary;
                                                }
                                            }}
                                            onMouseLeave={(e) => { 
                                                if (job.lastSyncDiff) {
                                                    e.currentTarget.style.transform = 'translateY(0)'; 
                                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)'; 
                                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                                }
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>{new Date(job.completedAt).toLocaleTimeString()}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ 
                                                        fontSize: '9px', 
                                                        fontWeight: '900', 
                                                        padding: '2px 8px', 
                                                        borderRadius: '6px', 
                                                        background: job.status === 'success' ? '#d1fae5' : '#fee2e2', 
                                                        color: job.status === 'success' ? '#065f46' : '#991b1b',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {job.status === 'success' ? t('statusSuccess') : t('statusFailed')}
                                                    </span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteHistoryItem(job.id); }}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', borderRadius: '50%' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                                        onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                                                        title="Delete history log"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '13px', fontWeight: '850', color: '#0f172a', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.fileName}</div>
                                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ textTransform: 'uppercase', fontWeight: '700', color: '#475569' }}>{job.actionType === 'excel' ? t('spreadsheetUpdate') : t('accAttributesUpdate')}</span>
                                                {blockName && <span style={{ color: '#94a3b8' }}>• {blockName}</span>}
                                            </div>
                                            {job.status === 'failed' && (
                                                <div style={{ fontSize: '11px', color: '#b91c1c', background: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5', marginTop: '10px', wordBreak: 'break-word' }}>
                                                    <strong>{t('errorLabel') || 'Error'}:</strong> {job.message}
                                                </div>
                                            )}
                                            {job.lastSyncDiff && (
                                                <div style={{ fontSize: '10px', color: ACC_THEME.primary, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                                                    <Eye size={12} /> {t('viewDeltaSummary')}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ));
                    })()
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
    const [showReleaseNotes, setShowReleaseNotes] = useState(false);
    const [actionPrompt, setActionPrompt] = useState({ show: false, index: null, source: '', target: '' });
     const [syncMode, setSyncMode] = useState('full'); // 'full' or 'acc'
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [isQueueExpanded, setIsQueueExpanded] = useState(false);
    const [titleBlocks, setTitleBlocks] = useState([]);

    // Translation and Feedback states
    const [lang, setLang] = useState('en');
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showFeedbackHub, setShowFeedbackHub] = useState(false);
    const [adminPasscode, setAdminPasscode] = useState(sessionStorage.getItem('admin_passcode') || '');
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackCategory, setFeedbackCategory] = useState('general');
    const [feedbackComment, setFeedbackComment] = useState('');
    const [feedbackScreenshot, setFeedbackScreenshot] = useState('');
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [feedbackSuccess, setFeedbackSuccess] = useState(false);
    const [feedbackList, setFeedbackList] = useState([]);
    const [loadingFeedbackList, setLoadingFeedbackList] = useState(false);

    // Lifted Feedback Hub States (to prevent dynamic hook violation crash)
    const [feedbackActiveFilter, setFeedbackActiveFilter] = useState('all');
    const [feedbackSelectedImage, setFeedbackSelectedImage] = useState(null);
    const [feedbackHubPasscode, setFeedbackHubPasscode] = useState('');
    const [feedbackHubError, setFeedbackHubError] = useState('');
    const [feedbackHubIsSubmitting, setFeedbackHubIsSubmitting] = useState(false);

    // Session-specific Operation History Tracker
    const [sessionNotificationCount, setSessionNotificationCount] = useState(0);

    // Persistent Print and Plot Configuration States
    const [printDestination, setPrintDestination] = useState(localStorage.getItem('print_destination') || 'download');
    const [printTargetFolderId, setPrintTargetFolderId] = useState(localStorage.getItem('print_target_folder_id') || '');
    const [printTargetFolderName, setPrintTargetFolderName] = useState(localStorage.getItem('print_target_folder_name') || '');
    const [printPaperSize, setPrintPaperSize] = useState(localStorage.getItem('print_paper_size') || 'ISO_A3');
    const [printPlotStyle, setPrintPlotStyle] = useState(localStorage.getItem('print_plot_style') || 'monochrome.ctb');
    const [printOrientation, setPrintOrientation] = useState(localStorage.getItem('print_orientation') || 'Landscape');
    const [printScale, setPrintScale] = useState(localStorage.getItem('print_scale') || 'Fit');
    const [printPlotArea, setPrintPlotArea] = useState(localStorage.getItem('print_plot_area') || 'Extents');
    const [printPlotLineweights, setPrintPlotLineweights] = useState(localStorage.getItem('print_plot_lineweights') !== 'false');
    const [printPlotTransparency, setPrintPlotTransparency] = useState(localStorage.getItem('print_plot_transparency') !== 'false');
    const [showPrintConfigModal, setShowPrintConfigModal] = useState(false);
    const [printingJobs, setPrintingJobs] = useState({});
    const loadedPrefsRef = useRef(null);

    const t = (key) => {
        return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
    };

    const translateStatus = (statusStr) => {
        if (!statusStr) return '';
        if (statusStr === 'Engine Standby') return t('engineStandby');
        if (statusStr === 'Synchronizing project state...') return t('statusSyncProjectState');
        if (statusStr === 'Orchestrating asset alignment...') return t('statusOrchestrateAsset');
        if (statusStr.startsWith('Console Synced. Found ')) {
            const match = statusStr.match(/\d+/);
            const count = match ? match[0] : '0';
            return t('statusConsoleSynced').replace('{count}', count);
        }
        if (statusStr.startsWith('Alignment failed: ')) {
            const msg = statusStr.replace('Alignment failed: ', '');
            return t('statusAlignmentFailed').replace('{message}', msg);
        }
        return statusStr;
    };

    const addJobToHistory = async (job, status, errorMsg = '') => {
        try {
            const completedJob = {
                id: job.id || Math.random().toString(36).substr(2, 9),
                status,
                completedAt: new Date().toISOString(),
                fileName: job.fileName || 'Unknown File',
                actionType: job.actionType || 'unknown',
                message: errorMsg || job.message || '',
                lastSyncDiff: job.lastSyncDiff || {},
                payload: job.payload || {}
            };
            
            // Post to backend database persistent storage
            await axios.post('/api/history', completedJob);

            // Fetch latest history to update UI
            const res = await axios.get('/api/history');
            setJobHistory(res.data);

            // Increment session notification count
            setSessionNotificationCount(prev => prev + 1);
        } catch (e) {
            console.error('Failed to log job completion persistently', e);
            // Fallback to local state
            const completedJob = {
                id: job.id || Math.random().toString(36).substr(2, 9),
                status,
                completedAt: new Date().toISOString(),
                fileName: job.fileName || 'Unknown File',
                actionType: job.actionType || 'unknown',
                message: errorMsg || job.message || '',
                lastSyncDiff: job.lastSyncDiff || {},
                payload: job.payload || {}
            };
            setJobHistory(h => [completedJob, ...h]);
            setSessionNotificationCount(prev => prev + 1);
        }
    };

    const clearJobHistory = async () => {
        if (!confirm('Clear all logs permanently?')) return;
        try {
            await axios.delete('/api/history');
            setJobHistory([]);
            setSessionNotificationCount(0);
        } catch (e) {
            console.error('Failed to clear operation history persistently', e);
            setJobHistory([]);
        }
    };

    const deleteHistoryItem = async (historyId) => {
        try {
            await axios.delete(`/api/history/${historyId}`);
            setJobHistory(h => h.filter(item => item.id !== historyId));
        } catch (e) {
            console.error('Failed to delete history item persistently', e);
            setJobHistory(h => h.filter(item => item.id !== historyId));
        }
    };

    const submitFeedback = async () => {
        if (!feedbackRating) {
            alert('Please select a star rating!');
            return;
        }
        if (!feedbackCategory) {
            alert('Please select a feedback category!');
            return;
        }
        setIsSubmittingFeedback(true);
        try {
            const browserMeta = {
                browser: navigator.userAgent,
                os: navigator.platform,
                url: window.location.href,
                screenSize: `${window.innerWidth}x${window.innerHeight}`
            };

            await axios.post('/api/feedback', {
                userName: user?.name || user?.userName || 'Local Developer',
                userEmail: user?.email || 'dev@example.local',
                rating: feedbackRating,
                category: feedbackCategory,
                comment: feedbackComment,
                screenshot: feedbackScreenshot,
                metadata: browserMeta
            });

            setFeedbackSuccess(true);
            setTimeout(() => {
                setFeedbackSuccess(false);
                setShowFeedbackModal(false);
                setFeedbackRating(0);
                setFeedbackCategory('general');
                setFeedbackComment('');
                setFeedbackScreenshot('');
            }, 2500);
        } catch (e) {
            console.error('Failed to submit feedback', e);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    const fetchFeedbacks = async (passcodeToUse = adminPasscode) => {
        setLoadingFeedbackList(true);
        try {
            const res = await axios.get('/api/feedback', {
                headers: { 'x-admin-secret': passcodeToUse }
            });
            setFeedbackList(Array.isArray(res.data) ? res.data : []);
            return true;
        } catch (e) {
            console.error('Failed to fetch feedback registry', e);
            return false;
        } finally {
            setLoadingFeedbackList(false);
        }
    };

    const handleDeleteFeedback = async (id) => {
        if (!window.confirm("Are you sure you want to delete this feedback entry?")) return;
        try {
            const secret = adminPasscode || sessionStorage.getItem('admin_passcode') || 'admin123';
            await axios.delete(`/api/feedback/${id}`, {
                headers: { 'x-admin-secret': secret }
            });
            await fetchFeedbacks(secret);
        } catch (err) {
            alert(`Delete failed: ${err.response?.data?.error || err.message}`);
        }
    };


    useEffect(() => {
        checkProfile();
        fetchTitleBlocks();
    }, []);

    useEffect(() => {
        if (adminPasscode) {
            const verifySaved = async () => {
                const ok = await fetchFeedbacks(adminPasscode);
                if (ok) {
                    setIsAdminAuthenticated(true);
                } else {
                    setAdminPasscode('');
                    sessionStorage.removeItem('admin_passcode');
                    setIsAdminAuthenticated(false);
                }
            };
            verifySaved();
        }
    }, [adminPasscode]);

    useEffect(() => {
        if (showFeedbackHub && isAdminAuthenticated && adminPasscode) {
            fetchFeedbacks(adminPasscode);
        }
    }, [showFeedbackHub, isAdminAuthenticated, adminPasscode]);
    
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

    const handlePrintDrawing = async (file) => {
        if (!file) return;
        const versionId = file.versionId;
        
        setPrintingJobs(prev => ({ ...prev, [versionId]: 'executing' }));

        try {
            const res = await axios.post('/api/acc/print', {
                versionId,
                projectId: selectedProject,
                hubId: selectedHub,
                paperSize: printPaperSize,
                plotStyle: printPlotStyle,
                orientation: printOrientation,
                scale: printScale,
                plotArea: printPlotArea,
                lineweights: printPlotLineweights,
                transparency: printPlotTransparency,
                destination: printDestination,
                targetFolderId: printTargetFolderId,
                targetFolderName: printTargetFolderName
            });

            setPrintingJobs(prev => ({ ...prev, [versionId]: 'success' }));

            if (printDestination === 'download' && res.data.downloadUrl) {
                const link = document.createElement('a');
                link.href = res.data.downloadUrl;
                link.setAttribute('download', `${file.name.replace('.dwg', '')}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            } else if (printDestination === 'acc') {
                alert(`Drawing successfully plotted and stored in ACC folder: ${printTargetFolderName}!`);
            }
        } catch (err) {
            console.error('[Print Drawing Error]', err);
            setPrintingJobs(prev => ({ ...prev, [versionId]: 'failed' }));
            alert(`Plotting failed: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleBulkPrint = async () => {
        const selectedFiles = Array.from(selectedIndices)
            .map(idx => matches[idx]?.matchedFile)
            .filter(f => f);

        if (selectedFiles.length === 0) {
            alert('Please select at least one drawing file to print!');
            return;
        }

        if (printDestination === 'acc' && !printTargetFolderId) {
            alert('Please configure your ACC target folder path first inside "Print Settings"!');
            return;
        }

        const confirmMsg = `Do you want to batch plot ${selectedFiles.length} drawing(s) to ${printDestination === 'download' ? 'Local Download' : `ACC Folder: ${printTargetFolderName}`}?`;
        if (!window.confirm(confirmMsg)) return;

        selectedFiles.forEach(file => {
            setPrintingJobs(prev => ({ ...prev, [file.versionId]: 'executing' }));
        });

        try {
            const res = await axios.post('/api/acc/print/bulk', {
                files: selectedFiles.map(f => ({ versionId: f.versionId, name: f.name })),
                projectId: selectedProject,
                hubId: selectedHub,
                paperSize: printPaperSize,
                plotStyle: printPlotStyle,
                orientation: printOrientation,
                scale: printScale,
                plotArea: printPlotArea,
                lineweights: printPlotLineweights,
                transparency: printPlotTransparency,
                destination: printDestination,
                targetFolderId: printTargetFolderId,
                targetFolderName: printTargetFolderName
            });

            selectedFiles.forEach(file => {
                setPrintingJobs(prev => ({ ...prev, [file.versionId]: 'success' }));
            });

            if (printDestination === 'download' && res.data.zipUrl) {
                const link = document.createElement('a');
                link.href = res.data.zipUrl;
                link.setAttribute('download', 'printed_drawings.zip');
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            } else if (printDestination === 'acc') {
                alert(`Successfully plotted and stored ${selectedFiles.length} drawing(s) in ACC folder: ${printTargetFolderName}!`);
            }
        } catch (err) {
            console.error('[Bulk Print Error]', err);
            selectedFiles.forEach(file => {
                setPrintingJobs(prev => ({ ...prev, [file.versionId]: 'failed' }));
            });
            alert(`Batch plotting failed: ${err.response?.data?.message || err.message}`);
        }
    };

    const handlePrintClick = (index, file) => {
        if (selectedIndices.size > 1 && selectedIndices.has(index)) {
            setActionPrompt({ show: true, index, type: 'print', file });
        } else {
            enqueuePrintJobs([index]);
        }
    };

    const enqueuePrintJobs = (indicesArray) => {
        if (printDestination === 'acc' && !printTargetFolderId) {
            alert('Please configure your ACC target folder path first inside "Print Settings"!');
            return;
        }
        const newJobs = indicesArray.map(idx => {
            const match = matches[idx];
            const file = match?.matchedFile;
            return {
                id: Math.random().toString(36).substr(2, 9),
                fileName: file?.name || 'Unknown',
                actionType: `PDF PLOT \u2192 ${printDestination === 'download' ? 'LOCAL' : 'ACC'}`,
                status: 'pending',
                progress: 0,
                message: 'In Queue',
                payload: { target: 'print', match, index: idx }
            };
        });
        setJobQueue(prev => [...prev, ...newJobs]);
        setIsQueueExpanded(true);
    };

    const enqueueBulkPrintJob = (indicesArray) => {
        if (printDestination === 'acc' && !printTargetFolderId) {
            alert('Please configure your ACC target folder path first inside "Print Settings"!');
            return;
        }
        const selectedFiles = indicesArray
            .map(idx => matches[idx]?.matchedFile)
            .filter(f => f);

        if (selectedFiles.length === 0) {
            alert('Please select at least one drawing file to print!');
            return;
        }

        const jobId = Math.random().toString(36).substr(2, 9);
        const bulkJob = {
            id: jobId,
            fileName: `Batch: ${selectedFiles.length} Drawings`,
            actionType: `BATCH PLOT \u2192 ${printDestination === 'download' ? 'LOCAL' : 'ACC'}`,
            status: 'pending',
            progress: 0,
            message: 'In Queue',
            payload: { target: 'bulk-print', selectedFiles }
        };

        setJobQueue(prev => [...prev, bulkJob]);
        setIsQueueExpanded(true);
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
        const { source, target, match, index, selectedFiles } = job.payload || {};

        try {
            if (target === 'print') {
                updateJob({ progress: 10, message: 'Initiating CAD Plot...' });
                const file = match.matchedFile;

                const res = await axios.post('/api/acc/print', {
                    versionId: file.versionId,
                    projectId: selectedProject,
                    hubId: selectedHub,
                    paperSize: printPaperSize,
                    plotStyle: printPlotStyle,
                    orientation: printOrientation,
                    scale: printScale,
                    plotArea: printPlotArea,
                    lineweights: printPlotLineweights,
                    transparency: printPlotTransparency,
                    destination: printDestination,
                    targetFolderId: printTargetFolderId,
                    targetFolderName: printTargetFolderName
                });

                updateJob({ progress: 40, message: 'CAD Engine Plotting...' });
                pollJobStatus(job.id, res.data.workItemId, file.versionId, null, 'print');
                setLoading(false); // Allow next queue tick
            } else if (target === 'bulk-print') {
                updateJob({ progress: 10, message: 'Initiating Batch CAD Plot...' });

                const res = await axios.post('/api/acc/print/bulk', {
                    files: selectedFiles.map(f => ({ versionId: f.versionId, name: f.name })),
                    projectId: selectedProject,
                    hubId: selectedHub,
                    paperSize: printPaperSize,
                    plotStyle: printPlotStyle,
                    orientation: printOrientation,
                    scale: printScale,
                    plotArea: printPlotArea,
                    lineweights: printPlotLineweights,
                    transparency: printPlotTransparency,
                    destination: printDestination,
                    targetFolderId: printTargetFolderId,
                    targetFolderName: printTargetFolderName
                });

                updateJob({ progress: 40, message: 'Cloud Engines Plotting (Parallel)...' });
                pollJobStatus(job.id, res.data.bulkJobId, null, null, 'bulk-print');
                setLoading(false); // Allow next queue tick
            } else if (target === 'drawing') {
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
                        if (targetJob) addJobToHistory(targetJob, 'success');
                        return prev.filter(j => j.id !== job.id);
                    });
                }, 2000);
            }
        } catch (e) {
            const errorMsg = e.response?.data?.error || e.response?.data || e.message;
            const finalizedError = typeof errorMsg === 'string' ? errorMsg : (JSON.stringify(errorMsg) || 'System Error');
            updateJob({ progress: 100, status: 'failed', message: finalizedError });
            setTimeout(() => {
                setJobQueue(prev => {
                    const targetJob = prev.find(j => j.id === job.id);
                    if (targetJob) addJobToHistory(targetJob, 'failed', finalizedError);
                    return prev.filter(j => j.id !== job.id);
                });
            }, 3000);
            setMatches(prev => prev.map(m => (m.matchedFile?.versionId === match.matchedFile?.versionId) ? { ...m, status: 'failed' } : m));
        }
    };

    const pollJobStatus = (jobId, workItemId, targetMatchId, activeDiff, originalSource) => {
        const interval = setInterval(async () => {
            try {
                const statusUrl = originalSource === 'bulk-print'
                    ? `/api/acc/print/bulk-status/${workItemId}`
                    : (originalSource === 'print' ? `/api/acc/print/status/${workItemId}` : `/api/automation/status/${workItemId}`);
                
                const res = await axios.get(statusUrl);
                const { status, downloadUrl, zipUrl, newVersion } = res.data;

                const isCompleted = status === 'finished' || status === 'success' || status === 'failed' || status === 'cancelled';

                if (isCompleted) {
                    clearInterval(interval);
                    const finalStatus = (status === 'finished' || status === 'success') ? 'success' : 'failed';
                    const finalMsg = finalStatus === 'success' ? 'Process Success' : 'Engine Failed';
                    
                    if (originalSource === 'print') {
                        setPrintingJobs(prev => ({ ...prev, [targetMatchId]: finalStatus }));
                        if (finalStatus === 'success' && printDestination === 'download' && downloadUrl) {
                            const link = document.createElement('a');
                            link.href = downloadUrl;
                            link.setAttribute('download', `printed_layout_${Date.now()}.pdf`);
                            document.body.appendChild(link);
                            link.click();
                            link.parentNode.removeChild(link);
                        }
                    } else if (originalSource === 'bulk-print') {
                        if (finalStatus === 'success' && printDestination === 'download' && zipUrl) {
                            const link = document.createElement('a');
                            link.href = zipUrl;
                            link.setAttribute('download', 'printed_drawings.zip');
                            document.body.appendChild(link);
                            link.click();
                            link.parentNode.removeChild(link);
                        }
                    } else {
                        if (finalStatus === 'success') {
                            setMatches(prev => prev.map(m => (m.matchedFile?.versionId === targetMatchId) ? { ...m, status: 'success', lastSyncDiff: activeDiff } : m));
                        }
                    }

                    setJobQueue(prev => prev.map(j => j.id === jobId ? { ...j, status: finalStatus, progress: 100, message: finalMsg, lastSyncDiff: activeDiff } : j));
                    
                    setTimeout(() => {
                        setJobQueue(prev => {
                            const targetJob = prev.find(j => j.id === jobId);
                            if (targetJob) addJobToHistory(targetJob, finalStatus, finalMsg);
                            return prev.filter(j => j.id !== jobId);
                        });
                    }, 3000);

                    if (originalSource !== 'print' && originalSource !== 'bulk-print' && status === 'finished') {
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
                    const prog = status === 'committing' ? 90 : (status === 'inprogress' ? 60 : (status === 'executing' ? 60 : 40));
                    const msg = status === 'committing' ? 'Finalizing Cloud Write...' : (status === 'inprogress' ? 'Transmitting CAD Data...' : (status === 'executing' ? 'CAD Engine Plotting...' : 'Preparing Engine...'));
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

        // Helper to check if a job writes back to the shared Excel sheet
        const writesToExcel = (job) => {
            const { source, target } = job?.payload || {};
            return target === 'excel' || (source === 'acc' && syncMode === 'full' && target === 'drawing');
        };

        // Resource Locking: Only one job can write to Excel at a time to prevent version conflicts
        const isExcelLockActive = executingJobs.some(writesToExcel);

        const pendingJobs = jobQueue.filter(j => j.status === 'pending');
        if (pendingJobs.length === 0) return;

        let startCount = 3 - executingCount;
        const jobsToStart = [];
        let excelInBatch = isExcelLockActive;

        for (const job of pendingJobs) {
            if (jobsToStart.length >= startCount) break;
            
            if (writesToExcel(job)) {
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

    const fetchTitleBlocks = async () => {
        try {
            const res = await axios.get('/api/automation/titleblocks');
            setTitleBlocks(res.data);
        } catch (e) {
            console.error("Failed to fetch title blocks", e);
        }
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
            loadedPrefsRef.current = prefs;

            try {
                const historyRes = await axios.get('/api/history');
                setJobHistory(historyRes.data);
            } catch (histErr) {
                console.error('Failed to load history from persistent storage', histErr);
            }

            if (prefs.syncMode) setSyncMode(prefs.syncMode);
            // Do not restore selected/expanded folder preferences to prevent heavy crawls/lag on project load
            // if (prefs.selectedFolderIds) setSelectedFolderIds(new Set(prefs.selectedFolderIds));
            // if (prefs.expandedFolderIds) setExpandedFolderIds(new Set(prefs.expandedFolderIds));
            if (prefs.printDestination) setPrintDestination(prefs.printDestination);
            if (prefs.printTargetFolderId) setPrintTargetFolderId(prefs.printTargetFolderId);
            if (prefs.printTargetFolderName) setPrintTargetFolderName(prefs.printTargetFolderName);
            if (prefs.printPaperSize) setPrintPaperSize(prefs.printPaperSize);
            if (prefs.printPlotStyle) setPrintPlotStyle(prefs.printPlotStyle);
            if (prefs.printOrientation) setPrintOrientation(prefs.printOrientation);
            if (prefs.printScale) setPrintScale(prefs.printScale);
            if (prefs.printPlotArea) setPrintPlotArea(prefs.printPlotArea);
            if (prefs.printPlotLineweights !== undefined) setPrintPlotLineweights(prefs.printPlotLineweights);
            if (prefs.printPlotTransparency !== undefined) setPrintPlotTransparency(prefs.printPlotTransparency);

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
                savePreference({ projectId: selectedProject, excelVersionId: '' });
                setSelectedExcel(''); // Only clear if project actually changed
                setMatches([]);
                prevProject.current = selectedProject;
            }
        }
    }, [selectedProject]);

    // Auto-save Folder Scope changes
    useEffect(() => {
        if (!isInitializing && selectedProject) {
            fetchExcelFiles(selectedHub, selectedProject, Array.from(selectedFolderIds));
            // Do not save folder scope selection/expanded state to preferences to prevent load lag
        }
    }, [selectedFolderIds, expandedFolderIds]);

    // Auto-save Sync Mode changes
    useEffect(() => {
        if (!isInitializing) {
            savePreference({ syncMode });
        }
    }, [syncMode]);

    // Auto-save Selected Excel changes
    useEffect(() => {
        if (!isInitializing && selectedExcel) {
            savePreference({ excelVersionId: selectedExcel });
        }
    }, [selectedExcel]);

    // Auto-save Print settings changes
    useEffect(() => {
        if (!isInitializing) {
            savePreference({
                printDestination,
                printTargetFolderId,
                printTargetFolderName,
                printPaperSize,
                printPlotStyle,
                printOrientation,
                printScale,
                printPlotArea,
                printPlotLineweights,
                printPlotTransparency
            });
        }
    }, [
        printDestination,
        printTargetFolderId,
        printTargetFolderName,
        printPaperSize,
        printPlotStyle,
        printOrientation,
        printScale,
        printPlotArea,
        printPlotLineweights,
        printPlotTransparency
    ]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                setShowFeedbackHub(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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

    const toggleFolder = (folderId, isBlocked = false) => {
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
                        borderLeft: effectiveSelected ? `2px solid ${ACC_THEME.primary}` : '2px solid transparent',
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
                        border: `1px solid ${effectiveSelected ? ACC_THEME.primary : '#CBD5E1'}`,
                        background: effectiveSelected ? ACC_THEME.primary : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {effectiveSelected && <Check size={10} color="white" />}
                    </div>
                    <Folder size={14} color={effectiveSelected ? ACC_THEME.primary : '#64748B'} />
                    <span style={{ 
                        fontSize: '12px', 
                        color: effectiveSelected ? ACC_THEME.primary : ACC_THEME.text, 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        fontWeight: effectiveSelected ? '700' : '400'
                    }}>
                        {folder.attributes?.name || folder.attributes?.displayName || folder.name}
                    </span>
                </div>
                {isExpanded && hasChildren && (
                    <div style={{ borderLeft: depth === 0 ? 'none' : `1px solid #E2E8F0`, marginLeft: '7px' }}>
                        {folder.children.map(child => (
                            <FolderTreeItem 
                                key={child.id} 
                                folder={child} 
                                depth={depth + 1} 
                                isBlocked={effectiveSelected} 
                            />
                        ))}
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

            // Auto-restore excelVersionId from preferences if not set
            let targetExcel = selectedExcel;
            if (!targetExcel && loadedPrefsRef.current && loadedPrefsRef.current.excelVersionId) {
                const prefExcelId = loadedPrefsRef.current.excelVersionId;
                const found = newFiles.find(f => f.versionId === prefExcelId);
                if (found) {
                    targetExcel = found.versionId;
                    setSelectedExcel(found.versionId);
                } else {
                    const baseId = prefExcelId.split('?')[0];
                    const foundBase = newFiles.find(f => f.id === baseId || f.versionId.startsWith(baseId));
                    if (foundBase) {
                        targetExcel = foundBase.versionId;
                        setSelectedExcel(foundBase.versionId);
                    }
                }
            }

            // Auto-update selectedExcel if the current file has a new version
            if (targetExcel) {
                const currentFile = newFiles.find(f => f.versionId === targetExcel);
                if (!currentFile) {
                    // Find by base URN if versionId changed
                    const oldBaseId = targetExcel.split('?')[0];
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
        
        const blockName = match.excelRow?.BlockName || match.matchedFile?.BlockName || '';
        let allowedAttributes = [];
        if (blockName && titleBlocks.length > 0) {
            const cleanName = String(blockName).toLowerCase().trim();
            const matchedTB = titleBlocks.find(tb => {
                const tbName = String(tb.name || '').toLowerCase().trim();
                return tbName.includes(cleanName) || cleanName.includes(tbName);
            });
            if (matchedTB && matchedTB.properties && matchedTB.properties.Attributes) {
                allowedAttributes = Object.keys(matchedTB.properties.Attributes);
            }
        }

        const rawDiffData = match.lastSyncDiff || [];
        const diffData = allowedAttributes.length > 0
            ? rawDiffData.filter(d => allowedAttributes.includes(d.key))
            : rawDiffData;

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
                            <p style={{ margin: 0, color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
                                {match.excelRow?.DrawingName || match.matchedFile?.name || 'Unknown Drawing'} • Delta Report
                                {blockName && <span style={{ marginLeft: '12px', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center' }}>BLOCK: {blockName}</span>}
                            </p>
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


    const renderFeedbackModal = () => {
        if (!showFeedbackModal) return null;

        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '20px' }}>
                <div style={{ background: 'white', width: '100%', maxWidth: '550px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', border: '1px solid rgba(255,255,255,0.1)' }}>
                    
                    {feedbackSuccess ? (
                        <div style={{ padding: '48px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '50%', marginBottom: '24px', animation: 'pulse 2s infinite' }}>
                                <CheckCircle size={48} color="#059669" />
                            </div>
                            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px' }}>{t('feedbackSuccess')}</h3>
                            <p style={{ color: '#64748b', fontSize: '13px', margin: 0, fontWeight: '500' }}>Dispatched telemetry packet to feedback database.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ padding: '32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{t('feedbackTitle')}</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{t('feedbackSubtitle')}</p>
                                </div>
                                <button onClick={() => setShowFeedbackModal(false)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f8fafc', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div style={{ padding: '32px', overflowY: 'auto', maxHeight: '70vh' }}>
                                {/* Category Selection */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '850', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>{t('category')}</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                        {[
                                            { id: 'bug', label: t('bugReport') || 'Bug Report', color: '#ef4444', bg: '#fef2f2' },
                                            { id: 'feature', label: t('featureRequest') || 'Feature Request', color: '#3b82f6', bg: '#eff6ff' },
                                            { id: 'general', label: t('generalFeedback') || 'General Feedback', color: '#10b981', bg: '#ecfdf5' },
                                            { id: 'praise', label: t('praiseLove') || 'Praise & Love', color: '#eab308', bg: '#fef9c3' }
                                        ].map(cat => (
                                            <div
                                                key={cat.id}
                                                onClick={() => setFeedbackCategory(cat.id)}
                                                style={{ 
                                                    padding: '12px', 
                                                    borderRadius: '12px', 
                                                    border: `2px solid ${feedbackCategory === cat.id ? cat.color : '#e2e8f0'}`, 
                                                    background: feedbackCategory === cat.id ? cat.bg : 'white', 
                                                    cursor: 'pointer', 
                                                    textAlign: 'center', 
                                                    fontSize: '13px', 
                                                    fontWeight: '700', 
                                                    color: feedbackCategory === cat.id ? cat.color : '#475569',
                                                    transition: 'all 0.15s' 
                                                }}
                                            >
                                                {cat.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Rating */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '850', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>{t('rating')}</label>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => setFeedbackRating(star)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                            >
                                                <Star 
                                                    size={32} 
                                                    color={star <= feedbackRating ? '#fbbf24' : '#cbd5e1'} 
                                                    fill={star <= feedbackRating ? '#fbbf24' : 'none'} 
                                                    style={{ transition: 'transform 0.1s' }}
                                                />
                                            </button>
                                        ))}
                                        {feedbackRating > 0 && (
                                            <span style={{ fontSize: '13px', fontWeight: '800', color: '#fbbf24', marginLeft: '6px' }}>
                                                {[t('poor') || 'Poor', t('fair') || 'Fair', t('good') || 'Good', t('veryGood') || 'Very Good', t('excellent') || 'Excellent'][feedbackRating - 1]}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Comments */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '850', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{t('comment')}</label>
                                    <textarea
                                        value={feedbackComment}
                                        onChange={(e) => setFeedbackComment(e.target.value)}
                                        placeholder={t('feedbackPlaceholder') || "Tell us what you experienced, what needs improvement, or what works great..."}
                                        style={{ width: '100%', height: '100px', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px', fontWeight: '500', resize: 'none', transition: 'border-color 0.15s' }}
                                        onFocus={(e) => e.target.style.borderColor = ACC_THEME.primary}
                                        onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                    />
                                </div>

                                {/* Screenshot Attachment */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '850', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{t('screenshot')}</label>
                                    
                                    {!feedbackScreenshot ? (
                                        <div 
                                            onClick={() => document.getElementById('feedback-screenshot-upload').click()}
                                            style={{ border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACC_THEME.primary; e.currentTarget.style.background = '#f0f9ff'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = 'white'; }}
                                        >
                                            <Upload size={24} color="#94a3b8" style={{ marginBottom: '8px' }} />
                                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>{t('selectOrDropScreenshot') || 'Select or drop a screenshot file'}</div>
                                            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{t('fileSpecs') || 'PNG, JPG, or GIF up to 5MB'}</div>
                                            <input 
                                                id="feedback-screenshot-upload"
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setFeedbackScreenshot(reader.result);
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                style={{ display: 'none' }} 
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                            <img src={feedbackScreenshot} alt="Screenshot Preview" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', background: '#f8fafc' }} />
                                            <button 
                                                onClick={() => setFeedbackScreenshot('')}
                                                style={{ position: 'absolute', top: '10px', right: '10px', background: '#fee2e2', border: 'none', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={submitFeedback}
                                    disabled={isSubmittingFeedback}
                                    style={{ 
                                        width: '100%', 
                                        padding: '14px', 
                                        background: `linear-gradient(135deg, ${ACC_THEME.primary} 0%, #0369a1 100%)`, 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '12px', 
                                        fontSize: '14px', 
                                        fontWeight: '800', 
                                        cursor: 'pointer', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        gap: '8px', 
                                        boxShadow: '0 10px 15px -3px rgba(6, 150, 215, 0.3)',
                                        opacity: isSubmittingFeedback ? 0.7 : 1
                                    }}
                                >
                                    {isSubmittingFeedback ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" /> {t('submitting') || 'Submitting...'}
                                        </>
                                    ) : (
                                        <>
                                            {t('submitFeedback')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderFeedbackHubModal = () => {
        if (!showFeedbackHub) return null;
        
        if (!isAdminAuthenticated) {
            return (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '20px' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #f1f5f9', padding: '32px', textAlign: 'center', position: 'relative' }}>
                        <button onClick={() => setShowFeedbackHub(false)} style={{ position: 'absolute', right: '20px', top: '20px', width: '32px', height: '32px', borderRadius: '50%', background: '#f8fafc', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={16} />
                        </button>
                        <div style={{ background: 'rgba(6, 150, 215, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(6, 150, 215, 0.2)' }}>
                            <Shield size={28} color={ACC_THEME.primary} />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{t('adminPassgate') || 'Admin Passcode Gate'}</h3>
                        <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                            {t('passgateDescription') || 'Enter the secure backend passcode to decrypt and unlock the product feedback registry and diagnostic logs.'}
                        </p>
                        
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setFeedbackHubError('');
                            setFeedbackHubIsSubmitting(true);
                            const ok = await fetchFeedbacks(feedbackHubPasscode);
                            if (ok) {
                                setAdminPasscode(feedbackHubPasscode);
                                sessionStorage.setItem('admin_passcode', feedbackHubPasscode);
                                setIsAdminAuthenticated(true);
                            } else {
                                setFeedbackHubError('Invalid passcode. Access Denied.');
                                setFeedbackHubPasscode('');
                            }
                            setFeedbackHubIsSubmitting(false);
                        }}>
                            <div style={{ marginBottom: '16px', position: 'relative' }}>
                                <input 
                                    type="password" 
                                    value={feedbackHubPasscode}
                                    onChange={(e) => setFeedbackHubPasscode(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{ width: '100%', padding: '12px 16px', border: `1px solid ${feedbackHubError ? ACC_THEME.error : '#e2e8f0'}`, borderRadius: '12px', fontSize: '16px', textAlign: 'center', letterSpacing: '4px', outline: 'none', transition: 'border-color 0.2s', background: '#f8fafc' }}
                                />
                            </div>

                            {feedbackHubError && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', color: ACC_THEME.error, fontSize: '12px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <span>⚠️ {feedbackHubError}</span>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={feedbackHubIsSubmitting}
                                style={{ width: '100%', padding: '14px', background: ACC_THEME.primary, color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '850', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s, transform 0.1s', boxShadow: '0 4px 6px rgba(6, 150, 215, 0.2)' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#057da3'}
                                onMouseLeave={(e) => e.currentTarget.style.background = ACC_THEME.primary}
                            >
                                {feedbackHubIsSubmitting ? (t('verifying') || 'Verifying...') : (t('unlockRegistry') || 'Unlock Registry')}
                            </button>
                        </form>
                    </div>
                </div>
            );
        }

        const filteredList = feedbackActiveFilter === 'all' 
            ? feedbackList 
            : feedbackList.filter(f => f.category === feedbackActiveFilter);

        const total = feedbackList.length;
        const averageRating = total > 0 
            ? (feedbackList.reduce((sum, item) => sum + item.rating, 0) / total).toFixed(1) 
            : '0.0';
        
        const categoriesCounts = feedbackList.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, { bug: 0, feature: 0, general: 0, praise: 0 });

        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '20px' }}>
                <div style={{ background: 'white', width: '100%', maxWidth: '1050px', height: '85vh', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.1)' }}>
                    
                    {/* Header */}
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Shield size={20} color={ACC_THEME.primary} />
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{t('feedbackHubTitle')}</h3>
                            </div>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{t('feedbackHubSubtitle')}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button 
                                onClick={() => fetchFeedbacks(adminPasscode)} 
                                disabled={loadingFeedbackList}
                                title={t('refreshFeedbacks')}
                                style={{ 
                                    width: '36px', 
                                    height: '36px', 
                                    borderRadius: '50%', 
                                    background: '#f8fafc', 
                                    border: 'none', 
                                    cursor: 'pointer', 
                                    color: '#64748b', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = ACC_THEME.primary; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
                            >
                                <RefreshCw size={18} className={loadingFeedbackList ? "animate-spin" : ""} style={{ color: loadingFeedbackList ? ACC_THEME.primary : 'inherit' }} />
                            </button>
                            <button onClick={() => setShowFeedbackHub(false)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f8fafc', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                        
                        {/* Sidebar: Analytics Dashboard */}
                        <div style={{ width: '280px', borderRight: '1px solid #f1f5f9', background: '#fafbfc', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
                            <div style={{ background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                                <div style={{ fontSize: '11px', fontWeight: '850', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{t('avgRating') || 'Avg Rating'}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a' }}>{averageRating}</span>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex' }}>
                                            {[1,2,3,4,5].map(s => (
                                                <Star key={s} size={14} color="#fbbf24" fill={s <= Math.round(parseFloat(averageRating)) ? '#fbbf24' : 'none'} />
                                            ))}
                                        </div>
                                        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', marginTop: '2px' }}>{t('reviewsCount').replace('{count}', total)}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                                <div style={{ fontSize: '11px', fontWeight: '850', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>{t('telemetryFilter') || 'Telemetry Filter'}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {[
                                        { id: 'all', label: t('allTelemetry') || 'All Telemetry', count: total, color: '#475569' },
                                        { id: 'bug', label: t('bugReports') || 'Bug Reports', count: categoriesCounts.bug, color: '#ef4444' },
                                        { id: 'feature', label: t('featureRequests') || 'Feature Requests', count: categoriesCounts.feature, color: '#3b82f6' },
                                        { id: 'general', label: t('generalFeedback') || 'General Feedback', count: categoriesCounts.general, color: '#10b981' },
                                        { id: 'praise', label: t('praiseLove') || 'Praise & Love', count: categoriesCounts.praise, color: '#eab308' }
                                    ].map(filter => (
                                        <div
                                            key={filter.id}
                                            onClick={() => setFeedbackActiveFilter(filter.id)}
                                            style={{ 
                                                padding: '10px 12px', 
                                                borderRadius: '10px', 
                                                cursor: 'pointer', 
                                                fontSize: '12px', 
                                                fontWeight: feedbackActiveFilter === filter.id ? '800' : '600', 
                                                color: feedbackActiveFilter === filter.id ? 'white' : '#475569',
                                                background: feedbackActiveFilter === filter.id ? filter.color : 'transparent',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'all 0.15s'
                                            }}
                                            onMouseEnter={(e) => { if (feedbackActiveFilter !== filter.id) e.currentTarget.style.background = '#f1f5f9'; }}
                                            onMouseLeave={(e) => { if (feedbackActiveFilter !== filter.id) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <span>{filter.label}</span>
                                            <span style={{ 
                                                fontSize: '10px', 
                                                padding: '2px 6px', 
                                                borderRadius: '6px', 
                                                background: feedbackActiveFilter === filter.id ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                                                color: feedbackActiveFilter === filter.id ? 'white' : '#475569',
                                                fontWeight: '800'
                                            }}>{filter.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Body: Feeds List */}
                        <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', background: '#f8fafc' }}>
                            {loadingFeedbackList ? (
                                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                    <Loader2 size={36} className="animate-spin" color={ACC_THEME.primary} />
                                </div>
                            ) : filteredList.length === 0 ? (
                                <div style={{ display: 'flex', height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                    <HelpCircle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                    <div style={{ fontSize: '14px', fontWeight: '700' }}>{t('noTelemetry') || 'No telemetry data in category'}</div>
                                    <div style={{ fontSize: '12px', marginTop: '4px' }}>{t('telemetryRenderNote') || 'Feedback matches will render here dynamically'}</div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {filteredList.map((item) => (
                                        <div 
                                            key={item.id} 
                                            style={{ 
                                                background: 'white', 
                                                borderRadius: '16px', 
                                                padding: '20px', 
                                                border: '1px solid #e2e8f0', 
                                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', alignItems: 'flex-start' }}>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>{item.userName}</div>
                                                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '500', marginTop: '2px' }}>{item.userEmail}</div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ 
                                                        fontSize: '9px', 
                                                        fontWeight: '900', 
                                                        padding: '2px 8px', 
                                                        borderRadius: '6px', 
                                                        background: item.category === 'bug' ? '#fee2e2' : item.category === 'feature' ? '#eff6ff' : item.category === 'general' ? '#ecfdf5' : '#fef9c3',
                                                        color: item.category === 'bug' ? '#ef4444' : item.category === 'feature' ? '#3b82f6' : item.category === 'general' ? '#10b981' : '#eab308',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {item.category}
                                                    </span>
                                                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
                                                        {new Date(item.createdAt).toLocaleString()}
                                                    </span>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteFeedback(item.id); }}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', borderRadius: '50%', marginLeft: '8px' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                                        onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                                                        title="Delete feedback entry"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Rating Stars */}
                                            <div style={{ display: 'flex', marginBottom: '10px' }}>
                                                {[1,2,3,4,5].map(s => (
                                                    <Star key={s} size={14} color="#fbbf24" fill={s <= item.rating ? '#fbbf24' : 'none'} />
                                                ))}
                                            </div>

                                            {/* Comment */}
                                            <p style={{ fontSize: '13px', color: '#334155', fontWeight: '500', margin: '0 0 16px 0', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                                {item.comment}
                                            </p>

                                            {/* Screenshot Expandable */}
                                            {item.screenshot && (
                                                <div style={{ marginTop: '12px' }}>
                                                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Attached Screenshot</div>
                                                    <div 
                                                        onClick={() => setFeedbackSelectedImage(item.screenshot)}
                                                        style={{ display: 'inline-block', position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer', maxWidth: '240px' }}
                                                    >
                                                        <img src={item.screenshot} alt="Attachment" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover' }} />
                                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                                                             onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                                             onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                                                        >
                                                            <Maximize2 size={18} color="white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Client Metadata */}
                                            {item.metadata && (
                                                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
                                                    <span>OS: {item.metadata.os || 'Unknown'}</span>
                                                    <span>Browser: {String(item.metadata.browser || '').split(' ').slice(-1)[0]}</span>
                                                    <span>Resolution: {item.metadata.screenSize || 'Unknown'}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Sub-Lightbox: High-res screenshot view */}
                {feedbackSelectedImage && (
                    <div 
                        onClick={() => setFeedbackSelectedImage(null)}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, padding: '40px' }}
                    >
                        <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
                            <img src={feedbackSelectedImage} alt="Expanded Screenshot" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} />
                            <button 
                                onClick={() => setFeedbackSelectedImage(null)}
                                style={{ position: 'absolute', top: '-16px', right: '-16px', background: 'white', border: 'none', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const PrintConfigModal = () => {
        if (!showPrintConfigModal) return null;

        const [tempDest, setTempDest] = useState(printDestination);
        const [tempFolderId, setTempFolderId] = useState(printTargetFolderId);
        const [tempFolderName, setTempFolderName] = useState(printTargetFolderName);
        const [tempPaperSize, setTempPaperSize] = useState(printPaperSize);
        const [tempPlotStyle, setTempPlotStyle] = useState(printPlotStyle);
        const [tempOrientation, setTempOrientation] = useState(printOrientation);
        const [tempScale, setTempScale] = useState(printScale);
        const [tempPlotArea, setTempPlotArea] = useState(printPlotArea);
        const [tempLineweights, setTempLineweights] = useState(printPlotLineweights);
        const [tempTransparency, setTempTransparency] = useState(printPlotTransparency);

        const getAllFolders = (folders) => {
            let list = [];
            for (const f of folders) {
                list.push(f);
                if (f.children && f.children.length > 0) {
                    list = list.concat(getAllFolders(f.children));
                }
            }
            return list;
        };
        const allFlatFolders = getAllFolders(folderList);
        
        const isFolderInScope = (folder, foldersTree) => {
            if (selectedFolderIds.has(folder.id)) return true;
            const findAncestors = (currentFolder, targetId, pathSoFar = []) => {
                if (currentFolder.id === targetId) return pathSoFar;
                if (currentFolder.children && currentFolder.children.length > 0) {
                    for (const child of currentFolder.children) {
                        const path = findAncestors(child, targetId, [...pathSoFar, currentFolder.id]);
                        if (path) return path;
                    }
                }
                return null;
            };
            for (const root of foldersTree) {
                const ancestors = findAncestors(root, folder.id);
                if (ancestors) {
                    if (ancestors.some(id => selectedFolderIds.has(id))) return true;
                }
            }
            return false;
        };

        const activeScopeFolders = allFlatFolders.filter(f => isFolderInScope(f, folderList));

        const isFolderVisibleInPrintTree = (folder) => {
            if (isFolderInScope(folder, folderList)) return true;
            const hasInScopeDescendant = (f) => {
                if (f.children && f.children.length > 0) {
                    for (const child of f.children) {
                        if (isFolderInScope(child, folderList) || hasInScopeDescendant(child)) return true;
                    }
                }
                return false;
            };
            return hasInScopeDescendant(folder);
        };

        const PrintFolderTreeItem = ({ folder, depth = 0 }) => {
            if (!isFolderVisibleInPrintTree(folder)) return null;
            
            const isSelected = tempFolderId === folder.id;
            const hasChildren = folder.children && folder.children.length > 0 && folder.children.some(isFolderVisibleInPrintTree);
            const inScope = isFolderInScope(folder, folderList);
            const isExpanded = expandedFolderIds.has(folder.id);

            return (
                <div style={{ marginLeft: depth > 0 ? '12px' : 0 }}>
                    <div 
                        onClick={() => {
                            if (inScope) {
                                setTempFolderId(folder.id);
                                setTempFolderName(folder.attributes?.name || folder.attributes?.displayName || folder.name);
                            }
                        }}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            padding: '6px 8px', 
                            cursor: inScope ? 'pointer' : 'not-allowed', 
                            borderRadius: '6px',
                            marginBottom: '2px',
                            background: isSelected ? 'rgba(239, 68, 68, 0.06)' : 'transparent',
                            borderLeft: isSelected ? `2px solid #EF4444` : '2px solid transparent',
                            opacity: inScope ? 1 : 0.6,
                            transition: 'all 0.15s'
                        }}
                    >
                        <div 
                            onClick={(e) => { e.stopPropagation(); toggleExpand(folder.id, e); }} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                width: '16px', 
                                height: '16px', 
                                cursor: 'pointer',
                                borderRadius: '4px'
                            }}
                        >
                            {hasChildren ? (
                                isExpanded ? <ChevronDown size={12} color="#64748B" /> : <ChevronRight size={12} color="#64748B" />
                            ) : <div style={{ width: 12 }} />}
                        </div>
                        <Folder size={14} color={isSelected ? '#EF4444' : '#64748B'} />
                        <span style={{ 
                            fontSize: '13px', 
                            color: isSelected ? '#EF4444' : '#334155', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            fontWeight: isSelected ? '700' : '500',
                        }}>
                            {folder.attributes?.name || folder.attributes?.displayName || folder.name}
                        </span>
                        {isSelected && <Check size={12} color="#EF4444" style={{ marginLeft: 'auto' }} />}
                    </div>
                    {isExpanded && hasChildren && (
                        <div style={{ borderLeft: `1px solid #E2E8F0`, marginLeft: '7px' }}>
                            {folder.children.map(child => <PrintFolderTreeItem key={child.id} folder={child} depth={depth + 1} />)}
                        </div>
                    )}
                </div>
            );
        };

        const handleApply = () => {
            setPrintDestination(tempDest);
            setPrintTargetFolderId(tempFolderId);
            setPrintTargetFolderName(tempFolderName);
            setPrintPaperSize(tempPaperSize);
            setPrintPlotStyle(tempPlotStyle);
            setPrintOrientation(tempOrientation);
            setPrintScale(tempScale);
            setPrintPlotArea(tempPlotArea);
            setPrintPlotLineweights(tempLineweights);
            setPrintPlotTransparency(tempTransparency);

            localStorage.setItem('print_destination', tempDest);
            localStorage.setItem('print_target_folder_id', tempFolderId);
            localStorage.setItem('print_target_folder_name', tempFolderName);
            localStorage.setItem('print_paper_size', tempPaperSize);
            localStorage.setItem('print_plot_style', tempPlotStyle);
            localStorage.setItem('print_orientation', tempOrientation);
            localStorage.setItem('print_scale', tempScale);
            localStorage.setItem('print_plot_area', tempPlotArea);
            localStorage.setItem('print_plot_lineweights', tempLineweights ? 'true' : 'false');
            localStorage.setItem('print_plot_transparency', tempTransparency ? 'true' : 'false');

            setShowPrintConfigModal(false);
        };

        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '20px' }}>
                <div style={{ background: 'white', width: '100%', maxWidth: '650px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #f1f5f9' }}>
                    
                    {/* Header */}
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Printer size={20} color="#EF4444" />
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>AutoCAD Plot Configuration</h3>
                        </div>
                        <button onClick={() => setShowPrintConfigModal(false)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f8fafc', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={16} />
                        </button>
                    </div>

                    <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {/* Print Destination Selection */}
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Print Target Destination</label>
                            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
                                <button 
                                    onClick={() => setTempDest('download')}
                                    style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: '700', borderRadius: '6px', border: 'none', background: tempDest === 'download' ? 'white' : 'transparent', color: tempDest === 'download' ? '#EF4444' : '#64748b', cursor: 'pointer', transition: 'all 0.2s', boxShadow: tempDest === 'download' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
                                >
                                    📥 Local Download (ZIP for bulk)
                                </button>
                                <button 
                                    onClick={() => setTempDest('acc')}
                                    style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: '700', borderRadius: '6px', border: 'none', background: tempDest === 'acc' ? 'white' : 'transparent', color: tempDest === 'acc' ? '#EF4444' : '#64748b', cursor: 'pointer', transition: 'all 0.2s', boxShadow: tempDest === 'acc' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
                                >
                                    📁 Store in Autodesk ACC / BIM 360
                                </button>
                            </div>
                        </div>

                        {/* ACC Folder Selection if active */}
                        {tempDest === 'acc' && (
                            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                                    Select Target ACC Folder (From Active Scope)
                                </label>
                                {activeScopeFolders.length === 0 ? (
                                    <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600', padding: '12px 0' }}>
                                        ⚠️ No folders are currently selected in your left sidebar "Folder Scope". Please select target folders in the sidebar first to store printed PDFs in ACC.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '10px', maxHeight: '200px', overflowY: 'auto', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px' }}>
                                        {folderList.map(rootFolder => (
                                            <PrintFolderTreeItem key={rootFolder.id} folder={rootFolder} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }} />

                        {/* Page & Plot Setup Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Paper Size</label>
                                <select 
                                    value={tempPaperSize}
                                    onChange={(e) => setTempPaperSize(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#1e293b', outline: 'none' }}
                                >
                                    <option value="ISO_A0">A0 (841 x 1189 mm)</option>
                                    <option value="ISO_A1">A1 (594 x 841 mm)</option>
                                    <option value="ISO_A2">A2 (420 x 594 mm)</option>
                                    <option value="ISO_A3">A3 (297 x 420 mm)</option>
                                    <option value="ISO_A4">A4 (210 x 297 mm)</option>
                                    <option value="ANSI_D">ANSI D (22 x 34 in)</option>
                                    <option value="ANSI_Letter">ANSI Letter (8.5 x 11 in)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Plot Style Table (.CTB)</label>
                                <select 
                                    value={tempPlotStyle}
                                    onChange={(e) => setTempPlotStyle(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#1e293b', outline: 'none' }}
                                >
                                    <option value="monochrome.ctb">Monochrome (Black & White)</option>
                                    <option value="acad.ctb">AutoCAD Color (acad.ctb)</option>
                                    <option value="grayscale.ctb">Grayscale Plot (grayscale.ctb)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Page Orientation</label>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#1e293b', cursor: 'pointer' }}>
                                        <input type="radio" name="orientation" checked={tempOrientation === 'Landscape'} onChange={() => setTempOrientation('Landscape')} style={{ accentColor: '#EF4444' }} />
                                        Landscape
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#1e293b', cursor: 'pointer' }}>
                                        <input type="radio" name="orientation" checked={tempOrientation === 'Portrait'} onChange={() => setTempOrientation('Portrait')} style={{ accentColor: '#EF4444' }} />
                                        Portrait
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Plot Scale</label>
                                <select 
                                    value={tempScale}
                                    onChange={(e) => setTempScale(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#1e293b', outline: 'none' }}
                                >
                                    <option value="Fit">Fit to Paper</option>
                                    <option value="1:1">1:1 (Actual Size)</option>
                                    <option value="1:2">1:2</option>
                                    <option value="1:5">1:5</option>
                                    <option value="1:10">1:10</option>
                                    <option value="1:50">1:50</option>
                                    <option value="1:100">1:100</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Plot Area</label>
                                <select 
                                    value={tempPlotArea}
                                    onChange={(e) => setTempPlotArea(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#1e293b', outline: 'none' }}
                                >
                                    <option value="Extents">Extents (All Drawing Objects)</option>
                                    <option value="Layout">Layout Sheets</option>
                                    <option value="Display">Active Display Coordinates</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={tempLineweights} onChange={(e) => setTempLineweights(e.target.checked)} style={{ accentColor: '#EF4444' }} />
                                    Plot Object Lineweights
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={tempTransparency} onChange={(e) => setTempTransparency(e.target.checked)} style={{ accentColor: '#EF4444' }} />
                                    Plot Object Transparency
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button 
                            onClick={() => setShowPrintConfigModal(false)}
                            style={{ padding: '10px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleApply}
                            disabled={tempDest === 'acc' && !tempFolderId}
                            style={{ padding: '10px 20px', background: (tempDest === 'acc' && !tempFolderId) ? '#fca5a5' : '#EF4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: (tempDest === 'acc' && !tempFolderId) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.2)' }}
                        >
                            Apply Settings
                        </button>
                    </div>

                </div>
            </div>
        );
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
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFBFC', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
                {showDocumentation && <DocumentationPage onClose={() => setShowDocumentation(false)} lang={lang} />}
                {showReleaseNotes && <ReleaseNotesPage onClose={() => setShowReleaseNotes(false)} lang={lang} />}
                
                {/* Floating Language Switcher */}
                <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 1000 }}>
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowLangMenu(!showLangMenu)}
                            style={{ padding: '8px 12px', background: 'white', color: ACC_THEME.text, border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}
                        >
                            <Globe size={14} color={ACC_THEME.primary} />
                            <span style={{ textTransform: 'uppercase', fontWeight: '800' }}>{lang}</span>
                            <ChevronDown size={12} />
                        </button>
                        {showLangMenu && (
                            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '150px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '6px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', zIndex: 110 }}>
                                {[
                                    { code: 'en', label: 'English' },
                                    { code: 'es', label: 'Español' },
                                    { code: 'fr', label: 'Français' },
                                    { code: 'de', label: 'Deutsch' },
                                    { code: 'ja', label: '日本語' },
                                    { code: 'zh', label: '中文' },
                                    { code: 'hi', label: 'हिन्दी' }
                                ].map(item => (
                                    <div
                                        key={item.code}
                                        onClick={() => { setLang(item.code); setShowLangMenu(false); }}
                                        style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: lang === item.code ? '800' : '500', color: lang === item.code ? ACC_THEME.primary : '#334155', background: lang === item.code ? '#f0f9ff' : 'transparent', transition: 'all 0.15s' }}
                                        onMouseEnter={(e) => { if (lang !== item.code) e.currentTarget.style.background = '#f8fafc'; }}
                                        onMouseLeave={(e) => { if (lang !== item.code) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ width: '100%', maxWidth: '440px', padding: '40px', background: 'white', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{ display: 'inline-flex', background: ACC_THEME.primary, padding: '12px', borderRadius: '12px', marginBottom: '24px' }}>
                            <Zap size={32} color="white" fill="white" />
                        </div>
                        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: '0 0 12px' }}>DWG Cloud Alter</h1>
                        <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '500', lineHeight: '1.5' }}>{t('title')}</p>
                    </div>

                    <button
                        onClick={() => window.location.href = `/api/auth/login?v=${Date.now()}`}
                        style={{ width: '100%', padding: '16px', background: ACC_THEME.primary, color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'transform 0.2s, background 0.2s', boxShadow: `0 4px 14px 0 ${ACC_THEME.primary}40` }}
                    >
                        {t('signInHubControl') || 'Sign in to Hub Control'} <ArrowRight size={18} />
                    </button>

                    <div style={{ marginTop: '32px', borderTop: '1px solid #f1f5f9', paddingTop: '24px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '24px' }}>
                        <div 
                            onClick={() => setShowDocumentation(true)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: ACC_THEME.primary, fontSize: '13px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                        >
                            <HelpCircle size={16} />
                            <span>{t('manual') || 'Operations Manual'}</span>
                        </div>
                        <div 
                            onClick={() => setShowReleaseNotes(true)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: ACC_THEME.primary, fontSize: '13px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                        >
                            <FileText size={16} />
                            <span>{t('whatsNew') || 'Release Notes'}</span>
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: ACC_THEME.bg, color: ACC_THEME.text, fontFamily: "'Inter', 'Segoe UI', sans-serif", overflow: 'hidden' }}>
            {showDocumentation && <DocumentationPage onClose={() => setShowDocumentation(false)} lang={lang} />}
            {showReleaseNotes && <ReleaseNotesPage onClose={() => setShowReleaseNotes(false)} lang={lang} />}
            {selectedMatch && <StatusModal match={selectedMatch} onClose={() => setSelectedMatch(null)} t={t} />}
            {showDiffSummary && <DiffSummaryModal match={selectedDiffMatch} onClose={() => { setShowDiffSummary(false); setSelectedDiffMatch(null); }} />}
            {activeUrn && <APSViewer versionId={activeUrn} onClose={() => setActiveUrn(null)} t={t} />}
            {showFeedbackModal && renderFeedbackModal()}
            {showFeedbackHub && renderFeedbackHubModal()}

            {actionPrompt.show && (
                <ActionPromptModal 
                    actionPrompt={actionPrompt} 
                    selectedIndices={selectedIndices}
                    matches={matches}
                    setActionPrompt={setActionPrompt}
                    enqueueJobs={enqueueJobs}
                    enqueuePrintJobs={enqueuePrintJobs}
                    enqueueBulkPrintJob={enqueueBulkPrintJob}
                    setSelectedIndices={setSelectedIndices}
                    t={t}
                />
            )}
            <JobQueuePanel 
                jobQueue={jobQueue} 
                isQueueExpanded={isQueueExpanded} 
                setIsQueueExpanded={setIsQueueExpanded}
                removeJob={removeJob}
                t={t}
            />
            {showHistory && (
                <HistoryPanel 
                    jobHistory={jobHistory} 
                    clearJobHistory={clearJobHistory}
                    deleteHistoryItem={deleteHistoryItem}
                    showHistory={showHistory}
                    setShowHistory={setShowHistory}
                    setSelectedDiffMatch={setSelectedDiffMatch}
                    setShowDiffSummary={setShowDiffSummary}
                    t={t}
                    lang={lang}
                />
            )}
            <ExcelPreviewModal 
                showExcelPreview={showExcelPreview} 
                setShowExcelPreview={setShowExcelPreview} 
                excelPreviewData={excelPreviewData} 
                previewLoading={previewLoading} 
                getSelectedExcelDetails={getSelectedExcelDetails} 
                selectedProject={selectedProject}
                selectedHub={selectedHub}
                selectedFolderIds={selectedFolderIds}
                selectedExcel={selectedExcel}
                setSelectedExcel={setSelectedExcel}
                fetchExcelFiles={fetchExcelFiles}
                fetchExcelPreview={fetchExcelPreview}
            />
            <PrintConfigModal />

            <div style={{ width: '300px', background: ACC_THEME.sidebar, borderRight: `1px solid ${ACC_THEME.border}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px', borderBottom: `1px solid ${ACC_THEME.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: ACC_THEME.primary, padding: '6px', borderRadius: '6px' }}>
                        <Zap size={22} color="white" />
                    </div>
                    <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '700', color: ACC_THEME.text }}>DWG Cloud Alter</h2>
                </div>

                <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: ACC_THEME.textSecondary, marginBottom: '8px', textTransform: 'uppercase' }}>{t('availableHubs')}</label>
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
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: ACC_THEME.textSecondary, marginBottom: '8px', textTransform: 'uppercase' }}>{t('targetProjects')}</label>
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
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase' }}>{t('folderScope')}</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {selectedProject && (
                                    <button 
                                        onClick={() => fetchFolders(selectedHub, selectedProject, false)} 
                                        style={{ background: 'none', border: 'none', color: ACC_THEME.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', padding: 0 }}
                                    >
                                        <RefreshCw size={10} className={isRefreshingFolders ? 'animate-spin' : ''} /> {t('refreshText')}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div style={{ background: '#FFFFFF', borderRadius: '4px', border: `1px solid ${ACC_THEME.border}`, height: '250px', overflowY: 'auto', padding: '6px', position: 'relative' }}>
                            {!selectedProject ? (
                                <div style={{ fontSize: '12px', color: ACC_THEME.textSecondary, textAlign: 'center', padding: '40px 16px' }}>
                                    {lang === 'es' ? "Seleccione un proyecto primero" :
                                     lang === 'fr' ? "Sélectionnez d'abord un projet" :
                                     lang === 'de' ? "Wählen Sie zuerst ein Projekt" :
                                     lang === 'ja' ? "先にプロジェクトを選択してください" :
                                     lang === 'zh' ? "请先选择项目" :
                                     lang === 'hi' ? "पहले एक परियोजना चुनें" : "Select a project first"}
                                </div>
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
                                <div style={{ fontSize: '12px', color: ACC_THEME.textSecondary, textAlign: 'center', padding: '40px 16px' }}>
                                    {lang === 'es' ? "No se encontraron carpetas" :
                                     lang === 'fr' ? "Aucun dossier trouvé" :
                                     lang === 'de' ? "Keine Ordner gefunden" :
                                     lang === 'ja' ? "フォルダが見つかりません" :
                                     lang === 'zh' ? "未找到文件夹" :
                                     lang === 'hi' ? "कोई फ़ोल्डर नहीं मिला" : "No folders found"}
                                </div>
                            ) : (
                                folderList.map(folder => (
                                    <FolderTreeItem key={folder.id} folder={folder} />
                                ))
                            )}
                        </div>
                        <div style={{ fontSize: '10px', color: ACC_THEME.success, marginTop: '6px', fontStyle: 'italic', fontWeight: '700' }}>
                            {isRefreshingFolders ? t('discoveringFolders') : (selectedFolderIds.size === 0 ? "" : t('foldersSelected').replace('{count}', selectedFolderIds.size))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px', padding: '12px', background: 'rgba(6, 150, 215, 0.05)', borderRadius: '8px', border: '1px solid rgba(6, 150, 215, 0.1)', opacity: selectedFolderIds.size === 0 ? 0.5 : 1, pointerEvents: selectedFolderIds.size === 0 ? 'none' : 'auto', transition: 'opacity 0.3s' }}>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: ACC_THEME.primary, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                            {t('engineConnectivityMode')} {selectedFolderIds.size === 0 && <span style={{ color: '#94a3b8', marginLeft: '4px' }}>{t('selectFolderFirst')}</span>}
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
                                {t('accPlusExcel')}
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
                                {t('onlyAcc')}
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
                                        {t('availableSpreadsheets')}
                                    </label>
                                    <button
                                        onClick={() => fetchExcelFiles(selectedHub, selectedProject, Array.from(selectedFolderIds))}
                                        disabled={!selectedProject || isRefreshingExcel || selectedFolderIds.size === 0}
                                        style={{ background: 'none', border: 'none', color: (isRefreshingExcel || selectedFolderIds.size === 0) ? '#999' : ACC_THEME.primary, cursor: (selectedProject && !isRefreshingExcel && selectedFolderIds.size > 0) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800' }}
                                    >
                                        <RefreshCw size={12} className={isRefreshingExcel ? 'animate-spin' : ''} style={{ animationDuration: '0.8s' }} />
                                        {isRefreshingExcel ? <span style={{ color: '#666' }}>{t('syncingText')}</span> : t('refreshText')}
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
                                        <option value="">{selectedFolderIds.size === 0 ? t('selectFoldersFirst') : t('selectDataSource')}</option>
                                        {excelFiles.map(f => <option key={f.id} value={f.versionId}>{f.name} (V{f.version})</option>)}
                                    </select>
                                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: ACC_THEME.textSecondary }} />
                                </div>
                            </div>

                            {selectedExcel && (
                                <div style={{ marginBottom: '32px', padding: '16px', background: 'white', border: `1px solid ${ACC_THEME.border}`, borderRadius: '6px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '10px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase', marginBottom: '4px' }}>{t('sourceVersion')}</div>
                                            <div style={{ fontSize: '14px', fontWeight: '800', color: ACC_THEME.text }}>
                                                V{getSelectedExcelDetails()?.version || '1'}
                                                <span style={{ marginLeft: '8px', fontSize: '10px', color: ACC_THEME.success, background: '#E6FFFA', padding: '2px 6px', borderRadius: '4px' }}>{t('verified')}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={fetchExcelPreview}
                                            style={{ padding: '6px 10px', background: '#F8F9FA', border: `1px solid ${ACC_THEME.border}`, borderRadius: '4px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <FileText size={12} /> {t('viewTable')}
                                        </button>
                                    </div>
                                    <div style={{ fontSize: '11px', color: ACC_THEME.textSecondary, lineHeight: '1.4' }}>
                                        {t('visualInspectionNote')}
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
                            {t('syncConsole')}
                        </button>
                        {syncMode === 'full' && !selectedExcel && selectedProject && (
                            <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '8px', textAlign: 'center', fontWeight: '700' }}>
                                {t('selectExcelWarning')}
                            </div>
                        )}
                    </div>

                </div>

                <div style={{ padding: '16px 24px', borderTop: `1px solid ${ACC_THEME.border}`, background: '#f8f9fa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div 
                            onClick={() => setShowDocumentation(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: ACC_THEME.primary, fontSize: '11px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                        >
                            <HelpCircle size={14} />
                            <span>{t('manual')}</span>
                        </div>
                        <div 
                            onClick={() => setShowReleaseNotes(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: ACC_THEME.primary, fontSize: '11px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                        >
                            <FileText size={14} />
                            <span>{t('whatsNew')}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '11px', fontWeight: '600' }}>
                            <Shield size={14} />
                            <span>{t('poweredByAPS')}</span>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                            v2.3.0 {t('stableLabel')}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <header style={{ padding: '12px 32px', borderBottom: `1px solid ${ACC_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', minHeight: '64px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h1 style={{ fontSize: '18px', margin: 0, fontWeight: '800', color: '#0f172a' }}>{t('title')}</h1>
                        <span style={{ fontSize: '12px', color: ACC_THEME.textSecondary, borderLeft: `1px solid ${ACC_THEME.border}`, paddingLeft: '16px' }}> {translateStatus(status)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {matches.length > 0 && (
                            <button
                                onClick={() => startMatching(true)}
                                disabled={loading}
                                style={{ padding: '8px 16px', background: 'white', color: ACC_THEME.text, border: `1px solid ${ACC_THEME.border}`, borderRadius: '6px', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: loading ? 'not-allowed' : 'pointer' }}
                            >
                                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {t('refreshConsole')}
                            </button>
                        )}

                        {/* Globe Language Switcher */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <button
                                onClick={() => setShowLangMenu(!showLangMenu)}
                                style={{ padding: '8px 12px', background: 'white', color: ACC_THEME.text, border: `1px solid ${ACC_THEME.border}`, borderRadius: '6px', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                <Globe size={14} color={ACC_THEME.primary} />
                                <span style={{ textTransform: 'uppercase', fontWeight: '800' }}>{lang}</span>
                                <ChevronDown size={12} />
                            </button>
                            {showLangMenu && (
                                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '150px', background: 'white', borderRadius: '12px', border: `1px solid ${ACC_THEME.border}`, padding: '6px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', zIndex: 110 }}>
                                    {[
                                        { code: 'en', label: 'English' },
                                        { code: 'es', label: 'Español' },
                                        { code: 'fr', label: 'Français' },
                                        { code: 'de', label: 'Deutsch' },
                                        { code: 'ja', label: '日本語' },
                                        { code: 'zh', label: '中文' },
                                        { code: 'hi', label: 'हिन्दी' }
                                    ].map(item => (
                                        <div
                                            key={item.code}
                                            onClick={() => { setLang(item.code); setShowLangMenu(false); }}
                                            style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: lang === item.code ? '800' : '500', color: lang === item.code ? ACC_THEME.primary : '#334155', background: lang === item.code ? '#f0f9ff' : 'transparent', transition: 'all 0.15s' }}
                                            onMouseEnter={(e) => { if (lang !== item.code) e.currentTarget.style.background = '#f8fafc'; }}
                                            onMouseLeave={(e) => { if (lang !== item.code) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Share Feedback Button */}
                        <button
                            onClick={() => setShowFeedbackModal(true)}
                            style={{ 
                                padding: '8px 16px', 
                                background: `linear-gradient(135deg, ${ACC_THEME.primary} 0%, #0369a1 100%)`, 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '6px', 
                                fontWeight: '750', 
                                fontSize: '12px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(6, 150, 215, 0.2)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(6, 150, 215, 0.3)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(6, 150, 215, 0.2)'; }}
                        >
                            <MessageSquare size={14} /> 
                            {t('feedbackButton')}
                        </button>
                        
                        <button
                            onClick={() => { setShowHistory(true); setSessionNotificationCount(0); }}
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
                            {t('operationHistory')}
                            {sessionNotificationCount > 0 && (
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
                                    {sessionNotificationCount}
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
                                <h3 style={{ fontSize: '24px', fontWeight: '900', color: ACC_THEME.text, margin: '0 0 16px' }}>{t('engineStandby')}</h3>
                                <p style={{ fontSize: '16px', color: ACC_THEME.textSecondary, lineHeight: '1.6', margin: 0 }}>
                                    {t('engineReady')}
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
                                                        {t('descriptor')}
                                                        {sortConfig.key === 'drawing' && (sortConfig.direction === 'asc' ? <ChevronRight size={12} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />)}
                                                    </div>
                                                </th>
                                                <th onClick={() => handleSort('cloud')} style={{ padding: '14px 24px', borderBottom: `1px solid ${ACC_THEME.border}`, fontSize: '12px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase', cursor: 'pointer' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {t('linkedCloud')}
                                                        {sortConfig.key === 'cloud' && (sortConfig.direction === 'asc' ? <ChevronRight size={12} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />)}
                                                    </div>
                                                </th>
                                            </>
                                        ) : (
                                            <th onClick={() => handleSort('cloud')} style={{ padding: '14px 24px', borderBottom: `1px solid ${ACC_THEME.border}`, fontSize: '12px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase', cursor: 'pointer' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {t('identifiedAsset')}
                                                    {sortConfig.key === 'cloud' && (sortConfig.direction === 'asc' ? <ChevronRight size={12} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />)}
                                                </div>
                                            </th>
                                        )}
                                        {syncMode === 'full' && (
                                            <th onClick={() => handleSort('version')} style={{ padding: '14px 24px', borderBottom: `1px solid ${ACC_THEME.border}`, fontSize: '12px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase', width: '120px', cursor: 'pointer' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {t('fileVersion')}
                                                    {sortConfig.key === 'version' && (sortConfig.direction === 'asc' ? <ChevronRight size={12} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />)}
                                                </div>
                                            </th>
                                        )}
                                        <th style={{ padding: '14px 24px', borderBottom: `1px solid ${ACC_THEME.border}`, fontSize: '12px', fontWeight: '700', color: ACC_THEME.textSecondary, textTransform: 'uppercase', textAlign: 'center' }}>{t('modify')}</th>

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
                                                                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{t('sourceAcc')}</span>
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
                                                                    m.status === 'starting' ? t('statusPreparing') :
                                                                    m.status === 'executing' ? t('statusSyncing') :
                                                                    m.status === 'finalizing' ? t('statusWriting') :
                                                                    m.status === 'extracting' ? t('statusReading') :
                                                                    m.status === 'extracted' ? t('statusSuccess') :
                                                                    m.status === 'success' ? t('statusSynced') :
                                                                    m.status === 'failed' ? t('statusFailed') : ''
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ color: ACC_THEME.error, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                                                        <AlertCircle size={14} /> {t('disconnected')}
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
                                                            title={lang === 'es' ? "Actualizar dibujo y atributos de ACC desde la hoja de cálculo" :
                                                                   lang === 'fr' ? "Mettre à jour le dessin et les attributs ACC à partir de la feuille de calcul" :
                                                                   lang === 'de' ? "Zeichnung und ACC-Attribute aus der Tabelle aktualisieren" :
                                                                   lang === 'ja' ? "スプレッドシートから図面とACC属性を更新" :
                                                                   lang === 'zh' ? "从电子表格更新图纸和 ACC 属性" :
                                                                   lang === 'hi' ? "स्प्रेडशीट से ड्रॉइंग और ACC विशेषताएँ अपडेट करें" : "Update Drawing & ACC Attributes from Spreadsheet"}
                                                        >
                                                            <FileText size={12} color={ACC_THEME.primary} /> {t('fromSpreadsheet')}
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
                                                        title={syncMode === 'acc' ? 
                                                               (lang === 'es' ? "Actualizar dibujo desde atributos de ACC" :
                                                                lang === 'fr' ? "Mettre à jour le dessin à partir des attributs ACC" :
                                                                lang === 'de' ? "Zeichnung aus ACC-Attributen aktualisieren" :
                                                                lang === 'ja' ? "ACC属性から図面を更新" :
                                                                lang === 'zh' ? "从 ACC 属性更新图纸" :
                                                                lang === 'hi' ? "ACC विशेषताओं से ड्रॉइंग अपडेट करें" : "Update Drawing from ACC Attributes") :
                                                               (lang === 'es' ? "Actualizar dibujo y hoja de cálculo desde atributos de ACC" :
                                                                lang === 'fr' ? "Mettre à jour le dessin et la feuille de calcul à partir des attributs ACC" :
                                                                lang === 'de' ? "Zeichnung und Tabelle aus ACC-Attributen aktualisieren" :
                                                                lang === 'ja' ? "ACC属性から図面とスプレッドシートを更新" :
                                                                lang === 'zh' ? "从 ACC 属性更新图纸和电子表格" :
                                                                lang === 'hi' ? "ACC विशेषताओं से ड्रॉइंग और स्प्रेडशीट अपडेट करें" : "Update Drawing & Spreadsheet from ACC Attributes")}
                                                    >
                                                        <Shield size={12} color="#059669" /> {t('fromAccAttributes')}
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

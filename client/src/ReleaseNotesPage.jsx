import React from 'react';
import { 
    Zap, 
    X, 
    Shield, 
    CheckCircle2, 
    Layers, 
    Activity, 
    FileText,
    Wrench
} from 'lucide-react';

const LOCALIZED_CONTENT = {
    en: {
        header: "DWG Cloud Alter • Release Notes",
        badge: "VERSION 2.3.0 STABLE",
        title: "What's New in v2.3.0",
        description: "This release introduces critical concurrency protection, optimizes directory traversals to solve lag, simplifies selection tools, and delivers essential bug fixes for input focus and telemetry data management.",
        sec1_title: "New Features & UI Polish",
        sec1_b1: "Telemetry Record Deletion: Administrators can now delete telemetry, praise, and bug records directly from the secure Feedback Hub using the quick-delete action.",
        sec1_b2: "Streamlined Grid Layout: Removed the redundant \"Batch Action\" floating header bar when selecting drawings, creating a cleaner and distraction-free workspace.",
        sec1_b3: "Flat Folder Tree selections: Selecting a folder no longer auto-checks or locks all subfolders. You can now define your synchronization scope with surgical precision.",
        sec2_title: "Critical Engine Fixes",
        sec2_b1: "Excel Lost Update Concurrency Lock: Resolved a race condition where simultaneous writes from ACC to Excel would overwrite each other. The scheduler now locks the execution queue, processing Excel writes sequentially and auto-refreshing the target spreadsheet URN version ID for each subsequent job.",
        sec2_b2: "Input Focus Hang Fix: Resolved a React component unmounting bug where typing inside the Feedback and Passcode dialog fields lost focus after entering a single character. Typing is now continuous and fluid.",
        sec2_b3: "Network Lag Mitigation: Removed the heavy recursive auto-selection sweeps on nested folders. Toggling folder scope now completes instantly without lagging the client or overload-pinging Autodesk servers.",
        sec3_title: "Branding & Maintenance",
        sec3_b1: "Version Alignment: Updated version stamps across the main dashboard interface, operations manual, and unauthenticated login views to v2.3.0 Stable.",
        sec3_b2: "Database Telemetry Fallback: Enhanced the backend telemetry module to securely fall back to lightweight JSON-storage if your enterprise MongoDB/PostgreSQL servers undergo restarts.",
        sec1_b4: "Comprehensive i18n Localization: The entire application interface—including form dropdowns, console table headers, audit histories, release notes, and operations manuals—is now fully translatable in real time into 7 languages (English, Spanish, French, German, Japanese, Chinese, and Hindi). Operation histories now also support native chronological date formatting corresponding to your active language.",
        footer: "DWG Cloud Alter • Engine Ready"
    },
    es: {
        header: "DWG Cloud Alter • Notas de Lanzamiento",
        badge: "VERSIÓN 2.3.0 ESTABLE",
        title: "Novedades de la v2.3.0",
        description: "Esta versión introduce una protección crítica de concurrencia, optimiza los recorridos del directorio para resolver el retraso, simplifica las herramientas de selección y ofrece correcciones de errores esenciales para el enfoque de entrada y la gestión de telemetría.",
        sec1_title: "Nuevas Características y Pulido de la IU",
        sec1_b1: "Eliminación de registros de telemetría: los administradores ahora pueden eliminar registros de telemetría, elogios y errores directamente desde el Centro de comentarios seguro usando la acción de eliminación rápida.",
        sec1_b2: "Diseño de cuadrícula optimizado: se eliminó la barra de encabezado flotante redundante de \"Acción por lotes\" al seleccionar dibujos, creando un espacio de trabajo más limpio y libre de distracciones.",
        sec1_b3: "Selecciones de carpetas planas: al seleccionar una carpeta ya no se marcan ni bloquean automáticamente todas las subcarpetas. Ahora puede definir el alcance de la sincronización con precisión quirúrgica.",
        sec2_title: "Correcciones Críticas del Motor",
        sec2_b1: "Bloqueo de concurrencia de actualizaciones perdidas de Excel: se resolvió una condición de carrera donde las escrituras simultáneas de ACC a Excel se sobrescribían entre sí. El planificador ahora bloquea la cola de ejecución, procesando las escrituras de Excel secuencialmente y actualizando automáticamente el ID de versión de la URN de la hoja de cálculo de destino para cada trabajo subsiguiente.",
        sec2_b2: "Corrección del bloqueo de enfoque de entrada: se resolvió un error de desmontaje del componente React por el cual al escribir dentro de los campos de diálogo de Comentarios y Contraseña se perdía el enfoque después de ingresar un solo carácter. La escritura es ahora continua y fluida.",
        sec2_b3: "Mitigación del retraso de red: se eliminaron los barridos pesados de selección automática recursiva en carpetas anidadas. Alternar el alcance de la carpeta ahora se completa instantáneamente sin retrasar al cliente ni sobrecargar los servidores de Autodesk.",
        sec3_title: "Marca y Mantenimiento",
        sec3_b1: "Alineación de versiones: se actualizaron los sellos de versión en el panel de control principal, el manual de operaciones y las vistas de inicio de sesión no autenticadas a v2.3.0 Estable.",
        sec3_b2: "Respaldo de telemetría de base de datos: se mejoró el módulo de telemetría backend para respaldar de manera segura en un almacenamiento JSON liviano si sus servidores corporativos MongoDB/PostgreSQL sufren reinicios.",
        sec1_b4: "Localización Integral i18n: Toda la interfaz de la aplicación—incluyendo menús desplegables, encabezados de tabla de la consola, historiales de auditoría, notas de lanzamiento y manuales de operaciones—ahora se puede traducir en tiempo real a 7 idiomas (inglés, español, francés, alemán, japonés, chino e hindi). Los historiales de operaciones ahora también admiten el formato de fecha cronológica nativo correspondiente a su idioma activo.",
        footer: "DWG Cloud Alter • Motor Listo"
    },
    fr: {
        header: "DWG Cloud Alter • Notes de Version",
        badge: "VERSION 2.3.0 STABLE",
        title: "Quoi de neuf dans la v2.3.0",
        description: "Cette version introduit une protection critique contre la concurrence, optimise les parcours de dossiers pour résoudre la latence, simplifie les outils de sélection et apporte des corrections de bugs essentielles pour le focus d'entrée et la gestion des données de télémétrie.",
        sec1_title: "Nouvelles fonctionnalités & Améliorations de l'interface",
        sec1_b1: "Suppression des enregistrements de télémétrie : Les administrateurs peuvent désormais supprimer les retours de télémétrie, les éloges et les rapports de bugs directement depuis le Centre de commentaires sécurisé via l'action de suppression rapide.",
        sec1_b2: "Mise en page épurée de la grille : Suppression de la barre d'en-tête flottante redondante \"Action groupée\" lors de la sélection de dessins, créant un espace de travail plus propre et sans distraction.",
        sec1_b3: "Sélections de dossiers à plat : La sélection d'un dossier ne coche ni ne verrouille plus automatiquement tous ses sous-dossiers. Vous pouvez désormais définir votre périmètre de synchronisation avec une précision chirurgicale.",
        sec2_title: "Corrections critiques du moteur",
        sec2_b1: "Verrou de concurrence pour les pertes de mise à jour Excel : Résolution d'une condition de concurrence où les écritures simultanées d'ACC vers Excel s'écrasaient mutuellement. Le planificateur verrouille désormais la file d'attente d'exécution, traitant les écritures Excel de manière séquentielle et rafraîchissant automatiquement l'ID de version URN de la feuille de calcul cible pour chaque tâche suivante.",
        sec2_b2: "Correction de la perte de focus de saisie : Résolution d'un bug de démontage du composant React où la saisie dans les champs de dialogue de retour et de mot de passe perdait le focus après la saisie d'un seul caractère. La saisie est désormais fluide et continue.",
        sec2_b3: "Atténuation de la latence réseau : Suppression des lourds balayages récursifs de sélection automatique sur les dossiers imbriqués. La modification du périmètre d'un dossier s'effectue désormais instantanément sans ralentir le client ni surcharger de requêtes les serveurs Autodesk.",
        sec3_title: "Image de marque & Maintenance",
        sec3_b1: "Harmonisation des versions : Mise à jour des estampilles de version dans l'interface principale du tableau de bord, le manuel d'utilisation et les écrans de connexion non authentifiés vers la version v2.3.0 Stable.",
        sec3_b2: "Solution de secours pour la télémétrie : Amélioration du module de télémétrie du backend pour basculer de manière sécurisée vers un stockage JSON léger si vos serveurs d'entreprise MongoDB/PostgreSQL subissent des redémarrages.",
        sec1_b4: "Localisation i18n complète : L'ensemble de l'interface de l'application—y compris les listes déroulantes, les en-têtes de tableau de la console, les historiques d'audit, les notes de version et les manuels d'utilisation—est désormais entièrement traduisible en temps réel en 7 langues (anglais, espagnol, français, allemand, japonais, chinois et hindi). L'historique d'audit prend également en charge le formatage chronologique natif de la date correspondant à la langue active.",
        footer: "DWG Cloud Alter • Moteur Prêt"
    },
    de: {
        header: "DWG Cloud Alter • Versionshinweise",
        badge: "VERSION 2.3.0 STABLE",
        title: "Was ist neu in v2.3.0",
        description: "Diese Version führt wichtige Nebenläufigkeitsabsicherungen ein, optimiert die Ordnerstrukturdurchläufe zur Beseitungen von Verzögerungen, vereinfacht die Auswahlwerkzeuge und bietet wichtige Fehlerbehebungen für den Eingabefokus sowie die Telemetriedatenverwaltung.",
        sec1_title: "Neue Funktionen & UI-Feinschliff",
        sec1_b1: "Telemetrieeinträge löschen: Administratoren können jetzt Telemetrie-, Lob- und Fehlerdatensätze direkt im sicheren Feedback-Zentrum über eine Schnellentfernungsaktion löschen.",
        sec1_b2: "Optimierte Tabellengitter-Ansicht: Die redundante schwebende Kopfzeile \"Sammelaktion\" bei der Zeichnungsauswahl wurde entfernt, um einen saubereren und ablenkungsfreien Arbeitsbereich zu schaffen.",
        sec1_b3: "Flache Ordnerauswahl: Die Auswahl eines Ordners markiert oder sperrt Unterordner nicht mehr automatisch. Sie können Ihren Synchronisationsbereich jetzt chirurgisch präzise definieren.",
        sec2_title: "Wichtige Motor-Fehlerbehebungen",
        sec2_b1: "Excel Lost Update Concurrency Lock: Behebung einer Race-Condition, bei der gleichzeitige Schreibzugriffe von ACC auf Excel sich gegenseitig überschrieben. Der Scheduler sperrt nun die Ausführungswarteschlange, verarbeitet Excel-Schreibvorgänge nacheinander und aktualisiert automatisch die URN-Versions-ID der Ziel-Tabelle für jeden nachfolgenden Job.",
        sec2_b2: "Eingabefokus-Fix: Behebung eines Fehlers beim React-Komponentenabbruch, bei dem das Tippen in Feedback- und Passwort-Eingabefeldern nach der Eingabe eines einzelnen Zeichens den Fokus verlor. Das Tippen ist nun kontinuierlich und flüssig.",
        sec2_b3: "Netzwerk-Verzögerungsminderung: Die rechenintensiven rekursiven automatischen Auswahlprüfungen für verschachtelte Ordner wurden entfernt. Das Ändern des Ordnerbereichs erfolgt nun sofort, ohne den Client zu verlangsamen oder die Autodesk-Server mit Anfragen zu überlasten.",
        sec3_title: "Branding & Wartung",
        sec3_b1: "Versionsausrichtung: Versionsangaben im Haupt-Dashboard, dem Benutzerhandbuch und den nicht authentifizierten Anmeldeansichten wurden auf v2.3.0 Stabil aktualisiert.",
        sec3_b2: "Datenbank-Telemetrie-Fallback: Das Backend-Telemetriemodul wurde verbessert, um sicher auf einen leichtgewichtigen JSON-Speicher zurückzugreifen, falls Ihre MongoDB-/PostgreSQL-Server im Unternehmen neu gestartet werden.",
        sec1_b4: "Umfassende i18n-Lokalisierung: Die gesamte Anwendungsoberfläche – einschließlich Dropdown-Menüs, Konsolentabellenkopfzeilen, Betriebsprotokollen, Versionshinweisen und Bedienungshandbüchern – kann jetzt in Echtzeit in 7 Sprachen übersetzt werden (Englisch, Spanisch, Französisch, Deutsch, Japanisch, Chinesisch und Hindi). Der Betriebsverlauf unterstützt nun auch die native chronologische Datumsformatierung entsprechend der aktiven Sprache.",
        footer: "DWG Cloud Alter • Motor Bereit"
    },
    ja: {
        header: "DWG Cloud Alter • リリースノート",
        badge: "バージョン 2.3.0 安定版",
        title: "v2.3.0 の新機能",
        description: "このリリースでは、重要な同時実行防止機能の導入、動作遅延を解消するためのディレクトリトラバーサルの最適化、選択ツールの簡素化、ならびに入力フォーカスの喪失やテレメトリデータ管理に関する重要なバグ修正が行われています。",
        sec1_title: "新機能とUI調整",
        sec1_b1: "テレメトリレコードの削除: 管理者は、安全なフィードバックハブから、クイック削除機能を使用してテレメトリ、称賛、およびバグ修正リクエストを直接削除できるようになりました。",
        sec1_b2: "スリムなグリッドレイアウト: 図面選択時の冗長な「一括アクション」フローティングヘッダーバーを削除し、よりクリーンで作業に集中できる環境を実現しました。",
        sec1_b3: "フラットなフォルダツリー選択: フォルダを選択しても、その配下のすべてのサブフォルダが自動的にチェックされたりロックされたりしなくなりました。同期範囲を高い精度で自在に指定できます。",
        sec2_title: "エンジンの重要なバグ修正",
        sec2_b1: "Excel更新競合によるデータ消失防止ロック: ACCからExcelへの同時書き込みが発生した際に書き込み内容が互いに上書きされてしまう競合条件を解消しました。スケジューラが実行キューをロックし、Excelへの書き込みを順次処理した上で、後続のジョブごとに書き込み対象のスプレッドシートURNバージョンIDを自動更新するようになりました。",
        sec2_b2: "入力フォーカス消失バグの解消: フィードバックおよびパスコード入力ダイアログ内で、1文字入力するごとに入力フォーカスが外れてしまうReactコンポーネントのアンマウント起因の不具合を修正しました。文字入力をスムーズに継続して行えます。",
        sec2_b3: "ネットワーク遅延の低減: 入れ子構造のフォルダにおける、負荷の高い再帰的な自動チェック処理を廃止しました。クライアントの動作遅延やAutodeskサーバーへの過剰な負荷を招くことなく、フォルダスコープを瞬時に切り替えられます。",
        sec3_title: "ブランディングとメンテナンス",
        sec3_b1: "バージョンの一貫性: メインダッシュボード、操作説明マニュアル、および未認証ログインビューのすべての表記を v2.3.0 安定版 に統一しました。",
        sec3_b2: "テレメトリのフェイルオーバー: 本番環境の MongoDB/PostgreSQL サーバーが再起動された場合でも、バックエンドのテレメトリモジュールが軽量なローカルJSONストレージへ自動的に退避保存する仕組みを構築しました。",
        sec1_b4: "包括的な i18n 多言語サポート: フォームドロップダウン、同期コンソールのテーブルヘッダー、操作履歴ログ、リリースノート、操作マニュアルなど、アプリ全体のインターフェースが 7 言語（英語、スペイン語、フランス語、ドイツ語、日本語、中国語、ヒンディー語）へリアルタイムに切り替え可能になりました。操作履歴の日付バナーも、選択された言語のネイティブな日付表示形式に対応しています。",
        footer: "DWG Cloud Alter • エンジン稼働中"
    },
    zh: {
        header: "DWG Cloud Alter • 版本更新日志",
        badge: "版本 2.3.0 稳定版",
        title: "v2.3.0 版本新特性与改动",
        description: "本次版本更新引入了关键的并发写入保护锁、优化了文件夹层级结构的检索以彻底消除界面卡顿、精简了选择组件，并修复了输入框失焦以及意见遥测数据管理的相关故障。",
        sec1_title: "新功能与界面优化",
        sec1_b1: "遥测记录快速删除：系统管理员现在可以直接在安全的「反馈看板」中，通过快速删除动作，一键删除用户提交的遥测、称赞及故障申报记录。",
        sec1_b2: "精简列表格布局：移过了在勾选图纸时出现的冗余「批量操作」悬浮标题栏，提供了更清爽且无干扰的交互体验。",
        sec1_b3: "扁平化文件夹选择：选中某个父文件夹时，将不再强制自动勾选或锁定其所有的子文件夹，您现在可以以极高精度自主规划同步文件的范围。",
        sec2_title: "引擎关键故障修复",
        sec2_b1: "Excel 写入并发冲突保护锁：彻底解决多图纸同时从 ACC 写回 Excel 时，可能因竞争写回而导致数据相互覆盖的冲突问题。任务调度器现在会对写入队列执行强并发锁，确保多任务有序排队写入，并在每次写回完成后，自动为后续队列刷新并对齐源 Excel 的最新 URN 版本标识符。",
        sec2_b2: "输入焦点卡顿修复：修复了由于 React 组件重复卸载导致在「意见反馈」和「管理密码验证」输入框中每输入单个字符即会失去焦点的严重故障。现在文字录入持久且流畅。",
        sec2_b3: "网络延迟与卡顿治理：移除了在多级文件夹树中展开时的深层递归自动筛选逻辑。现在切换同步文件夹范围响应在毫秒级完成，杜绝界面假死，并避免频繁请求引发 Autodesk 接口流控限制。",
        sec3_title: "品牌标识与系统维护",
        sec3_b1: "版本号全局对齐：将系统主控台、用户操作指南及登录认证界面的版本印记统一升级至 v2.3.0 稳定版。",
        sec3_b2: "遥测存储韧性备份：增强了后台遥测分发模块的异常处理能力。如果生产环境中的 MongoDB/PostgreSQL 数据库发生意外重启或中断，系统会无缝降级切换为轻量级本地 JSON 离线归档，确保用户反馈数据永不丢失。",
        sec1_b4: "全维度 i18n 国际化多语言支持：系统主控台、侧边栏下拉选单、表格标头、审计历史记录、版本更新日志以及操作说明手册，现在均已完美支持 7 种语言（英文、西班牙文、法文、德文、日文、中文和印地文）的实时双向切换。同时，审计日志日期分组也已支持对应语言的本地化日期格式渲染。",
        footer: "DWG Cloud Alter • 自动化引擎就绪"
    },
    hi: {
        header: "DWG Cloud Alter • रिलीज़ नोट्स",
        badge: "संस्करण 2.3.0 स्थिर",
        title: "v2.3.0 में नया क्या है",
        description: "यह रिलीज़ महत्वपूर्ण समवर्ती सुरक्षा (concurrency protection) पेश करती है, लैग को हल करने के लिए निर्देशिका पारगमन (directory traversal) को अनुकूलित करती है, चयन उपकरण को सरल बनाती है, और इनपुट फ़ोकस और टेलीमेट्री डेटा प्रबंधन के लिए आवश्यक सुधार प्रदान करती है।",
        sec1_title: "नई सुविधाएँ और UI सुधार",
        sec1_b1: "टेलीमेट्री रिकॉर्ड विलोपन (Deletion): एडमिनिस्ट्रेटर अब त्वरित-डिलीट क्रिया का उपयोग करके सुरक्षित फ़ीडबैक हब से टेलीमेट्री, प्रशंसा और बग रिकॉर्ड को सीधे हटा सकते हैं।",
        sec1_b2: "सुव्यवस्थित ग्रिड लेआउट: ड्रॉइंग का चयन करते समय अनावश्यक \"बैच एक्शन\" फ्लोटिंग हेडर बार को हटा दिया गया है, जिससे काम करने का स्थान अधिक साफ़ और विकर्षण-मुक्त हो गया है।",
        sec1_b3: "फ्लैट फ़ोल्डर ट्री चयन: किसी फ़ोल्डर का चयन करने से अब उसके सभी सब-फ़ोल्डर अपने आप चेक या लॉक नहीं होते हैं। अब आप अपने सिंक्रनाइज़ेशन दायरे को सटीक रूप से परिभाषित कर सकते हैं।",
        sec2_title: "इंजन के महत्वपूर्ण सुधार",
        sec2_b1: "एक्सेल लॉस्ट अपडेटConcurrency लॉक: एक रेस कंडीशन को हल किया गया है जहाँ ACC से एक्सेल में एक साथ लिखने से एक दूसरे का डेटा ओवरराइट हो जाता था। शेड्यूलर अब निष्पादन कतार (execution queue) को लॉक करता है, एक्सेल राइट्स को क्रमिक रूप से संसाधित करता है और प्रत्येक बाद के काम के लिए लक्ष्य स्प्रेडशीट URN संस्करण आईडी को स्वतः रीफ़्रेश करता है।",
        sec2_b2: "इनपुट फ़ोकस हैंग फिक्स: एक रिएक्ट घटक अनमाउंटिंग बग को हल किया गया है जहाँ फ़ीडबैक और पासकोड फ़ील्ड में टाइप करते समय केवल एक अक्षर दर्ज करने के बाद फ़ोकस खो जाता था। टाइपिंग अब निरंतर और निर्बाध है।",
        sec2_b3: "नेटवर्क लैग न्यूनीकरण: नेस्टेड फ़ोल्डरों पर भारी पुनरावर्ती ऑटो-चयन प्रक्रियाओं को हटा दिया गया है। फ़ोल्डर दायरे को बदलना अब क्लाइंट को लैग किए बिना या ऑटोडेस्क सर्वर को ओवरलोड किए बिना तुरंत पूरा होता है।",
        sec3_title: "ब्रांडिंग और रखरखाव",
        sec3_b1: "संस्करण संरेखण (Version Alignment): मुख्य डैशबोर्ड इंटरफ़ेस, संचालन मैनुअल और लॉगिन दृश्यों में संस्करण स्टैम्प को v2.3.0 स्थिर में अपडेट किया गया है।",
        sec3_b2: "डेटाबेस टेलीमेट्री फ़ॉलबैक: यदि आपके उद्यम के MongoDB/PostgreSQL सर्वर पुनरारंभ होते हैं, तो हल्के JSON-स्टोरेज में सुरक्षित रूप से फ़ॉलबैक करने के लिए बैकएंड टेलीमेट्री मॉड्यूल को बढ़ाया गया है।",
        sec1_b4: "व्यापक i18n स्थानीयकरण: संपूर्ण एप्लिकेशन इंटरफ़ेस—जिसमें फ़ॉर्म ड्रॉपडाउन, कंसोल तालिका हेडर, ऑडिट इतिहास, रिलीज़ नोट्स और संचालन नियमावली शामिल हैं—अब 7 भाषाओं (अंग्रेजी, स्पेनिश, फ्रेंच, जर्मन, जापानी, चीनी और हिंदी) में वास्तविक समय में अनुवाद करने के लिए पूरी तरह से तैयार है। ऑपरेशन इतिहास अब आपकी सक्रिय भाषा के संगत देशी कालानुक्रमिक तिथि प्रारूपण (chronological date formatting) का भी समर्थन करता है।",
        footer: "DWG Cloud Alter • इंजन तैयार है"
    }
};

const ReleaseNotesPage = ({ onClose, lang = 'en' }) => {
    const content = LOCALIZED_CONTENT[lang] || LOCALIZED_CONTENT.en;

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
                        <h1 style={{ fontSize: '18px', fontWeight: '800', color: ACC_THEME.text, margin: 0, letterSpacing: '-0.3px' }}>{content.header}</h1>
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
                            <Zap size={14} fill={ACC_THEME.primary} /> {content.badge}
                        </div>
                        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', marginBottom: '12px', letterSpacing: '-1px' }}>{content.title}</h1>
                        <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                            {content.description}
                        </p>
                    </div>

                    <Section icon={Activity} title={content.sec1_title}>
                        <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li>{content.sec1_b1}</li>
                            <li>{content.sec1_b2}</li>
                            <li>{content.sec1_b3}</li>
                            {content.sec1_b4 && <li>{content.sec1_b4}</li>}
                        </ul>
                    </Section>

                    <Section icon={Wrench} title={content.sec2_title}>
                        <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li>{content.sec2_b1}</li>
                            <li>{content.sec2_b2}</li>
                            <li>{content.sec2_b3}</li>
                        </ul>
                    </Section>

                    <Section icon={CheckCircle2} title={content.sec3_title}>
                        <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li>{content.sec3_b1}</li>
                            <li>{content.sec3_b2}</li>
                        </ul>
                    </Section>

                    <div style={{ borderTop: `1px solid ${ACC_THEME.border}`, marginTop: '48px', paddingTop: '32px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <Shield size={14} />
                            <span>{content.footer}</span>
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

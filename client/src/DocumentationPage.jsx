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

const LOCALIZED_DOCS = {
    en: {
        header: "DWG Cloud Alter • Operations Manual",
        title: "Getting Started with DWG Cloud Alter",
        subtitle: "A comprehensive guide to titleblock synchronization and cloud asset management for ACC, BIM 360, and Forma projects.",
        sec0_title: "Step 0: Hub Integration & Account Provisioning",
        sec0_desc: "To see your projects and hubs in the dashboard, you must first authorize DWG Cloud Alter in your Autodesk Account Admin portal. This is a one-time setup for your company hub.",
        admin_instructions: "Instructions for Account Admins:",
        step1: "Log in to your Autodesk Account Admin (Forma/ACC).",
        step2: "Navigate to the Settings or Custom Integrations tab.",
        step3: "Click \"Add Custom Integration\".",
        step4: "Ensure \"Account Administration\" and \"Document Management\" are selected.",
        step5: "When prompted for the Client ID, copy and paste the ID below:",
        copy_btn: "Copy ID",
        copy_alert: "Client ID copied to clipboard!",
        pro_tip: "Pro Tip: Name the integration \"DWG Cloud Alter\" to make it easy for your team to identify.",
        sec1_title: "1. Project Connection",
        sec1_desc: "After provisioning, follow these steps to connect the engine:",
        sec1_b1: "Select Hub: Choose the Hub where your project is hosted.",
        sec1_b2: "Select Project: Pick the project containing the target drawings.",
        sec1_b3: "Define Folder Scope: Select the folders in the tree. The engine recursively scans all checked folders for DWG assets.",
        sec2_title: "2. Operation Modes",
        sec2_desc: "Choose the workflow that fits your data source:",
        acc_excel_title: "ACC + Excel",
        acc_excel_desc: "Sync titleblocks using an Excel spreadsheet as the source of truth. Drawings are matched by their Number.",
        only_acc_title: "ONLY ACC",
        only_acc_desc: "Directly sync drawing attributes using the cloud interface metadata, removing the need for external files.",
        sec3_title: "3. Discovery & Matching",
        sec3_desc: "Click \"Sync Console\" to begin. The engine will:",
        sec3_b1: "Scan all selected folders for DWG files.",
        sec3_b2: "Automatically link source data to cloud assets.",
        sec3_b3: "Populate the data grid with versions and current sync status.",
        sec4_title: "4. Preview & Sync to Cloud",
        sec4_desc: "Use the \"Modify\" actions in the table to review and push updates:",
        sec4_b1: "Review Changes: Click \"Modify\" to see a side-by-side comparison of current titleblock values vs. new source data.",
        sec4_b2: "Attribute Selection: You can selectively choose which attributes (Date, Checked By, etc.) to update.",
        sec4_b3: "Sync to Drawing: Executing the sync creates a new version of the DWG in the cloud with the updated titleblock metadata.",
        sec5_title: "5. Audit History",
        sec5_desc: "Track every operation in the History panel. You can review the Delta Summary for any past session to see a precise log of every attribute that was updated.",
        footer: "DWG Cloud Alter • v2.3.0 Stable"
    },
    es: {
        header: "DWG Cloud Alter • Manual de Operaciones",
        title: "Primeros Pasos con DWG Cloud Alter",
        subtitle: "Una guía completa para la sincronización de bloques de título y la gestión de activos en la nube para proyectos ACC, BIM 360 y Forma.",
        sec0_title: "Paso 0: Integración del Hub y Aprovisionamiento de Cuenta",
        sec0_desc: "Para ver sus proyectos y hubs en el panel, primero debe autorizar DWG Cloud Alter en su portal de Autodesk Account Admin. Esta es una configuración única para el hub de su empresa.",
        admin_instructions: "Instrucciones para Administradores de Cuentas:",
        step1: "Inicie sesión en su Autodesk Account Admin (Forma/ACC).",
        step2: "Navegue a la pestaña Configuración o Integraciones personalizadas.",
        step3: "Haga clic en \"Agregar integración personalizada\".",
        step4: "Asegúrese de seleccionar \"Administración de cuentas\" y \"Gestión de documentos\".",
        step5: "Cuando se le solicite el ID de cliente, copie y pegue el ID a continuación:",
        copy_btn: "Copiar ID",
        copy_alert: "¡ID de cliente copiado al portapapeles!",
        pro_tip: "Consejo profesional: Nombre la integración \"DWG Cloud Alter\" para que su equipo la identifique fácilmente.",
        sec1_title: "1. Conexión del Proyecto",
        sec1_desc: "Después del aprovisionamiento, siga estos pasos para conectar el motor:",
        sec1_b1: "Seleccionar Hub: Elija el Hub donde está alojado su proyecto.",
        sec1_b2: "Seleccionar Proyecto: Elija el proyecto que contiene los planos de destino.",
        sec1_b3: "Definir alcance de carpeta: Seleccione las carpetas en el árbol. El motor escanea de forma recursiva todas las carpetas marcadas en busca de activos DWG.",
        sec2_title: "2. Modos de Operación",
        sec2_desc: "Elija el flujo de trabajo que se adapte a su origen de datos:",
        acc_excel_title: "ACC + Excel",
        acc_excel_desc: "Sincronice bloques de título utilizando una hoja de cálculo de Excel como fuente de verdad. Los planos se emparejan por su Número.",
        only_acc_title: "SOLO ACC",
        only_acc_desc: "Sincronice directamente los atributos del dibujo utilizando los metadatos de la interfaz de la nube, eliminando la necesidad de archivos externos.",
        sec3_title: "3. Descubrimiento y Emparejamiento",
        sec3_desc: "Haga clic en \"Sincronizar Consola\" para comenzar. El motor:",
        sec3_b1: "Escaneará todas las carpetas seleccionadas en busca de archivos DWG.",
        sec3_b2: "Vinculará automáticamente los datos de origen con los activos de la nube.",
        sec3_b3: "Llenará la cuadrícula de datos con las versiones y el estado de sincronización actual.",
        sec4_title: "4. Vista Previa y Sincronización en la Nube",
        sec4_desc: "Utilice las acciones \"Modificar\" en la tabla para revisar y enviar actualizaciones:",
        sec4_b1: "Revisar cambios: Haga clic en \"Modificar\" para ver una comparación lado a lado de los valores actuales del bloque de título frente a los nuevos datos de origen.",
        sec4_b2: "Selección de atributos: Puede elegir de forma selectiva qué atributos (Fecha, Verificado por, etc.) actualizar.",
        sec4_b3: "Sincronizar al plano: Al ejecutar la sincronización se crea una nueva versión del DWG en la nube con los metadatos del bloque de título actualizados.",
        sec5_title: "5. Historial de Auditoría",
        sec5_desc: "Realice un seguimiento de cada operación en el panel Historial. Puede revisar el Resumen Delta de cualquier sesión anterior para ver un registro preciso de cada atributo que se actualizó.",
        footer: "DWG Cloud Alter • v2.3.0 Estable"
    },
    fr: {
        header: "DWG Cloud Alter • Manuel d'Utilisation",
        title: "Prise en main de DWG Cloud Alter",
        subtitle: "Un guide complet sur la synchronisation des cartouches et la gestion des éléments cloud pour vos projets ACC, BIM 360 et Forma.",
        sec0_title: "Étape 0 : Intégration du Hub & Provisionnement du compte",
        sec0_desc: "Pour afficher vos projets et hubs sur le tableau de bord, vous devez d'abord autoriser DWG Cloud Alter dans votre portail Autodesk Account Admin. Il s'agit d'une configuration unique pour le hub de votre entreprise.",
        admin_instructions: "Instructions pour les administrateurs de compte :",
        step1: "Connectez-vous à votre portail Autodesk Account Admin (Forma/ACC).",
        step2: "Accédez à l'onglet Paramètres ou Intégrations personnalisées.",
        step3: "Cliquez sur \"Ajouter une intégration personnalisée\".",
        step4: "Assurez-vous que \"Administration du compte\" et \"Gestion des documents\" sont sélectionnés.",
        step5: "Lorsque vous êtes invité à saisir l'ID client, copiez et collez l'ID ci-dessous :",
        copy_btn: "Copier l'ID",
        copy_alert: "ID client copié dans le presse-papiers !",
        pro_tip: "Astuce : Nommez l'intégration \"DWG Cloud Alter\" pour qu'elle soit facilement identifiable par votre équipe.",
        sec1_title: "1. Connexion au projet",
        sec1_desc: "Une fois le provisionnement effectué, suivez ces étapes pour connecter le moteur :",
        sec1_b1: "Sélectionner un Hub : Choisissez le Hub hébergeant votre projet.",
        sec1_b2: "Sélectionner un projet : Choisissez le projet contenant les dessins cibles.",
        sec1_b3: "Définir le périmètre de dossiers : Sélectionnez les dossiers dans l'arborescence. Le moteur analyse de manière récursive tous les dossiers cochés pour y trouver des fichiers DWG.",
        sec2_title: "2. Modes de fonctionnement",
        sec2_desc: "Choisissez le flux de travail adapté à votre source de données :",
        acc_excel_title: "ACC + Excel",
        acc_excel_desc: "Synchronisez les cartouches en utilisant une feuille de calcul Excel comme source de vérité. Les dessins sont mis en correspondance par leur numéro.",
        only_acc_title: "ACC UNIQUEMENT",
        only_acc_desc: "Synchronisez directement les attributs des dessins à l'aide des métadonnées de l'interface cloud, sans fichier externe.",
        sec3_title: "3. Découverte & Mise en correspondance",
        sec3_desc: "Cliquez sur \"Synchroniser la Console\" pour commencer. Le moteur va :",
        sec3_b1: "Parcourir tous les dossiers sélectionnés pour y trouver des fichiers DWG.",
        sec3_b2: "Associer automatiquement les données sources aux fichiers cloud.",
        sec3_b3: "Alimenter la grille de données avec les versions et l'état actuel de synchronisation.",
        sec4_title: "4. Aperçu & Synchronisation Cloud",
        sec4_desc: "Utilisez les actions \"Modifier\" du tableau pour vérifier et déployer les mises à jour :",
        sec4_b1: "Vérifier les modifications : Cliquez sur \"Modifier\" pour afficher une comparaison côte à côte des valeurs actuelles du cartouche et des nouvelles données sources.",
        sec4_b2: "Sélection des attributs : Vous pouvez choisir de manière sélective les attributs à mettre à jour (Date, Vérifié par, etc.).",
        sec4_b3: "Synchroniser avec le dessin : L'exécution de la synchronisation crée une nouvelle version du DWG sur le cloud contenant les métadonnées de cartouche mises à jour.",
        sec5_title: "5. Historique d'audit",
        sec5_desc: "Suivez chaque opération dans le panneau Historique. Vous pouvez consulter le Résumé Delta de toute session passée pour afficher un journal précis de chaque attribut mis à jour.",
        footer: "DWG Cloud Alter • v2.3.0 Stable"
    },
    de: {
        header: "DWG Cloud Alter • Bedienungshandbuch",
        title: "Erste Schritte mit DWG Cloud Alter",
        subtitle: "Ein umfassender Leitfaden zur Schriftkopf-Synchronisierung und Cloud-Asset-Verwaltung für ACC-, BIM 360- und Forma-Projekte.",
        sec0_title: "Schritt 0: Hub-Integration & Kontobereitstellung",
        sec0_desc: "Um Ihre Projekte und Hubs im Dashboard anzuzeigen, müssen Sie zunächst DWG Cloud Alter in Ihrem Autodesk Account Admin-Portal autorisieren. Dies ist eine einmalige Einrichtung für Ihren Firmen-Hub.",
        admin_instructions: "Anweisungen für Kontoadministratoren:",
        step1: "Melden Sie sich bei Ihrem Autodesk Account Admin (Forma/ACC) an.",
        step2: "Navigieren Sie zum Reiter Einstellungen oder Benutzerdefinierte Integrationen.",
        step3: "Klicken Sie auf \"Benutzerdefinierte Integration hinzufügen\".",
        step4: "Stellen Sie sicher, dass \"Kontoverwaltung\" und \"Dokumentenverwaltung\" ausgewählt sind.",
        step5: "Wenn Sie nach der Client-ID gefragt werden, kopieren Sie die ID unten und fügen Sie sie ein:",
        copy_btn: "ID kopieren",
        copy_alert: "Client-ID in die Zwischenablage kopiert!",
        pro_tip: "Profi-Tipp: Benennen Sie die Integration \"DWG Cloud Alter\", damit Ihr Team sie leicht identifizieren kann.",
        sec1_title: "1. Projektverbindung",
        sec1_desc: "Befolgen Sie nach der Bereitstellung diese Schritte, um die Engine zu verbinden:",
        sec1_b1: "Hub auswählen: Wählen Sie den Hub aus, auf dem Ihr Projekt gehostet wird.",
        sec1_b2: "Projekt auswählen: Wählen Sie das Projekt aus, das die Zielzeichnungen enthält.",
        sec1_b3: "Ordnerbereich definieren: Wählen Sie die Ordner im Baum aus. Die Engine scannt rekursiv alle markierten Ordner nach DWG-Dateien.",
        sec2_title: "2. Betriebsmodi",
        sec2_desc: "Wählen Sie den Workflow, der zu Ihrer Datenquelle passt:",
        acc_excel_title: "ACC + Excel",
        acc_excel_desc: "Synchronisieren Sie Schriftköpfe mit einer Excel-Tabelle als Source of Truth. Zeichnungen werden anhand ihrer Nummer abgeglichen.",
        only_acc_title: "NUR ACC",
        only_acc_desc: "Synchronisieren Sie Zeichnungsattribute direkt über die Metadaten der Cloud-Oberfläche, sodass keine externen Dateien erforderlich sind.",
        sec3_title: "3. Erkennung & Abgleich",
        sec3_desc: "Klicken Sie auf \"Synchronisationskonsole\", um zu beginnen. Die Engine wird:",
        sec3_b1: "Alle ausgewählten Ordner nach DWG-Dateien scannen.",
        sec3_b2: "Quelldaten automatisch mit Cloud-Assets verknüpfen.",
        sec3_b3: "Das Datengitter mit Versionen und dem aktuellen Synchronisationsstatus füllen.",
        sec4_title: "4. Vorschau & Synchronisierung mit der Cloud",
        sec4_desc: "Verwenden Sie die Aktionen \"Bearbeiten\" in der Tabelle, um Aktualisierungen zu überprüfen und zu übertragen:",
        sec4_b1: "Änderungen überprüfen: Klicken Sie auf \"Bearbeiten\", um einen direkten Vergleich der aktuellen Schriftkopfwerte mit den neuen Quelldaten anzuzeigen.",
        sec4_b2: "Attributauswahl: Sie können gezielt auswählen, welche Attribute (Datum, Geprüft von usw.) aktualisiert werden sollen.",
        sec4_b3: "Mit Zeichnung synchronisieren: Durch das Ausführen der Synchronisierung wird eine neue Version der DWG in der Cloud mit den aktualisierten Schriftkopf-Metadaten erstellt.",
        sec5_title: "5. Audit-Verlauf",
        sec5_desc: "Verfolgen Sie jeden Vorgang im Verlaufspanel. Sie können die Delta-Zusammenfassung für jede vergangene Sitzung überprüfen, um ein präzises Protokoll jedes aktualisierten Attributs anzuzeigen.",
        footer: "DWG Cloud Alter • v2.3.0 Stabil"
    },
    ja: {
        header: "DWG Cloud Alter • 操作説明マニュアル",
        title: "DWG Cloud Alter の基本操作",
        subtitle: "Autodesk Construction Cloud (ACC)、BIM 360、および Forma プロジェクトにおける図面タイトルブロックの双方向同期とクラウド資産管理に関する総合ガイド。",
        sec0_title: "ステップ 0: ハブ統合とアカウント初期設定",
        sec0_desc: "ダッシュボードにハブやプロジェクトを表示するには、まず組織の Autodesk Account Admin ポータルで DWG Cloud Alter アプリケーションの接続を許可する必要があります。これは、組織の統合ハブにおける初回のみの必須設定です。",
        admin_instructions: "システム管理者向けの手順:",
        step1: "Autodesk Account Admin ポータル (Forma または ACC) に管理者としてログインします。",
        step2: "「設定」または「カスタム統合」タブに移動します。",
        step3: "「カスタム統合の追加」ボタンをクリックします。",
        step4: "「アカウント管理」および「ドキュメント管理」権限が選択されていることを確認します。",
        step5: "クライアント ID（Client ID）の入力を求められたら、以下の文字列をコピーして貼り付けます:",
        copy_btn: "ID をコピー",
        copy_alert: "クライアント ID をクリップボードにコピーしました！",
        pro_tip: "ヒント: チームメンバーが識別しやすいよう、統合名に「DWG Cloud Alter」と命名することを強く推奨します。",
        sec1_title: "1. プロジェクトへの接続",
        sec1_desc: "初期設定が完了したら、以下の手順で自動化エンジンを起動します:",
        sec1_b1: "ハブの選択: プロジェクトが保存されている対象の企業ハブを選択します。",
        sec1_b2: "プロジェクトの選択: 同期対象の図面が含まれるプロジェクトを指定します。",
        sec1_b3: "同期対象フォルダの指定: フォルダツリーから対象フォルダにチェックを入れます。エンジンが再帰的に下位の DWG アセットをすべてスキャンします。",
        sec2_title: "2. 操作モードの選択",
        sec2_desc: "管理要件に合わせて以下のいずれかのフローを指定します:",
        acc_excel_title: "ACC + Excel",
        acc_excel_desc: "Excel スプレッドシートを正（Source of Truth）としてタイトルブロックを同期します。図面名と図面番号をキーに自動マッチングします。",
        only_acc_title: "ACC のみ",
        only_acc_desc: "外部ファイルを一切介さず、クラウド上に定義されたプロパティのメタデータをベースに、直接アセットの変更内容を同期します。",
        sec3_title: "3. アセット検出とマッチング",
        sec3_desc: "「同期コンソール」を起動すると、エンジンは自動的に以下のタスクを実行します:",
        sec3_b1: "選択されたフォルダ配下の DWG ファイル群をくまなく検出します。",
        sec3_b2: "Excel などのデータソースとクラウドの図面データを瞬時に関連付けます。",
        sec3_b3: "データグリッド上にバージョンおよび現在の同期ステータスを展開します。",
        sec4_title: "4. 差分検証とクラウド同期",
        sec4_desc: "テーブルの「変更」アクションから、書き込み前に差分を確認し、クラウドに配信できます:",
        sec4_b1: "差分の確認: 「変更」をクリックして、既存のタイトルブロックの値と、データソースの最新値を左右対比で視覚的に検証します。",
        sec4_b2: "書き込み項目の選定: 日付、設計者、検証ステータスなど、一部の特定の属性のみを指定して更新することができます。",
        sec4_b3: "図面への同期実行: 同期を実行すると、クラウド上の図面にタイトルブロックの更新メタデータを適用した新規バージョンが安全に構築されます。",
        sec5_title: "5. 監査ログ履歴",
        sec5_desc: "過去のすべての操作は「操作ログ履歴」パネルからいつでも監査できます。実行ごとの「差分レポート」を開くと、どの属性値がどのように更新されたかをいつでも詳細に追跡できます。",
        footer: "DWG Cloud Alter • v2.3.0 安定版"
    },
    zh: {
        header: "DWG Cloud Alter • 系统操作手册",
        title: "快速上手 DWG Cloud Alter 自动同步系统",
        subtitle: "适用于 ACC、BIM 360 以及 Forma 项目图纸标题栏属性同步与云端资产管理的官方操作指南。",
        sec0_title: "步骤 0：企业 Hub 授权集成与账户配置",
        sec0_desc: "为在主控台正常检索项目与企业中心，您必须首先在 Autodesk Account Admin（账户管理员控制台）中授权 DWG Cloud Alter 的集成链接。这属于企业主管理中心的单次一次性设置。",
        admin_instructions: "企业账户管理员集成配置指南：",
        step1: "登录您的 Autodesk Account Admin 管理门户（Forma/ACC）。",
        step2: "导航至「设置」或「自定义集成」选项卡。",
        step3: "点击「添加自定义集成」按钮。",
        step4: "勾选确保集成了 \"账户管理\" 和 \"文档管理\" 两项授权范围。",
        step5: "在被要求输入客户端 ID (Client ID) 时，复制并粘贴下方的密钥串：",
        copy_btn: "复制客户端 ID",
        copy_alert: "客户端 ID 已成功复制到系统剪贴板！",
        pro_tip: "集成建议：将该集成命名为 \"DWG Cloud Alter\"，以便于企业内部团队日常辨别与管理。",
        sec1_title: "1. 同步项目链接",
        sec1_desc: "完成管理员后台授权后，按如下步骤建立引擎连接：",
        sec1_b1: "选择企业中心：在左侧栏指定项目所在的 Hub 模块。",
        sec1_b2: "选择同步项目：在下拉列表中指定包含图纸的目标项目名称。",
        sec1_b3: "划定同步文件夹：在目录树中勾选文件夹，引擎将递归扫描所选分支下的所有 DWG 图纸资产。",
        sec2_title: "2. 系统连接模式",
        sec2_desc: "根据企业数据源策略自主挑选业务流：",
        acc_excel_title: "ACC + Excel",
        acc_excel_desc: "以 Excel 电子表格为唯一真实数据源（Source of Truth）同步标题栏属性，图纸将通过其专属图纸编号进行对齐匹配。",
        only_acc_title: "仅限 ACC 模式",
        only_acc_desc: "摆脱对外部本地文件的依赖，直接使用云图纸接口所载的元数据与自定义属性进行快捷写入。",
        sec3_title: "3. 检索与对齐矩阵",
        sec3_desc: "点击「启动同步控制台」后，自动化引擎将快速执行以下工作：",
        sec3_b1: "全局扫描指定路径下的所有物理 DWG 电子文件。",
        sec3_b2: "智能解析并链接数据源与云端图纸资产的关系。",
        sec3_b3: "在表格展示区中渲染图纸版本、数据差分与同步状态看板。",
        sec4_title: "4. 差分预检与同步写回",
        sec4_desc: "利用表格底部的「修改」动作在写回云端前进行精确预检：",
        sec4_b1: "查看属性差分：点击「修改」查看当前图纸标题栏属性值与新数据源之间的精细对比。",
        sec4_b2: "按需按字段过滤：可选择性地决定仅同步部分属性（如只同步日期、审核人等）。",
        sec4_b3: "执行写回：启动同步后，系统将在 ACC 云端自动为该图纸创建带有最新标题栏属性的全新文件版本。",
        sec5_title: "5. 运行审计日志",
        sec5_desc: "在右侧的「系统运行日志」中追溯每一次操作。您可以点击任何历史记录中的「查看属性差分报告」，来精确审计每一次被修改的具体属性字段明细。",
        footer: "DWG Cloud Alter • v2.3.0 稳定版"
    },
    hi: {
        header: "DWG Cloud Alter • ऑपरेशनल मैनुअल",
        title: "DWG Cloud Alter के साथ शुरुआत करना",
        subtitle: "ACC, BIM 360, और Forma परियोजनाओं के लिए टाइटलब्लॉक सिंक्रनाइज़ेशन और क्लाउड एसेट प्रबंधन के लिए एक व्यापक गाइड।",
        sec0_title: "चरण 0: हब एकीकरण और खाता प्रावधान (Provisioning)",
        sec0_desc: "डैशबोर्ड में अपनी परियोजनाओं और हब को देखने के लिए, आपको पहले अपने Autodesk Account Admin पोर्टल में DWG Cloud Alter को अधिकृत करना होगा। यह आपके कंपनी हब के लिए एकमुश्त सेटअप है।",
        admin_instructions: "खाता व्यवस्थापकों (Account Admins) के लिए निर्देश:",
        step1: "अपने Autodesk Account Admin (Forma/ACC) में लॉग इन करें।",
        step2: "सेटिंग्स (Settings) या कस्टम इंटीग्रेशन (Custom Integrations) टैब पर जाएं।",
        step3: "\"कस्टम इंटीग्रेशन जोड़ें\" (Add Custom Integration) पर क्लिक करें।",
        step4: "सुनिश्चित करें कि \"खाता प्रशासन\" और \"दस्तावेज़ प्रबंधन\" चयनित हैं।",
        step5: "क्लाइंट आईडी (Client ID) के लिए संकेत मिलने पर, नीचे दी गई आईडी कॉपी और पेस्ट करें:",
        copy_btn: "आईडी कॉपी करें",
        copy_alert: "क्लाइंट आईडी क्लिपबोर्ड पर कॉपी हो गई है!",
        pro_tip: "सुझाव: एकीकरण का नाम \"DWG Cloud Alter\" रखें ताकि आपकी टीम के लिए इसकी पहचान करना आसान हो सके।",
        sec1_title: "1. प्रोजेक्ट कनेक्शन",
        sec1_desc: "प्रावधान (provisioning) के बाद, इंजन को कनेक्ट करने के लिए इन चरणों का पालन करें:",
        sec1_b1: "हब चुनें: वह हब चुनें जहां आपका प्रोजेक्ट होस्ट किया गया है।",
        sec1_b2: "प्रोजेक्ट चुनें: लक्षित ड्रॉइंग वाले प्रोजेक्ट को चुनें।",
        sec1_b3: "फ़ोल्डर दायरा परिभाषित करें: ट्री में फ़ोल्डर्स का चयन करें। इंजन DWG एसेट के लिए सभी चेक किए गए फ़ोल्डर्स को पुनरावर्ती रूप से स्कैन करता है।",
        sec2_title: "2. ऑपरेशन मोड",
        sec2_desc: "अपने डेटा स्रोत के अनुकूल कार्यप्रवाह चुनें:",
        acc_excel_title: "ACC + एक्सेल",
        acc_excel_desc: "सत्य के स्रोत (source of truth) के रूप में एक्सेल स्प्रेडशीट का उपयोग करके टाइटलब्लॉक को सिंक करें। ड्रॉइंग का मिलान उनके नंबर से किया जाता है।",
        only_acc_title: "केवल ACC",
        only_acc_desc: "बाहरी फ़ाइलों की आवश्यकता को समाप्त करते हुए, क्लाउड इंटरफ़ेस मेटाडेटा का उपयोग करके ड्रॉइंग विशेषताओं को सीधे सिंक करें।",
        sec3_title: "3. खोज और मिलान",
        sec3_desc: "शुरू करने के लिए \"सिंक कंसोल\" पर क्लिक करें। इंजन यह करेगा:",
        sec3_b1: "DWG फ़ाइलों के लिए सभी चयनित फ़ोल्डर्स को स्कैन करेगा।",
        sec3_b2: "स्रोत डेटा को क्लाउड एसेट से स्वचालित रूप से लिंक करेगा।",
        sec3_b3: "डेटा ग्रिड में संस्करणों और वर्तमान सिंक स्थिति को प्रदर्शित करेगा।",
        sec4_title: "4. पूर्वावलोकन और क्लाउड पर सिंक करें",
        sec4_desc: "समीक्षा और अपडेट भेजने के लिए तालिका में \"बदलाव करें\" (Modify) क्रियाओं का उपयोग करें:",
        sec4_b1: "बदलावों की समीक्षा करें: वर्तमान टाइटलब्लॉक मान बनाम नए स्रोत डेटा की तुलना देखने के लिए \"बदलाव करें\" पर क्लिक करें।",
        sec4_b2: "विशेषता चयन: आप चुनिंदा रूप से चुन सकते हैं कि किन विशेषताओं (दिनांक, किसके द्वारा जांचा गया, आदि) को अपडेट करना है।",
        sec4_b3: "ड्रॉइंग पर सिंक करें: सिंक निष्पादित करने से अपडेट किए गए टाइटलब्लॉक मेटाडेटा के साथ क्लाउड में DWG का एक नया संस्करण बनता है।",
        sec5_title: "5. ऑडिट इतिहास",
        sec5_desc: "इतिहास (History) पैनल में प्रत्येक ऑपरेशन को ट्रैक करें। अपडेट की गई प्रत्येक विशेषता का सटीक लॉग देखने के लिए आप किसी भी पिछले सत्र के डेल्टा सारांश की समीक्षा कर सकते हैं।",
        footer: "DWG Cloud Alter • v2.3.0 स्थिर"
    }
};

const DocumentationPage = ({ onClose, lang = 'en' }) => {
    const doc = LOCALIZED_DOCS[lang] || LOCALIZED_DOCS.en;

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
        alert(doc.copy_alert);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ width: '100%', maxWidth: '900px', height: '90vh', background: 'white', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', animation: 'modalSlideUp 0.4s ease-out' }}>
                
                {/* Header */}
                <header style={{ padding: '24px 40px', borderBottom: `1px solid ${ACC_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Zap size={22} color={ACC_THEME.primary} fill={ACC_THEME.primary} />
                        <h1 style={{ fontSize: '18px', fontWeight: '800', color: ACC_THEME.text, margin: 0, letterSpacing: '-0.3px' }}>{doc.header}</h1>
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
                        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', marginBottom: '12px', letterSpacing: '-1px' }}>{doc.title}</h1>
                        <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.5' }}>
                            {doc.subtitle}
                        </p>
                    </div>

                    <Section icon={Shield} title={doc.sec0_title}>
                        <p>{doc.sec0_desc}</p>
                        
                        <div style={{ background: '#F8FAFC', border: `1px solid ${ACC_THEME.border}`, borderRadius: '16px', padding: '24px', marginTop: '20px' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>{doc.admin_instructions}</h4>
                            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', margin: 0 }}>
                                <li>{doc.step1}</li>
                                <li>{doc.step2}</li>
                                <li>{doc.step3}</li>
                                <li>{doc.step4}</li>
                                <li>{doc.step5}</li>
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
                                    <Copy size={14} /> {doc.copy_btn}
                                </button>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: ACC_THEME.textSecondary, fontSize: '13px', background: '#EFF6FF', padding: '12px', borderRadius: '8px', border: '1px solid #DBEAFE' }}>
                                <Info size={16} color={ACC_THEME.primary} />
                                <span>{doc.pro_tip}</span>
                            </div>
                        </div>
                    </Section>

                    <Section icon={Settings} title={doc.sec1_title}>
                        <p>{doc.sec1_desc}</p>
                        <ul style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li>{doc.sec1_b1}</li>
                            <li>{doc.sec1_b2}</li>
                            <li>{doc.sec1_b3}</li>
                        </ul>
                    </Section>

                    <Section icon={Layers} title={doc.sec2_title}>
                        <p>{doc.sec2_desc}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                            <div style={{ padding: '20px', border: `1px solid ${ACC_THEME.border}`, borderRadius: '16px', background: '#F8FAFC' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <FileSpreadsheet size={18} color={ACC_THEME.primary} />
                                    <h4 style={{ margin: 0, fontWeight: '800' }}>{doc.acc_excel_title}</h4>
                                </div>
                                <p style={{ fontSize: '13px', margin: 0 }}>{doc.acc_excel_desc}</p>
                            </div>
                            <div style={{ padding: '20px', border: `1px solid ${ACC_THEME.border}`, borderRadius: '16px', background: '#F8FAFC' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <Cloud size={18} color={ACC_THEME.success} />
                                    <h4 style={{ margin: 0, fontWeight: '800' }}>{doc.only_acc_title}</h4>
                                </div>
                                <p style={{ fontSize: '13px', margin: 0 }}>{doc.only_acc_desc}</p>
                            </div>
                        </div>
                    </Section>

                    <Section icon={Activity} title={doc.sec3_title}>
                        <p>{doc.sec3_desc}</p>
                        <ul style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li>{doc.sec3_b1}</li>
                            <li>{doc.sec3_b2}</li>
                            <li>{doc.sec3_b3}</li>
                        </ul>
                    </Section>

                    <Section icon={RefreshCw} title={doc.sec4_title}>
                        <p>{doc.sec4_desc}</p>
                        <ul style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li>{doc.sec4_b1}</li>
                            <li>{doc.sec4_b2}</li>
                            <li>{doc.sec4_b3}</li>
                        </ul>
                    </Section>

                    <Section icon={History} title={doc.sec5_title}>
                        <p>{doc.sec5_desc}</p>
                    </Section>

                    <div style={{ borderTop: `1px solid ${ACC_THEME.border}`, marginTop: '48px', paddingTop: '32px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <Shield size={14} />
                            <span>{doc.footer}</span>
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

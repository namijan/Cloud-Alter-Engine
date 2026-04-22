const fs = require('fs');
const path = './client/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Find where UnifiedSyncModal starts inside App
const modalStartRegex = /\s+const UnifiedSyncModal = \(\) => {[\s\S]*?(?=const checkAuth = async \(\) => {)/;
const modalMatch = content.match(modalStartRegex);

if (modalMatch) {
    let modalsContent = modalMatch[0];

    // Remove it from inside App
    content = content.replace(modalMatch[0], '\n');

    // Modify the extracted Modals to take props
    modalsContent = modalsContent.replace('const UnifiedSyncModal = () => {', 'const UnifiedSyncModal = ({ syncModalConfig, setSyncModalConfig, selectedProject, selectedExcel, triggerUpdate, fetchExcelFiles }) => {\n        const { show, mode, source, target, match, index } = syncModalConfig;');

    // Remove the inner destructuring that we just moved to the top
    modalsContent = modalsContent.replace('        const { show, mode, source, target, match, index } = syncModalConfig;\n', '');

    modalsContent = modalsContent.replace('const ExcelPreviewModal = () => {', 'const ExcelPreviewModal = ({ showExcelPreview, setShowExcelPreview, excelPreviewData, previewLoading, getSelectedExcelDetails }) => {');

    // 2. Insert the modified Modals right before `const App = () => {`
    content = content.replace('const App = () => {', modalsContent + '\n\nconst App = () => {');

    // 3. Update the JSX tags in App's return statement to pass the props
    content = content.replace('<UnifiedSyncModal />', '<UnifiedSyncModal syncModalConfig={syncModalConfig} setSyncModalConfig={setSyncModalConfig} selectedProject={selectedProject} selectedExcel={selectedExcel} triggerUpdate={triggerUpdate} fetchExcelFiles={fetchExcelFiles} />');
    content = content.replace('<ExcelPreviewModal />', '<ExcelPreviewModal showExcelPreview={showExcelPreview} setShowExcelPreview={setShowExcelPreview} excelPreviewData={excelPreviewData} previewLoading={previewLoading} getSelectedExcelDetails={getSelectedExcelDetails} />');

    fs.writeFileSync(path, content);
    console.log('App.jsx successfully surgically refactored.');
} else {
    console.error('Could not find UnifiedSyncModal in App.jsx');
}

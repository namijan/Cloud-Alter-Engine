using System;
using System.Collections.Generic;
using System.IO;
using Autodesk.AutoCAD.ApplicationServices;
using Autodesk.AutoCAD.DatabaseServices;
using Autodesk.AutoCAD.EditorInput;
using Autodesk.AutoCAD.Runtime;
using Newtonsoft.Json;

namespace TitleBlockAutomation
{
    public class Commands
    {
        [CommandMethod("UpdateAttributes", CommandFlags.Modal)]
        public void UpdateAttributes()
        {
            Document doc = Application.DocumentManager.MdiActiveDocument;
            Database db = doc.Database;

            // 1. Read params.json
            string jsonPath = "params.json";
            if (!File.Exists(jsonPath))
            {
                doc.Editor.WriteMessage("\nError: params.json not found.");
                return;
            }

            Dictionary<string, string> paramsData = null;
            try
            {
                string jsonText = File.ReadAllText(jsonPath);
                doc.Editor.WriteMessage($"\nRead JSON: {jsonText}");
                var list = JsonConvert.DeserializeObject<List<Dictionary<string, string>>>(jsonText);
                if (list != null && list.Count > 0)
                {
                    paramsData = list[0];
                }
                else 
                {
                    doc.Editor.WriteMessage("\nError: params.json is empty or invalid array.");
                    return;
                }
            }
            catch (System.Exception ex)
            {
                doc.Editor.WriteMessage("\nError parsing params.json: " + ex.Message);
                try {
                    // Fallback to dict
                    paramsData = JsonConvert.DeserializeObject<Dictionary<string, string>>(File.ReadAllText(jsonPath));
                } catch (System.Exception ex2) {
                    doc.Editor.WriteMessage("\nFallback parsing also failed: " + ex2.Message);
                    return;
                }
            }
            
            string targetLayout = paramsData.ContainsKey("LayoutName") ? paramsData["LayoutName"] : "Model";
            string targetBlock = paramsData.ContainsKey("BlockName") ? paramsData["BlockName"] : "";

            Console.WriteLine($"Updating Block: {targetBlock} on Layout: {targetLayout}");

            doc.Editor.WriteMessage($"\nUpdating Block: {targetBlock} on Layout: {targetLayout}");

            using (Transaction tr = db.TransactionManager.StartTransaction())
            {
                // Find the layout
                DBDictionary layoutDict = tr.GetObject(db.LayoutDictionaryId, OpenMode.ForRead) as DBDictionary;
                if (layoutDict.Contains(targetLayout))
                {
                    Layout layout = tr.GetObject(layoutDict.GetAt(targetLayout), OpenMode.ForRead) as Layout;
                    BlockTableRecord btr = tr.GetObject(layout.BlockTableRecordId, OpenMode.ForRead) as BlockTableRecord;

                    foreach (ObjectId id in btr)
                    {
                        Entity ent = tr.GetObject(id, OpenMode.ForRead) as Entity;
                        if (ent is BlockReference br)
                        {
                            BlockTableRecord brBtr = tr.GetObject(br.BlockTableRecord, OpenMode.ForRead) as BlockTableRecord;
                            if (brBtr.Name.Equals(targetBlock, StringComparison.OrdinalIgnoreCase))
                            {
                                // Attribute update logic
                                foreach (ObjectId attId in br.AttributeCollection)
                                {
                                    AttributeReference attRef = tr.GetObject(attId, OpenMode.ForWrite) as AttributeReference;
                                    if (paramsData.ContainsKey(attRef.Tag))
                                    {
                                        doc.Editor.WriteMessage($"\nUpdating Attribute {attRef.Tag} to {paramsData[attRef.Tag]}");
                                        attRef.TextString = paramsData[attRef.Tag];
                                    }
                                }
                            }
                        }
                    }
                }
                else
                {
                    doc.Editor.WriteMessage($"\nError: Layout {targetLayout} not found.");
                }
                tr.Commit();
            }
            
            // Note: In Design Automation, we usually don't need to call SaveAs manually 
            // if the engine handles the output file, but we do it here for completeness.
            // db.SaveAs(db.Filename, DwgVersion.Current);
        }
    }
}

import { useState, useRef } from "react";
import { Upload, Eye, Download, Trash2, Edit, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { FilterBar, FilterValues } from "../FilterBar";
import { ValueHelpItem } from "../ValueHelpDialog";

const GRN_VH_ITEMS: ValueHelpItem[] = [
  { id: "GR3001", description: "GRN for PO2001 Steel Rod", plant: "1000", vendor: "Vendor A", status: "Received" },
  { id: "GR3002", description: "GRN for PO2002 Copper Wire", plant: "2000", vendor: "Vendor B", status: "Partial" },
];

const ALL_GRN_DATA = [
  { grnNumber: "GR3001", poNumber: "PO2001", docDate: "2025-03-04", postDate: "2025-03-05", item: "10", material: "MAT-001", unit: "EA", qty: 100, plant: "1000", storageLocation: "SL01", price: 45000 },
  { grnNumber: "GR3001", poNumber: "PO2001", docDate: "2025-03-04", postDate: "2025-03-05", item: "20", material: "MAT-002", unit: "EA", qty: 50,  plant: "1000", storageLocation: "SL01", price: 28000 },
  { grnNumber: "GR3002", poNumber: "PO2002", docDate: "2025-03-11", postDate: "2025-03-12", item: "10", material: "MAT-003", unit: "KG", qty: 300, plant: "2000", storageLocation: "SL02", price: 37500 },
];

const INITIAL_DOCS = [
  { fileName: "GR3001_GoodsReceipt.pdf", docNumber: "GR3001", uploadDate: "2025-03-06", uploadedBy: "Ravi Kumar", size: "0.7 MB" },
];

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  "Received": { color: "#107E3E", bg: "#EEF5EC" },
  "Partial": { color: "#E9730C", bg: "#FEF3E8" },
  "Pending": { color: "#0070F2", bg: "#E8F1FB" },
};

export function GRNModule() {
  const [subTab, setSubTab] = useState("upload");
  const [filters, setFilters] = useState<FilterValues>({ docNumber: "", plant: "", vendor: "", dateFrom: "", dateTo: "" });
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [ocr, setOcr] = useState<{ docType: boolean; docNumber: boolean; matching: boolean } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDocNumber, setUploadDocNumber] = useState("");
  const [pendingFile, setPendingFile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredGRN = ALL_GRN_DATA.filter((row) => {
    const grnMeta = GRN_VH_ITEMS.find((g) => g.id === row.grnNumber);

    if (filters.docNumber && row.grnNumber !== filters.docNumber) return false;
    if (filters.plant && row.plant !== filters.plant) return false;
    if (filters.vendor && grnMeta?.vendor !== filters.vendor) return false;

    return true;
  });

  const filteredDocs = docs.filter((d) => !filters.docNumber || d.docNumber === filters.docNumber);

  const processFile = (name: string) => {
    setPendingFile(name);
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setOcr({
        docType: name.endsWith(".pdf"),
        docNumber: !!uploadDocNumber,
        matching: !!uploadDocNumber && GRN_VH_ITEMS.some((i) => i.id === uploadDocNumber),
      });
    }, 1200);
  };

  const handleUpload = () => {
    if (!pendingFile || !uploadDocNumber) return;
    const newDoc = { fileName: pendingFile, docNumber: uploadDocNumber, uploadDate: new Date().toISOString().split("T")[0], uploadedBy: "John Doe", size: "0.9 MB" };
    setDocs((prev) => {
      const filtered = prev.filter((d) => d.docNumber !== uploadDocNumber);
      return [newDoc, ...filtered];
    });
    setPendingFile(null);
    setOcr(null);
    setUploadDocNumber("");
    setSubTab("view");
  };

  const toggleRow = (key: string) =>
    setSelectedRows((prev) => prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]);

  const SUB_TABS = [
    { id: "upload", label: "Upload Document" },
    { id: "change", label: "Change Document" },
    { id: "view", label: "View Document" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex border-b flex-shrink-0" style={{ backgroundColor: "#f0f0f0", borderColor: "#d9d9d9" }}>
        {SUB_TABS.map((t) => (
          <button key={t.id} onClick={() => setSubTab(t.id)} className="px-4 py-2"
            style={{ fontSize: "12px", fontWeight: subTab === t.id ? "600" : "400", color: subTab === t.id ? "#0070F2" : "#32363a", backgroundColor: subTab === t.id ? "#ffffff" : "transparent", borderBottom: subTab === t.id ? "2px solid #0070F2" : "2px solid transparent", borderRight: "1px solid #d9d9d9" }}>
            {t.label}
          </button>
        ))}
      </div>

      <FilterBar docType="GRN" valueHelpItems={GRN_VH_ITEMS} onSearch={(f) => setFilters(f)} />

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
        {/* GRN Items Table */}
        <div className="border" style={{ backgroundColor: "#ffffff", borderColor: "#d9d9d9", borderRadius: "2px" }}>
          <div className="px-4 py-2 border-b" style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#32363a" }}>GRN Items ({filteredGRN.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "1px solid #d9d9d9" }}>
                  <th style={{ width: "32px", padding: "6px 8px", borderRight: "1px solid #e5e5e5" }}>
                    <input type="checkbox" onChange={(e) => { if (e.target.checked) setSelectedRows(filteredGRN.map((r) => r.grnNumber + r.item)); else setSelectedRows([]); }} />
                  </th>
                  {["Purchase Order Number", "Document Date", "Posting Date", "Item", "Material", "Unit of Measure", "Quantity", "Plant", "Storage Location", "Price"].map((col) => (
                    <th key={col} className="text-left" style={{ padding: "6px 10px", fontSize: "11px", fontWeight: "600", color: "#32363a", borderRight: "1px solid #e5e5e5", whiteSpace: "nowrap" }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredGRN.length === 0 ? (
                  <tr><td colSpan={13} style={{ padding: "20px", textAlign: "center", fontSize: "12px", color: "#8a8b8c" }}>No records found. Use the Filter Bar to search.</td></tr>
                ) : filteredGRN.map((row, i) => {
                  const rowKey = row.grnNumber + row.item;
                  const isSelected = selectedRows.includes(rowKey);
                  return (
                    <tr key={rowKey} onClick={() => toggleRow(rowKey)}
                      style={{ borderBottom: "1px solid #eeeeee", backgroundColor: isSelected ? "#EAF1FF" : i % 2 === 0 ? "#ffffff" : "#fafafa", cursor: "pointer" }}>
                      <td style={{ padding: "5px 8px", borderRight: "1px solid #e5e5e5", textAlign: "center" }}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleRow(rowKey)} onClick={(e) => e.stopPropagation()} />
                      </td>
                      <td style={{ padding: "5px 10px", fontSize: "12px", color: "#0070F2", fontWeight: "500", borderRight: "1px solid #e5e5e5" }}>{row.poNumber}</td>
                      <td style={{ padding: "5px 10px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5", whiteSpace: "nowrap" }}>{row.docDate}</td>
                      <td style={{ padding: "5px 10px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5", whiteSpace: "nowrap" }}>{row.postDate}</td>
                      <td style={{ padding: "5px 10px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{row.item}</td>
                      <td style={{ padding: "5px 10px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{row.material}</td>
                      <td style={{ padding: "5px 10px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{row.unit}</td>
                      <td style={{ padding: "5px 10px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5", textAlign: "right" }}>{row.qty}</td>
                      <td style={{ padding: "5px 10px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{row.plant}</td>
                      <td style={{ padding: "5px 10px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{row.storageLocation}</td>
                      <td style={{ padding: "5px 10px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5", textAlign: "right" }}>{row.price.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {subTab === "upload" && (
          <div className="flex gap-4">
            <div className="flex-1 border" style={{ backgroundColor: "#ffffff", borderColor: "#d9d9d9", borderRadius: "2px" }}>
              <div className="px-4 py-2 border-b" style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#32363a" }}>Upload GRN Document</span>
                <span style={{ fontSize: "11px", color: "#8a8b8c", marginLeft: "8px" }}>(Single document per GRN)</span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <label style={{ fontSize: "11px", fontWeight: "500", color: "#32363a", width: "120px" }}>GRN Number *</label>
                  <input type="text" value={uploadDocNumber} onChange={(e) => setUploadDocNumber(e.target.value)} placeholder="Enter GRN Number"
                    className="border px-2 py-1 outline-none" style={{ fontSize: "12px", borderColor: "#d9d9d9", width: "160px", color: "#32363a", borderRadius: "2px" }} />
                </div>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFile(f.name); }}
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed flex flex-col items-center justify-center cursor-pointer"
                  style={{ borderColor: dragOver ? "#0070F2" : "#b0b0b0", backgroundColor: dragOver ? "#EEF4FF" : "#fafafa", minHeight: "90px", borderRadius: "2px" }}>
                  <Upload size={22} color={dragOver ? "#0070F2" : "#8a8b8c"} />
                  <div style={{ fontSize: "12px", color: pendingFile ? "#0070F2" : "#32363a", marginTop: "6px", fontWeight: pendingFile ? "500" : "400" }}>
                    {pendingFile || "Drag & Drop file here or click to browse"}
                  </div>
                  <input ref={fileRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f.name); }} />
                </div>
                {uploading && <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /><span style={{ fontSize: "11px", color: "#8a8b8c" }}>Processing OCR validation...</span></div>}
                <button onClick={handleUpload} disabled={!pendingFile || !uploadDocNumber} className="px-4 py-1 border w-fit"
                  style={{ fontSize: "12px", backgroundColor: (!pendingFile || !uploadDocNumber) ? "#d9d9d9" : "#0070F2", color: "#ffffff", borderColor: (!pendingFile || !uploadDocNumber) ? "#d9d9d9" : "#0070F2", borderRadius: "2px", cursor: (!pendingFile || !uploadDocNumber) ? "not-allowed" : "pointer" }}>
                  Upload Document
                </button>
              </div>
            </div>
            {ocr && (
              <div className="border flex-shrink-0" style={{ width: "240px", backgroundColor: "#ffffff", borderColor: "#d9d9d9", borderRadius: "2px" }}>
                <div className="px-4 py-2 border-b" style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#32363a" }}>OCR Validation</span>
                </div>
                <div className="p-3 flex flex-col gap-2">
                  {[{ label: "Document Type", value: ocr.docType }, { label: "Document Number Detected", value: ocr.docNumber }, { label: "GRN Matching", value: ocr.matching }].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1 border-b" style={{ borderColor: "#eeeeee" }}>
                      <span style={{ fontSize: "11px", color: "#32363a" }}>{item.label}</span>
                      <div className="flex items-center gap-1">
                        {item.value ? <><CheckCircle size={13} color="#107E3E" /><span style={{ fontSize: "11px", color: "#107E3E", fontWeight: "500" }}>Valid</span></> : <><XCircle size={13} color="#BB0000" /><span style={{ fontSize: "11px", color: "#BB0000", fontWeight: "500" }}>Invalid</span></>}
                      </div>
                    </div>
                  ))}
                  <div className="mt-1 p-2 border" style={{ borderColor: "#d9d9d9", backgroundColor: "#f5f5f5", borderRadius: "2px" }}>
                    {ocr.docType && ocr.docNumber && ocr.matching
                      ? <div className="flex items-center gap-1"><CheckCircle size={12} color="#107E3E" /><span style={{ fontSize: "11px", color: "#107E3E" }}>All checks passed.</span></div>
                      : <div className="flex items-start gap-1"><AlertCircle size={12} color="#E9730C" style={{ marginTop: "1px" }} /><span style={{ fontSize: "11px", color: "#E9730C" }}>Some checks failed.</span></div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {(subTab === "change" || subTab === "view") && (
          <div className="border" style={{ backgroundColor: "#ffffff", borderColor: "#d9d9d9", borderRadius: "2px" }}>
            <div className="px-4 py-2 border-b" style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#32363a" }}>{subTab === "change" ? "Manage" : "Uploaded"} Documents ({filteredDocs.length})</span>
            </div>
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "1px solid #d9d9d9" }}>
                  {["File Name", "Document Number", "Upload Date", "Uploaded By", "Size", "Actions"].map((col) => (
                    <th key={col} className="text-left" style={{ padding: "6px 12px", fontSize: "11px", fontWeight: "600", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDocs.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "20px", textAlign: "center", fontSize: "12px", color: "#8a8b8c" }}>No documents found.</td></tr>
                ) : filteredDocs.map((doc, i) => (
                  <tr key={doc.fileName} style={{ borderBottom: "1px solid #eeeeee", backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafafa" }}>
                    <td style={{ padding: "5px 12px", fontSize: "12px", color: "#0070F2", borderRight: "1px solid #e5e5e5" }}>{doc.fileName}</td>
                    <td style={{ padding: "5px 12px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{doc.docNumber}</td>
                    <td style={{ padding: "5px 12px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{doc.uploadDate}</td>
                    <td style={{ padding: "5px 12px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{doc.uploadedBy}</td>
                    <td style={{ padding: "5px 12px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{doc.size}</td>
                    <td style={{ padding: "5px 12px", borderRight: "1px solid #e5e5e5" }}>
                      <div className="flex items-center gap-2">
                        {subTab === "change" ? (
                          <>
                            <button className="flex items-center gap-1 px-2 py-1 border hover:bg-blue-50" style={{ fontSize: "11px", borderColor: "#0070F2", color: "#0070F2", borderRadius: "2px" }}><Edit size={11} />Replace</button>
                            <button onClick={() => setDocs((prev) => prev.filter((d) => d.fileName !== doc.fileName))} className="flex items-center gap-1 px-2 py-1 border hover:bg-red-50" style={{ fontSize: "11px", borderColor: "#BB0000", color: "#BB0000", borderRadius: "2px" }}><Trash2 size={11} />Delete</button>
                          </>
                        ) : (
                          <>
                            <button className="flex items-center gap-1 px-2 py-1 border hover:bg-blue-50" style={{ fontSize: "11px", borderColor: "#0070F2", color: "#0070F2", borderRadius: "2px" }}><Eye size={11} />View</button>
                            <button className="flex items-center gap-1 px-2 py-1 border hover:bg-gray-50" style={{ fontSize: "11px", borderColor: "#d9d9d9", color: "#32363a", borderRadius: "2px" }}><Download size={11} />Download</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
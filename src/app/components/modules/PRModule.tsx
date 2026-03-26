import { useState, useRef } from "react";
import { Upload, Eye, Download, Trash2, Edit, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { FilterBar, FilterValues } from "../FilterBar";
import { ValueHelpItem } from "../ValueHelpDialog";

const PR_VH_ITEMS: ValueHelpItem[] = [
  { id: "PR1001", description: "Steel Rod Procurement", plant: "1000", vendor: "Vendor A", status: "Open" },
  { id: "PR1002", description: "Copper Wire Procurement", plant: "2000", vendor: "Vendor B", status: "In Process" },
  { id: "PR1003", description: "Aluminium Sheet Order", plant: "3000", vendor: "Vendor C", status: "Closed" },
];

const ALL_PR_DATA = [
  { prNumber: "PR1001", docType: "NB", item: "10", material: "MAT-001", unit: "EA", qty: 100, valuationPrice: 4500, delivDate: "2025-02-15", plant: "1000", storageLocation: "SL01", purchaseGroup: "P01",vendor: "Vendor A"  },
  { prNumber: "PR1001", docType: "NB", item: "20", material: "MAT-002", unit: "EA", qty: 50, valuationPrice: 2800, delivDate: "2025-02-15", plant: "1000", storageLocation: "SL01", purchaseGroup: "P01",vendor: "Vendor A"  },
  { prNumber: "PR1002", docType: "NB", item: "10", material: "MAT-003", unit: "KG", qty: 500, valuationPrice: 62500, delivDate: "2025-02-20", plant: "2000", storageLocation: "SL02", purchaseGroup: "P02",vendor: "Vendor B"  },
  { prNumber: "PR1002", docType: "NB", item: "20", material: "MAT-004", unit: "M",  qty: 200, valuationPrice: 18000, delivDate: "2025-02-20", plant: "2000", storageLocation: "SL02", purchaseGroup: "P02",vendor: "Vendor B"  },
  { prNumber: "PR1003", docType: "NB", item: "10", material: "MAT-005", unit: "M2", qty: 200, valuationPrice: 34000, delivDate: "2025-03-01", plant: "3000", storageLocation: "SL03", purchaseGroup: "P03",vendor: "Vendor C"  },
];

const INITIAL_DOCS = [
  { fileName: "PR1001_Invoice.pdf", docNumber: "PR1001", uploadDate: "2025-02-16", uploadedBy: "John Doe", size: "1.2 MB" },
  { fileName: "PR1001_Quotation.pdf", docNumber: "PR1001", uploadDate: "2025-02-16", uploadedBy: "John Doe", size: "0.8 MB" },
  { fileName: "PR1002_Approval.pdf", docNumber: "PR1002", uploadDate: "2025-02-22", uploadedBy: "Jane Smith", size: "0.5 MB" },
];

type OCRResult = { docType: boolean; docNumber: boolean; matching: boolean };

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  "Open": { color: "#0070F2", bg: "#E8F1FB" },
  "In Process": { color: "#E9730C", bg: "#FEF3E8" },
  "Closed": { color: "#107E3E", bg: "#EEF5EC" },
};

export function PRModule() {
  const [subTab, setSubTab] = useState("upload");
  const [filters, setFilters] = useState<FilterValues>({ docNumber: "", plant: "", vendor: "", dateFrom: "", dateTo: "" });
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [ocr, setOcr] = useState<OCRResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDocNumber, setUploadDocNumber] = useState("");
  const [pendingFile, setPendingFile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredPR = ALL_PR_DATA.filter((row) => {
    if (filters.docNumber && row.prNumber !== filters.docNumber) return false;
    if (filters.plant && row.plant !== filters.plant) return false;
    if (filters.vendor && row.vendor !== filters.vendor) return false;
    return true;
  });

  const filteredDocs = docs.filter((d) => !filters.docNumber || d.docNumber === filters.docNumber);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file.name);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file.name);
  };

  const processFile = (name: string) => {
    setPendingFile(name);
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setOcr({
        docType: name.endsWith(".pdf"),
        docNumber: !!uploadDocNumber,
        matching: !!uploadDocNumber && PR_VH_ITEMS.some((i) => i.id === uploadDocNumber),
      });
    }, 1200);
  };

  const handleUpload = () => {
    if (!pendingFile || !uploadDocNumber) return;
    const newDoc = {
      fileName: pendingFile,
      docNumber: uploadDocNumber,
      uploadDate: new Date().toISOString().split("T")[0],
      uploadedBy: "John Doe",
      size: "0.9 MB",
    };
    setDocs((prev) => [newDoc, ...prev]);
    setPendingFile(null);
    setOcr(null);
    setUploadDocNumber("");
    setSubTab("view");
  };

  const toggleRow = (key: string) => {
    setSelectedRows((prev) => prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]);
  };

  const SUB_TABS = [
    { id: "upload", label: "Upload Document" },
    { id: "change", label: "Change Document" },
    { id: "view", label: "View Document" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-tabs */}
      <div className="flex border-b flex-shrink-0" style={{ backgroundColor: "#f0f0f0", borderColor: "#d9d9d9" }}>
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className="px-4 py-2"
            style={{
              fontSize: "12px",
              fontWeight: subTab === t.id ? "600" : "400",
              color: subTab === t.id ? "#0070F2" : "#32363a",
              backgroundColor: subTab === t.id ? "#ffffff" : "transparent",
              borderBottom: subTab === t.id ? "2px solid #0070F2" : "2px solid transparent",
              borderRight: "1px solid #d9d9d9",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <FilterBar
        docType="PR"
        valueHelpItems={PR_VH_ITEMS}
        onSearch={(f) => setFilters(f)}
      />

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">

        {/* PR Items Table */}
        <div className="border" style={{ backgroundColor: "#ffffff", borderColor: "#d9d9d9", borderRadius: "2px" }}>
          <div className="px-4 py-2 border-b flex items-center justify-between" style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#32363a" }}>
              PR Items ({filteredPR.length})
            </span>
            {selectedRows.length > 0 && (
              <span style={{ fontSize: "11px", color: "#0070F2" }}>{selectedRows.length} row(s) selected</span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "1px solid #d9d9d9" }}>
                  <th style={{ width: "32px", padding: "6px 8px", borderRight: "1px solid #e5e5e5" }}>
                    <input type="checkbox" style={{ cursor: "pointer" }}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedRows(filteredPR.map((r) => r.prNumber + r.item));
                        else setSelectedRows([]);
                      }}
                    />
                  </th>
                  {["Document Type", "Item Number", "Material", "Unit of Measure", "Quantity", "Valuation Price", "Delivery Date", "Plant", "Storage Location", "Purchase Group"].map((col) => (
                    <th key={col} className="text-left" style={{ padding: "6px 10px", fontSize: "11px", fontWeight: "600", color: "#32363a", borderRight: "1px solid #e5e5e5", whiteSpace: "nowrap" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPR.length === 0 ? (
                  <tr><td colSpan={11} style={{ padding: "20px", textAlign: "center", fontSize: "12px", color: "#8a8b8c" }}>No records found. Use the Filter Bar to search.</td></tr>
                ) : (
                  filteredPR.map((row, i) => {
                    const rowKey = row.prNumber + row.item;
                    const isSelected = selectedRows.includes(rowKey);
                    return (
                      <tr key={rowKey} onClick={() => toggleRow(rowKey)}
                        style={{ borderBottom: "1px solid #eeeeee", backgroundColor: isSelected ? "#EAF1FF" : i % 2 === 0 ? "#ffffff" : "#fafafa", cursor: "pointer" }}
                      >
                        <td style={{ padding: "5px 8px", borderRight: "1px solid #e5e5e5", textAlign: "center" }}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleRow(rowKey)} onClick={(e) => e.stopPropagation()} />
                        </td>
                        <td style={{ padding: "5px 10px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{row.docType}</td>
                        <td style={{ padding: "5px 10px", fontSize: "12px", color: "#0070F2", fontWeight: "500", borderRight: "1px solid #e5e5e5" }}>{row.item}</td>
                        <td style={{ padding: "5px 10px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{row.material}</td>
                        <td style={{ padding: "5px 10px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{row.unit}</td>
                        <td style={{ padding: "5px 10px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5", textAlign: "right" }}>{row.qty}</td>
                        <td style={{ padding: "5px 10px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5", textAlign: "right" }}>{row.valuationPrice.toLocaleString()}</td>
                        <td style={{ padding: "5px 10px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5", whiteSpace: "nowrap" }}>{row.delivDate}</td>
                        <td style={{ padding: "5px 10px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{row.plant}</td>
                        <td style={{ padding: "5px 10px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{row.storageLocation}</td>
                        <td style={{ padding: "5px 10px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{row.purchaseGroup}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sub-tab specific content */}
        {subTab === "upload" && (
          <div className="flex gap-4">
            {/* Upload Area */}
            <div className="flex-1 border" style={{ backgroundColor: "#ffffff", borderColor: "#d9d9d9", borderRadius: "2px" }}>
              <div className="px-4 py-2 border-b" style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#32363a" }}>Upload Document</span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {/* Doc Number with VH */}
                <div className="flex items-center gap-3">
                  <label style={{ fontSize: "11px", fontWeight: "500", color: "#32363a", width: "120px" }}>Document Number *</label>
                  <input
                    type="text"
                    value={uploadDocNumber}
                    onChange={(e) => setUploadDocNumber(e.target.value)}
                    placeholder="Enter PR Number"
                    className="border px-2 py-1 outline-none"
                    style={{ fontSize: "12px", borderColor: "#d9d9d9", width: "160px", color: "#32363a", borderRadius: "2px" }}
                  />
                </div>

                {/* Drag & Drop */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed flex flex-col items-center justify-center cursor-pointer"
                  style={{
                    borderColor: dragOver ? "#0070F2" : "#b0b0b0",
                    backgroundColor: dragOver ? "#EEF4FF" : "#fafafa",
                    minHeight: "100px",
                    borderRadius: "2px",
                  }}
                >
                  <Upload size={24} color={dragOver ? "#0070F2" : "#8a8b8c"} />
                  <div style={{ fontSize: "12px", color: "#32363a", marginTop: "8px" }}>
                    {pendingFile ? (
                      <span style={{ color: "#0070F2", fontWeight: "500" }}>{pendingFile}</span>
                    ) : (
                      "Drag & Drop file here or click to browse"
                    )}
                  </div>
                  <div style={{ fontSize: "11px", color: "#8a8b8c" }}>Supported: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG</div>
                  <input ref={fileRef} type="file" className="hidden" onChange={handleFileInput} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png" />
                </div>

                {uploading && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span style={{ fontSize: "11px", color: "#8a8b8c" }}>Processing file & running OCR validation...</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleUpload}
                    disabled={!pendingFile || !uploadDocNumber}
                    className="px-4 py-1 border"
                    style={{
                      fontSize: "12px",
                      backgroundColor: (!pendingFile || !uploadDocNumber) ? "#d9d9d9" : "#0070F2",
                      color: "#ffffff",
                      borderColor: (!pendingFile || !uploadDocNumber) ? "#d9d9d9" : "#0070F2",
                      borderRadius: "2px",
                      cursor: (!pendingFile || !uploadDocNumber) ? "not-allowed" : "pointer",
                    }}
                  >
                    Upload Document
                  </button>
                  <button
                    onClick={() => { setPendingFile(null); setOcr(null); }}
                    className="px-4 py-1 border hover:bg-gray-100"
                    style={{ fontSize: "12px", borderColor: "#d9d9d9", color: "#32363a", borderRadius: "2px" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            {/* OCR Validation Panel */}
            {ocr && (
              <div
                className="border flex-shrink-0"
                style={{ width: "240px", backgroundColor: "#ffffff", borderColor: "#d9d9d9", borderRadius: "2px" }}
              >
                <div className="px-4 py-2 border-b" style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#32363a" }}>OCR Validation</span>
                </div>
                <div className="p-3 flex flex-col gap-2">
                  {[
                    { label: "Document Type", value: ocr.docType },
                    { label: "Document Number Detected", value: ocr.docNumber },
                    { label: "PR/PO Matching", value: ocr.matching },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1 border-b" style={{ borderColor: "#eeeeee" }}>
                      <span style={{ fontSize: "11px", color: "#32363a" }}>{item.label}</span>
                      <div className="flex items-center gap-1">
                        {item.value ? (
                          <>
                            <CheckCircle size={13} color="#107E3E" />
                            <span style={{ fontSize: "11px", color: "#107E3E", fontWeight: "500" }}>Valid</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={13} color="#BB0000" />
                            <span style={{ fontSize: "11px", color: "#BB0000", fontWeight: "500" }}>Invalid</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="mt-1 p-2 border" style={{ borderColor: "#d9d9d9", backgroundColor: "#f5f5f5", borderRadius: "2px" }}>
                    {ocr.docType && ocr.docNumber && ocr.matching ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle size={12} color="#107E3E" />
                        <span style={{ fontSize: "11px", color: "#107E3E" }}>All checks passed. Ready to upload.</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-1">
                        <AlertCircle size={12} color="#E9730C" style={{ marginTop: "1px", flexShrink: 0 }} />
                        <span style={{ fontSize: "11px", color: "#E9730C" }}>Some checks failed. Review before uploading.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {subTab === "change" && (
          <div className="border" style={{ backgroundColor: "#ffffff", borderColor: "#d9d9d9", borderRadius: "2px" }}>
            <div className="px-4 py-2 border-b" style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#32363a" }}>Manage Documents ({filteredDocs.length})</span>
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
                {filteredDocs.map((doc, i) => (
                  <tr key={doc.fileName} style={{ borderBottom: "1px solid #eeeeee", backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafafa" }}>
                    <td style={{ padding: "5px 12px", fontSize: "12px", color: "#0070F2", borderRight: "1px solid #e5e5e5" }}>{doc.fileName}</td>
                    <td style={{ padding: "5px 12px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{doc.docNumber}</td>
                    <td style={{ padding: "5px 12px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{doc.uploadDate}</td>
                    <td style={{ padding: "5px 12px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{doc.uploadedBy}</td>
                    <td style={{ padding: "5px 12px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{doc.size}</td>
                    <td style={{ padding: "5px 12px", borderRight: "1px solid #e5e5e5" }}>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 px-2 py-1 border hover:bg-blue-50" style={{ fontSize: "11px", borderColor: "#0070F2", color: "#0070F2", borderRadius: "2px" }}>
                          <Edit size={11} />Replace
                        </button>
                        <button
                          onClick={() => setDocs((prev) => prev.filter((d) => d.fileName !== doc.fileName))}
                          className="flex items-center gap-1 px-2 py-1 border hover:bg-red-50"
                          style={{ fontSize: "11px", borderColor: "#BB0000", color: "#BB0000", borderRadius: "2px" }}
                        >
                          <Trash2 size={11} />Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {subTab === "view" && (
          <div className="border" style={{ backgroundColor: "#ffffff", borderColor: "#d9d9d9", borderRadius: "2px" }}>
            <div className="px-4 py-2 border-b" style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#32363a" }}>Uploaded Documents ({filteredDocs.length})</span>
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
                        <button className="flex items-center gap-1 px-2 py-1 border hover:bg-blue-50" style={{ fontSize: "11px", borderColor: "#0070F2", color: "#0070F2", borderRadius: "2px" }}>
                          <Eye size={11} />View
                        </button>
                        <button className="flex items-center gap-1 px-2 py-1 border hover:bg-gray-50" style={{ fontSize: "11px", borderColor: "#d9d9d9", color: "#32363a", borderRadius: "2px" }}>
                          <Download size={11} />Download
                        </button>
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
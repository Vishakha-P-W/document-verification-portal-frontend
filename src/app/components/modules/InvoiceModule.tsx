import { useState, useRef } from "react";
import { Upload, Eye, Download, Trash2, Edit, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { FilterBar, FilterValues } from "../FilterBar";
import { ValueHelpItem } from "../ValueHelpDialog";

const INV_VH_ITEMS: ValueHelpItem[] = [
  { id: "INV4001", description: "Invoice for PO2001 Steel Rod", plant: "1000", vendor: "Vendor A", status: "Open" },
  { id: "INV4002", description: "Invoice for PO2002 Copper Wire", plant: "2000", vendor: "Vendor B", status: "Pending" },
];

// ── Linked PR data per Invoice ──────────────────────────────────────────────
const LINKED_PR: Record<string, { prNumber: string; item: string; material: string; description: string; qty: number; unit: string; plant: string; vendor: string; reqDate: string; status: string }[]> = {
  INV4001: [
    { prNumber: "PR1001", item: "10", material: "MAT-001", description: "Steel Rod", qty: 100, unit: "EA", plant: "1000", vendor: "Vendor A", reqDate: "2025-02-15", status: "Closed" },
    { prNumber: "PR1001", item: "20", material: "MAT-002", description: "Industrial Steel Plate", qty: 50, unit: "EA", plant: "1000", vendor: "Vendor A", reqDate: "2025-02-15", status: "Closed" },
  ],
  INV4002: [
    { prNumber: "PR1002", item: "10", material: "MAT-003", description: "Copper Wire 2.5mm", qty: 500, unit: "KG", plant: "2000", vendor: "Vendor B", reqDate: "2025-02-20", status: "In Process" },
  ],
};

// ── Linked PO data per Invoice ──────────────────────────────────────────────
const LINKED_PO: Record<string, { poNumber: string; item: string; material: string; description: string; qty: number; unit: string; plant: string; vendor: string; netPrice: number; currency: string; delivDate: string; status: string }[]> = {
  INV4001: [
    { poNumber: "PO2001", item: "10", material: "MAT-001", description: "Steel Rod", qty: 100, unit: "EA", plant: "1000", vendor: "Vendor A", netPrice: 45000, currency: "INR", delivDate: "2025-03-10", status: "Open" },
    { poNumber: "PO2001", item: "20", material: "MAT-002", description: "Industrial Steel Plate", qty: 50, unit: "EA", plant: "1000", vendor: "Vendor A", netPrice: 28000, currency: "INR", delivDate: "2025-03-10", status: "Open" },
  ],
  INV4002: [
    { poNumber: "PO2002", item: "10", material: "MAT-003", description: "Copper Wire 2.5mm", qty: 500, unit: "KG", plant: "2000", vendor: "Vendor B", netPrice: 62500, currency: "INR", delivDate: "2025-03-20", status: "Pending" },
  ],
};

// ── Linked GRN data per Invoice ─────────────────────────────────────────────
const LINKED_GRN: Record<string, { grnNumber: string; poNumber: string; item: string; material: string; description: string; receivedQty: number; orderedQty: number; unit: string; plant: string; vendor: string; postDate: string; status: string }[]> = {
  INV4001: [
    { grnNumber: "GR3001", poNumber: "PO2001", item: "10", material: "MAT-001", description: "Steel Rod", receivedQty: 100, orderedQty: 100, unit: "EA", plant: "1000", vendor: "Vendor A", postDate: "2025-03-05", status: "Received" },
    { grnNumber: "GR3001", poNumber: "PO2001", item: "20", material: "MAT-002", description: "Industrial Steel Plate", receivedQty: 50, orderedQty: 50, unit: "EA", plant: "1000", vendor: "Vendor A", postDate: "2025-03-05", status: "Received" },
  ],
  INV4002: [
    { grnNumber: "GR3002", poNumber: "PO2002", item: "10", material: "MAT-003", description: "Copper Wire 2.5mm", receivedQty: 300, orderedQty: 500, unit: "KG", plant: "2000", vendor: "Vendor B", postDate: "2025-03-12", status: "Partial" },
  ],
};

// ── Invoice header data ──────────────────────────────────────────────────────
const ALL_INV_DATA = [
  { invNumber: "INV4001", poNumber: "PO2001", grnNumber: "GR3001", vendor: "Vendor A", plant: "1000", amount: 100000, currency: "INR", invoiceDate: "2025-03-08", postDate: "2025-03-09", status: "Open" },
  { invNumber: "INV4002", poNumber: "PO2002", grnNumber: "GR3002", vendor: "Vendor B", plant: "2000", amount: 75000, currency: "INR", invoiceDate: "2025-03-15", postDate: "2025-03-16", status: "Pending" },
];

const INITIAL_DOCS = [
  { fileName: "INV4001_Invoice.pdf", docNumber: "INV4001", uploadDate: "2025-03-09", uploadedBy: "Priya Nair", size: "1.1 MB" },
];

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  "Open":        { color: "#0070F2", bg: "#E8F1FB" },
  "Pending":     { color: "#E9730C", bg: "#FEF3E8" },
  "Posted":      { color: "#107E3E", bg: "#EEF5EC" },
  "Blocked":     { color: "#BB0000", bg: "#FBEAEA" },
  "In Process":  { color: "#E9730C", bg: "#FEF3E8" },
  "Received":    { color: "#107E3E", bg: "#EEF5EC" },
  "Partial":     { color: "#E9730C", bg: "#FEF3E8" },
  "Closed":      { color: "#107E3E", bg: "#EEF5EC" },
};

function SectionTable({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="border" style={{ backgroundColor: "#ffffff", borderColor: "#d9d9d9", borderRadius: "2px" }}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-4 py-2 border-b flex items-center justify-between"
        style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9", textAlign: "left" }}
      >
        <div className="flex items-center gap-2">
          {collapsed ? <ChevronRight size={13} color="#6a6d70" /> : <ChevronDown size={13} color="#6a6d70" />}
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#32363a" }}>{title}</span>
          {badge && (
            <span style={{ fontSize: "10px", color: "#0070F2", backgroundColor: "#E8F1FB", padding: "1px 6px", borderRadius: "8px", fontWeight: "600" }}>{badge}</span>
          )}
        </div>
      </button>
      {!collapsed && <div className="overflow-x-auto">{children}</div>}
    </div>
  );
}

export function InvoiceModule() {
  const [subTab, setSubTab] = useState("upload");
  const [filters, setFilters] = useState<FilterValues>({ docNumber: "", plant: "", vendor: "", dateFrom: "", dateTo: "" });
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [dragOver, setDragOver] = useState(false);
  const [ocr, setOcr] = useState<{ docType: boolean; docNumber: boolean; matching: boolean } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDocNumber, setUploadDocNumber] = useState("");
  const [pendingFile, setPendingFile] = useState<string | null>(null);
  const [selectedInv, setSelectedInv] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredINV = ALL_INV_DATA.filter((row) => {
    if (filters.docNumber && row.invNumber !== filters.docNumber) return false;
    if (filters.plant && row.plant !== filters.plant) return false;
    if (filters.vendor && row.vendor !== filters.vendor) return false;
    return true;
  });

  const filteredDocs = docs.filter((d) => !filters.docNumber || d.docNumber === filters.docNumber);

  // The active invoice for linked data (use filter or first row)
  const activeInv = selectedInv || (filteredINV.length === 1 ? filteredINV[0].invNumber : null);

  const processFile = (name: string) => {
    setPendingFile(name);
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setOcr({
        docType: name.endsWith(".pdf"),
        docNumber: !!uploadDocNumber,
        matching: !!uploadDocNumber && INV_VH_ITEMS.some((i) => i.id === uploadDocNumber),
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

  const TH = ({ children }: { children: React.ReactNode }) => (
    <th className="text-left" style={{ padding: "6px 10px", fontSize: "11px", fontWeight: "600", color: "#32363a", borderRight: "1px solid #e5e5e5", whiteSpace: "nowrap", backgroundColor: "#f5f5f5" }}>
      {children}
    </th>
  );

  const TD = ({ children, blue, right }: { children: React.ReactNode; blue?: boolean; right?: boolean }) => (
    <td style={{ padding: "5px 10px", fontSize: "12px", color: blue ? "#0070F2" : "#32363a", fontWeight: blue ? "500" : "400", borderRight: "1px solid #e5e5e5", textAlign: right ? "right" : "left", whiteSpace: "nowrap" }}>
      {children}
    </td>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const st = STATUS_STYLE[status] || { color: "#32363a", bg: "#f5f5f5" };
    return <span style={{ fontSize: "11px", color: st.color, backgroundColor: st.bg, padding: "1px 6px", borderRadius: "2px", fontWeight: "500" }}>{status}</span>;
  };

  const SUB_TABS = [
    { id: "upload", label: "Upload Document" },
    { id: "change", label: "Change Document" },
    { id: "view", label: "View Document" },
  ];

  const prData   = activeInv ? (LINKED_PR[activeInv]  || []) : filteredINV.flatMap((inv) => LINKED_PR[inv.invNumber]  || []);
  const poData   = activeInv ? (LINKED_PO[activeInv]  || []) : filteredINV.flatMap((inv) => LINKED_PO[inv.invNumber]  || []);
  const grnData  = activeInv ? (LINKED_GRN[activeInv] || []) : filteredINV.flatMap((inv) => LINKED_GRN[inv.invNumber] || []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-tabs */}
      <div className="flex border-b flex-shrink-0" style={{ backgroundColor: "#f0f0f0", borderColor: "#d9d9d9" }}>
        {SUB_TABS.map((t) => (
          <button key={t.id} onClick={() => setSubTab(t.id)} className="px-4 py-2"
            style={{ fontSize: "12px", fontWeight: subTab === t.id ? "600" : "400", color: subTab === t.id ? "#0070F2" : "#32363a", backgroundColor: subTab === t.id ? "#ffffff" : "transparent", borderBottom: subTab === t.id ? "2px solid #0070F2" : "2px solid transparent", borderRight: "1px solid #d9d9d9" }}>
            {t.label}
          </button>
        ))}
      </div>

      <FilterBar docType="INV" valueHelpItems={INV_VH_ITEMS} onSearch={(f) => { setFilters(f); setSelectedInv(null); }} />

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">

        {/* ── Invoice Header Table ──────────────────────────────────────── */}
        <SectionTable title="Invoice Documents" badge={`${filteredINV.length} record(s)`}>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #d9d9d9" }}>
                <th style={{ width: "32px", padding: "6px 8px", borderRight: "1px solid #e5e5e5", backgroundColor: "#f5f5f5" }}>
                  <input type="checkbox" />
                </th>
                <TH>Invoice No.</TH>
                <TH>PO Number</TH>
                <TH>GRN Number</TH>
                <TH>Vendor</TH>
                <TH>Plant</TH>
                <TH>Amount</TH>
                <TH>Currency</TH>
                <TH>Invoice Date</TH>
                <TH>Posting Date</TH>
                <TH>Status</TH>
              </tr>
            </thead>
            <tbody>
              {filteredINV.length === 0 ? (
                <tr><td colSpan={11} style={{ padding: "20px", textAlign: "center", fontSize: "12px", color: "#8a8b8c" }}>No records found. Use the Filter Bar to search.</td></tr>
              ) : filteredINV.map((row, i) => (
                <tr key={row.invNumber}
                  onClick={() => setSelectedInv(selectedInv === row.invNumber ? null : row.invNumber)}
                  style={{ borderBottom: "1px solid #eeeeee", backgroundColor: selectedInv === row.invNumber ? "#EAF1FF" : i % 2 === 0 ? "#ffffff" : "#fafafa", cursor: "pointer" }}>
                  <td style={{ padding: "5px 8px", borderRight: "1px solid #e5e5e5", textAlign: "center" }}>
                    <input type="checkbox" checked={selectedInv === row.invNumber} onChange={() => setSelectedInv(selectedInv === row.invNumber ? null : row.invNumber)} onClick={(e) => e.stopPropagation()} />
                  </td>
                  <TD blue>{row.invNumber}</TD>
                  <TD blue>{row.poNumber}</TD>
                  <TD blue>{row.grnNumber}</TD>
                  <TD>{row.vendor}</TD>
                  <TD>{row.plant}</TD>
                  <TD right>{row.amount.toLocaleString()}</TD>
                  <TD>{row.currency}</TD>
                  <TD>{row.invoiceDate}</TD>
                  <TD>{row.postDate}</TD>
                  <td style={{ padding: "5px 10px", borderRight: "1px solid #e5e5e5" }}><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionTable>

        {/* ── Linked PR Details ─────────────────────────────────────────── */}
        <SectionTable title="Linked Purchase Requisition (PR) Details" badge={`${prData.length} item(s)`}>
          {prData.length === 0 ? (
            <div style={{ padding: "16px 20px", fontSize: "12px", color: "#8a8b8c" }}>
              {filteredINV.length === 0 ? "Search for an invoice to view linked PR details." : "Select an invoice row to view linked PR details."}
            </div>
          ) : (
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #d9d9d9" }}>
                  <TH>PR Number</TH><TH>Item</TH><TH>Material</TH><TH>Description</TH>
                  <TH>Quantity</TH><TH>Unit</TH><TH>Plant</TH><TH>Vendor</TH><TH>Req. Date</TH><TH>Status</TH>
                </tr>
              </thead>
              <tbody>
                {prData.map((row, i) => (
                  <tr key={row.prNumber + row.item} style={{ borderBottom: "1px solid #eeeeee", backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafafa" }}>
                    <TD blue>{row.prNumber}</TD>
                    <TD>{row.item}</TD>
                    <TD>{row.material}</TD>
                    <TD>{row.description}</TD>
                    <TD right>{row.qty}</TD>
                    <TD>{row.unit}</TD>
                    <TD>{row.plant}</TD>
                    <TD>{row.vendor}</TD>
                    <TD>{row.reqDate}</TD>
                    <td style={{ padding: "5px 10px", borderRight: "1px solid #e5e5e5" }}><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionTable>

        {/* ── Linked PO Details ─────────────────────────────────────────── */}
        <SectionTable title="Linked Purchase Order (PO) Details" badge={`${poData.length} item(s)`}>
          {poData.length === 0 ? (
            <div style={{ padding: "16px 20px", fontSize: "12px", color: "#8a8b8c" }}>
              {filteredINV.length === 0 ? "Search for an invoice to view linked PO details." : "Select an invoice row to view linked PO details."}
            </div>
          ) : (
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #d9d9d9" }}>
                  <TH>PO Number</TH><TH>Item</TH><TH>Material</TH><TH>Description</TH>
                  <TH>Qty</TH><TH>Unit</TH><TH>Plant</TH><TH>Vendor</TH>
                  <TH>Net Price</TH><TH>Currency</TH><TH>Delivery Date</TH><TH>Status</TH>
                </tr>
              </thead>
              <tbody>
                {poData.map((row, i) => (
                  <tr key={row.poNumber + row.item} style={{ borderBottom: "1px solid #eeeeee", backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafafa" }}>
                    <TD blue>{row.poNumber}</TD>
                    <TD>{row.item}</TD>
                    <TD>{row.material}</TD>
                    <TD>{row.description}</TD>
                    <TD right>{row.qty}</TD>
                    <TD>{row.unit}</TD>
                    <TD>{row.plant}</TD>
                    <TD>{row.vendor}</TD>
                    <TD right>{row.netPrice.toLocaleString()}</TD>
                    <TD>{row.currency}</TD>
                    <TD>{row.delivDate}</TD>
                    <td style={{ padding: "5px 10px", borderRight: "1px solid #e5e5e5" }}><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionTable>

        {/* ── Linked GRN Details ────────────────────────────────────────── */}
        <SectionTable title="Linked Goods Receipt Note (GRN) Details" badge={`${grnData.length} item(s)`}>
          {grnData.length === 0 ? (
            <div style={{ padding: "16px 20px", fontSize: "12px", color: "#8a8b8c" }}>
              {filteredINV.length === 0 ? "Search for an invoice to view linked GRN details." : "Select an invoice row to view linked GRN details."}
            </div>
          ) : (
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #d9d9d9" }}>
                  <TH>GRN Number</TH><TH>PO Number</TH><TH>Item</TH><TH>Material</TH>
                  <TH>Description</TH><TH>Received Qty</TH><TH>Ordered Qty</TH>
                  <TH>Unit</TH><TH>Plant</TH><TH>Vendor</TH><TH>Posting Date</TH><TH>Status</TH>
                </tr>
              </thead>
              <tbody>
                {grnData.map((row, i) => (
                  <tr key={row.grnNumber + row.item} style={{ borderBottom: "1px solid #eeeeee", backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafafa" }}>
                    <TD blue>{row.grnNumber}</TD>
                    <TD blue>{row.poNumber}</TD>
                    <TD>{row.item}</TD>
                    <TD>{row.material}</TD>
                    <TD>{row.description}</TD>
                    <TD right>{row.receivedQty}</TD>
                    <TD right>{row.orderedQty}</TD>
                    <TD>{row.unit}</TD>
                    <TD>{row.plant}</TD>
                    <TD>{row.vendor}</TD>
                    <TD>{row.postDate}</TD>
                    <td style={{ padding: "5px 10px", borderRight: "1px solid #e5e5e5" }}><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionTable>

        {/* ── Document Sub-tab content ─────────────────────────────────── */}
        {subTab === "upload" && (
          <div className="flex gap-4">
            <div className="flex-1 border" style={{ backgroundColor: "#ffffff", borderColor: "#d9d9d9", borderRadius: "2px" }}>
              <div className="px-4 py-2 border-b" style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#32363a" }}>Upload Invoice Document</span>
                <span style={{ fontSize: "11px", color: "#8a8b8c", marginLeft: "8px" }}>(Single document per Invoice)</span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <label style={{ fontSize: "11px", fontWeight: "500", color: "#32363a", width: "120px" }}>Invoice Number *</label>
                  <input type="text" value={uploadDocNumber} onChange={(e) => setUploadDocNumber(e.target.value)} placeholder="Enter Invoice Number"
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
                  {[{ label: "Document Type", value: ocr.docType }, { label: "Document Number Detected", value: ocr.docNumber }, { label: "Invoice Matching", value: ocr.matching }].map((item) => (
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

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Download, RefreshCw } from "lucide-react";

const MONTHLY_DATA = [
  { month: "Oct '24", PR: 8, PO: 5, GRN: 4, INV: 3 },
  { month: "Nov '24", PR: 12, PO: 8, GRN: 6, INV: 5 },
  { month: "Dec '24", PR: 10, PO: 7, GRN: 5, INV: 4 },
  { month: "Jan '25", PR: 14, PO: 10, GRN: 8, INV: 7 },
  { month: "Feb '25", PR: 11, PO: 9, GRN: 7, INV: 6 },
  { month: "Mar '25", PR: 9, PO: 6, GRN: 4, INV: 3 },
];

const STATUS_DIST = [
  { name: "Uploaded", value: 93, color: "#107E3E" },
  { name: "Pending", value: 7, color: "#E9730C" },
  { name: "Missing", value: 4, color: "#BB0000" },
];

const VENDOR_DATA = [
  { vendor: "Vendor A", documents: 38, onTime: 35, late: 3 },
  { vendor: "Vendor B", documents: 29, onTime: 25, late: 4 },
  { vendor: "Vendor C", documents: 22, onTime: 21, late: 1 },
  { vendor: "Vendor D", documents: 15, onTime: 12, late: 3 },
];

const SUMMARY_REPORT = [
  { docType: "Purchase Requisition (PR)", total: 42, uploaded: 37, pending: 3, missing: 2, compliance: "88%" },
  { docType: "Purchase Order (PO)", total: 28, uploaded: 25, pending: 2, missing: 1, compliance: "89%" },
  { docType: "Goods Receipt Note (GRN)", total: 19, uploaded: 17, pending: 1, missing: 1, compliance: "89%" },
  { docType: "Invoice Verification", total: 15, uploaded: 14, pending: 1, missing: 0, compliance: "93%" },
  { docType: "Total", total: 104, uploaded: 93, pending: 7, missing: 4, compliance: "89%" },
];

export function Reports() {
  const [dateFrom, setDateFrom] = useState("2024-10-01");
  const [dateTo, setDateTo] = useState("2025-03-31");
  const [docType, setDocType] = useState("All");
  const [plant, setPlant] = useState("All");
  const [activeChart, setActiveChart] = useState<"bar" | "line">("bar");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="px-5 py-3 border-b flex items-center justify-between flex-shrink-0" style={{ backgroundColor: "#ffffff", borderColor: "#d9d9d9" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#8a8b8c" }}>Home &rsaquo; Reports</div>
          <h1 style={{ fontSize: "16px", fontWeight: "600", color: "#32363a", margin: 0 }}>Reports & Analytics</h1>
        </div>
        <button className="flex items-center gap-1 px-3 py-1 border hover:bg-gray-50"
          style={{ fontSize: "12px", borderColor: "#d9d9d9", color: "#32363a", borderRadius: "2px" }}>
          <Download size={13} />Export Report
        </button>
      </div>

      {/* Filter Bar */}
      <div className="px-4 py-3 border-b flex-shrink-0" style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9" }}>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: "11px", fontWeight: "500", color: "#32363a" }}>Date From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="border px-2 py-1 outline-none" style={{ fontSize: "12px", borderColor: "#d9d9d9", color: "#32363a", borderRadius: "2px", backgroundColor: "#ffffff", height: "26px", width: "130px" }} />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: "11px", fontWeight: "500", color: "#32363a" }}>Date To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="border px-2 py-1 outline-none" style={{ fontSize: "12px", borderColor: "#d9d9d9", color: "#32363a", borderRadius: "2px", backgroundColor: "#ffffff", height: "26px", width: "130px" }} />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: "11px", fontWeight: "500", color: "#32363a" }}>Document Type</label>
            <select value={docType} onChange={(e) => setDocType(e.target.value)}
              className="border px-2 py-1 outline-none" style={{ fontSize: "12px", borderColor: "#d9d9d9", color: "#32363a", borderRadius: "2px", backgroundColor: "#ffffff", height: "26px", width: "150px" }}>
              <option value="All">All Types</option>
              <option value="PR">Purchase Requisition</option>
              <option value="PO">Purchase Order</option>
              <option value="GRN">Goods Receipt Note</option>
              <option value="INV">Invoice</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: "11px", fontWeight: "500", color: "#32363a" }}>Plant</label>
            <select value={plant} onChange={(e) => setPlant(e.target.value)}
              className="border px-2 py-1 outline-none" style={{ fontSize: "12px", borderColor: "#d9d9d9", color: "#32363a", borderRadius: "2px", backgroundColor: "#ffffff", height: "26px", width: "100px" }}>
              <option value="All">All Plants</option>
              {["1000", "2000", "3000", "4000"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button className="flex items-center gap-1 px-4 py-1 border"
              style={{ fontSize: "12px", backgroundColor: "#0070F2", color: "#ffffff", borderColor: "#0070F2", borderRadius: "2px", height: "26px" }}>
              <RefreshCw size={11} />Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
        {/* Summary Table */}
        <div className="border" style={{ backgroundColor: "#ffffff", borderColor: "#d9d9d9", borderRadius: "2px" }}>
          <div className="px-4 py-2 border-b flex items-center justify-between" style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#32363a" }}>Document Compliance Summary</span>
            <span style={{ fontSize: "11px", color: "#8a8b8c" }}>Period: Oct 2024 – Mar 2025</span>
          </div>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "1px solid #d9d9d9" }}>
                {["Document Type", "Total", "Uploaded", "Pending", "Missing", "Compliance %"].map((col) => (
                  <th key={col} className="text-left" style={{ padding: "6px 12px", fontSize: "11px", fontWeight: "600", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUMMARY_REPORT.map((row, i) => (
                <tr key={row.docType} style={{ borderBottom: "1px solid #eeeeee", backgroundColor: row.docType === "Total" ? "#f5f5f5" : i % 2 === 0 ? "#ffffff" : "#fafafa" }}>
                  <td style={{ padding: "6px 12px", fontSize: "12px", color: "#32363a", fontWeight: row.docType === "Total" ? "600" : "400", borderRight: "1px solid #e5e5e5" }}>{row.docType}</td>
                  <td style={{ padding: "6px 12px", fontSize: "12px", color: "#32363a", fontWeight: row.docType === "Total" ? "600" : "400", borderRight: "1px solid #e5e5e5", textAlign: "right" }}>{row.total}</td>
                  <td style={{ padding: "6px 12px", fontSize: "12px", color: "#107E3E", fontWeight: row.docType === "Total" ? "600" : "400", borderRight: "1px solid #e5e5e5", textAlign: "right" }}>{row.uploaded}</td>
                  <td style={{ padding: "6px 12px", fontSize: "12px", color: "#E9730C", fontWeight: row.docType === "Total" ? "600" : "400", borderRight: "1px solid #e5e5e5", textAlign: "right" }}>{row.pending}</td>
                  <td style={{ padding: "6px 12px", fontSize: "12px", color: row.missing > 0 ? "#BB0000" : "#32363a", fontWeight: row.docType === "Total" ? "600" : "400", borderRight: "1px solid #e5e5e5", textAlign: "right" }}>{row.missing}</td>
                  <td style={{ padding: "6px 12px", borderRight: "1px solid #e5e5e5" }}>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full overflow-hidden" style={{ height: "6px", width: "80px" }}>
                        <div style={{ height: "100%", width: row.compliance, backgroundColor: parseInt(row.compliance) >= 90 ? "#107E3E" : "#E9730C", borderRadius: "2px" }} />
                      </div>
                      <span style={{ fontSize: "11px", color: parseInt(row.compliance) >= 90 ? "#107E3E" : "#E9730C", fontWeight: "600", whiteSpace: "nowrap" }}>{row.compliance}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Monthly Trend Chart */}
          <div className="col-span-2 border" style={{ backgroundColor: "#ffffff", borderColor: "#d9d9d9", borderRadius: "2px" }}>
            <div className="px-4 py-2 border-b flex items-center justify-between" style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#32363a" }}>Monthly Document Volume</span>
              <div className="flex gap-1">
                {(["bar", "line"] as const).map((type) => (
                  <button key={type} onClick={() => setActiveChart(type)}
                    className="px-3 py-1 border capitalize"
                    style={{ fontSize: "11px", backgroundColor: activeChart === type ? "#0070F2" : "#ffffff", color: activeChart === type ? "#ffffff" : "#32363a", borderColor: activeChart === type ? "#0070F2" : "#d9d9d9", borderRadius: "2px" }}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4" style={{ height: "220px" }}>
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === "bar" ? (
                  <BarChart data={MONTHLY_DATA} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6a6d70" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#6a6d70" }} />
                    <Tooltip contentStyle={{ fontSize: "11px", border: "1px solid #d9d9d9" }} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="PR" fill="#0070F2" maxBarSize={20} />
                    <Bar dataKey="PO" fill="#107E3E" maxBarSize={20} />
                    <Bar dataKey="GRN" fill="#E9730C" maxBarSize={20} />
                    <Bar dataKey="INV" fill="#6A6D70" maxBarSize={20} />
                  </BarChart>
                ) : (
                  <LineChart data={MONTHLY_DATA} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6a6d70" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#6a6d70" }} />
                    <Tooltip contentStyle={{ fontSize: "11px", border: "1px solid #d9d9d9" }} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Line type="monotone" dataKey="PR" stroke="#0070F2" strokeWidth={1.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="PO" stroke="#107E3E" strokeWidth={1.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="GRN" stroke="#E9730C" strokeWidth={1.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="INV" stroke="#6A6D70" strokeWidth={1.5} dot={{ r: 3 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution Pie */}
          <div className="border" style={{ backgroundColor: "#ffffff", borderColor: "#d9d9d9", borderRadius: "2px" }}>
            <div className="px-4 py-2 border-b" style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#32363a" }}>Upload Status Distribution</span>
            </div>
            <div className="p-4 flex flex-col items-center" style={{ height: "220px" }}>
              <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                  <Pie data={STATUS_DIST} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                    {STATUS_DIST.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1 w-full mt-2">
                {STATUS_DIST.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div style={{ width: "10px", height: "10px", backgroundColor: item.color, borderRadius: "1px" }} />
                      <span style={{ fontSize: "11px", color: "#32363a" }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Table */}
        <div className="border" style={{ backgroundColor: "#ffffff", borderColor: "#d9d9d9", borderRadius: "2px" }}>
          <div className="px-4 py-2 border-b" style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#32363a" }}>Vendor-wise Document Submission</span>
          </div>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "1px solid #d9d9d9" }}>
                {["Vendor", "Total Documents", "On Time", "Late", "On-Time Rate"].map((col) => (
                  <th key={col} className="text-left" style={{ padding: "6px 12px", fontSize: "11px", fontWeight: "600", color: "#32363a", borderRight: "1px solid #e5e5e5" }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VENDOR_DATA.map((row, i) => {
                const rate = Math.round((row.onTime / row.documents) * 100);
                return (
                  <tr key={row.vendor} style={{ borderBottom: "1px solid #eeeeee", backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafafa" }}>
                    <td style={{ padding: "6px 12px", fontSize: "12px", color: "#32363a", fontWeight: "500", borderRight: "1px solid #e5e5e5" }}>{row.vendor}</td>
                    <td style={{ padding: "6px 12px", fontSize: "12px", color: "#32363a", borderRight: "1px solid #e5e5e5", textAlign: "right" }}>{row.documents}</td>
                    <td style={{ padding: "6px 12px", fontSize: "12px", color: "#107E3E", borderRight: "1px solid #e5e5e5", textAlign: "right" }}>{row.onTime}</td>
                    <td style={{ padding: "6px 12px", fontSize: "12px", color: row.late > 0 ? "#BB0000" : "#107E3E", borderRight: "1px solid #e5e5e5", textAlign: "right" }}>{row.late}</td>
                    <td style={{ padding: "6px 12px", borderRight: "1px solid #e5e5e5" }}>
                      <div className="flex items-center gap-2">
                        <div style={{ width: "80px", height: "6px", backgroundColor: "#e5e5e5", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${rate}%`, backgroundColor: rate >= 90 ? "#107E3E" : "#E9730C" }} />
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: "600", color: rate >= 90 ? "#107E3E" : "#E9730C" }}>{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

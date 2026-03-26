import { useState, useRef, useEffect } from "react";
import { FileText, ShoppingCart, Clock, AlertTriangle, Send, ChevronUp, ChevronDown, MessageSquare, X, Minus } from "lucide-react";

const KPI_DATA = [
  { label: "Total PR Documents", value: 42, sub: "+3 this week", icon: FileText, color: "#0070F2", bg: "#E8F1FB" },
  { label: "Total PO Documents", value: 28, sub: "+1 this week", icon: ShoppingCart, color: "#107E3E", bg: "#EEF5EC" },
  { label: "Pending Approvals", value: 9, sub: "4 urgent", icon: Clock, color: "#E9730C", bg: "#FEF3E8" },
  { label: "Missing Documents", value: 5, sub: "Requires action", icon: AlertTriangle, color: "#BB0000", bg: "#FBEAEA" },
];

const SUMMARY_DATA = [
  { type: "Purchase Requisition (PR)", total: 42, uploaded: 37, pending: 3, missing: 2 },
  { type: "Purchase Order (PO)", total: 28, uploaded: 25, pending: 2, missing: 1 },
  { type: "Goods Receipt Note (GRN)", total: 19, uploaded: 17, pending: 1, missing: 1 },
  { type: "Invoice Verification", total: 15, uploaded: 14, pending: 1, missing: 0 },
  { type: "Total", total: 104, uploaded: 93, pending: 7, missing: 4 },
];

const CHAT_SUGGESTIONS = [
  "Show missing PR documents",
  "Pending approvals",
  "Upload status for PO2002",
  "List all GRN documents",
];

const STATIC_RESPONSES: Record<string, string> = {
  "Show missing PR documents":
    "There are 2 missing PR documents:\n• PR1001 — Invoice not uploaded\n• PR1003 — GRN document missing\n\nNavigate to Document Uploads → PR to resolve.",
  "Pending approvals":
    "You have 9 pending approvals:\n• 4 marked as Urgent (PO2001, PO2002, PR1002, GR3001)\n• 5 standard approvals awaiting review.",
  "Upload status for PO2002":
    "PO2002 Status:\n• PO Document: ✓ Uploaded\n• Invoice: ✗ Missing\n• GRN: ✓ Uploaded\n\nAction required: Upload Invoice for PO2002.",
  "List all GRN documents":
    "GRN Documents (2 of 2):\n• GR3001 — Linked to PO2001 — Status: Received\n• GR3002 — Linked to PO2002 — Status: Partial\n\nBoth documents are uploaded.",
};

type SortKey = "type" | "total" | "uploaded" | "pending" | "missing";

export function Dashboard() {
  const [sortKey, setSortKey] = useState<SortKey>("type");
  const [sortAsc, setSortAsc] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([
    { from: "bot", text: "Hello! I'm your DVP Assistant. How can I help you today?" },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatOpen && !chatMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatOpen, chatMinimized]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const sortedData = [...SUMMARY_DATA].sort((a, b) => {
    if (a.type === "Total") return 1;
    if (b.type === "Total") return -1;
    const av = a[sortKey] as string | number;
    const bv = b[sortKey] as string | number;
    if (typeof av === "string") return sortAsc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
    return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  const sendMessage = (text: string) => {
    const msg = text.trim();
    if (!msg) return;
    setMessages((prev) => [...prev, { from: "user", text: msg }]);
    const reply = STATIC_RESPONSES[msg] || "I'm sorry, I couldn't find specific information for that query. Please try one of the suggested queries or contact your system administrator.";
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    }, 600);
    setChatInput("");
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortAsc ? <ChevronUp size={11} className="inline ml-1" /> : <ChevronDown size={11} className="inline ml-1" />
    ) : (
      <ChevronDown size={11} className="inline ml-1 opacity-30" />
    );

  return (
    <div className="p-0 h-full flex flex-col">
      {/* Page Header */}
      <div
        className="px-5 py-3 border-b flex items-center justify-between flex-shrink-0"
        style={{ backgroundColor: "#ffffff", borderColor: "#d9d9d9" }}
      >
        <div>
          <div style={{ fontSize: "11px", color: "#8a8b8c" }}>Home</div>
          <h1 style={{ fontSize: "16px", fontWeight: "600", color: "#32363a", margin: 0 }}>Dashboard</h1>
        </div>
        <div style={{ fontSize: "11px", color: "#8a8b8c" }}>
          Last updated: 26 Mar 2025, 09:42 AM
        </div>
      </div>

      {/* Main Content — full width now that chatbot is floating */}
      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
        {/* KPI Strip */}
        <div className="grid grid-cols-4 gap-3">
          {KPI_DATA.map((kpi) => (
            <div
              key={kpi.label}
              className="border flex items-center gap-3 p-3"
              style={{ backgroundColor: "#ffffff", borderColor: "#d9d9d9", borderRadius: "2px" }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: "40px", height: "40px", backgroundColor: kpi.bg, borderRadius: "2px" }}
              >
                <kpi.icon size={18} color={kpi.color} />
              </div>
              <div>
                <div style={{ fontSize: "22px", fontWeight: "700", color: kpi.color, lineHeight: "1.1" }}>{kpi.value}</div>
                <div style={{ fontSize: "11px", color: "#32363a", fontWeight: "500" }}>{kpi.label}</div>
                <div style={{ fontSize: "10px", color: "#8a8b8c" }}>{kpi.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Table */}
        <div className="border" style={{ backgroundColor: "#ffffff", borderColor: "#d9d9d9", borderRadius: "2px" }}>
          <div
            className="px-4 py-2 border-b flex items-center justify-between"
            style={{ borderColor: "#d9d9d9", backgroundColor: "#f5f5f5" }}
          >
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#32363a" }}>Document Summary</span>
            <span style={{ fontSize: "11px", color: "#8a8b8c" }}>FY 2025 | All Plants</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "1px solid #d9d9d9" }}>
                  {(["type", "total", "uploaded", "pending", "missing"] as SortKey[]).map((col) => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      className="text-left cursor-pointer select-none"
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#32363a",
                        borderRight: "1px solid #e5e5e5",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col === "type" ? "Document Type" : col.charAt(0).toUpperCase() + col.slice(1)}
                      <SortIcon col={col} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row, i) => (
                  <tr
                    key={row.type}
                    style={{
                      borderBottom: "1px solid #eeeeee",
                      backgroundColor: row.type === "Total" ? "#f5f5f5" : i % 2 === 0 ? "#ffffff" : "#fafafa",
                    }}
                  >
                    <td style={{ padding: "6px 12px", fontSize: "12px", color: "#32363a", fontWeight: row.type === "Total" ? "600" : "400", borderRight: "1px solid #e5e5e5" }}>
                      {row.type}
                    </td>
                    <td style={{ padding: "6px 12px", fontSize: "12px", color: "#32363a", fontWeight: row.type === "Total" ? "600" : "400", borderRight: "1px solid #e5e5e5", textAlign: "right" }}>{row.total}</td>
                    <td style={{ padding: "6px 12px", fontSize: "12px", color: "#107E3E", fontWeight: row.type === "Total" ? "600" : "400", borderRight: "1px solid #e5e5e5", textAlign: "right" }}>{row.uploaded}</td>
                    <td style={{ padding: "6px 12px", fontSize: "12px", color: "#E9730C", fontWeight: row.type === "Total" ? "600" : "400", borderRight: "1px solid #e5e5e5", textAlign: "right" }}>{row.pending}</td>
                    <td style={{ padding: "6px 12px", fontSize: "12px", color: row.missing > 0 ? "#BB0000" : "#32363a", fontWeight: row.type === "Total" ? "600" : "400", textAlign: "right" }}>{row.missing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Floating DVP Assistant ────────────────────────────────────────── */}

      {/* Chat Panel — expands above the FAB */}
      {chatOpen && (
        <div
          className="fixed flex flex-col shadow-2xl border z-50"
          style={{
            bottom: "80px",
            right: "24px",
            width: "320px",
            height: chatMinimized ? "0px" : "420px",
            overflow: "hidden",
            backgroundColor: "#ffffff",
            borderColor: "#d9d9d9",
            borderRadius: "4px",
            transition: "height 0.2s ease",
          }}
        >
          {/* Chat Header */}
          <div
            className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0"
            style={{ backgroundColor: "#003B62", borderColor: "#d9d9d9" }}
          >
            <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
            <MessageSquare size={13} color="#ffffff" />
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#ffffff", flex: 1 }}>DVP Assistant</span>
            <button onClick={() => setChatMinimized(!chatMinimized)} className="hover:opacity-70">
              <Minus size={13} color="#ffffff" />
            </button>
            <button onClick={() => { setChatOpen(false); setChatMinimized(false); }} className="hover:opacity-70 ml-1">
              <X size={13} color="#ffffff" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2" style={{ backgroundColor: "#f9f9f9" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="px-3 py-2 max-w-[85%]"
                  style={{
                    borderRadius: "4px",
                    fontSize: "11px",
                    lineHeight: "1.5",
                    whiteSpace: "pre-line",
                    backgroundColor: msg.from === "user" ? "#0070F2" : "#ffffff",
                    color: msg.from === "user" ? "#ffffff" : "#32363a",
                    border: msg.from === "bot" ? "1px solid #e5e5e5" : "none",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="px-3 py-2 border-t flex-shrink-0" style={{ borderColor: "#eeeeee", backgroundColor: "#ffffff" }}>
            <div style={{ fontSize: "10px", color: "#8a8b8c", marginBottom: "4px", fontWeight: "600" }}>QUICK QUERIES</div>
            <div className="flex flex-col gap-1">
              {CHAT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left px-2 py-1 border hover:bg-blue-50 transition-colors"
                  style={{
                    fontSize: "11px",
                    color: "#0070F2",
                    borderColor: "#C8D8F0",
                    backgroundColor: "#EEF4FF",
                    borderRadius: "2px",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t flex gap-2 flex-shrink-0" style={{ borderColor: "#d9d9d9" }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(chatInput)}
              placeholder="Ask about documents..."
              className="flex-1 border px-2 py-1 outline-none"
              style={{ fontSize: "11px", borderColor: "#d9d9d9", borderRadius: "2px", color: "#32363a" }}
            />
            <button
              onClick={() => sendMessage(chatInput)}
              className="flex items-center justify-center"
              style={{ width: "28px", height: "28px", backgroundColor: "#0070F2", borderRadius: "2px", flexShrink: 0 }}
            >
              <Send size={12} color="#ffffff" />
            </button>
          </div>
        </div>
      )}

      {/* FAB — circular button */}
      <button
        onClick={() => {
          if (chatOpen) {
            setChatMinimized(false);
            setChatOpen(false);
          } else {
            setChatOpen(true);
            setChatMinimized(false);
          }
        }}
        className="fixed flex items-center justify-center shadow-lg hover:opacity-90 transition-all z-50"
        style={{
          bottom: "24px",
          right: "24px",
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          backgroundColor: "#0070F2",
          border: "none",
        }}
        title="Open DVP Assistant"
      >
        {chatOpen ? (
          <X size={20} color="#ffffff" />
        ) : (
          <>
            <MessageSquare size={20} color="#ffffff" />
            {/* Unread dot */}
            <span
              className="absolute flex items-center justify-center rounded-full text-white"
              style={{ top: "4px", right: "4px", width: "14px", height: "14px", backgroundColor: "#BB0000", fontSize: "8px", fontWeight: "700" }}
            >
              1
            </span>
          </>
        )}
      </button>
    </div>
  );
}

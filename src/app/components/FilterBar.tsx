import { useState } from "react";
import { Search, X, HelpCircle } from "lucide-react";
import { ValueHelpDialog, ValueHelpItem } from "./ValueHelpDialog";

type FilterBarProps = {
  docType: "PR" | "PO" | "GRN" | "INV";
  onSearch: (filters: FilterValues) => void;
  valueHelpItems: ValueHelpItem[];
};

export type FilterValues = {
  docNumber: string;
  plant: string;
  vendor: string;
  dateFrom: string;
  dateTo: string;
};

const PLANTS = ["1000", "2000", "3000", "4000"];
const VENDORS = ["Vendor A", "Vendor B", "Vendor C", "Vendor D"];

const DOC_LABELS: Record<string, string> = {
  PR: "PR Number",
  PO: "PO Number",
  GRN: "GRN Number",
  INV: "Invoice Number",
};

const VH_TITLES: Record<string, string> = {
  PR: "Purchase Requisition",
  PO: "Purchase Order",
  GRN: "Goods Receipt Note",
  INV: "Invoice",
};

export function FilterBar({ docType, onSearch, valueHelpItems }: FilterBarProps) {
  const [docNumber, setDocNumber] = useState("");
  const [plant, setPlant] = useState("");
  const [vendor, setVendor] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [vhOpen, setVhOpen] = useState(false);

  const handleSearch = () => {
    onSearch({ docNumber, plant, vendor, dateFrom, dateTo });
  };

  const handleClear = () => {
    setDocNumber("");
    setPlant("");
    setVendor("");
    setDateFrom("");
    setDateTo("");
    onSearch({ docNumber: "", plant: "", vendor: "", dateFrom: "", dateTo: "" });
  };

  return (
    <>
      <div
        className="px-4 py-3 border-b"
        style={{ backgroundColor: "#f5f5f5", borderColor: "#d9d9d9" }}
      >
        <div
          className="flex items-center gap-1 mb-2"
          style={{ fontSize: "11px", fontWeight: "600", color: "#32363a" }}
        >
          <Search size={12} />
          <span>FILTER BAR</span>
          <span style={{ color: "#8a8b8c", fontWeight: "400", marginLeft: "4px" }}>
            — Enter search criteria and press Search
          </span>
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          {/* Doc Number with Value Help */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: "11px", color: "#32363a", fontWeight: "500" }}>
              {DOC_LABELS[docType]}
            </label>
            <div className="flex">
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder={`e.g. ${docType === "PR" ? "PR1001" : docType === "PO" ? "PO2001" : docType === "GRN" ? "GR3001" : "INV4001"}`}
                className="border px-2 py-1 outline-none"
                style={{
                  fontSize: "12px",
                  borderColor: "#d9d9d9",
                  borderRight: "none",
                  width: "130px",
                  color: "#32363a",
                  borderRadius: "2px 0 0 2px",
                  backgroundColor: "#ffffff",
                }}
              />
              <button
                onClick={() => setVhOpen(true)}
                title="Value Help (F4)"
                className="border flex items-center justify-center hover:bg-blue-50"
                style={{
                  width: "26px",
                  height: "26px",
                  borderColor: "#d9d9d9",
                  backgroundColor: "#ffffff",
                  borderRadius: "0 2px 2px 0",
                  flexShrink: 0,
                }}
              >
                <HelpCircle size={13} color="#0070F2" />
              </button>
            </div>
          </div>

          {/* Plant */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: "11px", color: "#32363a", fontWeight: "500" }}>Plant</label>
            <select
              value={plant}
              onChange={(e) => setPlant(e.target.value)}
              className="border px-2 py-1 outline-none"
              style={{
                fontSize: "12px",
                borderColor: "#d9d9d9",
                width: "100px",
                color: "#32363a",
                borderRadius: "2px",
                backgroundColor: "#ffffff",
                height: "26px",
              }}
            >
              <option value="">All Plants</option>
              {PLANTS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Vendor */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: "11px", color: "#32363a", fontWeight: "500" }}>Vendor</label>
            <select
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="border px-2 py-1 outline-none"
              style={{
                fontSize: "12px",
                borderColor: "#d9d9d9",
                width: "120px",
                color: "#32363a",
                borderRadius: "2px",
                backgroundColor: "#ffffff",
                height: "26px",
              }}
            >
              <option value="">All Vendors</option>
              {VENDORS.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {/* Date From */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: "11px", color: "#32363a", fontWeight: "500" }}>Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border px-2 py-1 outline-none"
              style={{
                fontSize: "12px",
                borderColor: "#d9d9d9",
                width: "130px",
                color: "#32363a",
                borderRadius: "2px",
                backgroundColor: "#ffffff",
                height: "26px",
              }}
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: "11px", color: "#32363a", fontWeight: "500" }}>Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border px-2 py-1 outline-none"
              style={{
                fontSize: "12px",
                borderColor: "#d9d9d9",
                width: "130px",
                color: "#32363a",
                borderRadius: "2px",
                backgroundColor: "#ffffff",
                height: "26px",
              }}
            />
          </div>

          {/* Buttons */}
          <div className="flex items-end gap-2 pb-0">
            <button
              onClick={handleSearch}
              className="flex items-center gap-1 px-4 py-1 border hover:opacity-90"
              style={{
                fontSize: "12px",
                backgroundColor: "#0070F2",
                color: "#ffffff",
                borderColor: "#0070F2",
                borderRadius: "2px",
                height: "26px",
                fontWeight: "500",
              }}
            >
              <Search size={12} />
              Search
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-4 py-1 border hover:bg-gray-100"
              style={{
                fontSize: "12px",
                backgroundColor: "#ffffff",
                color: "#32363a",
                borderColor: "#d9d9d9",
                borderRadius: "2px",
                height: "26px",
              }}
            >
              <X size={12} />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Value Help Dialog */}
      {vhOpen && (
        <ValueHelpDialog
          title={VH_TITLES[docType]}
          items={valueHelpItems}
          onSelect={(item) => {
            setDocNumber(item.id);
            setVhOpen(false);
            onSearch({ docNumber: item.id, plant, vendor, dateFrom, dateTo });
          }}
          onClose={() => setVhOpen(false)}
        />
      )}
    </>
  );
}

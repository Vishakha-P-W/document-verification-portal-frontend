import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import logo from "../../assets/logo.png";
import {
  LayoutDashboard,
  FileUp,
  BarChart2,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Settings,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Invoice Verification", path: "/documents", icon: FileUp },
  { label: "Reports", path: "/reports", icon: BarChart2 },
];

const NOTIFICATIONS = [
  { id: 1, message: "PR1001 document missing", type: "error", time: "10 min ago" },
  { id: 2, message: "PO2002 pending approval", type: "warning", time: "25 min ago" },
  { id: 3, message: "GR3001 uploaded successfully", type: "success", time: "1 hr ago" },
  { id: 4, message: "PR1003 approved by Manager", type: "info", time: "2 hrs ago" },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ fontFamily: "'72', '72full', Arial, Helvetica, sans-serif", fontSize: "13px" }}>
      {/* SAP Shell Header */}
      <header
        className="flex items-center justify-between px-4 flex-shrink-0"
        style={{ backgroundColor: "#003B62", height: "56px", minHeight: "56px" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <img
              src={logo}
              alt="logo"
              className="h-10 w-auto object-contain rounded-md"
            />
          </div>
          <span
            className="text-white leading-none"
            style={{ fontSize: "15px", fontWeight: "600", letterSpacing: "0.02em" }}
          >
            Document Verification Portal
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="relative flex items-center justify-center rounded hover:bg-white/10 transition-colors"
              style={{ width: "36px", height: "36px" }}
            >
              <Bell size={18} color="#ffffff" />
              <span
                className="absolute flex items-center justify-center rounded-full text-white"
                style={{
                  top: "5px", right: "5px", width: "16px", height: "16px",
                  backgroundColor: "#BB0000", fontSize: "9px", fontWeight: "700"
                }}
              >
                {NOTIFICATIONS.length}
              </span>
            </button>
            {notifOpen && (
              <div
                className="absolute right-0 bg-white shadow-lg border z-50"
                style={{ top: "40px", width: "320px", borderColor: "#d9d9d9" }}
              >
                <div
                  className="flex items-center justify-between px-3 py-2 border-b"
                  style={{ borderColor: "#d9d9d9", backgroundColor: "#f5f5f5" }}
                >
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#32363a" }}>Notifications</span>
                  <button onClick={() => setNotifOpen(false)}>
                    <X size={14} color="#6a6d70" />
                  </button>
                </div>
                {NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-2 px-3 py-2 border-b hover:bg-blue-50 cursor-pointer"
                    style={{ borderColor: "#eeeeee" }}
                  >
                    <div
                      className="rounded-full mt-1 flex-shrink-0"
                      style={{
                        width: "8px", height: "8px",
                        backgroundColor:
                          n.type === "error" ? "#BB0000"
                          : n.type === "warning" ? "#E9730C"
                          : n.type === "success" ? "#107E3E"
                          : "#0070F2"
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: "12px", color: "#32363a" }}>{n.message}</div>
                      <div style={{ fontSize: "11px", color: "#8a8b8c" }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="mx-1" style={{ width: "1px", height: "20px", backgroundColor: "rgba(255,255,255,0.3)" }} />

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white/10 transition-colors"
            >
              <div
                className="rounded-full flex items-center justify-center text-white"
                style={{ width: "28px", height: "28px", backgroundColor: "#0070F2", fontSize: "11px", fontWeight: "600" }}
              >
                JD
              </div>
              <span className="text-white" style={{ fontSize: "12px" }}>John Doe</span>
              <ChevronDown size={12} color="#ffffff" />
            </button>
            {profileOpen && (
              <div
                className="absolute right-0 bg-white shadow-lg border z-50"
                style={{ top: "40px", width: "180px", borderColor: "#d9d9d9" }}
              >
                <div className="px-3 py-2 border-b" style={{ borderColor: "#eeeeee", backgroundColor: "#f5f5f5" }}>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#32363a" }}>John Doe</div>
                  <div style={{ fontSize: "11px", color: "#8a8b8c" }}>john.doe@company.com</div>
                </div>
                {[
                  { icon: User, label: "Profile" },
                  { icon: Settings, label: "Settings" },
                  { icon: LogOut, label: "Log Out" },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-blue-50 text-left"
                    style={{ fontSize: "12px", color: "#32363a" }}
                  >
                    <item.icon size={13} color="#6a6d70" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className="flex-shrink-0 flex flex-col border-r overflow-y-auto"
          style={{ width: "220px", backgroundColor: "#ffffff", borderColor: "#d9d9d9" }}
        >
          <nav className="flex flex-col pt-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-3 px-4 py-2 text-left w-full transition-colors relative"
                style={{
                  fontSize: "13px",
                  fontWeight: isActive(item.path) ? "600" : "400",
                  color: isActive(item.path) ? "#0070F2" : "#32363A",
                  backgroundColor: isActive(item.path) ? "#E8F1FB" : "transparent",
                  borderLeft: isActive(item.path) ? "3px solid #0070F2" : "3px solid transparent",
                  paddingLeft: isActive(item.path) ? "13px" : "13px",
                  minHeight: "36px",
                }}
              >
                <item.icon
                  size={15}
                  color={isActive(item.path) ? "#0070F2" : "#6A6D70"}
                />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="mt-auto px-4 py-3 border-t" style={{ borderColor: "#eeeeee" }}>
            <div style={{ fontSize: "11px", color: "#8a8b8c" }}>DMS v1</div>
            <div style={{ fontSize: "11px", color: "#8a8b8c" }}>© 2026 Midwest Limited</div>
          </div>
        </aside>

        {/* Content Area */}
        <main
          className="flex-1 overflow-auto"
          style={{ backgroundColor: "#f5f5f5" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
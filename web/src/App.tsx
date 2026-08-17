import { Routes, Route, NavLink } from "react-router-dom";
import { Dashboard } from "./features/dashboard/Dashboard.js";
import { Discovery } from "./features/discovery/Discovery.js";
import { ProspectDetail } from "./features/prospects/ProspectDetail.js";
import { Opportunities } from "./features/opportunities/Opportunities.js";
import { Customers } from "./features/customers/Customers.js";

const navItems = [
  { to: "/", label: "Call queue", end: true },
  { to: "/discovery", label: "Discovery" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/customers", label: "Customers" },
];

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-6 py-4">
        <h1 className="text-lg font-medium">Peak Empire</h1>
        <p className="text-sm text-slate-400">Sales Intelligence Empire Builder</p>
        <nav className="mt-3 flex gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "text-white font-medium" : "text-slate-400 hover:text-slate-200"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/discovery" element={<Discovery />} />
          <Route path="/prospects/:id" element={<ProspectDetail />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/customers" element={<Customers />} />
        </Routes>
      </main>
    </div>
  );
}

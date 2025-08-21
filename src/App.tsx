import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Home from "@/pages/Home";
import Schedule from "@/pages/Schedule";
import Clients from "@/pages/Clients";
import Professionals from "@/pages/Professionals";
import Services from "@/pages/Services";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agenda" element={<Schedule />} />
          <Route path="/clientes" element={<Clients />} />
          <Route path="/profissionais" element={<Professionals />} />
          <Route path="/servicos" element={<Services />} />
          <Route path="/whatsapp" element={<div className="text-center text-xl">WhatsApp - Em Desenvolvimento</div>} />
          <Route path="/relatorios" element={<Reports />} />
          <Route path="/configuracoes" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

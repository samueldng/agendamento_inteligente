import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Home from "@/pages/Home";
import Schedule from "@/pages/Schedule";
import Clients from "@/pages/Clients";
import Professionals from "@/pages/Professionals";
import Services from "@/pages/Services";
import Templates from "@/pages/Templates";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import HotelDashboard from "@/pages/HotelDashboard";
import HealthDashboard from "@/pages/HealthDashboard";
import HealthConsultations from "@/pages/HealthConsultations";
import HealthPatients from "@/pages/HealthPatients";
import HealthProcedures from "@/pages/HealthProcedures";
import BeautyDashboard from "@/pages/BeautyDashboard";
import BeautyClients from "@/pages/BeautyClients";
import BeautyAppointments from "@/pages/BeautyAppointments";
import BeautyServices from "@/pages/BeautyServices";
import { Rooms } from "@/pages/hotel/Rooms";
import { Reservations } from "@/pages/hotel/Reservations";
import Checkins from "@/pages/hotel/Checkins";
import Consumption from "@/pages/hotel/Consumption";
import { Dashboard as HotelDashboardNew } from "@/pages/hotel/Dashboard";
import HotelReports from "@/pages/HotelReports";
import HotelNotifications from "@/pages/HotelNotifications";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import { SectorProvider, useSector } from "@/hooks/useSector.tsx";
import SectorSelection from "@/components/SectorSelection";
import { Toaster } from 'sonner';

function AppContent() {
  const { selectedSector, isLoading } = useSector();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!selectedSector) {
    return <SectorSelection />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/professionals" element={<Professionals />} />
              <Route path="/services" element={<Services />} />
              <Route path="/templates" element={<Templates />} />
        
        {/* Rotas específicas de hotelaria */}
            <Route path="/hotel-dashboard" element={<HotelDashboardNew />} />
            <Route path="/hotel-rooms" element={<Rooms />} />
            <Route path="/hotel-reservations" element={<Reservations />} />
            <Route path="/hotel-checkins" element={<Checkins />} />
            <Route path="/hotel-consumption" element={<Consumption />} />
            <Route path="/hotel-reports" element={<HotelReports />} />
            <Route path="/hotel-notifications" element={<HotelNotifications />} />
            
            {/* Rotas específicas de saúde */}
            <Route path="/health-dashboard" element={<HealthDashboard />} />
               <Route path="/health-patients" element={<HealthPatients />} />
               <Route path="/health-consultations" element={<HealthConsultations />} />
               <Route path="/health-procedures" element={<HealthProcedures />} />
               
               {/* Rotas específicas de beleza */}
              <Route path="/beauty-dashboard" element={<BeautyDashboard />} />
              <Route path="/beauty-clients" element={<BeautyClients />} />
              <Route path="/beauty-appointments" element={<BeautyAppointments />} />
              <Route path="/beauty-services" element={<BeautyServices />} />
        
        {/* Rota principal - redireciona baseado no setor */}
        <Route path="/" element={
              selectedSector.id === 'hospitality' ? <HotelDashboardNew /> :
              selectedSector.id === 'health' ? <HealthDashboard /> :
              selectedSector.id === 'beauty' ? <BeautyDashboard /> :
              <Dashboard />
            } />
            <Route path="/dashboard" element={
              selectedSector.id === 'hospitality' ? <HotelDashboardNew /> :
              selectedSector.id === 'health' ? <HealthDashboard /> :
              <Dashboard />
            } />
        <Route path="/whatsapp" element={<div className="text-center text-xl">WhatsApp - Em Desenvolvimento</div>} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        {/* Rotas legadas para compatibilidade */}
        <Route path="/agenda" element={<Schedule />} />
        <Route path="/clientes" element={<Clients />} />
        <Route path="/profissionais" element={<Professionals />} />
        <Route path="/servicos" element={<Services />} />
        <Route path="/quartos" element={<Rooms />} />
        <Route path="/reservas" element={<Reservations />} />
        <Route path="/checkins" element={<Checkins />} />
              <Route path="/relatorios" element={<Reports />} />
              <Route path="/configuracoes" element={<Settings />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SectorProvider>
        <Router>
          <AppContent />
          <Toaster position="top-right" richColors />
        </Router>
      </SectorProvider>
    </AuthProvider>
  );
}

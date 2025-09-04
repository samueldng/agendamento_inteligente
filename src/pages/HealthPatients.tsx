import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  ChevronRight,
  Activity,
  Stethoscope,
  Heart,
  AlertTriangle
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birth_date?: string;
  address?: string;
  medical_notes?: string;
  allergies?: string;
  medical_history?: string;
  emergency_contact?: string;
  created_at: string;
  updated_at: string;
  total_consultations: number;
  last_consultation?: string;
  next_consultation?: string;
  status: 'active' | 'inactive';
  blood_type?: string;
  insurance?: string;
}

interface Consultation {
  id: string;
  patient_id: string;
  doctor_name: string;
  procedure_name: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  price: number;
}

const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    phone: '(11) 99999-1111',
    birth_date: '1985-03-15',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    medical_notes: 'Paciente com histórico de diabetes tipo 2.',
    allergies: 'Dipirona, Penicilina',
    medical_history: 'Diabetes tipo 2 diagnosticada em 2020',
    emergency_contact: 'João Silva - (11) 88888-1111',
    blood_type: 'O+',
    insurance: 'Unimed',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-15T14:30:00Z',
    total_consultations: 12,
    last_consultation: '2024-01-10T14:00:00Z',
    next_consultation: '2024-01-25T10:00:00Z',
    status: 'active'
  },
  {
    id: '2',
    name: 'Carlos Santos',
    email: 'carlos.santos@email.com',
    phone: '(11) 88888-2222',
    birth_date: '1978-07-22',
    address: 'Av. Paulista, 456 - São Paulo/SP',
    medical_notes: 'Hipertensão arterial controlada com medicação.',
    allergies: 'Nenhuma alergia conhecida',
    medical_history: 'Hipertensão arterial desde 2015',
    emergency_contact: 'Maria Santos - (11) 77777-2222',
    blood_type: 'A+',
    insurance: 'Bradesco Saúde',
    created_at: '2024-01-05T09:00:00Z',
    updated_at: '2024-01-12T16:45:00Z',
    total_consultations: 8,
    last_consultation: '2024-01-08T16:00:00Z',
    status: 'active'
  },
  {
    id: '3',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@email.com',
    phone: '(11) 77777-3333',
    birth_date: '1992-11-08',
    medical_notes: 'Paciente jovem, sem comorbidades.',
    allergies: 'Nenhuma alergia conhecida',
    blood_type: 'B+',
    created_at: '2023-12-20T11:00:00Z',
    updated_at: '2023-12-20T11:00:00Z',
    total_consultations: 3,
    last_consultation: '2023-12-28T09:00:00Z',
    status: 'inactive'
  }
];

const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: '1',
    patient_id: '1',
    doctor_name: 'Dr. João Silva',
    procedure_name: 'Consulta Endocrinológica',
    date: '2024-01-10',
    time: '14:00',
    status: 'completed',
    diagnosis: 'Diabetes tipo 2 controlada',
    prescription: 'Metformina 850mg - 2x ao dia',
    notes: 'Paciente apresentou melhora nos níveis glicêmicos.',
    price: 200.00
  },
  {
    id: '2',
    patient_id: '1',
    doctor_name: 'Dr. João Silva',
    procedure_name: 'Exames Laboratoriais',
    date: '2024-01-05',
    time: '08:00',
    status: 'completed',
    notes: 'Hemoglobina glicada: 6.8%',
    price: 120.00
  },
  {
    id: '3',
    patient_id: '1',
    doctor_name: 'Dr. João Silva',
    procedure_name: 'Consulta de Retorno',
    date: '2024-01-25',
    time: '10:00',
    status: 'scheduled',
    price: 180.00
  },
  {
    id: '4',
    patient_id: '2',
    doctor_name: 'Dra. Maria Santos',
    procedure_name: 'Consulta Cardiológica',
    date: '2024-01-08',
    time: '16:00',
    status: 'completed',
    diagnosis: 'Hipertensão arterial estável',
    prescription: 'Losartana 50mg - 1x ao dia',
    notes: 'Pressão arterial controlada. Manter medicação.',
    price: 220.00
  },
  {
    id: '5',
    patient_id: '3',
    doctor_name: 'Dr. Pedro Costa',
    procedure_name: 'Consulta Clínica Geral',
    date: '2023-12-28',
    time: '09:00',
    status: 'completed',
    diagnosis: 'Exame de rotina normal',
    notes: 'Paciente saudável, sem alterações.',
    price: 150.00
  }
];

export default function HealthPatients() {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [consultations, setConsultations] = useState<Consultation[]>(MOCK_CONSULTATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birth_date: '',
    address: '',
    medical_notes: '',
    allergies: '',
    medical_history: '',
    emergency_contact: '',
    blood_type: '',
    insurance: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getPatientConsultations = (patientId: string) => {
    return consultations.filter(consultation => consultation.patient_id === patientId)
                       .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ativo' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inativo' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Agendada' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Concluída' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' },
      no_show: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Faltou' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string, timeString?: string) => {
    const date = new Date(dateString + (timeString ? ' ' + timeString : ''));
    return date.toLocaleDateString('pt-BR') + (timeString ? ' às ' + timeString : '');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingPatient) {
        // Atualizar paciente existente
        const updatedPatients = patients.map(patient => 
          patient.id === editingPatient.id 
            ? { ...patient, ...formData, updated_at: new Date().toISOString() }
            : patient
        );
        setPatients(updatedPatients);
      } else {
        // Criar novo paciente
        const newPatient: Patient = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          total_consultations: 0
        };
        setPatients([...patients, newPatient]);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      birth_date: patient.birth_date || '',
      address: patient.address || '',
      medical_notes: patient.medical_notes || '',
      allergies: patient.allergies || '',
      medical_history: patient.medical_history || '',
      emergency_contact: patient.emergency_contact || '',
      blood_type: patient.blood_type || '',
      insurance: patient.insurance || '',
      status: patient.status
    });
    setShowPatientModal(true);
  };

  const handleDelete = async (patientId: string) => {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) return;
    
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setPatients(patients.filter(patient => patient.id !== patientId));
    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowProfileModal(true);
  };

  const handleCloseModal = () => {
    setShowPatientModal(false);
    setEditingPatient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      birth_date: '',
      address: '',
      medical_notes: '',
      allergies: '',
      medical_history: '',
      emergency_contact: '',
      blood_type: '',
      insurance: '',
      status: 'active'
    });
    setErrors({});
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setSelectedPatient(null);
  };

  const getTotalRevenue = (patientId: string) => {
    return getPatientConsultations(patientId)
      .filter(consultation => consultation.status === 'completed')
      .reduce((total, consultation) => total + consultation.price, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prontuários de Pacientes</h1>
            <p className="text-gray-600 mt-1">Gerencie informações médicas e histórico dos pacientes</p>
          </div>
          <button
            onClick={() => setShowPatientModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Paciente
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar pacientes por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-full"
            />
          </div>

          {/* Filtro por status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
              <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pacientes Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {patients.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Stethoscope className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Consultas Realizadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {consultations.filter(c => c.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Com Alergias</p>
              <p className="text-2xl font-bold text-gray-900">
                {patients.filter(p => p.allergies && p.allergies !== 'Nenhuma alergia conhecida').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Pacientes */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Pacientes Cadastrados</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Informações Médicas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consultas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => {
                const patientConsultations = getPatientConsultations(patient.id);
                const lastConsultation = patientConsultations[0];
                const nextConsultation = patientConsultations.find(c => c.status === 'scheduled');
                
                return (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">
                            {patient.birth_date && `${calculateAge(patient.birth_date)} anos`}
                            {patient.blood_type && ` • Tipo ${patient.blood_type}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            <Mail className="inline w-3 h-3 mr-1" />
                            {patient.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            <Phone className="inline w-3 h-3 mr-1" />
                            {patient.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {patient.allergies && patient.allergies !== 'Nenhuma alergia conhecida' && (
                          <div className="flex items-center text-red-600 mb-1">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            <span className="text-xs font-medium">Alergias: {patient.allergies}</span>
                          </div>
                        )}
                        {patient.medical_history && (
                          <div className="text-xs text-gray-600 mb-1">
                            📋 {patient.medical_history}
                          </div>
                        )}
                        {patient.insurance && (
                          <div className="text-xs text-gray-600">
                            🏥 {patient.insurance}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <Stethoscope className="w-3 h-3 mr-1 text-gray-400" />
                          <span className="font-medium">{patient.total_consultations}</span>
                          <span className="text-gray-500 ml-1">consultas</span>
                        </div>
                        {lastConsultation && (
                          <div className="text-xs text-gray-500">
                            Última: {formatDate(lastConsultation.date)}
                          </div>
                        )}
                        {nextConsultation && (
                          <div className="text-xs text-blue-600">
                            Próxima: {formatDate(nextConsultation.date)}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(patient.status)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewProfile(patient)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver prontuário"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(patient)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar paciente"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir paciente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum paciente encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece cadastrando seu primeiro paciente.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edição de Paciente */}
      {showPatientModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nome completo do paciente"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="email@exemplo.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo Sanguíneo
                  </label>
                  <select
                    value={formData.blood_type}
                    onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Convênio
                  </label>
                  <input
                    type="text"
                    value={formData.insurance}
                    onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Nome do convênio"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Endereço completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contato de Emergência
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Nome e telefone do contato de emergência"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alergias
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Alergias conhecidas ou 'Nenhuma alergia conhecida'"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Histórico Médico
                </label>
                <textarea
                  value={formData.medical_history}
                  onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Histórico médico relevante, doenças crônicas, cirurgias anteriores..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações Médicas
                </label>
                <textarea
                  value={formData.medical_notes}
                  onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Observações importantes sobre o paciente..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editingPatient ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Perfil do Paciente */}
      {showProfileModal && selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-gray-900">
                Prontuário - {selectedPatient.name}
              </h3>
              <button
                onClick={handleCloseProfileModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Informações do Paciente */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Informações Pessoais</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Nome:</span> {selectedPatient.name}
                    </div>
                    {selectedPatient.birth_date && (
                      <div>
                        <span className="font-medium">Idade:</span> {calculateAge(selectedPatient.birth_date)} anos
                      </div>
                    )}
                    {selectedPatient.blood_type && (
                      <div>
                        <span className="font-medium">Tipo Sanguíneo:</span> {selectedPatient.blood_type}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Email:</span> {selectedPatient.email}
                    </div>
                    <div>
                      <span className="font-medium">Telefone:</span> {selectedPatient.phone}
                    </div>
                    {selectedPatient.address && (
                      <div>
                        <span className="font-medium">Endereço:</span> {selectedPatient.address}
                      </div>
                    )}
                    {selectedPatient.insurance && (
                      <div>
                        <span className="font-medium">Convênio:</span> {selectedPatient.insurance}
                      </div>
                    )}
                    {selectedPatient.emergency_contact && (
                      <div>
                        <span className="font-medium">Emergência:</span> {selectedPatient.emergency_contact}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Informações Médicas */}
                <div className="bg-red-50 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                    Informações Médicas
                  </h4>
                  <div className="space-y-2 text-sm">
                    {selectedPatient.allergies && (
                      <div>
                        <span className="font-medium text-red-700">Alergias:</span>
                        <p className="text-red-600">{selectedPatient.allergies}</p>
                      </div>
                    )}
                    {selectedPatient.medical_history && (
                      <div>
                        <span className="font-medium">Histórico:</span>
                        <p className="text-gray-600">{selectedPatient.medical_history}</p>
                      </div>
                    )}
                    {selectedPatient.medical_notes && (
                      <div>
                        <span className="font-medium">Observações:</span>
                        <p className="text-gray-600">{selectedPatient.medical_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Histórico de Consultas */}
              <div className="lg:col-span-2">
                <h4 className="font-medium text-gray-900 mb-3">Histórico de Consultas</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {getPatientConsultations(selectedPatient.id).map((consultation) => (
                    <div key={consultation.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium text-gray-900">{consultation.procedure_name}</h5>
                          <p className="text-sm text-gray-600">Dr(a). {consultation.doctor_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatDateTime(consultation.date, consultation.time)}
                          </p>
                          {getStatusBadge(consultation.status)}
                        </div>
                      </div>
                      
                      {consultation.diagnosis && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Diagnóstico:</span>
                          <p className="text-sm text-gray-600">{consultation.diagnosis}</p>
                        </div>
                      )}
                      
                      {consultation.prescription && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Prescrição:</span>
                          <p className="text-sm text-gray-600">{consultation.prescription}</p>
                        </div>
                      )}
                      
                      {consultation.notes && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Observações:</span>
                          <p className="text-sm text-gray-600">{consultation.notes}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-gray-500">Valor: R$ {consultation.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  
                  {getPatientConsultations(selectedPatient.id).length === 0 && (
                    <div className="text-center py-8">
                      <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-gray-500 mt-2">Nenhuma consulta registrada</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
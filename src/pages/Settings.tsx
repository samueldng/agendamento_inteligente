import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Clock,
  Phone,
  Mail,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';

interface SystemSettings {
  // Configurações gerais
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  timezone: string;
  language: string;
  currency: string;
  
  // Configurações de agendamento
  defaultAppointmentDuration: number;
  advanceBookingDays: number;
  cancellationHours: number;
  autoConfirmAppointments: boolean;
  allowOnlineBooking: boolean;
  requireClientConfirmation: boolean;
  
  // Configurações de notificação
  emailNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  reminderHours: number;
  confirmationRequired: boolean;
  
  // Configurações de segurança
  sessionTimeout: number;
  requireStrongPassword: boolean;
  twoFactorAuth: boolean;
  loginAttempts: number;
  
  // Configurações de aparência
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  compactMode: boolean;
  showAvatars: boolean;
}

const DEFAULT_SETTINGS: SystemSettings = {
  companyName: 'Clínica Exemplo',
  companyEmail: 'contato@clinica.com',
  companyPhone: '(11) 99999-9999',
  timezone: 'America/Sao_Paulo',
  language: 'pt-BR',
  currency: 'BRL',
  
  defaultAppointmentDuration: 30,
  advanceBookingDays: 30,
  cancellationHours: 24,
  autoConfirmAppointments: false,
  allowOnlineBooking: true,
  requireClientConfirmation: true,
  
  emailNotifications: true,
  smsNotifications: false,
  whatsappNotifications: true,
  reminderHours: 24,
  confirmationRequired: true,
  
  sessionTimeout: 60,
  requireStrongPassword: true,
  twoFactorAuth: false,
  loginAttempts: 3,
  
  theme: 'light',
  primaryColor: '#3B82F6',
  compactMode: false,
  showAvatars: true
};

const TIMEZONE_OPTIONS = [
  { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
  { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco (GMT-5)' }
];

const LANGUAGE_OPTIONS = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español' }
];

const COLOR_OPTIONS = [
  { value: '#3B82F6', label: 'Azul', color: 'bg-blue-500' },
  { value: '#10B981', label: 'Verde', color: 'bg-green-500' },
  { value: '#F59E0B', label: 'Amarelo', color: 'bg-yellow-500' },
  { value: '#EF4444', label: 'Vermelho', color: 'bg-red-500' },
  { value: '#8B5CF6', label: 'Roxo', color: 'bg-purple-500' },
  { value: '#06B6D4', label: 'Ciano', color: 'bg-cyan-500' }
];

export default function Settings() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    twilio: '',
    supabase: ''
  });

  useEffect(() => {
    // Carregar configurações salvas
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Salvar no localStorage
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: SettingsIcon },
    { id: 'appointments', label: 'Agendamentos', icon: Clock },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'integrations', label: 'Integrações', icon: Globe }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
            <p className="text-gray-600 mt-1">Gerencie as configurações e preferências do sistema</p>
          </div>
          <div className="flex items-center space-x-3">
            {saved && (
              <div className="flex items-center text-green-600 text-sm">
                <Check className="w-4 h-4 mr-1" />
                Configurações salvas
              </div>
            )}
            <button
              onClick={handleReset}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Restaurar Padrão
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar com abas */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Conteúdo das configurações */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow rounded-lg p-6">
            {/* Configurações Gerais */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informações da Empresa</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome da Empresa
                      </label>
                      <input
                        type="text"
                        value={settings.companyName}
                        onChange={(e) => updateSetting('companyName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email da Empresa
                      </label>
                      <input
                        type="email"
                        value={settings.companyEmail}
                        onChange={(e) => updateSetting('companyEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone da Empresa
                      </label>
                      <input
                        type="tel"
                        value={settings.companyPhone}
                        onChange={(e) => updateSetting('companyPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações Regionais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fuso Horário
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => updateSetting('timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        {TIMEZONE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Idioma
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => updateSetting('language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        {LANGUAGE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Moeda
                      </label>
                      <select
                        value={settings.currency}
                        onChange={(e) => updateSetting('currency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="BRL">Real Brasileiro (R$)</option>
                        <option value="USD">Dólar Americano ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Configurações de Agendamento */}
            {activeTab === 'appointments' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de Agendamento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duração padrão (minutos)
                      </label>
                      <input
                        type="number"
                        min="15"
                        max="240"
                        step="15"
                        value={settings.defaultAppointmentDuration}
                        onChange={(e) => updateSetting('defaultAppointmentDuration', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Antecedência máxima (dias)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={settings.advanceBookingDays}
                        onChange={(e) => updateSetting('advanceBookingDays', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cancelamento mínimo (horas)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="72"
                        value={settings.cancellationHours}
                        onChange={(e) => updateSetting('cancellationHours', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Opções de Agendamento</h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.autoConfirmAppointments}
                        onChange={(e) => updateSetting('autoConfirmAppointments', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Confirmar agendamentos automaticamente
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.allowOnlineBooking}
                        onChange={(e) => updateSetting('allowOnlineBooking', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Permitir agendamento online
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.requireClientConfirmation}
                        onChange={(e) => updateSetting('requireClientConfirmation', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Exigir confirmação do cliente
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Configurações de Notificação */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Canais de Notificação</h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Mail className="w-4 h-4 ml-2 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Notificações por email
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.smsNotifications}
                        onChange={(e) => updateSetting('smsNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Phone className="w-4 h-4 ml-2 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Notificações por SMS
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.whatsappNotifications}
                        onChange={(e) => updateSetting('whatsappNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Phone className="w-4 h-4 ml-2 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Notificações por WhatsApp
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de Lembrete</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lembrete antecipado (horas)
                      </label>
                      <select
                        value={settings.reminderHours}
                        onChange={(e) => updateSetting('reminderHours', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value={1}>1 hora antes</option>
                        <option value={2}>2 horas antes</option>
                        <option value={4}>4 horas antes</option>
                        <option value={24}>24 horas antes</option>
                        <option value={48}>48 horas antes</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.confirmationRequired}
                        onChange={(e) => updateSetting('confirmationRequired', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Exigir confirmação de recebimento
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Configurações de Segurança */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de Sessão</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timeout da sessão (minutos)
                      </label>
                      <select
                        value={settings.sessionTimeout}
                        onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value={15}>15 minutos</option>
                        <option value={30}>30 minutos</option>
                        <option value={60}>1 hora</option>
                        <option value={120}>2 horas</option>
                        <option value={480}>8 horas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tentativas de login
                      </label>
                      <select
                        value={settings.loginAttempts}
                        onChange={(e) => updateSetting('loginAttempts', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value={3}>3 tentativas</option>
                        <option value={5}>5 tentativas</option>
                        <option value={10}>10 tentativas</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Políticas de Senha</h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.requireStrongPassword}
                        onChange={(e) => updateSetting('requireStrongPassword', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Exigir senhas fortes (8+ caracteres, maiúsculas, números)
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorAuth}
                        onChange={(e) => updateSetting('twoFactorAuth', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Autenticação de dois fatores (2FA)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                    <h4 className="text-sm font-medium text-yellow-800">Aviso de Segurança</h4>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Recomendamos manter a autenticação de dois fatores ativada e usar senhas fortes para maior segurança.
                  </p>
                </div>
              </div>
            )}

            {/* Configurações de Aparência */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tema</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {['light', 'dark', 'auto'].map((theme) => (
                      <label key={theme} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="theme"
                          value={theme}
                          checked={settings.theme === theme}
                          onChange={(e) => updateSetting('theme', e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                          {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Automático'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cor Principal</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {COLOR_OPTIONS.map((color) => (
                      <label key={color.value} className="flex flex-col items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="primaryColor"
                          value={color.value}
                          checked={settings.primaryColor === color.value}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-8 h-8 rounded-full ${color.color} ${settings.primaryColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`} />
                        <span className="text-xs text-gray-600 mt-1">{color.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Opções de Interface</h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.compactMode}
                        onChange={(e) => updateSetting('compactMode', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Modo compacto (menos espaçamento)
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.showAvatars}
                        onChange={(e) => updateSetting('showAvatars', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Mostrar avatars dos usuários
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Configurações de Integrações */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Chaves de API</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Google Gemini API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKeys ? 'text' : 'password'}
                          value={apiKeys.gemini}
                          onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm"
                          placeholder="Insira sua chave da API Gemini"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKeys(!showApiKeys)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showApiKeys ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Twilio API Key
                      </label>
                      <input
                        type={showApiKeys ? 'text' : 'password'}
                        value={apiKeys.twilio}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, twilio: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Insira sua chave da API Twilio"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Supabase API Key
                      </label>
                      <input
                        type={showApiKeys ? 'text' : 'password'}
                        value={apiKeys.supabase}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, supabase: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Insira sua chave da API Supabase"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Info className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="text-sm font-medium text-blue-800">Informação</h4>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    As chaves de API são armazenadas de forma segura e criptografada. Nunca compartilhe suas chaves com terceiros.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Status das Integrações</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                        <span className="text-sm font-medium text-gray-900">Google Gemini AI</span>
                      </div>
                      <span className="text-sm text-green-600">Conectado</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3" />
                        <span className="text-sm font-medium text-gray-900">Twilio WhatsApp</span>
                      </div>
                      <span className="text-sm text-yellow-600">Configuração pendente</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                        <span className="text-sm font-medium text-gray-900">Supabase Database</span>
                      </div>
                      <span className="text-sm text-green-600">Conectado</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
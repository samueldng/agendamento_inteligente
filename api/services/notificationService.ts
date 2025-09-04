import { supabaseAdmin } from '../config/supabase';
import { generateAutomaticReminders } from '../hotel/notifications';

class NotificationService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Iniciar o serviço de notificações automáticas
  start() {
    if (this.isRunning) {
      console.log('Serviço de notificações já está em execução');
      return;
    }

    console.log('Iniciando serviço de notificações automáticas...');
    this.isRunning = true;

    // Executar imediatamente
    this.processNotifications();

    // Executar a cada 30 minutos
    this.intervalId = setInterval(() => {
      this.processNotifications();
    }, 30 * 60 * 1000); // 30 minutos
  }

  // Parar o serviço
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Serviço de notificações parado');
  }

  // Processar notificações automáticas
  private async processNotifications() {
    try {
      console.log('Processando notificações automáticas...');
      
      // Gerar lembretes automáticos
      await generateAutomaticReminders();
      
      // Limpar notificações antigas (mais de 30 dias)
      await this.cleanOldNotifications();
      
      console.log('Notificações processadas com sucesso');
    } catch (error) {
      console.error('Erro ao processar notificações:', error);
    }
  }

  // Limpar notificações antigas
  private async cleanOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { error } = await supabaseAdmin
        .from('hotel_notifications')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())
        .eq('read', true);

      if (error) {
        console.error('Erro ao limpar notificações antigas:', error);
      } else {
        console.log('Notificações antigas limpas com sucesso');
      }
    } catch (error) {
      console.error('Erro ao limpar notificações antigas:', error);
    }
  }

  // Verificar se o serviço está rodando
  isServiceRunning(): boolean {
    return this.isRunning;
  }

  // Forçar processamento manual
  async forceProcess() {
    await this.processNotifications();
  }
}

// Instância singleton do serviço
export const notificationService = new NotificationService();

// Função para inicializar o serviço
export const initializeNotificationService = () => {
  notificationService.start();
};

// Função para parar o serviço
export const stopNotificationService = () => {
  notificationService.stop();
};

export default notificationService;
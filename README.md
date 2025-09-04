# Sistema de Hotelaria Inteligente

Um sistema completo de gestão hoteleira desenvolvido com React, TypeScript, Vite e Supabase.

## 🚀 Funcionalidades

- **Autenticação**: Sistema completo de login/registro com Supabase Auth
- **Dashboard**: Visão geral com métricas e estatísticas em tempo real
- **Gestão de Quartos**: CRUD completo para quartos com status e disponibilidade
- **Sistema de Reservas**: Criação, edição e cancelamento de reservas
- **Check-in/Check-out**: Processo completo com validações
- **Sistema de Consumo**: Controle de minibar e room service
- **Notificações**: Sistema de alertas e notificações
- **Validações**: Formulários validados com Zod
- **Interface Responsiva**: Design moderno com Tailwind CSS

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database, Auth, Real-time)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd Agendamento_Inteligente
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Configure o Supabase:
- Crie um projeto no [Supabase](https://supabase.com)
- Atualize as variáveis no arquivo `.env`
- Execute as migrações do banco de dados

5. Execute o projeto:
```bash
npm run dev
```

## 🔐 Usuário Administrador

**Email**: admin@hotel.com  
**Senha**: admin123

> Este usuário foi criado automaticamente e possui acesso completo ao sistema.

## 🚀 Deploy no Vercel

1. Instale a CLI do Vercel:
```bash
npm i -g vercel
```

2. Faça login no Vercel:
```bash
vercel login
```

3. Execute o deploy:
```bash
vercel --prod
```

4. Configure as variáveis de ambiente no painel do Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_NAME`
- `VITE_APP_VERSION`

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de interface
│   └── forms/          # Componentes de formulário
├── pages/              # Páginas da aplicação
│   ├── auth/           # Páginas de autenticação
│   └── hotel/          # Páginas do sistema hoteleiro
├── hooks/              # Custom hooks
├── lib/                # Configurações e utilitários
├── types/              # Definições de tipos TypeScript
└── utils/              # Funções utilitárias
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run check` - Verifica tipos TypeScript
- `npm run lint` - Executa o linter

## 📝 Licença

Este projeto está sob a licença MIT.
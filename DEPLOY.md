# 🚀 Deploy do Sistema Hoteleiro no Vercel

## Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Conta no [Supabase](https://supabase.com) com projeto configurado
3. Node.js instalado localmente

## 📋 Passos para Deploy

### 1. Preparação Local

```bash
# Clone o repositório (se necessário)
git clone <seu-repositorio>
cd Agendamento_Inteligente

# Instale as dependências
npm install

# Teste o build local
npm run build
```

### 2. Configuração do Vercel

#### Opção A: Deploy via CLI

```bash
# Instale o Vercel CLI
npm i -g vercel

# Faça login no Vercel
vercel login

# Deploy do projeto
vercel
```

#### Opção B: Deploy via Dashboard

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte seu repositório GitHub/GitLab
4. Configure as seguintes opções:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Configuração das Variáveis de Ambiente

No dashboard do Vercel, vá em **Settings > Environment Variables** e adicione:

```
VITE_SUPABASE_URL=https://nxvzrqewfgbcwsovaaiv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54dnpycWV3ZmdiY3dzb3ZhYWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MDkzNzksImV4cCI6MjA3MTM4NTM3OX0.A5nhavahrp5W_4tUGkcdpcCFGKWPv7Y6f8ZaOsQsr8Q
```

### 4. Configurações Adicionais

O arquivo `vercel.json` já está configurado com:
- Redirecionamento para SPA (Single Page Application)
- Headers de segurança
- Configurações de build otimizadas

### 5. Verificação do Deploy

Após o deploy:

1. ✅ Acesse a URL fornecida pelo Vercel
2. ✅ Teste o login/registro
3. ✅ Verifique se todas as páginas carregam corretamente
4. ✅ Teste as funcionalidades principais:
   - Dashboard
   - Gestão de quartos
   - Sistema de reservas
   - Check-in/Check-out
   - Sistema de consumo

## 🔧 Solução de Problemas

### Erro de Build
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Erro de Variáveis de Ambiente
- Certifique-se de que todas as variáveis começam com `VITE_`
- Verifique se as chaves do Supabase estão corretas
- Redeploy após adicionar/modificar variáveis

### Erro de Roteamento
- O arquivo `vercel.json` já está configurado para SPAs
- Se houver problemas, verifique se o arquivo está na raiz do projeto

## 📱 Funcionalidades Implementadas

✅ **Sistema de Autenticação**
- Login/Registro com Supabase Auth
- Proteção de rotas
- Logout seguro

✅ **Gestão de Quartos**
- CRUD completo
- Validação com Zod
- Interface responsiva

✅ **Sistema de Reservas**
- Criação e edição de reservas
- Cálculo automático de valores
- Integração com quartos disponíveis

✅ **Check-in/Check-out**
- Processo completo de hospedagem
- Validações de datas
- Atualizações de status

✅ **Sistema de Consumo**
- Minibar e room service
- Cálculos automáticos
- Histórico de consumo

✅ **Dashboard**
- Estatísticas em tempo real
- Gráficos e métricas
- Dados do banco de dados

✅ **Validações**
- Formulários com Zod
- Tratamento de erros
- Feedback visual

## 🌐 URLs Importantes

- **Aplicação**: Será fornecida após o deploy
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs no dashboard do Vercel
2. Confirme as configurações do Supabase
3. Teste localmente antes de fazer redeploy

---

**Sistema desenvolvido com React + TypeScript + Vite + Supabase + Tailwind CSS**
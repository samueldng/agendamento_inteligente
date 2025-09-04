# 🚀 Instruções de Deploy Manual no Vercel

Devido ao limite de rate da API do Vercel, siga estas instruções para fazer o deploy manual:

## 📋 Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. CLI do Vercel instalada globalmente

## 🔧 Passos para Deploy

### 1. Instalar CLI do Vercel
```bash
npm install -g vercel
```

### 2. Fazer Login
```bash
vercel login
```

### 3. Executar Deploy
```bash
vercel --prod
```

### 4. Configurar Variáveis de Ambiente

No painel do Vercel, adicione as seguintes variáveis:

```
VITE_SUPABASE_URL=https://nxvzrqewfgbcwsovaaiv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54dnpycWV3ZmdiY3dzb3ZhYWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MDkzNzksImV4cCI6MjA3MTM4NTM3OX0.A5nhavahrp5W_4tUGkcdpcCFGKWPv7Y6f8ZaOsQsr8Q
VITE_APP_NAME=Sistema Hoteleiro
VITE_APP_VERSION=1.0.0
VITE_DEV_MODE=false
NODE_ENV=production
```

### 5. Verificar Deploy

Após o deploy, acesse a URL fornecida pelo Vercel e teste:

- **Login com usuário admin**:
  - Email: `admin@hotel.com`
  - Senha: `admin123`

## ✅ Verificações Pós-Deploy

- [ ] Site carrega corretamente
- [ ] Login funciona
- [ ] Dashboard exibe dados
- [ ] Navegação entre páginas funciona
- [ ] Formulários funcionam
- [ ] Dados são salvos no Supabase

## 🔧 Troubleshooting

### Erro de CORS
Se houver erro de CORS, adicione o domínio do Vercel nas configurações do Supabase:
1. Acesse o painel do Supabase
2. Vá em Settings > API
3. Adicione a URL do Vercel em "Site URL"

### Erro de Autenticação
Verifique se as variáveis de ambiente estão corretas no painel do Vercel.

## 📞 Suporte

Se encontrar problemas, verifique:
1. Logs do Vercel
2. Console do navegador
3. Configurações do Supabase

---

**✨ Sistema pronto para produção!**
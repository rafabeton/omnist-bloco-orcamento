# Omnist Bloco de Orçamento - Cloud

Sistema completo de gestão de orçamentos e compras para obras, desenvolvido com Next.js 14, Supabase e Vercel.

## 🚀 Funcionalidades

- ✅ **Gestão de Projetos** - Criação e gestão de projetos de obra
- ✅ **Controlo de Orçamento** - Categorias de orçamento com alertas automáticos
- ✅ **Sistema de Compras** - Criação, aprovação e gestão de compras
- ✅ **Aprovações Automáticas** - Regras configuráveis de aprovação
- ✅ **Notificações por Email** - Alertas automáticos via Resend
- ✅ **Upload de Recibos** - Armazenamento seguro de documentos
- ✅ **Dashboard em Tempo Real** - Visão geral financeira atualizada
- ✅ **PWA** - Funciona offline e pode ser instalada como app

## 🛠️ Tecnologias

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Edge Functions + Auth + Storage)
- **Deploy:** Vercel
- **Email:** Resend
- **UI:** Radix UI + Shadcn/ui

## 📋 Pré-requisitos

1. **Conta Supabase** - [supabase.com](https://supabase.com)
2. **Conta Vercel** - [vercel.com](https://vercel.com)
3. **Conta Resend** - [resend.com](https://resend.com) (opcional, para emails)
4. **Node.js 18+** - Para desenvolvimento local

## 🚀 Deploy Rápido

### 1. Configurar Supabase

1. Crie um novo projeto no Supabase
2. Vá para **SQL Editor** e execute o script `supabase-schema.sql`
3. Configure **Storage** criando um bucket chamado `receipts` (público)
4. Anote as credenciais:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 2. Deploy no Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/omnist-bloco-orcamento)

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   RESEND_API_KEY=your_resend_api_key (opcional)
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
3. Deploy automático!

### 3. Configurar Edge Functions (Opcional)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Deploy das Edge Functions
supabase functions deploy auto-approval
supabase functions deploy budget-alerts
supabase functions deploy email-notifications
```

## 💻 Desenvolvimento Local

```bash
# Clonar repositório
git clone https://github.com/your-repo/omnist-bloco-orcamento
cd omnist-bloco-orcamento

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais

# Executar em desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📊 Estrutura do Projeto

```
omnist-bloco-orcamento/
├── src/
│   ├── app/                 # App Router (Next.js 14)
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── login/          # Página de login
│   │   └── layout.tsx      # Layout global
│   ├── components/         # Componentes React
│   │   ├── ui/             # Componentes base (shadcn/ui)
│   │   ├── purchases/      # Componentes de compras
│   │   └── budget/         # Componentes de orçamento
│   └── lib/                # Utilitários e configurações
│       ├── supabase/       # Clientes Supabase
│       ├── utils.ts        # Funções utilitárias
│       └── database.types.ts # Tipos TypeScript
├── supabase/
│   ├── functions/          # Edge Functions
│   └── config.toml         # Configuração Supabase
├── supabase-schema.sql     # Schema da base de dados
└── middleware.ts           # Middleware de autenticação
```

## 🔐 Segurança

- **Row Level Security (RLS)** ativado em todas as tabelas
- **Autenticação JWT** via Supabase Auth
- **Middleware de proteção** de rotas
- **Validação de dados** com Zod
- **Sanitização** de inputs

## 📱 PWA

A aplicação é uma Progressive Web App (PWA) que pode ser instalada em dispositivos móveis e funciona offline.

## 🎯 Funcionalidades Principais

### Gestão de Compras
- Criação de compras com upload de recibos
- Sistema de aprovações configurável
- Aprovações automáticas baseadas em regras
- Histórico completo de aprovações

### Controlo de Orçamento
- Categorias de orçamento personalizáveis
- Alertas automáticos por threshold
- Dashboard em tempo real
- Relatórios de gastos

### Notificações
- Emails automáticos via Resend
- Alertas de orçamento excedido
- Notificações de aprovações
- Templates personalizáveis

## 🔧 Configurações Avançadas

### Regras de Aprovação
Configure regras automáticas de aprovação por projeto:
- Valor mínimo/máximo
- Aprovadores obrigatórios
- Aprovação sequencial
- Auto-aprovação abaixo de threshold

### Alertas de Orçamento
Configure alertas por categoria:
- Threshold de alerta (%)
- Notificações automáticas
- Escalação para gestores

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Email: suporte@omnist.app
- Documentação: [docs.omnist.app](https://docs.omnist.app)

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ pela equipa Omnist**


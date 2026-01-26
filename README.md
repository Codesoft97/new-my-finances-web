# Minhas Finanças - Frontend TypeScript

Aplicação web para controle financeiro desenvolvida com Next.js e TypeScript.

## 🚀 Tecnologias

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Axios
- React Hook Form
- Lucide React (ícones)

## 📋 Pré-requisitos

- Node.js 18+
- NPM ou Yarn
- Backend rodando

## 🔧 Instalação

```bash
cd frontend
npm install
```

## ⚙️ Configuração

Crie o arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📦 Dependências

```bash
npm install axios react-hook-form lucide-react
npm install -D typescript @types/react @types/node
```

## ▶️ Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📁 Estrutura

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── categories/
│   │   │   └── transactions/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── modals/
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── validation.ts
├── .env.local
├── tsconfig.json
└── package.json
```

## 🎨 Funcionalidades

- ✅ Autenticação (Login/Registro)
- ✅ Menu lateral expansível
- ✅ Gerenciamento de categorias
- ✅ Controle de transações (receitas/despesas)
- ✅ Filtro por mês/ano
- ✅ Resumo financeiro
- ✅ Proteção de rotas

## 🌐 Hospedagem

**Vercel** (recomendado para Next.js) - Deploy gratuito e automático
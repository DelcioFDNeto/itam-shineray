# Shineray IT Asset Manager (ITAM)

Sistema corporativo para gestão de ativos de TI, licenças de software e auditoria de inventário.

## 🚀 Tecnologias
- **Frontend:** React + Vite
- **Estilo:** Tailwind CSS
- **Backend/Auth:** Firebase (Firestore, Auth)
- **Deploy:** Vercel

## ⚙️ Funcionalidades
- Dashboard Gerencial (KPIs)
- Gestão de Ativos (CRUD + Histórico)
- Controle de Licenças de Software
- Gestão de Projetos e Tarefas
- Auditoria Mobile via QR Code
- Impressão de Etiquetas e Termos

## 📦 Como rodar localmente

1. Clone o projeto:
\`\`\`bash
git clone https://github.com/SEU_USUARIO/itam-shineray.git
\`\`\`

2. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz com as chaves do Firebase:
\`\`\`env
VITE_API_KEY=sua_chave_aqui
VITE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
...
\`\`\`

4. Rode o servidor:
\`\`\`bash
npm run dev
\`\`\`
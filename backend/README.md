# Aladin API — Backend

API REST da plataforma **Aladin**, feita para conectar profissionais de TI a vagas em órgãos públicos e empresas do ecossistema tech do Estado de Alagoas.

Stack: **Node.js + Express + Prisma + PostgreSQL**, autenticação com **bcrypt** e sessão em **cookie**.

---

##  Entidades

| Entidade  | Descrição                                                                 | Relacionamento                              |
|-----------|----------------------------------------------------------------------------|----------------------------------------------|
| `Usuario` | Conta usada para login (representante da empresa/órgão que anuncia vagas) | 1 Usuario → 1 Empresa                        |
| `Empresa` | Empresa/órgão público que publica vagas                                   | 1 Empresa → N Vagas                          |
| `Vaga`    | Vaga de TI publicada por uma empresa (fluxo principal da aplicação)       | N Vagas → 1 Empresa                          |

```
Usuario (1) ── (1) Empresa (1) ── (N) Vaga
```

---

##  Endpoints principais

### Autenticação (`/api/auth`)

| Método | Rota             | Acesso   | Descrição                                    |
|--------|------------------|----------|-----------------------------------------------|
| POST   | `/api/auth/registro` | Público  | Cria um usuário (senha com hash bcrypt) e já inicia a sessão |
| POST   | `/api/auth/login`    | Público  | Autentica e cria a sessão (cookie `aladin.sid`) |
| POST   | `/api/auth/logout`   | Público  | Encerra a sessão                              |
| GET    | `/api/auth/me`       |  Privado | Retorna os dados do usuário logado            |

### Empresas (`/api/empresas`)

| Método | Rota                | Acesso     | Descrição                                  |
|--------|---------------------|------------|----------------------------------------------|
| GET    | `/api/empresas`      | Público    | Lista todas as empresas                      |
| GET    | `/api/empresas/:id`  | Público    | Detalhe de uma empresa + suas vagas          |
| POST   | `/api/empresas`      | Privado | Cria a empresa do usuário logado (1 por usuário) |
| PUT    | `/api/empresas/:id`  | Privado | Edita a empresa (somente o dono)             |
| DELETE | `/api/empresas/:id`  | Privado | Remove a empresa (somente o dono)            |

### Vagas (`/api/vagas`) — fluxo principal

| Método | Rota             | Acesso     | Descrição                                                  |
|--------|------------------|------------|-------------------------------------------------------------|
| GET    | `/api/vagas`      | Público    | Lista vagas abertas. Filtros via query string: `area`, `cidade`, `modalidade`, `busca`, `page`, `limit` |
| GET    | `/api/vagas/:id`  | Público    | Detalhe de uma vaga + dados da empresa                      |
| POST   | `/api/vagas`      | Privado | Cria uma vaga vinculada à empresa do usuário logado          |
| PUT    | `/api/vagas/:id`  | Privado | Edita a vaga (somente a empresa dona)                        |
| DELETE | `/api/vagas/:id`  | Privado | Remove a vaga (somente a empresa dona)                       |

Exemplo de busca: `GET /api/vagas?area=backend&cidade=Maceió&modalidade=REMOTO&busca=Node&page=1&limit=10`

> Rotas privadas exigem estar logado (cookie de sessão enviado automaticamente pelo navegador após `/login`). Ao testar em ferramentas como Insomnia/Postman, habilite "enviar cookies" / use a mesma aba de requisições para manter a sessão.

---

## ⚙️ Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores:

| Variável         | Descrição                                                        |
|------------------|---------------------------------------------------------------------|
| `DATABASE_URL`   | String de conexão do PostgreSQL usada pelo Prisma                    |
| `PORT`           | Porta em que a API vai rodar (padrão `3333`)                        |
| `NODE_ENV`       | `development` ou `production`                                       |
| `SESSION_SECRET` | Segredo usado para assinar o cookie de sessão                       |
| `CORS_ORIGIN`    | Origem do front-end liberada no CORS (padrão do Vite: `http://localhost:5173`) |

---

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL rodando localmente (ou em Docker)

### Passo a passo

```bash
# 1. Entre na pasta do backend
cd backend

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# edite o .env e ajuste DATABASE_URL com usuário/senha/banco do seu PostgreSQL

# 4. Rode as migrations (cria as tabelas no banco)
npx prisma migrate dev --name init

# 5. (opcional) Popule o banco com dados de exemplo
npm run prisma:seed

# 6. Suba a API em modo desenvolvimento
npm run dev
```

A API vai subir em `http://localhost:3333`.

### Testando rapidamente com curl

```bash
# Cadastro
curl -i -c cookies.txt -X POST http://localhost:3333/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"nome":"Minha Empresa","email":"teste@empresa.com","senha":"123456"}'

# Criar empresa (rota privada, usa o cookie salvo acima)
curl -i -b cookies.txt -X POST http://localhost:3333/api/empresas \
  -H "Content-Type: application/json" \
  -d '{"nome":"SEFAZ - AL","cidade":"Maceió"}'

# Criar vaga (rota privada)
curl -i -b cookies.txt -X POST http://localhost:3333/api/vagas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Dev Backend","descricao":"Vaga de teste","area":"backend","cidade":"Maceió","modalidade":"REMOTO","tecnologias":"Node.js"}'

# Listar vagas (pública)
curl http://localhost:3333/api/vagas
```

Se rodar o seed, já existe um usuário de teste:
- **email:** `contato@sefaz.al.gov.br`
- **senha:** `123456`

---

## 🗃️ Estrutura de pastas

```
backend/
├── prisma/
│   ├── schema.prisma      # modelagem das entidades e relacionamentos
│   └── seed.js            # dados de exemplo
├── src/
│   ├── config/
│   │   └── prisma.js      # instância única do Prisma Client
│   ├── controllers/       # regras de negócio de cada entidade
│   ├── middlewares/
│   │   ├── auth.js         # protege rotas privadas (sessão em cookie)
│   │   └── errorHandler.js # tratamento central de erros
│   ├── routes/            # definição dos endpoints
│   ├── app.js              # configuração do Express (CORS, sessão, rotas)
│   └── server.js           # ponto de entrada, sobe o servidor
├── .env.example
└── package.json
```

## 🛠️ Tecnologias

- Express
- Prisma ORM + PostgreSQL
- bcryptjs (hash de senha)
- express-session (sessão em cookie)
- cors, dotenv

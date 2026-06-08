# VibeAI - Sistema Inteligente de Recomendação Musical

> Aplicativo mobile de recomendação musical guiado por Inteligência Artificial | Projeto Integrador - 5º semestre Fatec

---

## Objetivo

O **VibeAI** é um sistema de recomendação musical hiperpersonalizado. O aplicativo gera playlists sob demanda a partir do objetivo do usuário, do humor atual e da energia desejada para a música, usando uma API principal em NestJS, um banco PostgreSQL com Prisma e um serviço de Machine Learning em Python.

A proposta é ir além de filtros tradicionais de gênero musical, oferecendo recomendações explicáveis e alinhadas ao momento do usuário.

---

## Funcionalidades Principais

### Autenticação e Gestão de Usuário

- Cadastro com nome, sobrenome, data de nascimento, e-mail e senha.
- Login com validação de credenciais.
- Recuperação de senha por código de 6 dígitos enviado por e-mail.
- Perfil com dados do usuário, logout e exclusão de conta.

### Criação de Vibes

- Fluxo de criação em três etapas:
  - Objetivo da música.
  - Humor atual.
  - Intensidade/energia desejada.
- Geração de playlist personalizada integrada ao backend e ao módulo de Machine Learning.
- Redirecionamento automático para a playlist gerada.
- Salvamento das vibes criadas na Home do usuário.

### Home e Playlists

- Tela **Suas Vibes** com as playlists criadas pelo usuário.
- Estado vazio orientando o usuário a criar a primeira vibe.
- Cards de vibes salvas com acesso aos detalhes da playlist.
- Exclusão de vibes com confirmação.

### Explicabilidade

- Tela de detalhes da playlist com lista de faixas recomendadas.
- Tela **DNA da Faixa** com atributos musicais, gráfico e explicação da recomendação.

---

## Stack de Tecnologias

### Front-end Mobile

- **Framework:** React Native
- **Tooling:** Expo
- **Navegação:** Expo Router
- **Estado:** Zustand
- **Linguagem:** TypeScript

### Back-end

- **Ambiente:** Node.js
- **Framework:** NestJS
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL
- **ORM:** Prisma
- **Documentação da API:** Swagger

### Machine Learning

- **Linguagem:** Python
- **API:** FastAPI
- **Modelo:** Random Forest Classifier
- **Bibliotecas:** Scikit-learn, Pandas e NumPy

---

## Estrutura do Projeto

```text
.
├── back-end/
│   └── music-selector/          # API principal em NestJS
│       ├── src/
│       │   ├── auth/            # Autenticação e JWT
│       │   ├── users/           # Usuários e recuperação de senha
│       │   ├── recommendations/ # Recomendações e vibes
│       │   ├── common/          # Utilidades compartilhadas
│       │   └── prisma/          # Serviço do Prisma
│       ├── prisma/
│       │   └── schema.prisma    # Modelagem do banco
│       └── package.json
├── ml/                          # Serviço de Machine Learning
│   ├── api_vibe.py              # API FastAPI
│   ├── gerar_vibes.py           # Scripts de geração/modelagem
│   ├── data/                    # Dados utilizados pelo modelo
│   ├── modelos/                 # Modelos treinados
│   └── requirements.txt
├── vibeai/                      # Aplicativo mobile Expo/React Native
│   ├── app/                     # Rotas e telas
│   ├── components/              # Componentes visuais
│   ├── services/                # Cliente da API
│   ├── store/                   # Estado global
│   └── package.json
└── README.md
```

---

## Como Executar

### Pré-requisitos

- Node.js 18+.
- npm.
- Python 3.11+.
- PostgreSQL configurado.
- Expo Go ou Android Studio para executar o app mobile.
- Arquivos `.env` configurados no backend e no frontend.

### Back-end

```bash
cd back-end/music-selector
npm install
npx prisma migrate dev
npx prisma generate
npm run start:dev
```

Para popular o banco com o dataset:

```bash
SEED_DATASET=true npm run db:seed
```

### Machine Learning

```bash
cd ml
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn api_vibe:app --reload
```

### Front-end Mobile

```bash
cd vibeai
npm install
npx expo start -c
```

No emulador Android, a URL da API local geralmente deve apontar para:

```text
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

---

## Scripts Úteis

### Back-end

| Comando | Descrição |
| --- | --- |
| `npm run start:dev` | Inicia a API em modo desenvolvimento |
| `npm run build` | Compila o backend |
| `npm run start:prod` | Executa a versão compilada |
| `npm run lint` | Executa o ESLint |
| `npm run test` | Executa testes unitários |
| `npm run test:e2e` | Executa testes end-to-end |
| `npm run db:push` | Sincroniza o schema com o banco em desenvolvimento |
| `npm run db:seed` | Executa seed do banco |

### Front-end

| Comando | Descrição |
| --- | --- |
| `npm run start` | Inicia o Expo |
| `npm run android` | Abre o app no Android |
| `npm run ios` | Abre o app no iOS |
| `npm run web` | Executa a versão web do Expo |

---

## Fluxo do Sistema

1. O usuário cria uma conta ou faz login no aplicativo.
2. A Home exibe as vibes já criadas ou orienta a criação da primeira vibe.
3. O usuário acessa **Criar Vibe** e informa objetivo, humor e energia desejada.
4. O backend processa a solicitação, consulta o serviço de Machine Learning e salva a vibe gerada.
5. O app abre a playlist criada e permite visualizar o DNA das faixas recomendadas.
6. As vibes criadas permanecem disponíveis na Home do usuário.

---

## Contribuidores

Projeto desenvolvido como **Projeto Integrador** do 5º semestre - Fatec.

Integrantes: Vinicius de Araújo Silva, Paulo Ricardo Alvino Azevedo e Thiago Cunha Archete Silva.

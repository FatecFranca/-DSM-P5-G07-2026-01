# 🎵 Music Selector - Sistema Inteligente de Recomendação Musical

> Sistema multiplataforma de recomendação musical guiado por Inteligência Artificial | PI 5º Semestre - Fatec

---

## 🎯 Objetivo

Desenvolvimento de um **sistema de recomendação musical hiperpersonalizado** utilizando Machine Learning. O aplicativo classifica e sugere músicas com base no **estado emocional** e no **contexto situacional** do usuário, transcendendo os filtros tradicionais de gênero.

---

## ⚙️ Funcionalidades Principais

### 1. **Autenticação e Gestão de Usuário**
- Cadastro enxuto (Nome, Data de Nascimento, E-mail, Senha)
- Recuperação de acesso via "Esqueci minha senha"

### 2. **Onboarding Inteligente**
- Wizard inicial com questionário de 3 passos (gêneros, estilo de escuta, preferência vocal/instrumental)
- Mitigação de Cold Start com alimentação inicial de dados

### 3. **Motor de Recomendação Híbrido** *(Core)*
- **Vibes Diárias**: Playlists automáticas adaptadas ao perfil (Foco, Treino, Relaxamento)
- **Criar Minha Vibe**: Gerador sob demanda baseado em Atividade, Energia e Humor

### 4. **Interatividade e Transparência**
- Sistema de Like/Dislike para refinamento contínuo
- Explicabilidade algorítmica com gráficos e justificativas (Energy, Valence, Danceability)

---

## 💻 Stack de Tecnologias

### 📱 **Front-end (Mobile)**
- **Framework:** React Native
- **Tooling:** Expo
- **Linguagem:** JavaScript / TypeScript

### ⚙️ **Back-end (API Principal)**
- **Ambiente:** Node.js
- **Framework:** NestJS
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL
- **ORM:** Prisma

### 🧠 **Módulo de Machine Learning**
- **Linguagem:** Python
- **Framework de API:** FastAPI
- **Algoritmo Principal:** Random Forest Classifier
- **Bibliotecas:** Scikit-learn, Pandas, NumPy

### ☁️ **Infraestrutura**
- **Provedor:** Microsoft Azure
- **Recursos:** Banco de dados, API Node.js e microserviço Python

---

## 📁 Estrutura do Projeto

```
MusicSelector/
├── back-end/
│   └── music-selector/          # API NestJS
│       ├── src/
│       │   ├── auth/            # Módulo de autenticação
│       │   ├── users/           # Módulo de usuários
│       │   ├── recommendations/ # Motor de recomendações
│       │   ├── common/          # Utilidades compartilhadas
│       │   ├── prisma/          # Serviço do Prisma
│       │   └── generated/       # Tipos gerados pelo Prisma
│       ├── prisma/
│       │   └── schema.prisma    # Schema do banco de dados
│       ├── test/                # Testes E2E
│       └── package.json
├── docs/
│   └── music-selector.md        # Documentação detalhada
└── README.md                    # Este arquivo
```

---

## 🚀 Como Começar

### Pré-requisitos
- Node.js 18+ ou superior
- npm ou yarn
- PostgreSQL configurado
- Variáveis de ambiente (`.env`)

### Instalação

1. **Clonar o repositório**
   ```bash
   git clone <repository-url>
   cd MusicSelector
   ```

2. **Instalar dependências do back-end**
   ```bash
   cd back-end/music-selector
   npm install
   ```

3. **Configurar variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Editar .env com suas configurações
   ```

4. **Executar migrações do banco de dados**
   ```bash
   npm run prisma:migrate
   ```

### Executar

**Desenvolvimento**
```bash
npm run start:dev
```

**Produção**
```bash
npm run build
npm run start:prod
```

---

## 📝 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run start` | Inicia a aplicação |
| `npm run start:dev` | Inicia em modo desenvolvimento com watch |
| `npm run start:debug` | Inicia com debug ativo |
| `npm run start:prod` | Inicia em modo produção |
| `npm run build` | Compila o projeto |
| `npm run lint` | Executa linting com ESLint |
| `npm run format` | Formata código com Prettier |
| `npm run test` | Executa testes unitários |
| `npm run test:watch` | Executa testes em modo watch |
| `npm run test:cov` | Executa testes com cobertura |
| `npm run test:e2e` | Executa testes end-to-end |

---

## 🔄 Fluxo do Sistema

1. **Autenticação**: Usuário realiza cadastro/login via app mobile
2. **Onboarding**: Preenchimento de perfil inicial com preferências musicais
3. **Recomendação**: Sistema gera playlists automáticas ou sob demanda
4. **Feedback**: Usuário interage com Like/Dislike para refinar as recomendações
5. **Explicabilidade**: App exibe análise das características musicais sugeridas

---

## 📚 Documentação

Para mais detalhes sobre a arquitetura, fluxos e especificações técnicas, consulte:
- [Documentação Completa](./docs/music-selector.md)

---

## 👥 Contribuidores

Projeto desenvolvido como **Projeto Integrador** do 5º semestre - Fatec

---

## 📄 Licença

UNLICENSED

---

## 📞 Suporte

Para dúvidas ou reportar problemas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para melhorar sua experiência musical**

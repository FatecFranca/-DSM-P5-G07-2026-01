
PI 5º Semestre - Fatec
Escopo do Projeto
Projeto: Sistema Inteligente de Recomendação Musical
Objetivo do Projeto
O projeto consiste no desenvolvimento de um # 🎵 PI 5º Semestre — Fatec
## Sistema Inteligente de Recomendação Musical

---

## 🎯 Objetivo do Projeto

Desenvolvimento de um **sistema multiplataforma de recomendação musical guiado por Inteligência Artificial**. Utilizando um modelo de Machine Learning treinado com atributos de áudio (Spotify Tracks Dataset), o aplicativo classifica e sugere músicas com base no **estado emocional** e no **contexto situacional** do usuário.

A solução busca transcender os filtros tradicionais de gênero musical, oferecendo uma experiência **hiperpersonalizada** através de uma abordagem híbrida:
- Playlists automáticas para o dia a dia
- Gerador de recomendações sob demanda
- Transparência algorítmica (explicabilidade) sobre cada recomendação

---

## ⚙️ Funcionalidades Principais

### 1. Autenticação e Gestão de Usuário
- **Cadastro Enxuto:** Nome, Data de Nascimento, E-mail e Senha
- **Recuperação de Acesso:** Fluxo padrão de "Esqueci minha senha"

### 2. Onboarding Inteligente (Mapeamento de Perfil)
- **Wizard Inicial:** Questionário de 3 passos no primeiro acesso (gêneros favoritos, estilo de escuta e preferência vocal/instrumental)
- **Mitigação de Cold Start:** Alimentação inicial do banco para garantir as primeiras recomendações antes de receber feedbacks

### 3. Motor de Recomendação Híbrido *(Core do App)*
- **Vibes Diárias (Automático):** Cards na tela inicial com playlists dinâmicas adaptadas ao perfil (ex: "Foco", "Treino", "Relaxamento")
- **Criar Minha Vibe (Sob Demanda):** Formulário situacional onde o usuário define Atividade, Nível de Energia e Humor para gerar uma playlist exclusiva em tempo real

### 4. Interatividade e Transparência Algorítmica
- **Feedback Contínuo:** Sistema de Like/Dislike durante a reprodução para refinar as predições futuras
- **Explicabilidade (White-box):** Exibição do "DNA" da música (gráficos de Energy, Valence, Danceability) e justificativas textuais (ex: *"Sugerida por ter 80% de energia, ideal para o seu treino"*)

---

## 💻 Stack de Tecnologias

### 📱 Front-end (Mobile)
| Item | Detalhe |
|---|---|
| Framework | React Native |
| Tooling | Expo |
| Linguagem | JavaScript / TypeScript |

### ⚙️ Back-end (API Principal)
| Item | Detalhe |
|---|---|
| Ambiente | Node.js |
| Framework | Express ou NestJS |
| Linguagem | JavaScript / TypeScript |

### 🧠 Módulo de Machine Learning (Microserviço)
| Item | Detalhe |
|---|---|
| Linguagem | Python |
| Framework de API | FastAPI |
| Bibliotecas | Scikit-learn, Pandas, NumPy |
| Algoritmo Principal | Random Forest Classifier |

> Escolhido pela **alta explicabilidade das features**.

### 🗄️ Banco de Dados
| Item | Detalhe |
|---|---|
| SGBD | PostgreSQL |
| Motivo | Estrutura relacional ideal para integridade entre Usuários, Músicas e Histórico de Feedback |

### ☁️ Infraestrutura & Cloud
| Item | Detalhe |
|---|---|
| Provedor | Microsoft Azure |
| Recursos | Banco de dados, API Node.js e microserviço Python |

---

## 🔄 Fluxo do Sistema (Jornada e Arquitetura)

### 1. Entrada no Aplicativo (Autenticação)
1. Usuário abre o app (React Native) e faz **Cadastro ou Login**
2. Front-end envia os dados para a **API Node.js**
3. API valida, salva no **PostgreSQL** e retorna um **Token de sessão**

### 2. Primeiro Acesso (Onboarding e Cold Start)
- Conta nova → usuário passa por formulário rápido de gêneros favoritos e preferência vocal/instrumental
- Dados salvos no banco para a IA ter um ponto de partida

### 3. Tela Inicial (Vibes Diárias)
- API exibe playlists automáticas geradas em background (ex: "Foco", "Treino", "Relaxar")
- Playlists recalculadas diariamente com base no perfil do usuário

### 4. Fluxo Principal — "Criar Minha Vibe"
1. Usuário clica em **"Criar Minha Vibe"** e preenche o formulário situacional
2. Informa: **Objetivo** → **Energia** → **Humor**
3. App envia os dados ao **Node.js**
4. Node.js repassa ao microserviço **Python (FastAPI)**
5. Modelo de ML cruza os dados com o Spotify Dataset (Energy, Valence, Danceability…)
6. Python retorna **10 músicas** → Node.js → Front-end

### 5. Consumo e Retroalimentação (Feedback)
- Usuário vê o **"DNA" da faixa** (porcentagem de energia, humor etc.)
- **Like/Dislike** → salvo no PostgreSQL → IA refina futuras recomendações
- Dislike em um contexto → música nunca mais aparece naquele contexto para aquele usuário

### 6. Tela de Perfil
- Refazer onboarding, recalcular Vibes Diárias, excluir conta ou **Logout** (invalida o JWT)

---

## 📋 Regras de Negócio por Tela

### 🔐 Tela de Cadastro
| Código | Regra |
|---|---|
| RN01 | Unicidade de E-mail — não permite dois cadastros com o mesmo e-mail |
| RN02 | Todos os campos são obrigatórios para habilitar o botão de cadastro |
| RN03 | "Confirmar E-mail" deve ser idêntico ao campo "E-mail" |
| RN04 | Senha com mínimo de 8 caracteres, contendo pelo menos uma letra e um número |
| RN05 | "Confirmar Senha" deve ser idêntico ao campo "Senha" |
| RN06 | Idade mínima de 13 anos calculada a partir da Data de Nascimento |

### 🔑 Tela de Login
| Código | Regra |
|---|---|
| RN07 | Acesso somente com combinação correta de e-mail e senha |
| RN08 | Recuperação de senha valida existência do e-mail antes de disparar o link |
| RN09 | Sessão mantida via Token JWT até expirar ou o usuário fazer logout |

### 🎛️ Tela de Onboarding
| Código | Regra |
|---|---|
| RN10 | Exibido obrigatoriamente apenas no primeiro login após o cadastro |
| RN11 | Seleção de 1 a 5 gêneros musicais (mapeados com `track_genre` do dataset) |
| RN12 | Preferência de formato: Instrumental, Misto ou Com Vocal |
| RN13 | Dados gravados imediatamente para mitigar o Cold Start |

### 🏠 Tela Home (Vibes Diárias)
| Código | Regra |
|---|---|
| RN14 | Exibição de pelo menos 3 playlists dinâmicas (Foco, Relaxar, Treinar) |
| RN15 | Recomendações automáticas recalculadas a cada 24 horas |
| RN16 | Botão "Criar Minha Vibe" com destaque permanente na interface |

### 🎯 Tela "Criar Minha Vibe"
| Código | Regra |
|---|---|
| RN17 | Todas as etapas são obrigatórias para habilitar a geração |
| RN18 | **Etapa 1 — Objetivo:** Estudar/Foco · Treinar/Exercício · Relaxar/Dormir · Melhorar o Humor |
| RN19 | **Etapa 2 — Energia:** Baixo (0.0–0.33) · Médio (0.34–0.66) · Alto (0.67–1.0) |
| RN20 | **Etapa 3 — Humor:** Feliz/Animado · Neutro · Ansioso/Tenso · Melancólico/Triste |
| RN21 | Back-end encaminha parâmetros ao microserviço Python/FastAPI (Random Forest) |
| RN22 | Retorno de exatamente **10 faixas** ordenadas por relevância e popularidade |

### 🎵 Tela de Player e Feedback
| Código | Regra |
|---|---|
| RN23 | Like/Dislike salvo com ID da Faixa, ID do Usuário e Contexto (Objetivo) |
| RN24 | Faixas com Dislike nunca mais são sugeridas no mesmo contexto |
| RN25 | Player exibe visualmente Energy, Valence e Danceability da faixa atual |

### 👤 Tela de Perfil e Configurações
| Código | Regra |
|---|---|
| RN26 | Nome e Senha editáveis; E-mail e Data de Nascimento **imutáveis** |
| RN27 | Usuário pode alterar preferências de Onboarding a qualquer momento |
| RN28 | Salvar novas preferências aciona recálculo imediato das playlists da Home |
| RN29 | Opção clara de exclusão permanente e irreversível da conta (LGPD) |
| RN30 | Exclusão apaga dados sensíveis (Nome, E-mail), mas mantém histórico de avaliações anonimizado |
| RN31 | Logout invalida o JWT local e redireciona para a Tela de Login |

---

## 🛡️ Requisitos Não Funcionais — Segurança

| Código | Requisito |
|---|---|
| RNF-S01 | **Limite de caracteres:** Nome (máx. 50, sem especiais numéricos); E-mail (máx. 100, regex padrão) |
| RNF-S02 | **Sanitização de Dados:** Todas as entradas sanitizadas no Node.js contra SQL Injection e XSS |
| RNF-S03 | **Criptografia de Senhas:** Hash com salt (BCrypt) — nenhuma senha em texto puro |
| RNF-S04 | **Rate Limiting:** Limitador de requisições por IP nas rotas públicas de autenticação contra Brute Force |sistema multiplataforma de recomendação musical guiado por Inteligência Artificial. Utilizando um modelo de Machine Learning treinado com atributos de áudio (Spotify Tracks Dataset), o aplicativo tem como objetivo principal classificar e sugerir músicas com base no estado emocional e no contexto situacional do usuário.
A solução busca transcender os filtros tradicionais de gênero musical, oferecendo uma experiência hiperpersonalizada através de uma abordagem híbrida: entregando tanto playlists automáticas para o dia a dia quanto um gerador de recomendações sob demanda, garantindo sempre a transparência (explicabilidade) de por que cada música foi escolhida.
Funcionalidades Principais
1. Autenticação e Gestão de Usuário
Cadastro Enxuto: Criação de conta focada na agilidade, exigindo apenas Nome, Data de Nascimento (para inferências geracionais no ML), E-mail e Senha.
Recuperação de Acesso: Fluxo padrão de "Esqueci minha senha".
2. Onboarding Inteligente (Mapeamento de Perfil)
Wizard Inicial: Questionário rápido de 3 passos no primeiro acesso para entender o gosto basal do usuário (Gêneros favoritos, estilo de escuta diária e preferência entre faixas instrumentais/vocais).
Mitigação de Cold Start: Alimentação inicial do banco de dados para garantir que o sistema já tenha informações suficientes para as primeiras recomendações antes de receber feedbacks detalhados.
3. Motor de Recomendação Híbrido (Core do App)
Vibes Diárias (Automático): Geração contínua e automática de "cards" na tela inicial com playlists dinâmicas adaptadas ao perfil do usuário (ex: "Foco", "Treino", "Relaxamento").
Criar Minha Vibe (Sob Demanda): Formulário situacional em que o usuário define seu momento exato (Atividade, Nível de Energia desejado e Humor atual) para que o algoritmo gere uma playlist exclusiva em tempo real.
4. Interatividade e Transparência Algorítmica
Feedback Contínuo: Sistema de avaliação rápida (Like/Dislike) durante a reprodução para retroalimentar o banco de dados e refinar as predições futuras do modelo de ML.
Explicabilidade (White-box): Exibição do "DNA" da música (gráficos visuais de características como Energy, Valence, Danceability) e justificativas textuais curtas do motivo da recomendação (ex: "Sugerida por ter 80% de energia, ideal para o seu treino").
💻 Stack de Tecnologias
📱 Front-end (Mobile)
Framework: React Native
Tooling: Expo
Linguagem: JavaScript / TypeScript
⚙️ Back-end (API Principal)
Ambiente: Node.js
Framework: Express ou NestJS (para roteamento e regras de negócio)
Linguagem: JavaScript / TypeScript
🧠 Módulo de Machine Learning (Microserviço)
Linguagem: Python
Framework de API: FastAPI
Bibliotecas ML: Scikit-learn, Pandas, NumPy
Algoritmo Principal: Random Forest Classifier (escolhido pela alta explicabilidade das features)
🗄️ Banco de Dados
SGBD: PostgreSQL
Motivo: Estrutura relacional ideal para garantir a integridade entre as tabelas de Usuários, Músicas (com atributos fixos) e Histórico de Feedback.
☁️ Infraestrutura & Cloud
Provedor: Microsoft Azure
Recursos: Hospedagem do banco de dados, da API Node.js e do microserviço Python.
Resumo do Fluxo do Sistema (Jornada e Arquitetura)
1. Entrada no Aplicativo (Autenticação)
O usuário abre o app (React Native) e faz o Cadastro ou Login.
O Front-end envia os dados para a nossa API principal (Node.js).
A API valida, salva no PostgreSQL e retorna um Token de sessão. O usuário está logado.
2. O Primeiro Acesso (Onboarding e Cold Start)
Se for uma conta nova, o usuário passa obrigatoriamente por um formulário rápido escolhendo seus gêneros favoritos e se prefere músicas cantadas ou instrumentais.
Isso é salvo no banco de dados para garantir que a IA já tenha um ponto de partida (evitando o problema do Cold Start).
3. Tela Inicial (Vibes Diárias)
Ao cair na Home, a API (Node.js) já exibe de cara algumas playlists automáticas prontas (ex: "Foco", "Treino", "Relaxar").
Essas playlists foram geradas em background com base no perfil do usuário e se atualizam diariamente.
4. O Fluxo Principal ("Criar Minha Vibe")
Se o usuário quiser algo específico na hora, ele clica no botão "Criar Minha Vibe" e preenche o Formulário Situacional.
Ele informa: 1. Objetivo (ex: Treinar), 2. Energia (ex: Alta), 3. Humor (ex: Feliz).
A Mágica Acontece: 1. O App manda esses 3 dados para o Node.js.
2. O Node.js repassa isso para o nosso microserviço em Python (FastAPI).
3. O modelo de Machine Learning cruza esses dados com os atributos do Spotify Dataset (Energy, Valence, Danceability, etc.) dentro dos gêneros que o usuário gosta.
4. O Python devolve uma lista com as 10 músicas perfeitas para o Node.js, que por sua vez manda para o Front-end exibir.
5. Consumo e Retroalimentação (Feedback)
O usuário dá play na recomendação. Na tela, ele consegue ver o porquê aquela música foi sugerida (o "DNA" da faixa, mostrando a porcentagem de energia e humor).
Se ele der um "Like" ou "Dislike", o App avisa o Node.js, que salva isso no PostgreSQL.
A partir desse momento, a IA fica mais inteligente: se ele deu dislike, aquela música nunca mais aparece para ele naquele mesmo contexto.
6. Saída do Aplicativo (Perfil)
A qualquer momento, ele pode ir na tela de Perfil, refazer o questionário inicial (Onboarding) para recalcular todas as suas "Vibes Diárias", excluir sua conta ou simplesmente fazer o Logout, encerrando a sessão de forma segura.
📂 Requisitos e Regras de Negócio do Sistema
Regras de Negócio por Tela (RN)
1. Tela de Cadastro
RN01 - Unicidade de E-mail: Não deve ser permitido o cadastro de dois usuários com o mesmo endereço de e-mail ativo na base.
RN02 - Validação de Campos Obrigatórios: Todos os campos (Nome, Sobrenome, Data de Nascimento, E-mail, Confirmar E-mail, Senha e Confirmar Senha) devem ser preenchidos para habilitar o botão de cadastro.
RN03 - Integridade de E-mail: O campo "Confirmar E-mail" deve ser estritamente idêntico ao campo "E-mail".
RN04 - Força da Senha: A senha deve conter no mínimo 8 caracteres, incluindo obrigatoriamente pelo menos uma letra e um número.
RN05 - Confirmação de Senha: O campo "Confirmar Senha" deve ser estritamente idêntico ao campo "Senha".
RN06 - Idade Mínima: O sistema deve calcular a idade com base na Data de Nascimento; cadastros de usuários com menos de 13 anos não devem ser processados.
2. Tela de Login
RN07 - Autenticação: O acesso só é permitido mediante a combinação correta de e-mail e senha previamente cadastrados no banco de dados.
RN08 - Recuperação de Senha: O fluxo de "Esqueci minha senha" deve validar a existência do e-mail na base antes de disparar o link/código de recuperação.
RN09 - Persistência de Sessão: O aplicativo deve manter a sessão do usuário ativa (utilizando Token JWT) para dispensar novos logins a cada abertura do app, até que o token expire ou o usuário faça logout manual.
3. Tela de Onboarding (Preferências Iniciais)
RN10 - Obrigatoriedade do Fluxo: O Onboarding deve ser apresentado obrigatoriamente e apenas no primeiro login após a conclusão do cadastro.
RN11 - Seleção de Gêneros: O usuário deve selecionar no mínimo 1 e no máximo 5 gêneros musicais (mapeados com a coluna track_genre do dataset).
RN12 - Preferência de Formato de Áudio: O usuário deve selecionar sua preferência predominante (Instrumental, Misto ou Com Vocal).
RN13 - Alimentação Inicial: Os dados do onboarding devem ser gravados imediatamente no perfil do usuário para mitigar o Cold Start e gerar as primeiras recomendações.
4. Tela Home (Vibes Diárias)
RN14 - Playlists Automáticas: O sistema deve exibir pelo menos 3 opções de playlists dinâmicas (ex: Foco, Relaxar, Treinar) calculadas com base no perfil histórico do usuário.
RN15 - Ciclo de Atualização: As recomendações automáticas da Home devem ser recalculadas pelo motor de ML a cada 24 horas.
RN16 - Atalho de Geração: O botão "Criar Minha Vibe" deve possuir destaque permanente na interface (navbar ou centro da tela principal).
5. Tela "Criar Minha Vibe" (Formulário Situacional)
RN17 - Preenchimento Integral: Todas as etapas do formulário são de preenchimento obrigatório para habilitar a geração da playlist.
RN18 - Etapa 1 (Objetivo): O usuário deve selecionar uma opção única:
Estudar / Foco (Prioriza alto instrumentalness)
Treinar / Exercício (Prioriza alto danceability)
Relaxar / Dormir (Prioriza alto acousticness)
Melhorar o Humor
RN19 - Etapa 2 (Nível de Energia): O usuário deve selecionar o nível (mapeado para a coluna energy):
Baixo (0.0 a 0.33)
Médio (0.34 a 0.66)
Alto (0.67 a 1.0)
RN20 - Etapa 3 (Humor Atual): O usuário deve selecionar seu estado emocional (mapeado para a coluna valence):
Feliz / Animado (Valence alta)
Neutro (Valence média)
Ansioso / Tenso
Melancólico / Triste (Valence baixa)
RN21 - Chamada de Previsão (ML): Ao submeter, o back-end (Node.js) deve encaminhar os parâmetros ao microserviço (Python/FastAPI) que processará o modelo Random Forest.
RN22 - Retorno da Requisição: O resultado da recomendação deve retornar uma playlist contendo exatamente 10 faixas ordenadas por relevância e popularity.
6. Tela de Player e Feedback
RN23 - Registro de Avaliação: Interações de "Like" ou "Dislike" na música em reprodução devem ser salvas na base relacionando o ID da Faixa, ID do Usuário e Contexto (Objetivo).
RN24 - Bloqueio de Dislike: Faixas avaliadas com "Dislike" nunca mais devem ser sugeridas para aquele usuário no mesmo contexto avaliado.
RN25 - Exibição de Atributos (DNA Musical): O player deve exibir de forma visual os atributos matemáticos da faixa atual (ex: Gráfico exibindo % de Energy, Valence e Danceability).
7. Tela de Perfil e Configurações
RN26 - Restrição de Edição: O usuário pode alterar Nome e Senha livremente. E-mail e Data de Nascimento são imutáveis após a criação da conta.
RN27 - Retomada de Onboarding: O sistema deve permitir que o usuário acesse e altere suas preferências iniciais (Gêneros e Formato de Áudio) a qualquer momento.
RN28 - Efeito de Atualização: Salvar novas preferências aciona um recálculo imediato das playlists automáticas da Tela Home (RN14).
RN29 - Direito de Exclusão (LGPD): O sistema deve possuir uma opção clara e acessível para exclusão permanente e irreversível da conta.
RN30 - Anonimização de Dados: Ao excluir a conta, os dados sensíveis (Nome, E-mail) são apagados, mas os históricos de avaliação musicais são mantidos no banco de dados sem associação ao usuário, para não prejudicar a acurácia global do modelo de Machine Learning.
RN31 - Encerramento de Sessão (Logout): O sistema deve fornecer um botão visível para "Sair" ou "Logout". Ao ser acionado, o aplicativo deve invalidar o token de autenticação (JWT) armazenado localmente e redirecionar o utilizador imediatamente para a Tela de Login, impedindo o acesso às áreas restritas sem uma nova autenticação.
Requisitos Não Funcionais: Validação e Segurança (RNF-S)
Estas regras não ditam o comportamento de negócio, mas garantem a integridade, estabilidade e segurança estrutural da aplicação.
RNF-S01 - Limite de Caracteres (Inputs): * O campo "Nome" deve aceitar no máximo 50 caracteres e rejeitar caracteres especiais numéricos.
O campo "E-mail" deve aceitar no máximo 100 caracteres e seguir o regex padrão de e-mail (usuario@dominio.com).
RNF-S02 - Sanitização de Dados: Todas as entradas de texto (inputs do front-end) devem passar por rotinas de sanitização no Node.js antes de tocarem no banco de dados, neutralizando tentativas de ataques como SQL Injection e Cross-Site Scripting (XSS).
RNF-S03 - Criptografia de Senhas: Nenhuma senha deve ser salva em texto puro. O back-end deve utilizar algoritmos de hash com salt (ex: BCrypt) antes de armazenar a string de segurança no PostgreSQL.
RNF-S04 - Rate Limiting: As rotas públicas de autenticação (Cadastro e Login) devem possuir um limitador de requisições por IP para prevenir ataques de força bruta (Brute Force).

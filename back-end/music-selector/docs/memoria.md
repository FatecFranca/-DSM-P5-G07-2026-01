Principais achados (erros de regra de negócio e inconsistências com ML) verificadas no fluxo Backend (NestJS) → ML (FastAPI/Python):

1) Integração ML quebrada para feedback (RN23/RN24 fica sem efeito)
Backend chama no FeedbackService.recordFeedback():
this.mlService.submitFeedback(...)
MLService.submitFeedback() faz POST ${ML_SERVICE_URL}/feedback.
Porém, no ML que existe no repositório (ml/scripts/api_vibe.py), não existe endpoint /feedback.
Resultado: o microserviço ML não recebe feedback, então:
a “melhora futuras recomendações” via retreinamento não acontece
qualquer lógica de RN23/RN24 no lado ML fica ineficaz (o backend ainda grava no banco, mas a parte de ML não processa).
2) Contrato do ML: backend chama /predict-vibe com “features”, mas ranking/semântica RN22 não está implementado como descrito
O ML (/predict-vibe) aceita exatamente: danceability, energy, valence, acousticness, instrumentalness, speechiness, tempo.
Backend (PlaylistGeneratorService) monta mlFeatures corretamente via mapAnswersToMlFeatures() e chama predictVibe(mlFeatures).
Problema de regra (RN22 “70% relevância + 30% popularity” não é aplicada)
O controller/sumário promete:

“Retorna exatamente 10 faixas ordenadas por (relevância 70% + popularity 30%).”

Mas no código do backend:

ele busca tracks ordenadas só por popularity: 'desc'
depois seleciona tracks.slice(0, 10)
não existe cálculo de score “70% relevância + 30% popularity” (nem uma fase de re-ranking usando “relevância”).
explanation.reason usa predictedScore, mas não entra no ordenamento real.
Resultado: a ordenação final provavelmente não atende a RN22.

3) RN22 “exatamente 10 faixas” pode falhar e retornar erro (ou comportamento contraditório)
No endpoint:

recommendations.controller.ts tenta garantir RN22:
se dto.limit !== 10, ele força dto.limit = 10
mas isso só funciona se dto.limit existir no payload (o DTO real precisa ser conferido; não li o DTO inteiro ainda).
No generateRecommendations():

selectedTracks = tracks.slice(0, targetCount)
response.totalTracks = enrichedTracks.length
e valida:
se response.totalTracks !== 10 → erro.
No entanto:

ele também tem uma regra anterior:
se tracks.length < targetCount → throw BadRequestException (em vez de devolver 10)
Como o filtro por vibe: predictedVibe e remoção de dislikes pode reduzir a disponibilidade, isso pode causar falhas frequentes, dependendo dos dados.
Resultado: RN22 “sempre 10” na prática pode virar “falha com 400” quando o banco não tem o suficiente.

4) Filtro de dislikes (RN24) está por objectiveContext, mas o “contexto” pode não casar com a vibe prevista
Backend filtra dislikes assim:
getUserDislikes(userId, dto.objective)
ou no daily vibe: getUserDislikes(userId, objective)
O ML prevê predictedVibe (classe Vibe) com base nas features.
A remoção de dislikes é feita por trackId + contexto do objetivo, não por vibe/cluster.
Isso é uma decisão de regra (pode ser ok), mas é inconsistente com a ideia de “melhorar recomendações via vibe”, porque dislikes podem ter sido registrados em contextos que não correspondem ao predictedVibe atual.
5) Observação de contrato/consistência: MLService.getRecommendations() parece irrelevante e usa payload “qualquer”
MLService.getRecommendations(payload) também chama POST /predict-vibe.
Mas o fluxo real usa predictVibe(features).
Não é necessariamente um bug funcional, porém indica inconsistência de abstração no ML client.
Checklist de testes (obrigatório)
O que foi testado
Nenhum teste foi executado (sem curl, sem execução local do serviço, sem validação funcional endpoint-a-endpoint).

O que ainda precisa de cobertura
API Backend
POST /api/recommendations/generate (happy path e falhas: onboarding incompleto, sem tracks suficientes, limites/DTO inválidos)
POST /api/recommendations/feedback (garantir gravação no banco e verificar chamada ao ML)
GET /api/recommendations/daily-vibe, /vibes, /history, /feedback, /feedback/stats
ver se RN22 “exatamente 10” se mantém com o filtro de dislikes
ML
confirmar que /predict-vibe está correto com um exemplo real de features do backend
confirmar falha/ausência de /feedback (no momento, o código do ML fornecido não contém esse endpoint)
Preferência para continuar testes
Como nenhum teste foi feito, preciso que você escolha o nível de teste antes de eu seguir com validações mais profundas:

Critical-path testing (recomendado): só os endpoints principais do fluxo (generate + feedback + daily-vibe) + validação mínima do contrato do ML
Thorough testing: tudo acima + edge cases e validação via curl
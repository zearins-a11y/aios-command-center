# AIOS Command Center — Regras de Governança

## 🛡️ Regras Absolutas (NUNCA violar)

### 1. Aprovação Humana Obrigatória
> **Nenhum conteúdo ou resposta é publicado sem aprovação humana explícita.**

- Toda publicação externa (redes sociais, emails, posts) REQUER aprovação humana
- Respostas automatizadas (WhatsApp, Telegram, comentários) REQUEREM aprovação prévia
- Apenas ações internas (logs, builds, testes) podem ser executadas sem aprovação

**Implementação:**
- Status de cada item: `pending` → `awaiting_approval` → `approved` → `published` | `rejected`
- Nenhuma chamada API externa sem status `approved`
- Logs devem mostrar: `"awaiting human approval: item#<id>"`

---

### 2. Checksum de Revisão
> **Aprovação pertence a uma revisão específica, identificada por checksum.**

Cada item aprovado possui um **checksum único** gerado a partir de:
```
checksum = hash(content + timestamp + agent_id + version)
```

**Regras:**
- Aprovação é vinculada ao checksum específico do conteúdo
- Se o conteúdo mudar (qualquer byte), checksum muda
- Novo checksum = nova aprovação necessária
- Histórico de checksums é imutável

**Implementação:**
```typescript
interface Approval {
  id: string;
  checksum: string;  // SHA-256 do conteúdo
  content: string;
  approvedBy: string;  // human user id
  approvedAt: Date;
  validUntil: Date;
  status: 'active' | 'expired' | 'revoked';
}
```

---

### 3. Imutabilidade Pós-Aprovação
> **Qualquer alteração após a aprovação cria nova revisão e cancela a aprovação anterior.**

**Fluxo:**
```
1. Item criado (revision 1, checksum A)
2. Humano aprova revision 1 (checksum A)
3. Item alterado (revision 2, checksum B)
4. Aprovação anterior (checksum A) é REVOCADA
5. Nova revisão (checksum B) precisa de nova aprovação
```

**Implementação:**
- Versionamento imutável — revisão antiga preservada como histórico
- Status `active` passa para `revoked` na aprovação anterior
- Nova revisão entra em `pending`

---

### 4. Isolamento de Credenciais
> **Agentes podem solicitar credenciais, mas nunca manipulam diretamente. Credenciais ficam em ambiente seguro, sem exposição.**

**Princípio:** Os agentes solicitam o que precisam, mas NÃO manipulam, armazenam ou veem credenciais em texto puro.

**Fluxo permitido:**
1. Agente identifica que precisa de credencial (ex: `WHATSAPP_TOKEN`)
2. Agente solicita via API interna: `requestCredential("whatsapp")`
3. **Vault seguro** valida permissão e contexto
4. Conector isolado recebe credencial **inline na chamada**
5. Ação executada **sem** agente ver credencial

**Implementação de Segurança:**
```typescript
// ❌ ERRADO — agente nunca vê o token
const token = vault.get("whatsapp");  // exposto
agent.execute({ token });

// ✅ CORRETO — conector isolado resolve internamente
const result = await connector.execute("whatsapp", "send_message", {
  to: "+5511999999999",
  message: "..."
  // token resolvido internamente pelo connector
});
```

**Vault Seguro (Ambiente Isolado):**
- Credenciais armazenadas em cofre criptografado (AES-256)
- Acesso auditado (quem solicitou, quando, por quê)
- Rotação automática de tokens
- Logs imutáveis de acesso
- Agentes recebem apenas **referência**, nunca valor

```typescript
interface CredentialRequest {
  agentId: string;
  connectorName: string;
  reason: string;          // obrigatório
  contextChecksum: string; // vincula à aprovação
}

// Vault resolve e passa ao connector — agente nunca vê
await vault.delegate(connectorName, request);
```

**Regras de Exposição:**
- ❌ Token NUNCA aparece em logs do agente
- ❌ Token NUNCA aparece em prompts ou respostas
- ❌ Token NUNCA é persistido em estado do agente
- ❌ Token NUNCA é enviado por webhook ao agente
- ✅ Token só existe dentro do conector isolado
- ✅ Token é descartado após execução
- ✅ Apenas **referência** (ID opaco) trafega entre agente e vault

---

### 5. Conectores Isolados
> **Somente conectores isolados podem publicar, enviar respostas ou importar dados externos.**

**Conectores permitidos:**
| Conector | Função | Credenciais em |
|----------|--------|----------------|
| `stripe-connector` | Pagamentos | Vault |
| `whatsapp-connector` | Mensagens | Vault |
| `instagram-connector` | Posts sociais | Vault |
| `email-connector` | Emails | Vault |
| `crm-connector` | Sync CRM | Vault |
| `database-connector` | Query DB | Vault |

**Regra:** Apenas o `*-connector` pode fazer chamadas externas. Agentes conversam via API interna.

---

## 🔐 Matriz de Permissões

| Ação | AIOS Dev | Brand Squad | Copy Squad | C-Level | Humano |
|------|----------|-------------|------------|---------|--------|
| Gerar código | ✅ | ❌ | ❌ | ❌ | ✅ |
| Sugerir copy | ❌ | ❌ | ✅ | ❌ | ✅ |
| Publicar post | ❌ | ❌ | ❌ | ❌ | ✅ |
| Aprovar conteúdo | ❌ | ❌ | ❌ | ❌ | ✅ |
| Deploy produção | ❌ | ❌ | ❌ | ✅ | ✅ |
| Acessar credenciais | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 📋 Fluxo de Aprovação

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  Agente     │───▶│  Pending     │───▶│  Awaiting    │
│  cria item  │    │  Review      │    │  Approval    │
└─────────────┘    └──────────────┘    └──────┬───────┘
                                             │
                                             ▼
                    ┌─────────────────┐   ┌─────────┐
                    │  Approved       │◀──│ Humano  │
                    │  (checksum X)   │   │ aprova  │
                    └────────┬────────┘   └─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Connector│  │  Audit   │  │  History │
        │ executa  │  │  log     │  │  stored  │
        └──────────┘  └──────────┘  └──────────┘
```

---

---

## 🔐 Ações Críticas — Autorização Específica Adicional

### Categorias de Ações Críticas

Algumas ações requerem **autorização dupla** ou **aprovação multi-nível**, além da aprovação humana padrão:

#### 1. 💸 Gastos e Transações Financeiras

| Valor | Aprovação Necessária |
|-------|---------------------|
| Até R$ 100 | Humano único |
| R$ 100 - R$ 1.000 | Humano + C-Level |
| R$ 1.000 - R$ 10.000 | Humano + C-Level + Co-founder |
| Acima de R$ 10.000 | Humano + C-Level + Co-founder + Delay de 24h |

**Regras:**
- ❌ Agentes **nunca** executam pagamentos diretamente
- ❌ Agentes **nunca** decidem valores monetários
- ✅ Agentes podem **sugerir** valores com justificativa
- ✅ Toda transação tem **reversibilidade avaliada** (refund possible?)
- ✅ Limite diário por agente: configurável
- ✅ Bloqueio automático se padrão anormal detectado

```typescript
interface FinancialAction {
  amount: number;
  currency: 'BRL' | 'USD' | 'EUR';
  destination: string;        // conta destino
  reason: string;             // obrigatório, > 50 chars
  expectedReturn?: number;    // ROI esperado
  reversibleUntil?: Date;     // janela de refund
  requiredApprovers: string[]; // calculado por valor
  cooldownMs?: number;        // delay obrigatório
}
```

---

#### 2. 📊 Modificação de Contas e Configurações

| Tipo de Mudança | Aprovação Necessária |
|-----------------|---------------------|
| Alterar API keys | Humano + C-Level |
| Mudar plano de assinatura | Humano + C-Level |
| Adicionar novo membro | Humano único |
| Remover membro | Humano + C-Level + Delay 24h |
| Mudar permissões de role | Humano + C-Level |
| Alterar configurações de billing | Humano + C-Level + Co-founder |

**Regras:**
- Toda mudança em conta gera **snapshot antes/depois**
- Mudanças de billing têm **delay de cancelamento** de 24h
- Alterações em API keys forçam **re-autenticação** de todos os conectores
- Mudanças em permissões são **versionadas** (rollback possível)

---

#### 3. 🔑 Mudanças de Permissões

| Ação | Aprovação Necessária |
|------|---------------------|
| Conceder permissão nova | Humano + C-Level |
| Revogar permissão crítica | Humano + C-Level + Co-founder |
| Elevar role temporário | Humano + Co-founder + Expiração automática |
| Bypass de regra | ❌ **PROIBIDO** — não há bypass |

**Regra de Ouro:** Permissões são **concedidas pelo mínimo necessário** (least privilege).

```typescript
interface PermissionChange {
  target: 'agent' | 'user' | 'connector';
  targetId: string;
  permission: string;
  action: 'grant' | 'revoke';
  expiresAt?: Date;      // expiração automática
  scope: 'global' | 'project';
  justification: string;
  approvedBy: string[]; // multi-aprovação
}
```

---

#### 4. 🗑️ Exclusões e Mudanças Destrutivas

| Tipo | Aprovação | Delay |
|------|-----------|-------|
| Excluir projeto | Humano + C-Level | 24h (pode cancelar) |
| Excluir conta de cliente | Humano + C-Level + Legal | 72h |
| Deletar dados de usuário (LGPD) | Humano + Co-founder | 0h (obrigação legal) |
| Resetar banco de produção | ❌ **BLOQUEADO** via agente | N/A |
| Limpar logs de auditoria | ❌ **PROIBIDO** | N/A |

**Regras:**
- Toda exclusão gera **backup automático** antes
- Backups têm retenção mínima de 30 dias
- Exclusões em massa (>100 itens) exigem confirmação dupla
- Soft-delete por padrão — exclusão real só após janela de recuperação

---

#### 5. 🛡️ Mudanças de Segurança

| Ação | Aprovação | Delay |
|------|-----------|-------|
| Adicionar novo IP allowlist | Humano + C-Level | 0h |
| Remover IP allowlist | Humano + Co-founder | 24h |
| Rotação de credenciais | Humano + C-Level + 2FA | 0h |
| Mudança em firewall | Humano + Co-founder + CISO | 24h |
| Desabilitar 2FA | Humano + Co-founder + 2FA atual | 0h |
| Reset de MFA de usuário | Humano + verificação manual | 0h |

**Mudanças críticas de segurança têm:**
- 🔐 Autenticação por 2FA obrigatória
- 📋 Justificativa documentada
- 🔔 Notificação a todos os admins
- ⏮️ Reversibilidade documentada
- 🚨 Alerta automático se mudança suspeita

---

## 📋 Fluxo de Autorização Multi-Nível

```
┌─────────────────┐
│ Ação Crítica    │
│ Solicitada      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐    Não    ┌──────────┐
│ Valor/Risco     │──────────▶│ Negada   │
│ Calculado       │           │ + log    │
└────────┬────────┘           └──────────┘
         │ Sim
         ▼
┌─────────────────┐    Não    ┌──────────┐
│ Aprovador 1     │──────────▶│ Pendente │
│ Disponível?     │           │ + notif  │
└────────┬────────┘           └──────────┘
         │ Sim
         ▼
┌─────────────────┐    Não    ┌──────────┐
│ Aprovador 2     │──────────▶│ Pendente │
│ Aprovou?        │           │ + notif  │
└────────┬────────┘           └──────────┘
         │ Sim
         ▼
┌─────────────────┐    Sim    ┌──────────┐
│ Delay           │──────────▶│ Esperar  │
│ Necessário?     │           │ N horas  │
└────────┬────────┘           └──────────┘
         │ Não
         ▼
┌─────────────────┐
│ Executar        │
│ + Audit Log     │
└─────────────────┘
```

---

## 🚨 Detecção de Padrões Anormais

O sistema bloqueia automaticamente:

1. **Velocity check** — Muitas ações em pouco tempo
2. **Amount spike** — Valor muito acima do histórico
3. **Off-hours activity** — Ações em horários incomuns
4. **Permission creep** — Agente acumulando permissões
5. **Failed attempts** — Múltiplas aprovações negadas
6. **Geographic anomaly** — Login de localização incomum

Quando detectado:
- 🔴 Ação bloqueada automaticamente
- 📞 Notificação imediata a admins
- 📋 Investigação automática iniciada
- ⏸️ Permissões reduzidas temporariamente

O sistema detecta e bloqueia automaticamente:

1. ❌ Tentativa de publicação sem status `approved`
2. ❌ Checksum diferente do aprovado
3. ❌ Token/credencial em contexto de agente
4. ❌ Agente tentando chamada externa direta
5. ❌ Múltiplas aprovações conflitantes

---

## 📊 Auditoria

Cada ação registra:
- Timestamp
- Agente que originou
- Checksum
- Status da aprovação
- Quem aprovou (humano)
- Resultado da execução

Logs imutáveis — podem ser exportados para compliance.

---

## 👥 Matriz de Papéis — Permissões por Agente

Cada agente tem **escopo definido de atuação**. Esta matriz é **inviolável** — nenhum agente pode ultrapassar seu escopo.

### 📋 Tabela de Permissões

| Agente | ✅ Pode fazer sozinho | ❌ Não pode fazer sozinho |
|--------|----------------------|--------------------------|
| **Estrategista** | Pesquisar fontes autorizadas, montar pauta e recomendar calendário | Aprovar pauta ou iniciar campanha |
| **Redator** | Criar e revisar versões para cada rede | Inventar fatos, enviar ou publicar |
| **Estúdio** | Criar roteiros, layouts, prompts e especificações visuais | Usar ativos não autorizados ou publicar |
| **Guardião** | Validar, emitir alertas e bloquear uma revisão | Aprovar em seu nome ou remover bloqueios |
| **Operador** | Preparar agenda, importar métricas e reconciliar resultados | Publicar ou responder sem aprovação válida |

---

### 🔍 Detalhamento por Papel

#### 🧠 Estrategista

**Responsabilidade:** Inteligência, planejamento e curadoria.

**Pode:**
- ✅ Pesquisar em fontes autorizadas (lista mantida pelo Guardião)
- ✅ Montar pauta editorial com base em dados
- ✅ Recomendar calendário de publicação
- ✅ Analisar tendências e oportunidades
- ✅ Sugerir temas e ângulos

**Não pode:**
- ❌ Aprovar pauta final (deve passar ao Humano)
- ❌ Iniciar campanha sem aprovação
- ❌ Publicar ou responder em qualquer canal
- ❌ Tomar decisões que afetem budget

**Limites:**
- Acesso: read-only em todas as plataformas
- Credenciais: nenhuma
- Pode consultar analytics públicos

---

#### ✍️ Redator

**Responsabilidade:** Criação textual e revisão.

**Pode:**
- ✅ Criar versões de copy para cada rede social
- ✅ Adaptar tom por canal (Instagram vs LinkedIn)
- ✅ Revisar e iterar sobre versões anteriores
- ✅ Sugerir headlines, CTAs, hashtags
- ✅ A/B testing de variações

**Não pode:**
- ❌ Inventar fatos não verificados
- ❌ Citar dados sem fonte
- ❌ Enviar ou publicar em qualquer canal
- ❌ Modificar copy já aprovado (cria nova revisão)

**Limites:**
- Acesso: read-only em fontes de dados
- Toda criação fica em status `draft`
- Facts checker automático ativo

---

#### 🎨 Estúdio

**Responsabilidade:** Criação visual e especificações.

**Pode:**
- ✅ Criar roteiros visuais
- ✅ Gerar layouts e composições
- ✅ Escrever prompts para geração de imagem/vídeo
- ✅ Criar especificações técnicas (cores, fontes, dimensões)
- ✅ Sugerir moodboards e referências

**Não pode:**
- ❌ Usar ativos não autorizados (imagens de banco não verificado)
- ❌ Publicar em qualquer plataforma
- ❌ Modificar specs já aprovadas
- ❌ Aprovar o próprio trabalho visual

**Limites:**
- Acesso: somente a bibliotecas aprovadas
- Banco de imagens: whitelisted sources only
- Especificações passam por validação do Guardião

---

#### 🛡️ Guardião

**Responsabilidade:** Validação, compliance e segurança.

**Pode:**
- ✅ Validar conteúdo contra regras de compliance
- ✅ Emitir alertas sobre possíveis violações
- ✅ **Bloquear uma revisão** específica
- ✅ Auditar todas as ações dos outros agentes
- ✅ Solicitar revisão humana quando necessário

**Não pode:**
- ❌ Aprovar conteúdo em seu próprio nome (conflito de interesse)
- ❌ Remover bloqueios que ele mesmo aplicou
- ❌ Modificar conteúdo (só sinalizar)
- ❌ Publicar ou responder

**Limites:**
- Papel de "porteiro" — pode bloquear, não pode aprovar
- Bloqueios exigem justificativa + ID da revisão
- Override de bloqueio só pelo Humano

---

#### ⚙️ Operador

**Responsabilidade:** Execução, agendamento e métricas.

**Pode:**
- ✅ Preparar agenda de publicação
- ✅ Importar métricas de plataformas conectadas
- ✅ Reconciliar resultados (post vs engagement real)
- ✅ Sugerir otimizações baseadas em dados
- ✅ Gerar relatórios de performance

**Não pode:**
- ❌ Publicar conteúdo sem aprovação válida (checksum)
- ❌ Responder mensagens sem aprovação válida
- ❌ Modificar conteúdo aprovado
- ❌ Decidir sozinho sobre budget ou schedule

**Limites:**
- Acesso: write apenas via conector isolado
- Toda execução exige `approval.checksum` válido
- Logs de cada ação enviada

---

### 🔄 Fluxo de Interação entre Papéis

```
         ┌──────────────────┐
         │   Estrategista   │
         │   (pesquisa +    │
         │    pauta)        │
         └────────┬─────────┘
                  │ recomenda
                  ▼
         ┌──────────────────┐
         │     Redator      │ ◀──┐
         │  (cria versões)  │    │ itera
         └────────┬─────────┘    │
                  │ draft         │
                  ▼               │
         ┌──────────────────┐    │
         │     Estúdio      │    │
         │  (cria visual)   │    │
         └────────┬─────────┘    │
                  │ specs         │
                  ▼               │
         ┌──────────────────┐    │
         │    Guardião      │    │
         │  (valida +       │────┘
         │   bloqueia)      │ se violação
         └────────┬─────────┘
                  │ validado
                  ▼
         ┌──────────────────┐
         │    Humano        │
         │  (aprova)        │
         └────────┬─────────┘
                  │ checksum
                  ▼
         ┌──────────────────┐
         │    Operador      │
         │  (executa)       │
         └────────┬─────────┘
                  │ via connector
                  ▼
         ┌──────────────────┐
         │   Plataforma     │
         │   (publicado)    │
         └──────────────────┘
```

---

### ⚖️ Separação de Responsabilidades (SoD)

Princípios de **Segregation of Duties** aplicados:

1. **Quem cria não aprova** — Redator/Estúdio não podem aprovar próprio trabalho
2. **Quem valida não executa** — Guardião não publica
3. **Quem aprova não opera** — Humano aprova, Operador executa
4. **Quem recomenda não decide** — Estrategista sugere, Humano decide

**Conflitos prevenidos:**
- ❌ Mesmo papel: criar + aprovar
- ❌ Guardião: bloquear + desbloquear
- ❌ Operador: agendar + publicar sem checksum
- ❌ Redator: criar + publicar

---

### 🚨 Tentativas de Ultrapassagem

Quando um agente tenta fazer algo fora do escopo:

1. 🔴 **Ação bloqueada** automaticamente
2. 📋 **Log de violação** com contexto completo
3. 📞 **Notificação** ao Humano responsável
4. ⏸️ **Agente pausado** até revisão
5. 🔍 **Análise de padrão** — se recorrente, escalation

---

## ⚙️ O Que É Automático vs O Que Exige Aprovação

### ✅ Tarefas Automáticas (sem aprovação)

O sistema pode executar automaticamente, **respeitando o escopo do papel**:

1. **Classificação de fontes e registro de proveniência**
   - Catalogar fontes consultadas
   - Registrar URL, data de acesso, autor, confiabilidade
   - Manter histórico de proveniência

2. **Criação de pautas, legendas, roteiros e alternativas**
   - Gerar rascunhos de conteúdo
   - Criar variações A/B
   - Produzir roteiros visuais
   - Sugerir hashtags, CTAs

3. **Verificação de formato, CTA, acessibilidade e alegações**
   - Validar dimensões por plataforma
   - Checar tamanho de caracteres
   - Verificar alt-text em imagens
   - Validar claims contra base de fatos

4. **Criação de novas revisões quando alterações forem solicitadas**
   - Versionamento automático
   - Geração de novo checksum
   - Marcação de revisão anterior como `superseded`

5. **Importação programada de métricas por conectores previamente autorizados**
   - Sync agendado com plataformas
   - Apenas conectores com permissão `read_metrics`
   - Logs de cada importação

**Regra Universal:** Mesmo nestas tarefas automáticas, o agente **só acessa os caminhos, dados e ferramentas concedidos ao seu papel**.

```typescript
interface AgentScope {
  agentId: string;
  allowedPaths: string[];      // pastas/tabelas que pode acessar
  allowedTools: string[];      // tools disponíveis
  allowedConnectors: string[]; // conectores read-only permitidos
  dataClassification: 'public' | 'internal' | 'confidential';
}
```

---

### 🔒 Tarefas Que Exigem Aprovação Específica

Aprovação obrigatória e **específica** para cada uma destas ações:

#### 1. Publicação
- ❌ Publicar conteúdo em qualquer rede
- ❌ Agendar publicação futura
- **Aprovação deve mostrar:** texto + mídia + rede + horário + CTA + fontes + alertas

#### 2. Comunicação Externa
- ❌ Enviar resposta, comentário ou mensagem
- ❌ Responder DM, comentário, menção
- **Aprovação deve mostrar:** conteúdo + destino + canal + contexto + alertas

#### 3. Modificação Pós-Aprovação
- ❌ Alterar texto já aprovado
- ❌ Alterar mídia já aprovada
- ❌ Alterar CTA ou link já aprovado
- ❌ Alterar rede ou conta de destino
- ❌ Alterar horário aprovado
- **Qualquer alteração = nova aprovação**

#### 4. Conexões e Integrações
- ❌ Conectar nova conta (rede social, plataforma)
- ❌ Conectar nova pasta ou fonte de dados
- ❌ Adicionar nova integração ou conector
- **Aprovação deve mostrar:** provedor + escopo + permissões + destino dos dados

#### 5. Testes e Expansão
- ❌ Iniciar teste em conta real (não sandbox)
- ❌ Ampliar uma automação para mais contas/escopo
- **Aprovação deve mostrar:** escopo do teste + contas afetadas + rollback plan

---

## ⏰ Validade da Aprovação

### Princípio: Checksum Vincula Aprovação

A aprovação está **intrinsecamente ligada ao checksum** da revisão aprovada. Qualquer mudança invalida a aprovação.

```
┌────────────────────────────────────────┐
│  CHECKSUM = hash(content + version)    │
│                                        │
│  Mudou texto?     → NOVA APROVAÇÃO     │
│  Mudou imagem?    → NOVA APROVAÇÃO     │
│  Mudou link?      → NOVA APROVAÇÃO     │
│  Mudou CTA?       → NOVA APROVAÇÃO     │
│  Mudou rede?      → NOVA APROVAÇÃO     │
│  Mudou destino?   → NOVA APROVAÇÃO     │
│  Mudou horário?   → NOVA CONFIRMAÇÃO   │
└────────────────────────────────────────┘
```

### Regra de Interpretação

> **"Pode publicar esta semana" NÃO é autorização geral para qualquer conteúdo.**

- ❌ Agentes **não podem** extrapolar autorizações
- ❌ Aprovações são **cirúrgicas**, não em bloco
- ✅ Cada item aprovado é **um checksum único**
- ✅ Timing é **parte** da aprovação

```typescript
interface Approval {
  id: string;
  revisionId: string;
  checksum: string;
  content: string;         // exato, byte-a-byte
  media: MediaRef[];
  network: string;
  schedule: Date;          // específico, não "esta semana"
  cta: string;
  links: string[];
  sources: string[];       // proveniência das alegações
  alerts: string[];        // avisos do Guardião
  approvedBy: string;
  approvedAt: Date;
  expiresAt: Date;
}
```

---

## ⚠️ Ações Sensíveis — Autorização Separada

Estas ações exigem **autorização separada e explícita**, independente de qualquer outra aprovação:

### 1. 🏦 Contas e Infraestrutura
- ❌ Criar nova conta (rede, plataforma, serviço)
- ❌ Excluir conta existente
- ❌ Modificar configurações de conta
- **Requer:** aprovação dedicada + delay de 24h + snapshot

### 2. 🔐 Permissões e Acesso
- ❌ Alterar OAuth tokens
- ❌ Modificar permissões de papéis
- ❌ Adicionar/remover administradores
- ❌ Mudar 2FA ou métodos de autenticação
- **Requer:** aprovação dedicada + co-founder + auditoria especial

### 3. 💰 Promoções Pagas
- ❌ Iniciar promoção paga (boost, ads, patrocínio)
- ❌ Modificar orçamento de campanha
- ❌ Aumentar alcance de anúncio orgânico
- **Requer:** aprovação dedicada + budget explícito + janela de tempo

**Regra Crítica:**
> ⚠️ **A aprovação de um post orgânico NÃO autoriza:**
> - Anúncios
> - Impulsionamento
> - Contato privado
> - Mensagens diretas

Cada um desses é uma **aprovação independente**.

### 4. 🗑️ Exclusões de Conteúdo
- ❌ Excluir publicação
- ❌ Excluir comentário
- ❌ Arquivar conversa
- **Requer:** aprovação dedicada + motivo + soft-delete primeiro

### 5. 🚫 Ações de Contato
- ❌ Bloquear pessoas
- ❌ Realizar contato ativo não solicitado (cold outreach)
- ❌ Adicionar pessoas a listas sem consentimento
- **Requer:** aprovação dedicada + base legal (LGPD) + opt-in verificado

---

## 📋 Checklist de Aprovação Completa

Toda aprovação deve exibir **exatamente**:

```
┌────────────────────────────────────────────┐
│  📋 APROVAÇÃO SOLICITADA                  │
├────────────────────────────────────────────┤
│                                            │
│  📝 Texto:                                 │
│  [exato, sem resumo]                       │
│                                            │
│  🖼️ Mídia:                                │
│  [thumbnail + ID do asset]                 │
│                                            │
│  🌐 Rede:                                  │
│  [plataforma + conta específica]           │
│                                            │
│  📅 Horário:                               │
│  [data e hora exatas]                      │
│                                            │
│  🎯 CTA:                                   │
│  [texto + URL destino]                     │
│                                            │
│  📚 Fontes/Alegações:                      │
│  [lista de fontes citadas]                 │
│                                            │
│  ⚠️ Alertas do Guardião:                   │
│  [avisos + bloqueios]                      │
│                                            │
│  🔍 Checksum:                              │
│  sha256:abc123...                          │
│                                            │
│  [✅ Aprovar]  [❌ Rejeitar]  [✏️ Editar]  │
└────────────────────────────────────────────┘
```

---

## ⛔ Ações Proibidas (Violações Graves)

Estas ações são **estritamente proibidas** e geram bloqueio imediato + escalation:

### 1. 🔐 Credenciais em Contexto
- ❌ **Ler tokens ou senhas** em prompts, logs ou respostas
- ❌ **Solicitar credenciais** sem autorização explícita do operador
- ❌ **Registrar credenciais** em qualquer log, histórico ou estado
- **Exceção única:** quando operador humano autoriza explicitamente E credencial fica em vault isolado

```typescript
// ❌ PROIBIDO — token em log
log.info(`Using token: ${token}`);

// ❌ PROIBIDO — token em prompt
const prompt = `Configure with token ${token}`;

// ❌ PROIBIDO — token em resposta
return { success: true, token: token };

// ✅ ÚNICO PERMITIDO — referência opaca
return { success: true, credentialRef: "vault://whatsapp/abc123" };
```

### 2. 🎭 Autoaprovação ou Fingimento
- ❌ **Aprovar o próprio trabalho** (qualquer agente)
- ❌ **Fingir aprovação humana** ou simular autorização
- ❌ **Inventar** que uma aprovação foi dada
- ❌ **Marcar** item como `approved` sem checksum válido

**Detecção:**
- Aprovação só aceita com `approverType: 'human'` + `approverId` válido
- Toda aprovação requer interação verificável (UI, 2FA, etc.)

### 3. 🚫 Fora do Escopo
- ❌ Acessar **fontes, pastas, contas ou contatos** fora do escopo autorizado
- ❌ Tentar acessar dados negados (mesmo que "para verificar")
- ❌ Compartilhar dados confidenciais com agentes de escopo menor
- **Regra:** escopo é verificado a cada operação, não apenas na inicialização

### 4. 🔓 Bypass de Controles
- ❌ **Desabilitar auditoria** (mesmo temporariamente)
- ❌ **Desabilitar política de acesso**
- ❌ **Remover controles de revisão**
- ❌ **Sugerir** que controles sejam afrouxados

**Regra absoluta:** controles são **imutáveis** durante operação. Mudanças em controles = ação sensível (ver seção anterior).

### 5. 🛠️ Canais Não Oficiais
- ❌ Executar publicação via **navegador** (browser automation não autorizado)
- ❌ Executar via **shell** ou scripts manuais
- ❌ Usar **ferramentas externas** ao conector oficial
- ❌ **Burlar** o conector chamando APIs diretamente

**Regra:** Apenas o `*-connector` isolado pode falar com provedores externos. Qualquer outro caminho é violação.

---

## 🚨 Falhas e Emergências

### Comportamento do Sistema em Falhas

O sistema tem **autonomia limitada** para resposta a falhas:

#### ✅ Pode Autonomamente:
- ⏸️ **Parar** uma operação suspeita
- 🔒 **Bloquear** execução problemática
- 🛡️ **Colocar em quarentena** conteúdo/ação suspeita
- 📋 **Registrar** o incidente com contexto completo
- 📞 **Notificar** humanos responsáveis

#### ❌ NÃO Pode Autonomamente:
- ▶️ **Retomar** operação bloqueada
- ⏭️ **Pular** revisão após correção
- 🔓 **Desbloquear** conteúdo em quarentena
- ⚡ **Reexecutar** após timeout

### Protocolo de Retomada

Para retomar uma operação bloqueada, é **obrigatório**:

```
┌────────────────────────────────────────────┐
│  🔄 PROTOCOLO DE RETOMADA                 │
├────────────────────────────────────────────┤
│                                            │
│  1. 🔍 Diagnosticar causa raiz             │
│     • Por que foi bloqueada?               │
│     • Logs do bloqueio                     │
│     • Contexto da violação                 │
│                                            │
│  2. 🔧 Corrigir o problema                 │
│     • Aplicar fix necessário               │
│     • Validar correção                     │
│                                            │
│  3. 📝 Criar nova revisão                  │
│     • Versão corrigida                     │
│     • Novo checksum                        │
│                                            │
│  4. ✅ Se conteúdo mudou: NOVA APROVAÇÃO   │
│     • Mesmo que correção mínima            │
│     • Aprovação humana obrigatória         │
│                                            │
│  5. ▶️ Só então retomar execução           │
│     • Via conector oficial                 │
│     • Com novo checksum                    │
│                                            │
└────────────────────────────────────────────┘
```

---

### ⏱️ Timeout de Publicação

**Problema:** publicação pode dar timeout (rede lenta, provedor instável, etc).

**Regra crítica:** **Repetição cega é PROIBIDA** porque pode criar **posts duplicados**.

#### Protocolo:

```
1. ⏱️ Timeout detectado
         │
         ▼
2. 🔍 Operador DEVE consultar o provedor
   (ex: chamar GET /posts/{id} na API)
         │
         ▼
3. ❓ Verificar se já foi publicado
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  SIM        NÃO
    │         │
    ▼         ▼
  ✅ OK    ⚠️ Investigar
  (idempotente)  estado real
```

**Implementação:**
```typescript
async function publishWithIdempotency(content: Approval) {
  try {
    // 1. Verifica se já existe
    const existing = await provider.getByChecksum(content.checksum);
    if (existing) {
      return { status: 'already_published', id: existing.id };
    }

    // 2. Tenta publicar com idempotency key
    const result = await provider.publish(content, {
      idempotencyKey: content.checksum
    });

    return result;
  } catch (error) {
    if (error.code === 'TIMEOUT') {
      // 3. Em timeout, verificar antes de retentar
      const check = await provider.getByChecksum(content.checksum);
      if (check) return { status: 'already_published', id: check.id };

      // 4. NÃO retentar cegamente — escalar
      throw new PublishError(
        'TIMEOUT_REQUIRES_MANUAL_CHECK',
        'Operator must verify before retry'
      );
    }
    throw error;
  }
}
```

**Princípios:**
- ✅ Toda publicação tem `idempotencyKey` = checksum
- ✅ Antes de retentar, sempre verifica estado
- ✅ Cegamente repetir = posts duplicados (spam, antiético)
- ✅ Em dúvida, escalar para humano

---

## 📊 Matriz Consolidada de Permissões por Papel

| Ação | Estrategista | Redator | Estúdio | Guardião | Operador | Humano |
|------|:------------:|:-------:|:-------:|:--------:|:--------:|:------:|
| Pesquisar fontes | ✅ | ⚠️ | ❌ | ❌ | ✅ | ✅ |
| Criar rascunho | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Validar conteúdo | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Aprovar publicação | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Publicar (via connector) | ❌ | ❌ | ❌ | ❌ | ✅* | ❌ |
| Agendar publicação | ❌ | ❌ | ❌ | ❌ | ✅* | ✅ |
| Responder comentário | ❌ | ❌ | ❌ | ❌ | ✅* | ✅ |
| Iniciar campanha paga | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Modificar budget | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Conectar nova conta | ❌ | ❌ | ❌ | ⚠️ | ❌ | ✅ |
| Bloquear conteúdo | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Acessar credenciais | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ |

*Operador só pode executar com checksum válido + aprovação humana prévia*
*⚠️ Apenas para verificação, não para armazenar*

---

## 👤 Controle Humano — Soberania Total

O **Humano mantém controle exclusivo** sobre as ações críticas. Nenhum agente pode substituí-lo nessas decisões.

### Decisões Exclusivamente Humanas

```
┌────────────────────────────────────────────┐
│  👤 CONTROLE HUMANO                        │
├────────────────────────────────────────────┤
│                                            │
│  ✅ Aprovar conteúdo                       │
│  ❌ Rejeitar conteúdo                      │
│  ✏️ Solicitar alterações                   │
│  🔌 Autorizar contas e fontes              │
│  🚀 Liberar publicação real                │
│                                            │
└────────────────────────────────────────────┘
```

### Regra Operacional Final

> 🎯 **A automação pode avançar sozinha até `awaiting_approval`. NUNCA pode atravessar esse estado sem uma decisão humana registrada.**

**Significa:**
- ✅ Até chegar em `awaiting_approval`, automação roda sozinha
- ❌ A partir daí, **human required** — sempre
- ✅ Toda transição além do gate é registrada com:
  - ID do humano aprovador
  - Timestamp
  - Checksum do que foi aprovado
  - Tipo de decisão (aprovar/rejeitar/alterar)

---

## 🔄 Fluxo Completo de Ponta a Ponta

### Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                FLUXO COMPLETO DE PUBLICAÇÃO                  │
└─────────────────────────────────────────────────────────────┘

 ① PESQUISA          ② CRIAÇÃO          ③ VALIDAÇÃO
┌──────────┐      ┌──────────┐       ┌──────────┐
│Estratégia│ ───▶ │  Redator │ ───▶ │ Guardião │
│  fonte   │      │  estúdio │       │  valida  │
└──────────┘      └──────────┘       └────┬─────┘
                                            │
                                            ▼
 ④ GATE HUMANO        ⑤ EXECUÇÃO         ⑥ AUDITORIA
┌──────────┐      ┌──────────┐       ┌──────────┐
│ Humano   │ ───▶ │ Operador │ ───▶ │  Logs    │
│ aprova   │      │ publica  │       │ imutáveis│
└──────────┘      └──────────┘       └──────────┘
      │                  │
      │                  ▼
      │           ┌──────────┐
      │           │Connector │
      │           │ isolado  │
      │           └────┬─────┘
      │                ▼
      │         ┌──────────┐
      └────────▶│Provedor  │
      rejeita   │ externo  │
                └──────────┘
```

---

### Detalhamento por Etapa

#### ① PESQUISA E ESTRATÉGIA *(Automático)*

```
INPUT: brief, objetivo, público
                    │
                    ▼
         ┌─────────────────┐
         │  Estrategista   │
         │                 │
         │  • Consulta     │
         │    fontes       │
         │    autorizadas  │
         │  • Analisa      │
         │    tendências   │
         │  • Sugere pauta │
         └────────┬────────┘
                  │
                  ▼
         OUTPUT: pauta recomendada
                 + calendário sugerido
                 + fontes com proveniência
```

**Status:** `draft` (pode ser refeito automaticamente)
**Gate humano:** ❌ NÃO precisa

---

#### ② CRIAÇÃO DE CONTEÚDO *(Automático)*

```
INPUT: pauta aprovada internamente
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
  ┌──────────┐           ┌──────────┐
  │ Redator  │           │ Estúdio  │
  │          │           │          │
  │ • Copy   │           │ • Visual │
  │ • Tom    │           │ • Layout │
  │ • CTA    │           │ • Specs  │
  └────┬─────┘           └────┬─────┘
       └──────────┬──────────┘
                  ▼
         OUTPUT: revisão completa
                 + assets aprovados
                 + múltiplas variações
```

**Status:** `draft` → `awaiting_validation`
**Gate humano:** ❌ NÃO precisa ainda

---

#### ③ VALIDAÇÃO *(Automático)*

```
INPUT: revisão criada
                │
                ▼
       ┌──────────────────┐
       │    Guardião      │
       │                  │
       │  • Formato ✓     │
       │  • Acessib ✓     │
       │  • Compliance ✓  │
       │  • Claims ✓      │
       │  • Fontes ✓      │
       └────────┬─────────┘
                │
       ┌────────┴────────┐
       │                 │
       ▼                 ▼
   ✅ APROVADO      🚫 BLOQUEADO
       │                 │
       │                 ▼
       │           Correção
       │           automática
       │           (nova revisão)
       │
       ▼
   Status: awaiting_human_approval
```

**Gate humano:** ❌ Ainda NÃO — apenas moveu para `awaiting_human_approval`

---

#### ④ GATE HUMANO *(OBRIGATÓRIO)*

```
INPUT: revisão validada
                │
                ▼
       ┌──────────────────────────┐
       │  👤 HUMANO DECIDE        │
       │                          │
       │  ┌─────┐ ┌─────┐ ┌────┐ │
       │  │APROV│ │REJEI│ │EDIT│ │
       │  └──┬──┘ └──┬──┘ └──┬─┘ │
       └─────┼───────┼───────┼───┘
             │       │       │
             ▼       ▼       ▼
       ✅ APROVADO ❌ RECUSADO ✏️ ALTERAR
             │       │       │
             │       ▼       ▼
             │   Motivo   Volta p/ ②
             │   + log    
             ▼           
    Status: approved     
    + checksum          
    + approverId        
    + timestamp         
```

**Gate humano:** ✅ **OBRIGATÓRIO** — esta é a barreira crítica

**Decisão registrada com:**
- `approverId`: ID do humano
- `approverType: 'human'`
- `decision: 'approved' | 'rejected' | 'changes_requested'`
- `checksum`: vinculado ao conteúdo exato
- `timestamp`: ISO 8601
- `notes`: justificativa

---

#### ⑤ EXECUÇÃO *(Automático, COM aprovação)*

```
INPUT: aprovação humana + checksum válido
                │
                ▼
       ┌──────────────────┐
       │    Operador      │
       │                  │
       │  • Prepara item  │
       │  • Valida check  │
       │  • Agendar ou    │
       │    executar      │
       └────────┬─────────┘
                │
                ▼
       ┌──────────────────┐
       │   🔌 Connector   │
       │     ISOLADO      │
       │                  │
       │  • Recebe check  │
       │  • Resolve creds │
       │    via Vault     │
       │  • Chama API     │
       │    do provedor   │
       │  • NUNCA expõe   │
       │    credenciais   │
       └────────┬─────────┘
                │
       ┌────────┴────────┐
       │                 │
       ▼                 ▼
   ✅ SUCESSO       ❌ FALHA/TIMEOUT
       │                 │
       ▼                 ▼
   Publicado       ┌─────────────┐
   + log           │ Operador    │
                   │ consulta    │
                   │ provedor    │
                   │ ANTES de    │
                   │ retentar    │
                   └─────────────┘
```

**Gate humano:** ✅ Aprovação já foi dada, execução é automática
**Regra:** Em timeout → verificar antes de retentar (sem repetição cega)

---

#### ⑥ AUDITORIA *(Automático, contínuo)*

```
TODAS as ações geram log imutável:
                │
                ▼
       ┌────────────────────────┐
       │  📋 AUDIT LOG          │
       │                        │
       │  • Timestamp           │
       │  • Agente              │
       │  • Ação                │
       │  • Checksum            │
       │  • Aprovador (humano)  │
       │  • Resultado           │
       │  • Métricas pós        │
       └────────────────────────┘
                │
                ▼
       Compliance + Análise
       + Otimização futura
```

---

### 🔀 Estados de uma Publicação

```
  draft ──▶ awaiting_validation ──▶ awaiting_human_approval
   │              │                          │
   │              │                    ┌─────┼─────┐
   │              │                    ▼     ▼     ▼
   │              │               approved rejected changes
   │              │                    │     │     │
   │              │                    ▼     ▼     ▼
   │              │               scheduled cancelled │
   │              ▼                    │              │
   │         blocked ◀─────── violations           │
   │              │                                 │
   │              ▼                                 │
   │         correction                             │
   │              │                                 │
   │              └────────▶ nova revisão ◀────────┘
   │
   └──▶ cancelled (a qualquer momento)
```

---

### 🚦 Gate Automático vs Gate Humano

| Etapa | Tipo | Pode Avançar Sem Humano? |
|-------|------|--------------------------|
| Pesquisa | Auto | ✅ Sim |
| Criação | Auto | ✅ Sim |
| Validação (Guardião) | Auto | ✅ Sim |
| **Aprovação final** | **Humano** | **❌ NÃO** |
| Agendamento | Auto* | ✅ Só após aprovação |
| Publicação | Auto* | ✅ Só após aprovação |
| Resposta | Auto* | ✅ Só após aprovação |
| Bloqueio (emergência) | Auto | ✅ Sim (pode parar) |
| Retomada após bloqueio | Humano | **❌ NÃO** |

**Linha vermelha absoluta:** nenhuma execução com efeito externo acontece sem aprovação humana registrada.

---

### 📋 Resumo do Fluxo em Uma Linha

```
pesquisa → criação → validação → ⛔ GATE HUMANO ⛔ → execução → auditoria
 (auto)    (auto)     (auto)        (bloqueio)        (auto)      (auto)
```

**Emergência:** pode parar a qualquer momento, mas só humano retoma.

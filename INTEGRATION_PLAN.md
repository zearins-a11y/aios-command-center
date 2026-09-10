# Plano de Integração: AIOS Command Center + Automated Agentic AI Web Agency

**Data:** Setembro 2026
**Status:** Pronto para implementação
**Tempo estimado:** 4 semanas (1 semana por fase)

---

## Resumo Executivo

O projeto "Automated Agentic AI Web Agency" representa uma implementação madura de um sistema multi-agente com pipeline completo para automação de agências web. Com **15 agentes especializados**, o sistema demonstra padrões robustos de arquitetura que podem ser adaptados ao AIOS Command Center.

O projeto deles utiliza **Bun + Hono** para o backend (performance superior), **Supabase** como database com realtime subscriptions, e um sistema de filas baseado em banco de dados com **HITL via Telegram**.

**Impacto esperado:** Elevação do Command Center de um dashboard de visualização para um verdadeiro centro de controle operacional com capacidades de governance em tempo real, pause/resume de agentes, e HITL via Telegram integrado ao painel de aprovações existente.

---

## Análise do Projeto Origem

### Stack Técnica

| Aspecto | Projeto Deles | AIOS Command Center | Compatibilidade |
|---------|---------------|---------------------|-----------------|
| **Runtime** | Bun | Node.js (via Vite) | Diferente, mas API é HTTP |
| **Backend** | Hono | N/A (React SPA) | Podem coexistir |
| **Frontend** | Vanilla JS + Vite | React + Vite + Tailwind | Similar |
| **State** | Supabase Realtime | Zustand | Podemos integrar Supabase |
| **Database** | Supabase (PostgreSQL) | LocalStorage/Zustand | Supabase pode ser adicionado |
| **SSE** | Hono streaming | N/A | Implementar |
| **MCP Servers** | Stripe, Supabase, Vercel | Nenhum ainda | Adicionar |

### Arquitetura

```
+------------------------------------------------------------------+
|                   AIOS COMMAND CENTER (React)                     |
|  +----------------+  +------------------+  +-------------------+  |
|  | Governance     |  | Workspaces       |  | Projects          |  |
|  | - ApprovalQueue|  | - Queue Panel    |  | - Lead Cards      |  |
|  | - RiskScore    |  | - Stats Panel    |  | - Sprint Board    |  |
|  +-------+--------+  +--------+---------+  +---------+---------+  |
|          |                    |                       |           |
|          +--------------------+-----------------------+           |
|                          | SSE / WebSocket                        |
+-------------------------+---------------------------------------+

+------------------------------------------------------------------+
|                   SUPABASE (novo)                                 |
|  +----------+  +-----------+  +------------+  +----------------+  |
|  | workspaces|  | projects  |  | queue_items|  | agent_logs     |  |
|  +----------+  +-----------+  +------------+  +----------------+  |
|                                                                  |
|  +------------------------------------------------------------+  |
|  | Realtime Subscriptions - Updates instantâneos               |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
|                   TELEGRAM BOT (HITL Integration)                  |
|  +------------------------------------------------------------+  |
|  | Inline keyboards: Approve/Reject/Skip/Pause                |  |
|  | Comandos: /status, /queues, /pause, /resume, /stats        |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### Agentes (15 especializados)

| Agente | Função | Integracao CC |
|--------|--------|---------------|
| Scout | Descoberta via Google Places | Não reusar |
| Verifier | Validação leads | Adaptar para project validation |
| Copywriter | Brief criativo | Adaptar para content generation |
| Builder | Gera sites via Claude Code | Adaptar para code generation |
| Code Reviewer | Revisa qualidade | Adaptar para code review |
| SEO | Otimiza SEO | Adaptar para seo-audit skill |
| Deployer | Deploy Vercel | Adaptar para deployment |
| Emailer | Outreach via Resend | Adaptar para email workflows |
| Caller | Ligacoes via Bland.ai | Não reusar |
| Follow-up | Acompanhamento | Adaptar para nurture |
| Closer | Fechamento deals | Não reusar |
| SMS | SMS via Twilio | Adaptar para notifications |
| WhatsApp | WhatsApp via Twilio | Adaptar para notifications |
| Monitor | Health checks | Adaptar para agent health |
| Delivery | Pos-venda | Não reusar |

---

## Padrões Reutilizáveis

### 🟢 Reuso Direto

#### 1. Sistema de Queue com Supabase

O sistema de filas usa Supabase com atomic updates para evitar race conditions.

```typescript
// Adaptado para AIOS Command Center
export async function enqueueTask(opts: {
  workspaceId: string;
  agentType: AgentRole;
  taskData: Record<string, unknown>;
  priority?: number;
  hitlRequired?: boolean;
}) {
  const { data, error } = await supabase
    .from('aios_queue_items')
    .insert({
      workspace_id: opts.workspaceId,
      agent_type: opts.agentType,
      task_data: opts.taskData,
      priority: opts.priority || 0,
      status: opts.hitlRequired ? 'pending_approval' : 'pending',
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to enqueue: ${error.message}`);
  
  if (opts.hitlRequired) {
    await notifyQueueApproval({ id: data.id, agent_type: opts.agentType }, opts.taskData);
  }

  return data.id;
}

// Dequeue atômico - previne race conditions
export async function dequeueTask(agentType: AgentRole): Promise<QueueItem | null> {
  const { data, error } = await supabase
    .from('aios_queue_items')
    .select('*')
    .eq('agent_type', agentType)
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) return null;

  const { data: updated } = await supabase
    .from('aios_queue_items')
    .update({ status: 'processing', updated_at: new Date().toISOString() })
    .eq('id', data.id)
    .eq('status', 'pending') // Condição atômica
    .select()
    .single();

  return updated as QueueItem || null;
}
```

#### 2. Sistema de Logging Centralizado

```typescript
export async function agentLog(
  agent: string,
  message: string,
  opts: { workspaceId?: string; projectId?: string; level?: 'info' | 'success' | 'warn' | 'error' } = {}
) {
  await supabase.from('agent_logs').insert({
    agent,
    message,
    workspace_id: opts.workspaceId || null,
    project_id: opts.projectId || null,
    level: opts.level || 'info',
    created_at: new Date().toISOString(),
  });
  
  broadcastSSE({ type: 'log', agent, message, level: opts.level });
}
```

#### 3. HITL via Telegram com Inline Keyboards

```typescript
export async function notifyQueueApproval(item: QueueItem, taskData: any) {
  const telegram = requireTelegram();
  
  const keyboard = {
    inline_keyboard: [[
      { text: 'Aprovar', callback_data: `approve_${item.id}` },
      { text: 'Rejeitar', callback_data: `reject_${item.id}` },
    ], [
      { text: 'Pausar Fila', callback_data: `pause_${item.queue_name}` }
    ]]
  };

  await telegram.sendMessage(ADMIN_ID,
    `HITL: ${item.agent_type}\n` +
    `Workspace: ${taskData.workspaceName}\n` +
    `Tarefa: ${taskData.description}`,
    { parse_mode: 'Markdown', reply_markup: keyboard }
  );
}
```

#### 4. Cross-Check Ranker ✅ **JÁ IMPLEMENTADO**

Implementado em `/src/utils/crossCheckRanker.ts`:
- Score de risco 0-100 com breakdown
- Priorização: critical > high > medium > low
- Fatores: reach (30%), severity (40%), false positive (20%), urgency (10%)
- Badge visual com animação

### 🟡 Reuso com Modificações

#### 1. Orchestrator - Claude Code Subprocess
Usar como base para agent spawning via Claude Code API.

#### 2. Cron System para Queue Processing
Adaptar para Web Workers ou polling intervals no Zustand store.

#### 3. Business Hours Enforcement
Configurar janelas de operação para diferentes regiões.

#### 4. Lead Card - Para Project Cards
Adaptar estrutura para `ProjectCard.tsx` existente.

### 🔴 Não Reusar

- Scout, Caller, Closer, Delivery (específicos de web agency)
- Stripe Integration (específico para pagamentos)
- Bland.ai / Twilio / Resend (APIs específicas)
- Dashboard Pixel Art Office (visual muito específico)

---

## Plano de Implementação

### Fase 1: Fundação (1 semana)

- [ ] Criar projeto Supabase
- [ ] Executar migrations do schema
- [ ] Configurar Realtime para tables
- [ ] Instalar `@supabase/supabase-js`

```sql
-- Workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Queue Items
CREATE TABLE aios_queue_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id),
  agent_type TEXT NOT NULL,
  task_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  error TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Logs
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id),
  project_id UUID,
  agent TEXT NOT NULL,
  level TEXT DEFAULT 'info',
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_queue_status ON aios_queue_items(status);
CREATE INDEX idx_queue_agent_type ON aios_queue_items(agent_type);
CREATE INDEX idx_logs_created ON agent_logs(created_at DESC);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE aios_queue_items;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_logs;
```

### Fase 2: HITL Integration (1 semana)

- [ ] Criar Telegram bot com BotFather
- [ ] Implementar webhook ou polling
- [ ] Integrar com Governance Panel
- [ ] Comandos: `/start`, `/status`, `/queues`, `/pause`, `/resume`

### Fase 3: Queue System (1 semana)

- [ ] Implementar `getConcurrency()` e `setConcurrency()`
- [ ] Criar `QueueWorkerPanel` component
- [ ] Adicionar pause/resume global
- [ ] Error handling e retry logic

### Fase 4: Live Dashboard (1 semana)

- [ ] `StatsPanel` com dados do Supabase
- [ ] Pipeline visualization em tempo real
- [ ] Log feed com filtros
- [ ] Notification center

---

## MCP Servers Recomendados

| MCP Server | Integracao |
|------------|------------|
| supabase | Database + Realtime |
| vercel | Deployment integration |
| stripe | Billing (futuro) |

---

## Próximos Passos Imediatos

1. **Criar projeto Supabase** e executar migrations
2. **Instalar:** `npm install @supabase/supabase-js`
3. **Criar:** `src/lib/supabase.ts` com cliente
4. **Implementar:** `src/utils/sse.ts` com reconnect
5. **Estender:** `useGovernanceStore.ts` para usar Supabase

---

## Riscos e Considerações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Supabase realtime latência | Média | Baixo | Fallback para polling |
| Telegram bot rate limits | Baixa | Médio | Batch notifications |
| Race conditions em dequeues | Baixa | Alto | Uuid + atomic updates |
| Complexidade de integração | Média | Médio | Fases incrementais |

---

**Fonte:** Análise detalhada de `/Users/josemoreiraarinsjr/Documents/ChatGPT/TEAM TESTE/local-agent-command-center`

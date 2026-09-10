# AIOS Command Center - Specification Document

## 1. Concept & Vision

**AIOS Command Center** é um dashboard de controle avançado para orquestrar múltiplos projetos com squads de agentes AI e XQuads. O sistema proporciona uma experiência de "centro de comando espacial" - escuro, sofisticado e com informações em tempo real. A interface transmite poder, controle e clareza, permitindo que líderes de projeto gerenciem múltiplos squads especializados com facilidade.

A estética é inspirada em dashboards de controle de missão, com um tema escuro premium que facilita longas sessões de trabalho e destaca métricas e alertas com cores vibrantes.

## 2. Design Language

### Aesthetic Direction
- **Referência**: Centro de controle espacial / Dashboard de missão NASA
- **Estilo**: Dark mode premium com acentos neon sutis
- **Atmosfera**: Profissional, poderoso, futurista mas funcional

### Color Palette
```css
--bg-primary: #0a0a0f;      /* Fundo principal - quase preto */
--bg-secondary: #1a1a2e;    /* Fundo secundário - azul escuro */
--bg-card: #1e1e32;         /* Cards - roxo escuro */
--bg-card-hover: #252540;   /* Card hover - roxo mais claro */
--border: #2d2d44;          /* Bordas padrão */
--border-hover: #3d3d5c;    /* Bordas hover */
--primary: #6366f1;         /* Indigo - ações principais */
--primary-hover: #7c7ff2;   /* Indigo hover */
--secondary: #8b5cf6;       /* Roxo - elementos secundários */
--accent: #06b6d4;          /* Cyan - destaques e links */
--success: #22c55e;         /* Verde - status ativo/sucesso */
--warning: #eab308;         /* Amarelo - alertas */
--error: #ef4444;           /* Vermelho - erros */
--text: #e2e8f0;            /* Texto principal */
--text-muted: #94a3b8;      /* Texto secundário */
--text-dim: #64748b;        /* Texto terciário */
```

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**:
  - H1: 32px, 700 weight
  - H2: 24px, 600 weight
  - H3: 18px, 600 weight
- **Body**: 14px, 400 weight
- **Small/Labels**: 12px, 500 weight
- **Monospace (logs)**: JetBrains Mono

### Spatial System
- **Base unit**: 4px
- **Spacing scale**: 4, 8, 12, 16, 20, 24, 32, 48, 64px
- **Border radius**:
  - Small: 6px (buttons, inputs)
  - Medium: 8px (cards)
  - Large: 12px (modals, panels)
- **Card padding**: 16-24px
- **Grid gap**: 16px

### Motion Philosophy
- **Hover transitions**: 200ms ease
- **Expand/collapse**: 300ms ease-out
- **Loading pulse**: 2s infinite
- **Live indicator**: 1s blink animation
- **Page transitions**: 300ms fade-in
- **Micro-interactions**: scale(1.02) on hover for cards

### Visual Assets
- **Icons**: Lucide React (linhas finas, consistentes)
- **Status indicators**: Círculos coloridos com glow sutil
- **Progress bars**: Gradientes sutis
- **Avatars**: Círculos com gradiente de fundo

## 3. Layout & Structure

### Page 1: Portfolio (Tela Inicial)
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Logo + Nav + User                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HERO: "AIOS Command Center" + Subtítulo                    │
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ Card 1  │ │ Card 2  │ │ Card 3  │ │ + Novo  │          │
│  │ Doniq   │ │Meu Site │ │App Mob. │ │ Projeto │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                             │
│  [Mais cards se necessário - grid responsivo]               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Page 2: Project Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: ← Voltar | [Nome Projeto] | Status Badge | ⚙️ | 🔔 │
├────────┬───────────────────────────────────────┬───────────┤
│        │                                       │           │
│SIDE-   │  AGENT CARDS (grid central)           │  CHAT     │
│BAR     │                                       │  PANEL    │
│        │  ┌────────┐ ┌────────┐ ┌────────┐    │           │
│Squads  │  │ Agent  │ │ Agent  │ │ Agent  │    │ Suggestions│
│Tree    │  │ Card   │ │ Card   │ │ Card   │    │ & Actions │
│        │  └────────┘ └────────┘ └────────┘    │           │
│240px   │                                       │ 320px     │
│        │  STATUS GRID (3x3)                    │           │
│        │  ○ ○ ○  ○ ○ ●  ○ ○ ○                  │           │
│        │                                       │           │
├────────┴───────────────────────────────────────┴───────────┤
│ CONSOLE: Logs em tempo real                    [320px]      │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Strategy
- **Desktop (1440px+)**: Layout completo 3 colunas
- **Laptop (1024-1439px)**: Chat panel colapsável
- **Tablet (768-1023px)**: Sidebar colapsável, chat em modal
- **Mobile (< 768px)**: Layout vertical, navegação em tabs

## 4. Features & Interactions

### 4.1 Portfolio Page

#### Project Cards
- **Display**: Nome, descrição (truncada), status badge, progresso (0-100%), última atividade (relative time)
- **Hover**: Elevação + borda colorida com glow
- **Click em "Abrir"**: Navega para dashboard do projeto
- **Click no card**: Também abre o projeto

#### Novo Projeto Button
- **Visual**: Grande, destacado com ícone "+"
- **Hover**: Scale up + glow
- **Click**: Abre modal de criação

#### Modal de Novo Projeto
- **Campos**: Nome, Descrição, Squads inicial (multi-select)
- **Validação**: Nome obrigatório (min 3 chars)
- **Botões**: Cancelar | Criar Projeto

### 4.2 Project Dashboard

#### Header
- **Voltar**: Seta para portfolio
- **Nome do Projeto**: Título editável (inline)
- **Status Badge**: Dropdown (Ativo, Pausado, Erro)
- **Settings**: Abre modal de configurações
- **Notifications**: Badge com count, dropdown de alertas

#### Sidebar - Hierarquia de Squads
- **Estrutura em árvore**: C-Level > Squads > Agentes
- **Expand/Collapse**: Click no nome ou ícone
- **Badge de contagem**: Número de agentes
- **Indicador de atividade**: Pulso verde se algum agente está ativo
- **Hover**: Background highlight
- **Click em agente**: Abre card expandido no centro

#### Agent Cards
- **Layout**: Avatar + Nome + Especialidade + Status
- **Ações**: 6 botões de comando quick actions
- **Hover**: Elevação + borda accent
- **Click**: Expande para ver mais detalhes

#### Command Buttons (em cada card)
- 🚀 Build
- 📊 Analyze
- 💡 Suggest
- ✅ Validate
- 📝 Create
- 🔄 Sync

**Click**: Adiciona comando ao console, simula execução

#### Status Grid
- **Grid 3x3**: Status visual de todos os agentes
- **Cores**:
  - Verde: Disponível
  - Amarelo: Trabalhando
  - Vermelho: Erro
  - Cinza: Offline
- **Hover**: Tooltip com nome e status detalhado

#### Chat Panel (Conselheiro)
- **Header**: "🤖 CONSELHEIRO"
- **Sugestões automáticas**: Baseadas no projeto contexto
- **Cards de sugestão**:
  - Ícone de ideia
  - Texto da sugestão
  - Botões [Ação 1] [Ação 2]
- **Input**: Campo de chat com botão enviar
- **Histórico**: Scroll de mensagens anteriores

#### Console de Logs
- **Header**: 🟢 LIVE | Filtros | Busca
- **Filtros**: ALL, BUILD, ERROR, SUCCESS
- **Log entry format**: `[HH:MM:SS] [TYPE] [Source] Message`
- **Cores por tipo**:
  - INFO: text-muted
  - SUCCESS: verde
  - WARNING: amarelo
  - ERROR: vermelho
- **Auto-scroll**: Toggle no canto
- **Busca**: Input que filtra em tempo real

### 4.3 Interações Globais

#### Toast Notifications
- **Posição**: Bottom-right
- **Tipos**: Success, Error, Warning, Info
- **Auto-dismiss**: 5 segundos
- **Animação**: Slide in + fade out

#### Loading States
- **Skeleton**: Placeholder pulsante durante carregamento
- **Spinner**: Para ações de curta duração
- **Progress bar**: Para ações longas

#### Empty States
- **Ilustração**: Ícone contextual
- **Mensagem**: Descrição do que está vazio
- **CTA**: Botão para adicionar algo

## 5. Component Inventory

### UI Components

#### Button
- **Variants**: Primary, Secondary, Ghost, Danger
- **Sizes**: Small (28px), Medium (36px), Large (44px)
- **States**: Default, Hover, Active, Disabled, Loading
- **Icon support**: Left icon, Right icon, Icon only

#### Badge
- **Variants**: Status (green/yellow/red/gray), Count, Label
- **Sizes**: Small (18px), Medium (24px)
- **Optional**: Dot indicator

#### Card
- **Variants**: Default, Interactive, Expandable
- **States**: Default, Hover, Active, Selected
- **Parts**: Header, Body, Footer (opcionais)

#### Input
- **Types**: Text, Search, Textarea
- **States**: Default, Focus, Error, Disabled
- **Features**: Label, Helper text, Error message, Icon

#### Avatar
- **Sizes**: Small (24px), Medium (32px), Large (48px)
- **Variants**: Image, Initials, Icon
- **Status indicator**: Online dot

#### Dropdown
- **Trigger**: Button ou custom
- **Menu**: Lista de items com ícones
- **Features**: Sections, Dividers, Nested items

#### Modal
- **Sizes**: Small (400px), Medium (560px), Large (720px)
- **Parts**: Header, Body, Footer
- **Features**: Close button, Backdrop click, Keyboard nav

#### Tooltip
- **Positions**: Top, Bottom, Left, Right
- **Delay**: 300ms show, 0ms hide
- **Style**: Dark background, light text

### Layout Components

#### Header
- **Height**: 64px
- **Parts**: Logo, Nav items, User menu
- **Sticky**: Yes

#### Sidebar
- **Width**: 240px (expanded), 64px (collapsed)
- **Features**: Expand/collapse toggle, Nested navigation
- **Sticky**: Yes

#### ChatPanel
- **Width**: 320px
- **Features**: Header, Message list, Input
- **Collapsible**: Yes

#### Console
- **Height**: 200-320px (resizable)
- **Features**: Tabs, Filters, Search, Auto-scroll

## 6. Technical Approach

### Stack
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: Zustand
- **Animation**: Framer Motion
- **Charts**: Recharts

### Architecture
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Console.tsx
│   │   └── ChatPanel.tsx
│   ├── squads/
│   │   ├── SquadList.tsx
│   │   ├── SquadItem.tsx
│   │   └── AgentCard.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectGrid.tsx
│   │   └── CreateProjectModal.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Avatar.tsx
│       ├── Modal.tsx
│       └── Toast.tsx
├── pages/
│   ├── Portfolio.tsx
│   └── ProjectDashboard.tsx
├── stores/
│   └── useStore.ts
├── data/
│   └── squads.ts
├── types/
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

### State Management (Zustand)
```typescript
interface AppState {
  // Projects
  projects: Project[];
  currentProject: Project | null;
  createProject: (data: CreateProjectData) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // UI
  sidebarCollapsed: boolean;
  chatPanelCollapsed: boolean;
  toggleSidebar: () => void;
  toggleChatPanel: () => void;

  // Console
  logs: LogEntry[];
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;

  // Squads
  expandedSquads: string[];
  toggleSquad: (id: string) => void;
}
```

### Data Models

#### Project
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'error';
  progress: number;
  lastActivity: Date;
  squads: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Squad
```typescript
interface Squad {
  id: string;
  name: string;
  icon: string;
  parentId: string | null;
  agents: Agent[];
  color: string;
}
```

#### Agent
```typescript
interface Agent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  status: 'available' | 'working' | 'error' | 'offline';
  avatar?: string;
  commands: Command[];
}
```

#### LogEntry
```typescript
interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  source: string;
  message: string;
}
```

## 7. Sample Data

### Projects
1. **Doniq** - Sistema de controle de estoque (principal)
   - Status: Ativo, Progresso: 72%
   - Squads: AIOS, Data Squad, Copy Squad, Design Squad

2. **Meu Site** - Website institucional
   - Status: Ativo, Progresso: 45%
   - Squads: Design Squad, Copy Squad

3. **App Mobile** - Aplicativo React Native
   - Status: Pausado, Progresso: 30%
   - Squads: AIOS

### Squads Hierarchy
```
📊 C-LEVEL SQUAD
├── 🧠 ADVISORY BOARD (12 mentores)
├── ⚙️ AIOS (10 agentes: dev, qa, pm, po, sm, architect, devops, data-engineer, ux-design-expert, squad-creator)
├── 🎨 BRAND SQUAD (8 especialistas)
├── 📝 COPY SQUAD (12 copywriters)
├── 🔒 CYBERSECURITY (16 especialistas)
├── 📈 DATA SQUAD (7 analistas)
├── 🎯 DESIGN SQUAD (8 designers)
├── 💰 HORMOZI SQUAD (15 especialistas)
├── 🚀 MOVEMENT (8 estrategistas)
├── 📖 STORYTELLING (12 narradores)
└── 📢 TRAFFIC MASTERS (17 especialistas)
```

## 8. Doniq-Specific Features

O projeto Doniq deve ter tratamento especial com:

### Módulos do Sistema
- **Cadastros**: Produtos, Clientes, Fornecedores
- **Movimentações**: Entradas, Saídas
- **Utilitários**: Backup, Restore
- **Relatórios**: Estoque, Vendas, Compras, Lucros

### Squads Prioritários (highlighted)
1. **AIOS** - Para construir features
2. **Data Squad** - Métricas de estoque
3. **Copy Squad** - Descrições de produtos
4. **Design Squad** - UI/UX do sistema

### Sugestões Contextuais para Doniq
- "Sugiro priorizar o módulo de relatórios de estoque"
- "Baseado em métricas, o módulo de Vendas precisa de atenção"
- "Você sabia que o Design Squad pode melhorar a UX do sistema?"

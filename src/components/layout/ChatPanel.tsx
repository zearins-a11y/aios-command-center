import React, { useState } from 'react';
import { Send, X, MessageCircle, ChevronRight, ChevronLeft, Lightbulb, CheckCircle, ArrowRight } from 'lucide-react';
import { Button, Input, Card } from '../ui';
import { useStore } from '../../stores/useStore';
import { Suggestion } from '../../types';

export const ChatPanel: React.FC = () => {
  const {
    chatPanelCollapsed,
    toggleChatPanel,
    suggestions,
    removeSuggestion,
    currentProject,
    addLog,
    addToast,
  } = useStore();

  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'bot'; content: string }[]>([
    {
      role: 'bot',
      content: 'Olá! Sou o Conselheiro AIOS. Como posso ajudar no projeto ' + (currentProject?.name || 'atual') + '?',
    },
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    setChatHistory((prev) => [...prev, { role: 'user', content: message }]);

    // Simulate bot response
    const responses = [
      'Analisando o contexto do projeto... Posso sugerir focar na otimização do módulo de relatórios.',
      'Baseado nos dados atuais, recomendo priorizar o QA testing para garantir a qualidade.',
      'Interessante! Vou verificar as métricas mais recentes e retornar com insights.',
      'Obrigado pela mensagem! Estou processando sua solicitação...',
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    setTimeout(() => {
      setChatHistory((prev) => [...prev, { role: 'bot', content: randomResponse }]);
      addLog({
        type: 'info',
        source: 'Advisor',
        message: `Conselho gerado para: ${message.substring(0, 30)}...`,
      });
    }, 1000);

    setMessage('');
  };

  const handleSuggestionAction = (suggestion: Suggestion, action: string) => {
    if (action === 'dismiss' || action === 'snooze') {
      removeSuggestion(suggestion.id);
      addToast('info', 'Sugestão dispensada');
    } else if (action === 'apply-suggestion' || action === 'view-reports' || action === 'apply') {
      addLog({
        type: 'success',
        source: 'Advisor',
        message: `Sugestão aplicada: ${suggestion.text.substring(0, 40)}...`,
      });
      removeSuggestion(suggestion.id);
      addToast('success', 'Sugestão aplicada com sucesso!');
    } else if (action === 'learn-more') {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'bot',
          content: 'Alex Hormozi recomenda focar em ofertas de alto valor (High Ticket Offers). Isso significa criar pacotes premium que entregam resultados significativos. Quer que eu detalhe mais?',
        },
      ]);
      removeSuggestion(suggestion.id);
    } else if (action === 'analyze-funnel') {
      addLog({
        type: 'info',
        source: 'Data Squad',
        message: 'Iniciando análise do funil de vendas...',
      });
      removeSuggestion(suggestion.id);
      addToast('info', 'Análise iniciada pelo Data Squad');
    }
  };

  if (chatPanelCollapsed) {
    return (
      <button
        onClick={toggleChatPanel}
        className="w-12 bg-bg-secondary border-l border-border-default flex flex-col items-center py-4 gap-4 hover:bg-bg-card transition-colors"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
          <MessageCircle className="w-5 h-5 text-primary" />
        </div>
        <span className="text-xs text-text-dim writing-vertical">Conselheiro</span>
        <ChevronLeft size={16} className="text-text-dim mt-auto" />
      </button>
    );
  }

  return (
    <aside className="w-80 bg-bg-secondary border-l border-border-default flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Conselheiro</h3>
            <p className="text-xs text-text-dim">Sugestões & Validações</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={toggleChatPanel}>
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* Suggestions */}
      <div className="flex-1 overflow-y-auto">
        {suggestions.length > 0 && (
          <div className="p-4">
            <h4 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-3 flex items-center gap-2">
              <Lightbulb size={12} />
              Sugestões
            </h4>
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="p-3 bg-bg-card/50" hover={false}>
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">{suggestion.icon}</span>
                    <p className="text-sm text-text-primary flex-1 leading-relaxed">
                      {suggestion.text}
                    </p>
                    <button
                      onClick={() => removeSuggestion(suggestion.id)}
                      className="text-text-dim hover:text-text-muted transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {suggestion.actions.map((action, idx) => (
                      <Button
                        key={action.action}
                        variant={idx === 0 ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => handleSuggestionAction(suggestion, action.action)}
                      >
                        {action.label === 'Ver Detalhes' && <ArrowRight size={12} />}
                        {action.label === 'Analisar' && <CheckCircle size={12} />}
                        {action.label === 'Aplicar' && <CheckCircle size={12} />}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="px-4 pb-4">
          <h4 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-3">
            Ações Rápidas
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Analisar Código', icon: '🔍' },
              { label: 'Gerar Relatório', icon: '📊' },
              { label: 'Revisar Design', icon: '🎨' },
              { label: 'Otimizar Performance', icon: '⚡' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => {
                  addLog({
                    type: 'info',
                    source: 'Quick Action',
                    message: `Ação rápida: ${action.label}`,
                  });
                  addToast('info', `${action.label} iniciado`);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-bg-card rounded-md text-xs text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors"
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History */}
        <div className="px-4 pb-4 border-t border-border-default pt-4">
          <h4 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-3 flex items-center gap-2">
            <MessageCircle size={12} />
            Chat
          </h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {chatHistory.slice(1).map((chat, idx) => (
              <div
                key={idx}
                className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-xs ${
                    chat.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-bg-card text-text-primary'
                  }`}
                >
                  {chat.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border-default">
        <div className="flex gap-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button variant="primary" onClick={handleSendMessage} disabled={!message.trim()}>
            <Send size={16} />
          </Button>
        </div>
      </div>
    </aside>
  );
};

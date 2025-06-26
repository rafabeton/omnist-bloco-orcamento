// Analytics tracking para o Bloco de Orçamento
// Baseado nas melhores práticas de tracking de UX

export interface CalculatorEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export interface ProjectSelection {
  projectType: string;
  quality: string;
  area: number;
  estimate: number;
  timestamp: Date;
}

class Analytics {
  private isEnabled: boolean = false;

  constructor() {
    // Verificar se Google Analytics está disponível
    this.isEnabled = typeof window !== 'undefined' && 'gtag' in window;
  }

  // Tracking de eventos da calculadora
  trackCalculatorEvent(event: CalculatorEvent) {
    if (this.isEnabled) {
      // @ts-ignore
      gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
    }

    // Fallback: salvar no localStorage para análise posterior
    this.saveEventLocally(event);
  }

  // Tracking específico para seleção de projetos
  trackProjectSelection(selection: ProjectSelection) {
    this.trackCalculatorEvent({
      action: 'project_calculated',
      category: 'calculator',
      label: `${selection.projectType}_${selection.quality}`,
      value: selection.estimate,
    });

    // Salvar dados detalhados localmente
    this.saveProjectSelection(selection);
  }

  // Tracking de etapas da calculadora
  trackCalculatorStep(step: number, projectType?: string) {
    this.trackCalculatorEvent({
      action: 'calculator_step',
      category: 'calculator_flow',
      label: `step_${step}${projectType ? `_${projectType}` : ''}`,
      value: step,
    });
  }

  // Tracking de abandono da calculadora
  trackCalculatorAbandonment(step: number, projectType?: string) {
    this.trackCalculatorEvent({
      action: 'calculator_abandoned',
      category: 'calculator_flow',
      label: `abandoned_step_${step}${projectType ? `_${projectType}` : ''}`,
      value: step,
    });
  }

  // Tracking de tempo gasto na calculadora
  trackCalculatorTime(timeSpent: number) {
    this.trackCalculatorEvent({
      action: 'calculator_time',
      category: 'engagement',
      label: 'time_spent_seconds',
      value: Math.round(timeSpent / 1000), // converter para segundos
    });
  }

  // Salvar eventos localmente como fallback
  private saveEventLocally(event: CalculatorEvent) {
    try {
      const events = JSON.parse(localStorage.getItem('calculator_events') || '[]');
      events.push({
        ...event,
        timestamp: new Date().toISOString(),
      });
      
      // Manter apenas os últimos 100 eventos
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('calculator_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Erro ao salvar evento localmente:', error);
    }
  }

  // Salvar seleções de projeto para análise
  private saveProjectSelection(selection: ProjectSelection) {
    try {
      const selections = JSON.parse(localStorage.getItem('project_selections') || '[]');
      selections.push(selection);
      
      // Manter apenas as últimas 50 seleções
      if (selections.length > 50) {
        selections.splice(0, selections.length - 50);
      }
      
      localStorage.setItem('project_selections', JSON.stringify(selections));
    } catch (error) {
      console.warn('Erro ao salvar seleção de projeto:', error);
    }
  }

  // Obter estatísticas locais para análise
  getLocalStats() {
    try {
      const events = JSON.parse(localStorage.getItem('calculator_events') || '[]');
      const selections = JSON.parse(localStorage.getItem('project_selections') || '[]');
      
      return {
        totalEvents: events.length,
        totalCalculations: selections.length,
        mostPopularProject: this.getMostPopularProject(selections),
        averageEstimate: this.getAverageEstimate(selections),
        events,
        selections,
      };
    } catch (error) {
      console.warn('Erro ao obter estatísticas locais:', error);
      return null;
    }
  }

  private getMostPopularProject(selections: ProjectSelection[]) {
    if (selections.length === 0) return null;
    
    const projectCounts = selections.reduce((acc, selection) => {
      acc[selection.projectType] = (acc[selection.projectType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(projectCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null;
  }

  private getAverageEstimate(selections: ProjectSelection[]) {
    if (selections.length === 0) return 0;
    
    const total = selections.reduce((sum, selection) => sum + selection.estimate, 0);
    return Math.round(total / selections.length);
  }
}

// Instância singleton
export const analytics = new Analytics();

// Hook para React
export function useAnalytics() {
  return analytics;
}

// Utilitários para tracking comum
export const trackCalculatorStart = () => {
  analytics.trackCalculatorEvent({
    action: 'calculator_started',
    category: 'calculator',
    label: 'user_initiated',
  });
};

export const trackCalculatorComplete = (projectType: string, quality: string, estimate: number) => {
  analytics.trackProjectSelection({
    projectType,
    quality,
    area: 0, // será preenchido pelo componente
    estimate,
    timestamp: new Date(),
  });
};


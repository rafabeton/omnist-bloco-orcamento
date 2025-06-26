'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockProjectTypes, type ProjectType } from '@/lib/mock-data';
import { analytics, trackCalculatorStart } from '@/lib/analytics';
import FeedbackButton from '@/components/ui/feedback-button';
import LoadingSpinner, { InlineLoading } from '@/components/ui/loading-spinner';

interface CommonUserDashboardProps {
  user: any;
}

// Chaves para localStorage
const CALCULATOR_STATE_KEY = 'calculatorState';

interface CalculatorState {
  showCalculator: boolean;
  step: number;
  selectedProject: ProjectType | null;
  selectedQuality: 'basic' | 'medium' | 'luxury' | null;
  area: number;
  estimate: number;
}

export default function CommonUserDashboard({ user }: CommonUserDashboardProps) {
  // Estado inicial
  const initialState: CalculatorState = {
    showCalculator: false,
    step: 1,
    selectedProject: null,
    selectedQuality: null,
    area: 0,
    estimate: 0
  };

  const [calculatorState, setCalculatorState] = useState<CalculatorState>(initialState);
  const [calculatorStartTime, setCalculatorStartTime] = useState<number | null>(null);

  // Carregar estado do localStorage na inicialização
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(CALCULATOR_STATE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        console.log('Estado carregado do localStorage:', parsed);
        setCalculatorState(parsed);
      }
    } catch (error) {
      console.error('Erro ao carregar estado:', error);
    }
  }, []);

  // Salvar estado no localStorage sempre que mudar
  useEffect(() => {
    try {
      localStorage.setItem(CALCULATOR_STATE_KEY, JSON.stringify(calculatorState));
      console.log('Estado salvo no localStorage:', calculatorState);
    } catch (error) {
      console.error('Erro ao salvar estado:', error);
    }
  }, [calculatorState]);

  // Função para atualizar estado
  const updateCalculatorState = useCallback((updates: Partial<CalculatorState>) => {
    setCalculatorState(prev => ({ ...prev, ...updates }));
  }, []);

  const openCalculator = useCallback(() => {
    console.log('Abrindo calculadora...');
    
    // Analytics tracking
    trackCalculatorStart();
    setCalculatorStartTime(Date.now());
    
    updateCalculatorState({
      showCalculator: true,
      step: 1,
      selectedProject: null,
      selectedQuality: null,
      area: 0,
      estimate: 0
    });
  }, [updateCalculatorState]);

  const closeCalculator = useCallback(() => {
    console.log('Fechando calculadora...');
    
    // Analytics tracking - tempo gasto
    if (calculatorStartTime) {
      const timeSpent = Date.now() - calculatorStartTime;
      analytics.trackCalculatorTime(timeSpent);
    }
    
    updateCalculatorState({ showCalculator: false });
  }, [updateCalculatorState, calculatorStartTime]);

  const selectProject = useCallback((project: ProjectType) => {
    console.log('Projeto selecionado:', project.name);
    
    // Analytics tracking
    analytics.trackCalculatorStep(2, project.name);
    
    updateCalculatorState({
      selectedProject: project,
      step: 2
    });
  }, [updateCalculatorState]);

  const selectQuality = useCallback((quality: 'basic' | 'medium' | 'luxury') => {
    console.log('Qualidade selecionada:', quality);
    
    // Analytics tracking
    analytics.trackCalculatorStep(3, `${calculatorState.selectedProject?.name}_${quality}`);
    
    updateCalculatorState({
      selectedQuality: quality,
      step: 3
    });
  }, [updateCalculatorState, calculatorState.selectedProject]);

  const calculateEstimate = useCallback((inputArea: number) => {
    if (!calculatorState.selectedProject || !calculatorState.selectedQuality) return;
    
    const basePrice = calculatorState.selectedProject.basePrice[calculatorState.selectedQuality];
    const totalEstimate = basePrice * inputArea;
    
    console.log('Calculando estimativa:', { inputArea, basePrice, totalEstimate });
    
    // Analytics tracking - cálculo completo
    analytics.trackProjectSelection({
      projectType: calculatorState.selectedProject.name,
      quality: calculatorState.selectedQuality,
      area: inputArea,
      estimate: totalEstimate,
      timestamp: new Date(),
    });
    
    updateCalculatorState({
      estimate: totalEstimate,
      area: inputArea,
      step: 4
    });
  }, [calculatorState.selectedProject, calculatorState.selectedQuality, updateCalculatorState]);

  const resetCalculator = useCallback(() => {
    console.log('Resetando calculadora...');
    updateCalculatorState({
      step: 1,
      selectedProject: null,
      selectedQuality: null,
      area: 0,
      estimate: 0
    });
  }, [updateCalculatorState]);

  const goToStep = useCallback((step: number) => {
    console.log('Indo para etapa:', step);
    updateCalculatorState({ step });
  }, [updateCalculatorState]);

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'basic': return 'Básico';
      case 'medium': return 'Médio';
      case 'luxury': return 'Luxo';
      default: return quality;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'basic': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'luxury': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Debug info
  console.log('Render - Estado atual:', calculatorState);

  // Se calculadora está aberta, mostrar calculadora
  if (calculatorState.showCalculator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Debug Info */}
          <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mb-4 text-xs">
            <strong>DEBUG:</strong> Step: {calculatorState.step}, 
            Project: {calculatorState.selectedProject?.name || 'null'}, 
            Quality: {calculatorState.selectedQuality || 'null'}, 
            Area: {calculatorState.area}, 
            Estimate: {calculatorState.estimate}
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Calculadora de Orçamento
            </h1>
            <p className="text-lg text-gray-600">
              Obtenha uma estimativa personalizada para o seu projeto
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Etapa {calculatorState.step} de 4
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((calculatorState.step / 4) * 100)}% concluído
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(calculatorState.step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="outline" 
              onClick={closeCalculator}
              className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 border-red-200"
            >
              <span>←</span>
              <span>Voltar ao Dashboard</span>
            </Button>
            
            {calculatorState.step > 1 && (
              <Button 
                variant="outline" 
                onClick={() => goToStep(calculatorState.step - 1)}
                className="flex items-center space-x-2"
              >
                <span>←</span>
                <span>Voltar</span>
              </Button>
            )}
          </div>

          {/* Step Content */}
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8">
              
              {/* Step 1: Select Project */}
              {calculatorState.step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    1. Escolha o tipo de projeto
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockProjectTypes.map((project) => (
                      <Card 
                        key={project.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          selectProject(project);
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="text-3xl">{project.icon}</div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {project.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {project.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-green-600">
                                  A partir de €{project.basePrice.basic}/m²
                                </span>
                                <span className="text-xs text-gray-500">
                                  {project.duration}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select Quality */}
              {calculatorState.step === 2 && calculatorState.selectedProject && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    2. Selecione o padrão de qualidade
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Projeto selecionado: <strong>{calculatorState.selectedProject.name}</strong>
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(['basic', 'medium', 'luxury'] as const).map((quality) => (
                      <Card 
                        key={quality}
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          selectQuality(quality);
                        }}
                      >
                        <CardContent className="p-6 text-center">
                          <Badge className={`mb-4 ${getQualityColor(quality)}`}>
                            {getQualityLabel(quality)}
                          </Badge>
                          <div className="text-2xl font-bold text-gray-900 mb-2">
                            €{calculatorState.selectedProject.basePrice[quality]}/m²
                          </div>
                          <p className="text-sm text-gray-600">
                            {quality === 'basic' && 'Materiais económicos e funcionais'}
                            {quality === 'medium' && 'Materiais de qualidade intermediária'}
                            {quality === 'luxury' && 'Materiais premium e acabamentos de luxo'}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Enter Area */}
              {calculatorState.step === 3 && calculatorState.selectedProject && calculatorState.selectedQuality && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    3. Insira a área do projeto
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {calculatorState.selectedProject.name} - Padrão {getQualityLabel(calculatorState.selectedQuality)} 
                    (€{calculatorState.selectedProject.basePrice[calculatorState.selectedQuality]}/m²)
                  </p>
                  
                  <div className="max-w-md mx-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área em metros quadrados (m²)
                    </label>
                    <Input
                      type="number"
                      placeholder="Ex: 20"
                      className="text-center text-xl py-4"
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        if (value > 0) {
                          calculateEstimate(value);
                        }
                      }}
                      min="1"
                      max="1000"
                      defaultValue={calculatorState.area > 0 ? calculatorState.area : ''}
                    />
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Digite a área e o cálculo será feito automaticamente
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Show Results */}
              {calculatorState.step === 4 && calculatorState.selectedProject && calculatorState.selectedQuality && calculatorState.estimate > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    4. Sua estimativa está pronta!
                  </h2>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        €{calculatorState.estimate.toLocaleString('pt-PT')}
                      </div>
                      <p className="text-lg text-green-700">
                        Estimativa total para o seu projeto
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Detalhes do Projeto</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Tipo:</span>
                            <span className="font-medium">{calculatorState.selectedProject.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Padrão:</span>
                            <Badge className={getQualityColor(calculatorState.selectedQuality)}>
                              {getQualityLabel(calculatorState.selectedQuality)}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Área:</span>
                            <span className="font-medium">{calculatorState.area} m²</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Preço/m²:</span>
                            <span className="font-medium">€{calculatorState.selectedProject.basePrice[calculatorState.selectedQuality]}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Informações Adicionais</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Duração estimada:</span>
                            <span className="font-medium">{calculatorState.selectedProject.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Margem de variação:</span>
                            <span className="font-medium">±15%</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-4">
                            <strong>Nota:</strong> Esta é uma estimativa inicial. 
                            Para um orçamento detalhado, recomendamos uma avaliação presencial.
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button 
                      onClick={resetCalculator}
                      variant="outline"
                      className="px-8"
                    >
                      Nova Estimativa
                    </Button>
                    <Button 
                      className="px-8 bg-blue-600 hover:bg-blue-700"
                      onClick={closeCalculator}
                    >
                      Voltar ao Dashboard
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Feedback Button */}
        <FeedbackButton context="calculator" />
      </div>
    );
  }

  // Dashboard normal
  return (
    <div className="space-y-8">
      {/* Debug Info */}
      <div className="bg-yellow-100 border border-yellow-300 rounded p-2 text-xs">
        <strong>DEBUG:</strong> showCalculator: {calculatorState.showCalculator.toString()}, 
        User: {user?.first_name || 'null'}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo, {user?.first_name || 'Utilizador'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Pronto para começar a sua renovação? Escolha o tipo de projeto e obtenha um orçamento personalizado.
          </p>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="text-sm">
            Conta: Usuário Comum
          </Badge>
        </div>
      </div>

      {/* Calculadora Rápida */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <span>🚀</span>
            <span>Calculadora Rápida</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            Obtenha uma estimativa de custo em menos de 2 minutos
          </p>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Como funciona:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                <span>🏠 Escolha o Ambiente</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                <span>⭐ Selecione o Padrão</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                <span>💰 Receba a Estimativa</span>
              </div>
            </div>
          </div>
          <Button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openCalculator();
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
          >
            Começar Agora
          </Button>
        </CardContent>
      </Card>

      {/* Meus Projetos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📋</span>
            <span>Meus Projetos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Acompanhe o progresso dos seus projetos de renovação
          </p>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500">
              Nenhum projeto iniciado ainda. Use a calculadora acima para começar!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Inspiração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>💡</span>
            <span>Inspiração</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Ideias e tendências para o seu projeto
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">🍳 Cozinhas Modernas</h4>
              <p className="text-sm text-gray-600">
                Tendências em design de cozinha para 2024
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">🚿 Casas de Banho Spa</h4>
              <p className="text-sm text-gray-600">
                Transforme sua casa de banho num oásis de relaxamento
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">🛋️ Salas Acolhedoras</h4>
              <p className="text-sm text-gray-600">
                Ideias para criar espaços de convívio perfeitos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Feedback Button */}
      <FeedbackButton context="dashboard" />
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockProjectTypes, QualityStandard } from '@/lib/mock-data';

interface CalculatorState {
  selectedProject: string | null;
  selectedQuality: QualityStandard | null;
  area: number;
  showResults: boolean;
  estimatedCost: {
    min: number;
    max: number;
    breakdown: Array<{
      category: string;
      cost: number;
      percentage: number;
    }>;
  } | null;
}

export default function InteractiveCalculator() {
  const [state, setState] = useState<CalculatorState>({
    selectedProject: null,
    selectedQuality: null,
    area: 0,
    showResults: false,
    estimatedCost: null
  });

  const [isCalculating, setIsCalculating] = useState(false);

  // Calcular estimativa em tempo real
  useEffect(() => {
    if (state.selectedProject && state.selectedQuality && state.area > 0) {
      calculateEstimate();
    }
  }, [state.selectedProject, state.selectedQuality, state.area]);

  const calculateEstimate = async () => {
    setIsCalculating(true);
    
    // Simular delay de cálculo para UX realista
    await new Promise(resolve => setTimeout(resolve, 500));

    const project = mockProjectTypes.find(p => p.id === state.selectedProject);
    if (!project) return;

    const basePrice = project.basePrice[state.selectedQuality!];
    const totalCost = basePrice * state.area;
    
    // Variação de ±20% para range realista
    const minCost = Math.round(totalCost * 0.8);
    const maxCost = Math.round(totalCost * 1.2);

    // Breakdown detalhado por categoria
    const breakdown = [
      { category: 'Materiais', cost: Math.round(totalCost * 0.45), percentage: 45 },
      { category: 'Mão de Obra', cost: Math.round(totalCost * 0.35), percentage: 35 },
      { category: 'Equipamentos', cost: Math.round(totalCost * 0.12), percentage: 12 },
      { category: 'Outros', cost: Math.round(totalCost * 0.08), percentage: 8 }
    ];

    setState(prev => ({
      ...prev,
      showResults: true,
      estimatedCost: { min: minCost, max: maxCost, breakdown }
    }));

    setIsCalculating(false);
  };

  const selectProject = (projectId: string) => {
    setState(prev => ({
      ...prev,
      selectedProject: projectId,
      showResults: false,
      estimatedCost: null
    }));
  };

  const selectQuality = (quality: QualityStandard) => {
    setState(prev => ({
      ...prev,
      selectedQuality: quality
    }));
  };

  const handleAreaChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setState(prev => ({
      ...prev,
      area: numValue
    }));
  };

  const resetCalculator = () => {
    setState({
      selectedProject: null,
      selectedQuality: null,
      area: 0,
      showResults: false,
      estimatedCost: null
    });
  };

  const getQualityColor = (quality: QualityStandard) => {
    switch (quality) {
      case 'basic': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'luxury': return 'bg-purple-100 text-purple-800 border-purple-300';
    }
  };

  const getQualityLabel = (quality: QualityStandard) => {
    switch (quality) {
      case 'basic': return 'Básico';
      case 'medium': return 'Médio';
      case 'luxury': return 'Luxo';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header com estimativa sempre visível */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">🚀 Calculadora Rápida de Orçamento</h2>
        <p className="text-blue-100 mb-4">Obtenha uma estimativa em menos de 2 minutos</p>
        
        {state.estimatedCost && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-center">
              <p className="text-sm text-blue-100">Estimativa do seu projeto:</p>
              <p className="text-3xl font-bold">
                {formatCurrency(state.estimatedCost.min)} - {formatCurrency(state.estimatedCost.max)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center space-x-8 mb-8">
        <div className={`flex items-center space-x-2 ${state.selectedProject ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            state.selectedProject ? 'bg-green-600 text-white' : 'bg-gray-200'
          }`}>1</div>
          <span>Escolha o Ambiente</span>
        </div>
        
        <div className={`flex items-center space-x-2 ${state.selectedQuality ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            state.selectedQuality ? 'bg-green-600 text-white' : 'bg-gray-200'
          }`}>2</div>
          <span>Selecione o Padrão</span>
        </div>
        
        <div className={`flex items-center space-x-2 ${state.area > 0 ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            state.area > 0 ? 'bg-green-600 text-white' : 'bg-gray-200'
          }`}>3</div>
          <span>Receba a Estimativa</span>
        </div>
      </div>

      {/* Etapa 1: Seleção de Projeto */}
      {!state.selectedProject && (
        <div>
          <h3 className="text-xl font-semibold mb-4">1. Escolha o tipo de projeto:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockProjectTypes.map((project) => (
              <Card 
                key={project.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-blue-500"
                onClick={() => selectProject(project.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-2xl">{project.icon}</span>
                    <span>{project.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">A partir de:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(Math.min(...Object.values(project.basePrice)) * 10)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Duração:</span>
                      <span className="text-sm">{project.duration}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Etapa 2: Seleção de Qualidade */}
      {state.selectedProject && !state.selectedQuality && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">2. Selecione o padrão de qualidade:</h3>
            <Button variant="outline" size="sm" onClick={resetCalculator}>
              ← Voltar
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['basic', 'medium', 'luxury'] as QualityStandard[]).map((quality) => {
              const project = mockProjectTypes.find(p => p.id === state.selectedProject);
              const pricePerM2 = project?.basePrice[quality] || 0;
              
              return (
                <Card 
                  key={quality}
                  className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-blue-500 ${getQualityColor(quality)}`}
                  onClick={() => selectQuality(quality)}
                >
                  <CardHeader>
                    <CardTitle className="text-center">
                      <Badge className={`text-lg px-4 py-2 ${getQualityColor(quality)}`}>
                        {getQualityLabel(quality)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-2xl font-bold mb-2">
                      {formatCurrency(pricePerM2)}/m²
                    </p>
                    <p className="text-sm text-gray-600">
                      {quality === 'basic' && 'Materiais económicos, qualidade padrão'}
                      {quality === 'medium' && 'Materiais de qualidade média, bom custo-benefício'}
                      {quality === 'luxury' && 'Materiais premium, acabamentos de luxo'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Etapa 3: Área e Resultados */}
      {state.selectedProject && state.selectedQuality && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">3. Insira a área do projeto:</h3>
            <Button variant="outline" size="sm" onClick={() => setState(prev => ({ ...prev, selectedQuality: null }))}>
              ← Voltar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input de Área */}
            <Card>
              <CardHeader>
                <CardTitle>Área do Projeto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Área em metros quadrados:</label>
                    <Input
                      type="number"
                      placeholder="Ex: 25"
                      value={state.area || ''}
                      onChange={(e) => handleAreaChange(e.target.value)}
                      className="text-lg text-center"
                      min="1"
                      max="1000"
                    />
                  </div>
                  
                  {state.area > 0 && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Projeto selecionado:</p>
                      <p className="font-semibold">
                        {mockProjectTypes.find(p => p.id === state.selectedProject)?.name} - {getQualityLabel(state.selectedQuality!)}
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {state.area}m² × {formatCurrency(mockProjectTypes.find(p => p.id === state.selectedProject)?.basePrice[state.selectedQuality!] || 0)}/m²
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resultados */}
            {state.showResults && state.estimatedCost && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">💰 Sua Estimativa</CardTitle>
                </CardHeader>
                <CardContent>
                  {isCalculating ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p>Calculando...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Custo total estimado:</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(state.estimatedCost.min)} - {formatCurrency(state.estimatedCost.max)}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Breakdown de custos:</h4>
                        <div className="space-y-2">
                          {state.estimatedCost.breakdown.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b">
                              <span className="text-sm">{item.category} ({item.percentage}%)</span>
                              <span className="font-medium">{formatCurrency(item.cost)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 space-y-2">
                        <Button className="w-full" size="lg">
                          📧 Enviar Orçamento por Email
                        </Button>
                        <Button variant="outline" className="w-full" onClick={resetCalculator}>
                          🔄 Calcular Novo Projeto
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


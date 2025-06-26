'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockProjectTypes, type ProjectType } from '@/lib/mock-data';

export default function CalculadoraPage() {
  const [step, setStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<'basic' | 'medium' | 'luxury' | null>(null);
  const [area, setArea] = useState<number>(0);
  const [estimate, setEstimate] = useState<number>(0);

  const selectProject = (project: ProjectType) => {
    console.log('Project selected:', project.name);
    setSelectedProject(project);
    setStep(2);
  };

  const selectQuality = (quality: 'basic' | 'medium' | 'luxury') => {
    console.log('Quality selected:', quality);
    setSelectedQuality(quality);
    setStep(3);
  };

  const calculateEstimate = (inputArea: number) => {
    if (!selectedProject || !selectedQuality) return;
    
    const basePrice = selectedProject.basePrice[selectedQuality];
    const totalEstimate = basePrice * inputArea;
    setEstimate(totalEstimate);
    setArea(inputArea);
    setStep(4);
  };

  const resetCalculator = () => {
    setStep(1);
    setSelectedProject(null);
    setSelectedQuality(null);
    setArea(0);
    setEstimate(0);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
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
              Etapa {step} de 4
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((step / 4) * 100)}% concluído
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center space-x-2"
          >
            <span>←</span>
            <span>Voltar ao Dashboard</span>
          </Button>
          
          {step > 1 && (
            <Button 
              variant="outline" 
              onClick={() => setStep(step - 1)}
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
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  1. Escolha o tipo de projeto
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockProjectTypes.map((project) => (
                    <Card 
                      key={project.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300"
                      onClick={() => selectProject(project)}
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
            {step === 2 && selectedProject && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  2. Selecione o padrão de qualidade
                </h2>
                <p className="text-gray-600 mb-6">
                  Projeto selecionado: <strong>{selectedProject.name}</strong>
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(['basic', 'medium', 'luxury'] as const).map((quality) => (
                    <Card 
                      key={quality}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300"
                      onClick={() => selectQuality(quality)}
                    >
                      <CardContent className="p-6 text-center">
                        <Badge className={`mb-4 ${getQualityColor(quality)}`}>
                          {getQualityLabel(quality)}
                        </Badge>
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          €{selectedProject.basePrice[quality]}/m²
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
            {step === 3 && selectedProject && selectedQuality && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  3. Insira a área do projeto
                </h2>
                <p className="text-gray-600 mb-6">
                  {selectedProject.name} - Padrão {getQualityLabel(selectedQuality)} 
                  (€{selectedProject.basePrice[selectedQuality]}/m²)
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
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Digite a área e o cálculo será feito automaticamente
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Show Results */}
            {step === 4 && selectedProject && selectedQuality && estimate > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  4. Sua estimativa está pronta!
                </h2>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      €{estimate.toLocaleString('pt-PT')}
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
                          <span className="font-medium">{selectedProject.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Padrão:</span>
                          <Badge className={getQualityColor(selectedQuality)}>
                            {getQualityLabel(selectedQuality)}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Área:</span>
                          <span className="font-medium">{area} m²</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Preço/m²:</span>
                          <span className="font-medium">€{selectedProject.basePrice[selectedQuality]}</span>
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
                          <span className="font-medium">{selectedProject.duration}</span>
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
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    Voltar ao Dashboard
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


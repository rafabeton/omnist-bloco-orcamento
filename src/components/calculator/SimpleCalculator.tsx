'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockProjectTypes, QualityStandard } from '@/lib/mock-data';

export default function SimpleCalculator() {
  const [step, setStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<QualityStandard | null>(null);
  const [area, setArea] = useState<number>(0);
  const [result, setResult] = useState<any>(null);

  console.log('SimpleCalculator render - step:', step, 'project:', selectedProject);

  const handleProjectSelect = (projectId: string) => {
    console.log('Project selected:', projectId);
    setSelectedProject(projectId);
    setStep(2);
  };

  const handleQualitySelect = (quality: QualityStandard) => {
    console.log('Quality selected:', quality);
    setSelectedQuality(quality);
    setStep(3);
  };

  const handleAreaSubmit = () => {
    if (area > 0 && selectedProject && selectedQuality) {
      const project = mockProjectTypes.find(p => p.id === selectedProject);
      if (project) {
        const basePrice = project.basePrice[selectedQuality];
        const totalCost = basePrice * area;
        const minCost = Math.round(totalCost * 0.8);
        const maxCost = Math.round(totalCost * 1.2);
        
        setResult({ min: minCost, max: maxCost, project: project.name });
        setStep(4);
      }
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedProject(null);
    setSelectedQuality(null);
    setArea(0);
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Calculadora Simplificada</h2>
        <p className="text-gray-600">Etapa {step} de 4</p>
      </div>

      {/* Etapa 1: Seleção de Projeto */}
      {step === 1 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Escolha o tipo de projeto:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockProjectTypes.slice(0, 4).map((project) => (
              <Card 
                key={project.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-500"
                onClick={() => handleProjectSelect(project.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-2xl">{project.icon}</span>
                    <span>{project.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                  <p className="text-lg font-bold text-green-600">
                    A partir de €{project.basePrice.basic}/m²
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Etapa 2: Seleção de Qualidade */}
      {step === 2 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Escolha o padrão de qualidade:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-green-500"
              onClick={() => handleQualitySelect('basic')}
            >
              <CardHeader>
                <CardTitle className="text-green-700">Básico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">€{mockProjectTypes.find(p => p.id === selectedProject)?.basePrice.basic}/m²</p>
                <p className="text-sm text-gray-600">Materiais económicos</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-500"
              onClick={() => handleQualitySelect('medium')}
            >
              <CardHeader>
                <CardTitle className="text-blue-700">Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">€{mockProjectTypes.find(p => p.id === selectedProject)?.basePrice.medium}/m²</p>
                <p className="text-sm text-gray-600">Qualidade intermediária</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-500"
              onClick={() => handleQualitySelect('luxury')}
            >
              <CardHeader>
                <CardTitle className="text-purple-700">Luxo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-purple-600">€{mockProjectTypes.find(p => p.id === selectedProject)?.basePrice.luxury}/m²</p>
                <p className="text-sm text-gray-600">Materiais premium</p>
              </CardContent>
            </Card>
          </div>
          <Button onClick={() => setStep(1)} variant="outline" className="mt-4">
            ← Voltar
          </Button>
        </div>
      )}

      {/* Etapa 3: Área */}
      {step === 3 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Qual é a área do projeto?</h3>
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Área em metros quadrados:</label>
              <Input
                type="number"
                value={area || ''}
                onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
                placeholder="Ex: 15"
                className="text-lg text-center"
              />
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                ← Voltar
              </Button>
              <Button 
                onClick={handleAreaSubmit} 
                disabled={area <= 0}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Calcular →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Etapa 4: Resultado */}
      {step === 4 && result && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Estimativa do seu projeto:</h3>
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-green-700">
                {result.project} - {area}m²
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                €{result.min.toLocaleString()} - €{result.max.toLocaleString()}
              </div>
              <p className="text-gray-600 mb-4">Estimativa baseada no padrão {selectedQuality}</p>
              <Button onClick={reset} className="w-full">
                Nova Estimativa
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


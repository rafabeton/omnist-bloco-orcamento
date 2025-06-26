'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PROJECT_TYPES, QUALITY_LEVELS, MATERIAL_CATEGORIES, getQualityLevel } from '@/lib/mock-data';

interface UserProfile {
  first_name?: string;
  last_name?: string;
  city?: string;
}

interface QuickBudgetState {
  projectType: string;
  qualityLevel: 'basic' | 'medium' | 'luxury';
  area: number;
  estimatedCost: number;
}

export default function CommonUserDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickBudget, setQuickBudget] = useState<QuickBudgetState>({
    projectType: '',
    qualityLevel: 'medium',
    area: 0,
    estimatedCost: 0
  });
  const [showQuickBudget, setShowQuickBudget] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, city')
        .eq('id', user.id)
        .single();

      setProfile(profileData);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateQuickBudget = (projectTypeId: string, quality: 'basic' | 'medium' | 'luxury', area: number) => {
    const projectType = PROJECT_TYPES.find(p => p.id === projectTypeId);
    const qualityData = getQualityLevel(quality);
    
    if (!projectType || !qualityData || area <= 0) {
      return 0;
    }

    // Cálculo baseado no tipo de projeto, qualidade e área
    const basePrice = projectType.basePrice;
    const qualityMultiplier = qualityData.multiplier;
    const areaMultiplier = Math.max(area / 20, 0.5); // Base de 20m²
    
    return Math.round(basePrice * qualityMultiplier * areaMultiplier);
  };

  const handleQuickBudgetChange = (field: keyof QuickBudgetState, value: any) => {
    const newState = { ...quickBudget, [field]: value };
    
    if (field === 'projectType' || field === 'qualityLevel' || field === 'area') {
      newState.estimatedCost = calculateQuickBudget(
        newState.projectType,
        newState.qualityLevel,
        newState.area
      );
    }
    
    setQuickBudget(newState);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header de Boas-vindas */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Bem-vindo, {profile?.first_name || 'Utilizador'}! 👋
        </h1>
        <p className="text-blue-100">
          Pronto para começar a sua renovação? Escolha o tipo de projeto e obtenha um orçamento personalizado.
        </p>
        {profile?.city && (
          <Badge className="mt-2 bg-blue-500 text-white">
            📍 {profile.city}
          </Badge>
        )}
      </div>

      {/* Calculadora Rápida de Orçamento */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              🚀 Calculadora Rápida de Orçamento
            </h2>
            <p className="text-gray-600">
              Obtenha uma estimativa em menos de 2 minutos
            </p>
          </div>
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowQuickBudget(!showQuickBudget)}
          >
            {showQuickBudget ? 'Ocultar' : 'Começar Agora'}
          </Button>
        </div>

        {showQuickBudget && (
          <div className="border-t pt-6 space-y-6">
            {/* Seleção de Tipo de Projeto */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">1. Que ambiente quer renovar?</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PROJECT_TYPES.filter(p => p.id !== 'custom').map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleQuickBudgetChange('projectType', project.id)}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      quickBudget.projectType === project.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{project.icon}</div>
                    <div className="font-medium text-sm">{project.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Seleção de Qualidade */}
            {quickBudget.projectType && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">2. Escolha o padrão de qualidade:</h3>
                <div className="grid grid-cols-3 gap-4">
                  {QUALITY_LEVELS.map((quality) => (
                    <button
                      key={quality.level}
                      onClick={() => handleQuickBudgetChange('qualityLevel', quality.level)}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        quickBudget.qualityLevel === quality.level
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{quality.icon}</div>
                      <div className="font-medium">{quality.title}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        +{Math.round((quality.multiplier - 1) * 100)}%
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Área */}
            {quickBudget.projectType && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">3. Qual a área aproximada? (m²)</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={quickBudget.area || ''}
                    onChange={(e) => handleQuickBudgetChange('area', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 15"
                  />
                  <span className="text-gray-600">m²</span>
                </div>
                
                {/* Botões de área rápida */}
                <div className="flex space-x-2 mt-2">
                  {[10, 15, 20, 30, 50].map(area => (
                    <button
                      key={area}
                      onClick={() => handleQuickBudgetChange('area', area)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                    >
                      {area}m²
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Resultado */}
            {quickBudget.estimatedCost > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    💰 Estimativa de Orçamento
                  </h3>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    €{quickBudget.estimatedCost.toLocaleString()}
                  </div>
                  <p className="text-green-700 text-sm mb-4">
                    *Estimativa baseada em {quickBudget.area}m² com padrão {QUALITY_LEVELS.find(q => q.level === quickBudget.qualityLevel)?.title}
                  </p>
                  
                  <div className="flex justify-center space-x-3">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Criar Orçamento Detalhado
                    </Button>
                    <Button variant="outline">
                      Contactar Profissional
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {!showQuickBudget && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">1️⃣</div>
              <p className="text-sm font-medium">Escolha o Ambiente</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">2️⃣</div>
              <p className="text-sm font-medium">Selecione o Padrão</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">3️⃣</div>
              <p className="text-sm font-medium">Receba a Estimativa</p>
            </div>
          </div>
        )}
      </Card>

      {/* Tipos de Projeto */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Tipos de Projeto Disponíveis
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROJECT_TYPES.map((project) => (
            <Card 
              key={project.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-blue-300"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{project.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {project.description}
                </p>
                
                <div className="space-y-1 text-xs text-gray-500">
                  <div>⏱️ {project.estimatedTime}</div>
                  <div>💰 A partir de €{project.basePrice.toLocaleString()}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Padrões de Qualidade */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Padrões de Qualidade
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {QUALITY_LEVELS.map((quality) => (
            <Card 
              key={quality.level}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{quality.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {quality.title}
                </h3>
                <Badge 
                  variant="secondary" 
                  className={`mb-2 ${
                    quality.level === 'basic' ? 'bg-gray-100' :
                    quality.level === 'medium' ? 'bg-yellow-100' :
                    'bg-purple-100'
                  }`}
                >
                  +{Math.round((quality.multiplier - 1) * 100)}%
                </Badge>
                <p className="text-sm text-gray-600 mb-3">
                  {quality.description}
                </p>
                
                <ul className="text-xs text-gray-500 space-y-1">
                  {quality.features.map((feature, index) => (
                    <li key={index} className="flex items-center justify-center">
                      <span className="text-green-500 mr-1">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Projetos Recentes */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          📋 Os Seus Projetos
        </h2>
        
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📝</div>
          <p className="mb-4">Ainda não tem projetos criados</p>
          <Button variant="outline">
            Criar Primeiro Projeto
          </Button>
        </div>
      </Card>

      {/* Dicas e Recursos */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            💡 Dicas de Renovação
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Planeie o orçamento com 10-15% de margem para imprevistos</li>
            <li>• Compare sempre 3 orçamentos diferentes</li>
            <li>• Considere a época do ano para melhores preços</li>
            <li>• Invista em materiais de qualidade em áreas húmidas</li>
            <li>• Defina prioridades: funcionalidade antes da estética</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            📞 Precisa de Ajuda?
          </h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              💬 Chat de Suporte
            </Button>
            <Button variant="outline" className="w-full justify-start">
              📧 Contactar por Email
            </Button>
            <Button variant="outline" className="w-full justify-start">
              📚 Ver Guia de Utilizador
            </Button>
            <Button variant="outline" className="w-full justify-start">
              🎥 Tutoriais em Vídeo
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}


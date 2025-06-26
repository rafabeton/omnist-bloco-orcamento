'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  first_name: string;
  last_name: string;
  city?: string;
}

export default function CommonUserDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  const projectTypes = [
    {
      id: 'kitchen',
      title: 'Cozinha',
      description: 'Renovação completa ou parcial da cozinha',
      icon: '🍳',
      estimatedTime: '2-4 semanas',
      priceRange: '€3.000 - €15.000'
    },
    {
      id: 'bathroom',
      title: 'Casa de Banho',
      description: 'Remodelação de casa de banho completa',
      icon: '🚿',
      estimatedTime: '1-3 semanas',
      priceRange: '€2.000 - €8.000'
    },
    {
      id: 'living_room',
      title: 'Sala de Estar',
      description: 'Renovação de sala com pintura e pavimentos',
      icon: '🛋️',
      estimatedTime: '1-2 semanas',
      priceRange: '€1.500 - €6.000'
    },
    {
      id: 'bedroom',
      title: 'Quarto',
      description: 'Remodelação de quarto com armários',
      icon: '🛏️',
      estimatedTime: '1-2 semanas',
      priceRange: '€1.000 - €5.000'
    },
    {
      id: 'exterior',
      title: 'Exterior',
      description: 'Pintura exterior e reparações',
      icon: '🏠',
      estimatedTime: '1-2 semanas',
      priceRange: '€2.000 - €10.000'
    },
    {
      id: 'custom',
      title: 'Personalizado',
      description: 'Projeto personalizado às suas necessidades',
      icon: '⚙️',
      estimatedTime: 'Variável',
      priceRange: 'A definir'
    }
  ];

  const qualityLevels = [
    {
      level: 'basic',
      title: 'Básico',
      description: 'Materiais económicos, boa relação qualidade-preço',
      icon: '🥉',
      discount: '0%',
      features: ['Materiais standard', 'Acabamentos básicos', 'Garantia 1 ano']
    },
    {
      level: 'medium',
      title: 'Médio',
      description: 'Materiais de qualidade intermédia, durabilidade',
      icon: '🥈',
      discount: '+40%',
      features: ['Materiais de qualidade', 'Acabamentos superiores', 'Garantia 2 anos']
    },
    {
      level: 'luxury',
      title: 'Luxo',
      description: 'Materiais premium, máxima qualidade',
      icon: '🥇',
      discount: '+120%',
      features: ['Materiais premium', 'Acabamentos de luxo', 'Garantia 3 anos']
    }
  ];

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

      {/* Assistente Rápido */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              🚀 Assistente Rápido
            </h2>
            <p className="text-gray-600">
              Obtenha um orçamento em menos de 5 minutos
            </p>
          </div>
          <Button size="lg" className="bg-green-600 hover:bg-green-700">
            Começar Agora
          </Button>
        </div>
        
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
            <p className="text-sm font-medium">Receba o Orçamento</p>
          </div>
        </div>
      </Card>

      {/* Tipos de Projeto */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Que ambiente quer renovar?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectTypes.map((project) => (
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
                  <div>💰 {project.priceRange}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Padrões de Qualidade */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Escolha o Padrão de Qualidade
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {qualityLevels.map((quality) => (
            <Card 
              key={quality.level}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
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
                  {quality.discount}
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
          </div>
        </Card>
      </div>
    </div>
  );
}


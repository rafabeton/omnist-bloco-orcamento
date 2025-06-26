'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProfileSelectorProps {
  onSelect: (profileType: 'common_user' | 'contractor') => void;
  selected?: 'common_user' | 'contractor';
}

export default function ProfileSelector({ onSelect, selected }: ProfileSelectorProps) {
  const [selectedProfile, setSelectedProfile] = useState<'common_user' | 'contractor'>(
    selected || 'common_user'
  );

  const profiles = [
    {
      type: 'common_user' as const,
      title: 'Usuário Comum',
      subtitle: 'Reformas Pessoais',
      description: 'Ideal para quem quer reformar a própria casa ou cômodo',
      features: [
        'Interface simplificada',
        'Assistente de reforma guiado',
        'Comparação de padrões (Básico/Médio/Luxo)',
        'Calculadora de custos automática',
        'Templates pré-definidos'
      ],
      icon: '🏠',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      selectedColor: 'bg-blue-100 border-blue-400'
    },
    {
      type: 'contractor' as const,
      title: 'Empreiteiro',
      subtitle: 'Profissional',
      description: 'Para profissionais que criam orçamentos para clientes',
      features: [
        'Interface profissional completa',
        'CRM de clientes integrado',
        'Biblioteca extensa de materiais',
        'Geração de PDFs profissionais',
        'Sistema de aprovação online',
        'Gestão de múltiplos projetos'
      ],
      icon: '🔨',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      selectedColor: 'bg-green-100 border-green-400'
    }
  ];

  const handleSelect = (profileType: 'common_user' | 'contractor') => {
    setSelectedProfile(profileType);
    onSelect(profileType);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Escolha o seu Perfil
        </h2>
        <p className="text-gray-600">
          Selecione o tipo de conta que melhor se adequa às suas necessidades
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {profiles.map((profile) => (
          <Card
            key={profile.type}
            className={`p-6 cursor-pointer transition-all duration-200 ${
              selectedProfile === profile.type
                ? profile.selectedColor
                : profile.color
            }`}
            onClick={() => handleSelect(profile.type)}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{profile.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900">
                {profile.title}
              </h3>
              <Badge variant="secondary" className="mt-1">
                {profile.subtitle}
              </Badge>
            </div>

            <p className="text-gray-700 text-center mb-4">
              {profile.description}
            </p>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 text-sm">
                Funcionalidades incluídas:
              </h4>
              <ul className="space-y-1">
                {profile.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {selectedProfile === profile.type && (
              <div className="mt-4 text-center">
                <Badge className="bg-blue-600 text-white">
                  Selecionado
                </Badge>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>
          💡 <strong>Dica:</strong> Pode alterar o tipo de perfil a qualquer momento nas configurações
        </p>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  first_name: string;
  last_name: string;
  company_name?: string;
  city?: string;
}

interface ProjectStats {
  total_projects: number;
  active_budgets: number;
  approved_budgets: number;
  total_value: number;
}

export default function ContractorDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProjectStats>({
    total_projects: 0,
    active_budgets: 0,
    approved_budgets: 0,
    total_value: 0
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carregar perfil
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, company_name, city')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Carregar estatísticas dos projetos
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('created_by', user.id);

      if (projects) {
        setStats({
          total_projects: projects.length,
          active_budgets: projects.filter(p => p.status === 'active').length,
          approved_budgets: 0, // TODO: implementar quando tiver tabela de orçamentos
          total_value: projects.reduce((sum, p) => sum + (p.total_budget || 0), 0)
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Novo Orçamento',
      description: 'Criar orçamento para cliente',
      icon: '📋',
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => console.log('Novo orçamento')
    },
    {
      title: 'Novo Cliente',
      description: 'Adicionar cliente ao CRM',
      icon: '👤',
      color: 'bg-green-600 hover:bg-green-700',
      action: () => console.log('Novo cliente')
    },
    {
      title: 'Biblioteca Materiais',
      description: 'Gerir catálogo de materiais',
      icon: '🔧',
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => console.log('Materiais')
    },
    {
      title: 'Relatórios',
      description: 'Ver análises e métricas',
      icon: '📊',
      color: 'bg-orange-600 hover:bg-orange-700',
      action: () => console.log('Relatórios')
    }
  ];

  const recentActivities = [
    {
      type: 'budget_created',
      title: 'Orçamento criado',
      description: 'Remodelação Cozinha - João Silva',
      time: '2 horas atrás',
      icon: '📋',
      color: 'text-blue-600'
    },
    {
      type: 'budget_approved',
      title: 'Orçamento aprovado',
      description: 'Casa de Banho - Maria Santos - €4.500',
      time: '1 dia atrás',
      icon: '✅',
      color: 'text-green-600'
    },
    {
      type: 'client_added',
      title: 'Novo cliente',
      description: 'Pedro Costa adicionado ao CRM',
      time: '2 dias atrás',
      icon: '👤',
      color: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Profissional */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Bem-vindo, {profile?.first_name || 'Profissional'}! 🔨
            </h1>
            <p className="text-slate-300 mb-2">
              {profile?.company_name || 'Empresa de Construção'}
            </p>
            <div className="flex items-center space-x-4 text-sm">
              {profile?.city && (
                <Badge className="bg-slate-700 text-slate-200">
                  📍 {profile.city}
                </Badge>
              )}
              <Badge className="bg-blue-600 text-white">
                👔 Conta Profissional
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">€{stats.total_value.toLocaleString()}</div>
            <div className="text-slate-300 text-sm">Valor Total Projetos</div>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projetos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_projects}</p>
            </div>
            <div className="text-2xl">📁</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Orçamentos Ativos</p>
              <p className="text-2xl font-bold text-blue-600">{stats.active_budgets}</p>
            </div>
            <div className="text-2xl">📋</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aprovados</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved_budgets}</p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa Conversão</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.total_projects > 0 ? Math.round((stats.approved_budgets / stats.total_projects) * 100) : 0}%
              </p>
            </div>
            <div className="text-2xl">📈</div>
          </div>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Ações Rápidas
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card 
              key={index}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={action.action}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{action.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {action.description}
                </p>
                <Button className={action.color} size="sm">
                  Abrir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Layout de duas colunas */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Atividade Recente */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Atividade Recente
              </h2>
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </div>

            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`text-xl ${activity.color}`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Painel Lateral */}
        <div className="space-y-6">
          {/* Orçamentos Pendentes */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              📋 Orçamentos Pendentes
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">Cozinha Moderna</p>
                    <p className="text-sm text-gray-600">Ana Costa</p>
                  </div>
                  <Badge variant="secondary">€8.500</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">Enviado há 2 dias</p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">Casa de Banho</p>
                    <p className="text-sm text-gray-600">João Silva</p>
                  </div>
                  <Badge variant="secondary">€4.200</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">Visualizado ontem</p>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4" size="sm">
              Ver Todos Orçamentos
            </Button>
          </Card>

          {/* Dicas Profissionais */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              💡 Dicas Profissionais
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800">Aumente a Taxa de Conversão</p>
                <p className="text-green-700">Responda a perguntas dos clientes em 24h</p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800">Otimize Preços</p>
                <p className="text-blue-700">Atualize preços de materiais mensalmente</p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="font-medium text-purple-800">Fidelização</p>
                <p className="text-purple-700">Ofereça desconto para clientes recorrentes</p>
              </div>
            </div>
          </Card>

          {/* Suporte */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              🆘 Precisa de Ajuda?
            </h3>
            
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                📞 Suporte Técnico
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                📚 Guia do Profissional
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                🎓 Tutoriais em Vídeo
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


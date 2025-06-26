'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import CommonUserDashboard from '@/components/dashboard/CommonUserDashboard';
import ContractorDashboard from '@/components/dashboard/ContractorDashboard';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  // Campos que podem existir ou não
  user_type?: 'common_user' | 'contractor' | 'admin';
  city?: string;
  preferences?: any;
}

export default function DashboardClient() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<'common_user' | 'contractor'>('common_user');

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      // Verificar se usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Erro de autenticação:', authError);
        router.push('/login');
        return;
      }

      // Buscar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        
        // Criar perfil básico se não existir
        const newProfile = {
          id: user.id,
          email: user.email || '',
          first_name: '',
          last_name: '',
          company_name: '',
          user_type: 'common_user'
        };

        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert(newProfile);

        if (insertError) {
          console.error('Erro ao criar perfil:', insertError);
        }

        setProfile(newProfile);
        setShowProfileSetup(true);
        return;
      }

      // Verificar se perfil precisa de configuração
      const needsSetup = !profileData.first_name || 
                        !profileData.last_name || 
                        !profileData.user_type;

      if (needsSetup) {
        setProfile(profileData);
        setShowProfileSetup(true);
        return;
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Erro geral:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSetup = async (formData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Preparar dados para atualização
      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        updated_at: new Date().toISOString()
      };

      // Adicionar campos se existirem na tabela
      if (formData.user_type) updateData.user_type = formData.user_type;
      if (formData.company_name) updateData.company_name = formData.company_name;
      if (formData.city) updateData.city = formData.city;

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return;
      }

      // Atualizar estado local
      setProfile(prev => prev ? { ...prev, ...updateData } : null);
      setShowProfileSetup(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Determinar tipo de usuário (com fallback)
  const getUserType = (): 'common_user' | 'contractor' => {
    if (profile?.user_type) {
      return profile.user_type === 'contractor' ? 'contractor' : 'common_user';
    }
    
    // Fallback: detectar baseado em dados existentes
    if (profile?.company_name && profile.company_name.trim() !== '') {
      return 'contractor';
    }
    
    return 'common_user';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Modal de configuração de perfil
  if (showProfileSetup && profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Complete o seu Perfil
            </h1>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleProfileSetup({
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                company_name: formData.get('company_name'),
                city: formData.get('city'),
                user_type: selectedUserType
              });
            }}>
              {/* Seleção de Tipo de Usuário */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Conta
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedUserType('common_user')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      selectedUserType === 'common_user'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🏠</div>
                    <div className="font-medium">Usuário Comum</div>
                    <div className="text-sm text-gray-600">Reformas pessoais</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedUserType('contractor')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      selectedUserType === 'contractor'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🔨</div>
                    <div className="font-medium">Empreiteiro</div>
                    <div className="text-sm text-gray-600">Profissional</div>
                  </button>
                </div>
              </div>

              {/* Campos do formulário */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    defaultValue={profile.first_name || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sobrenome *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    defaultValue={profile.last_name || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {selectedUserType === 'contractor' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    defaultValue={profile.company_name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  name="city"
                  defaultValue={profile.city || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Salvar e Continuar
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Perfil não encontrado</h1>
          <p className="text-gray-600 mb-4">Redirecionando...</p>
        </div>
      </div>
    );
  }

  const userType = getUserType();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Global */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo e Título */}
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                Omnist Bloco de Orçamento
              </h1>
              {userType === 'contractor' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  PRO
                </span>
              )}
            </div>

            {/* Menu do Usuário */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Olá, {profile.first_name || profile.email}
                {profile.company_name && (
                  <span className="block text-xs text-gray-500">
                    {profile.company_name}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowProfileSetup(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Configurações"
                >
                  ⚙️
                </button>
                
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Renderizar dashboard baseado no tipo de usuário */}
        {userType === 'contractor' ? (
          <ContractorDashboard />
        ) : (
          <CommonUserDashboard />
        )}
      </main>

      {/* Debug Info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs">
          <div>Tipo: {userType}</div>
          <div>ID: {profile.id.slice(0, 8)}...</div>
          <div>Schema: Adaptado</div>
        </div>
      )}
    </div>
  );
}


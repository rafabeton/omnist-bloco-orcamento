'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import CommonUserDashboard from '@/components/dashboard/CommonUserDashboard';
import ContractorDashboard from '@/components/dashboard/ContractorDashboard';

interface UserProfile {
  id: string;
  email: string;
  user_type?: 'common_user' | 'contractor' | 'admin';
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

export default function DashboardClient() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        
        // Se não encontrou perfil, criar um básico
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email,
            first_name: '',
            last_name: '',
            user_type: 'common_user'
          });

        if (insertError) {
          console.error('Erro ao criar perfil:', insertError);
          setError('Erro ao configurar perfil do usuário');
          return;
        }

        // Redirecionar para setup se perfil não existe ou está incompleto
        router.push('/setup');
        return;
      }

      // Verificar se perfil está completo
      if (!profileData.user_type || !profileData.first_name) {
        router.push('/setup');
        return;
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Erro geral:', error);
      setError('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro no Dashboard</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
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
          <p className="text-gray-600 mb-4">Redirecionando para configuração...</p>
        </div>
      </div>
    );
  }

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
              {profile.user_type === 'contractor' && (
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
                  onClick={() => router.push('/setup')}
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
        {profile.user_type === 'contractor' ? (
          <ContractorDashboard />
        ) : (
          <CommonUserDashboard />
        )}
      </main>

      {/* Debug Info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs">
          <div>Usuário: {profile.user_type}</div>
          <div>ID: {profile.id.slice(0, 8)}...</div>
        </div>
      )}
    </div>
  );
}


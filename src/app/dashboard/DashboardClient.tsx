'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import CommonUserDashboard from '@/components/dashboard/CommonUserDashboard';
import ContractorDashboard from '@/components/dashboard/ContractorDashboard';

interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  // Usar apenas campos que existem na tabela atual
  user_type?: 'common_user' | 'contractor' | 'admin';
}

export default function DashboardClient() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<'common_user' | 'contractor'>('common_user');
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    city: '',
    user_type: 'common_user' as 'common_user' | 'contractor'
  });

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

      console.log('Auth state change:', user.email);

      // Buscar perfil do usuário - usar apenas campos que existem
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, company')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', profileError);
      }

      // Se perfil não existe ou está incompleto, mostrar setup
      if (!profileData || !profileData.first_name) {
        console.log('Perfil incompleto, mostrando setup');
        setShowProfileSetup(true);
        setLoading(false);
        return;
      }

      // Perfil existe e está completo
      setProfile({
        id: user.id,
        email: user.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        company: profileData.company,
        user_type: 'common_user' // Default para usuário comum
      });

      setLoading(false);

    } catch (error) {
      console.error('Erro geral:', error);
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Tentar atualizar perfil existente primeiro
      const { data: updateData, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          first_name: profileForm.first_name,
          last_name: profileForm.last_name,
          email: user.email, // Incluir email obrigatório
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.log('Erro ao atualizar, tentando criar:', updateError);
        
        // Se falhar, tentar criar novo perfil
        const { data: insertData, error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email, // Incluir email obrigatório
            first_name: profileForm.first_name,
            last_name: profileForm.last_name,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao criar perfil:', insertError);
          return;
        }
      }

      // Atualizar estado local
      setProfile({
        id: user.id,
        email: user.email,
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        user_type: profileForm.user_type
      });

      setShowProfileSetup(false);

    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete o seu Perfil</h1>
            
            {/* Seleção de Tipo de Conta */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Conta
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserType('common_user');
                    setProfileForm({...profileForm, user_type: 'common_user'});
                  }}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    selectedUserType === 'common_user'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">Usuário Comum</div>
                  <div className="text-sm text-gray-600">Reformas pessoais</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserType('contractor');
                    setProfileForm({...profileForm, user_type: 'contractor'});
                  }}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    selectedUserType === 'contractor'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">Empreiteiro</div>
                  <div className="text-sm text-gray-600">Profissional</div>
                </button>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sobrenome *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
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

  // Renderizar dashboard baseado no tipo de usuário
  if (profile?.user_type === 'contractor') {
    return <ContractorDashboard profile={profile} onLogout={handleLogout} />;
  }

  return <CommonUserDashboard profile={profile} onLogout={handleLogout} />;
}


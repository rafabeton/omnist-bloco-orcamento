'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProfileSelector from '@/components/auth/ProfileSelector';

interface ProfileData {
  user_type: 'common_user' | 'contractor';
  first_name: string;
  last_name: string;
  company_name?: string;
  nif?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  website?: string;
}

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    user_type: 'common_user',
    first_name: '',
    last_name: '',
    company_name: '',
    nif: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    website: ''
  });

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile && profile.user_type) {
        // Usuário já tem perfil configurado
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erro ao verificar perfil:', error);
    }
  };

  const handleProfileSelect = (userType: 'common_user' | 'contractor') => {
    setProfileData(prev => ({ ...prev, user_type: userType }));
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não encontrado');

      // Atualizar perfil do usuário
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          ...profileData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Redirecionar para dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const isContractor = profileData.user_type === 'contractor';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuração Inicial
          </h1>
          <p className="text-gray-600">
            Vamos configurar a sua conta para uma experiência personalizada
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Step 1: Profile Selection */}
        {step === 1 && (
          <div>
            <ProfileSelector 
              onSelect={handleProfileSelect}
              selected={profileData.user_type}
            />
            <div className="text-center mt-8">
              <Button onClick={handleNext} size="lg">
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Personal Information */}
        {step === 2 && (
          <Card className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Informações Pessoais
              </h2>
              <p className="text-gray-600">
                {isContractor 
                  ? 'Complete os dados da sua empresa para orçamentos profissionais'
                  : 'Complete os seus dados para personalizar a experiência'
                }
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Dados Pessoais</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <Input
                    value={profileData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sobrenome *
                  </label>
                  <Input
                    value={profileData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Seu sobrenome"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+351 9XX XXX XXX"
                  />
                </div>
              </div>

              {/* Dados da Empresa (apenas para contractors) */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">
                  {isContractor ? 'Dados da Empresa' : 'Endereço'}
                </h3>

                {isContractor && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome da Empresa
                      </label>
                      <Input
                        value={profileData.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        placeholder="Nome da sua empresa"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NIF
                      </label>
                      <Input
                        value={profileData.nif}
                        onChange={(e) => handleInputChange('nif', e.target.value)}
                        placeholder="123456789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <Input
                        value={profileData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://www.suaempresa.pt"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <Input
                    value={profileData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Lisboa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Postal
                  </label>
                  <Input
                    value={profileData.postal_code}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    placeholder="1000-001"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Voltar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={loading || !profileData.first_name || !profileData.last_name}
              >
                {loading ? 'Salvando...' : 'Finalizar Configuração'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}


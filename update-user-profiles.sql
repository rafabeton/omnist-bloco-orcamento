-- Atualizar tabela user_profiles para suportar perfis diferenciados
-- Executar no SQL Editor do Supabase

-- Adicionar colunas para perfis diferenciados
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'common_user' CHECK (user_type IN ('common_user', 'contractor', 'admin')),
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS nif TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Criar tabela de categorias de materiais
CREATE TABLE IF NOT EXISTS material_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES material_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de materiais com padrões
CREATE TABLE IF NOT EXISTS materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES material_categories(id),
    basic_price DECIMAL(10,2) DEFAULT 0,
    medium_price DECIMAL(10,2) DEFAULT 0,
    luxury_price DECIMAL(10,2) DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'unidade',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Anyone can view categories" ON material_categories FOR SELECT USING (true);
CREATE POLICY "Users can manage materials" ON materials FOR ALL USING (created_by = auth.uid() OR created_by IS NULL);

-- Dados iniciais
INSERT INTO material_categories (name, description, sort_order) VALUES
('Cerâmica', 'Azulejos, pavimentos cerâmicos', 1),
('Tintas', 'Tintas interiores e exteriores', 2),
('Pavimentos', 'Laminados, parquet, vinílicos', 3),
('Mão de Obra', 'Serviços de instalação', 4)
ON CONFLICT DO NOTHING;

-- Materiais de exemplo
INSERT INTO materials (name, description, category_id, basic_price, medium_price, luxury_price, unit) 
SELECT 'Azulejo Cerâmico 30x60', 'Azulejo para paredes', id, 8.50, 15.00, 35.00, 'm²'
FROM material_categories WHERE name = 'Cerâmica'
ON CONFLICT DO NOTHING;


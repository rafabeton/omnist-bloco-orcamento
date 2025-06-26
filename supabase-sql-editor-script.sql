-- OMNIST BLOCO DE ORÇAMENTO - SCRIPT PARA SQL EDITOR SUPABASE
-- Execute este script completo no SQL Editor do Supabase

-- 1. ATUALIZAR TABELA USER_PROFILES
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'common_user' CHECK (user_type IN ('common_user', 'contractor', 'admin')),
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS nif TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- 2. CRIAR TABELA DE CATEGORIAS DE MATERIAIS
CREATE TABLE IF NOT EXISTS material_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES material_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR TABELA DE MATERIAIS COM PADRÕES
CREATE TABLE IF NOT EXISTS materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES material_categories(id),
    basic_price DECIMAL(10,2) DEFAULT 0,
    medium_price DECIMAL(10,2) DEFAULT 0,
    luxury_price DECIMAL(10,2) DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'unidade',
    brand TEXT,
    supplier TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRIAR TABELA DE CLIENTES (CRM)
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    client_type TEXT DEFAULT 'individual' CHECK (client_type IN ('individual', 'company', 'public_entity')),
    nif TEXT,
    company_name TEXT,
    address TEXT,
    postal_code TEXT,
    city TEXT,
    district TEXT,
    category TEXT DEFAULT 'new' CHECK (category IN ('vip', 'high_value', 'recurring', 'new', 'attention')),
    preferred_contact TEXT DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'sms')),
    default_discount DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    internal_notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ATUALIZAR TABELA DE PROJETOS
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id),
ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'custom' CHECK (project_type IN ('kitchen', 'bathroom', 'full_house', 'exterior', 'custom')),
ADD COLUMN IF NOT EXISTS quality_standard TEXT DEFAULT 'medium' CHECK (quality_standard IN ('basic', 'medium', 'luxury')),
ADD COLUMN IF NOT EXISTS target_budget DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 6. CRIAR TABELA DE ORÇAMENTOS
CREATE TABLE IF NOT EXISTS budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id),
    title TEXT NOT NULL,
    description TEXT,
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_percentage DECIMAL(5,2) DEFAULT 23,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    validity_days INTEGER DEFAULT 30,
    payment_terms TEXT DEFAULT '50% início, 50% conclusão',
    execution_time TEXT DEFAULT '15 dias úteis',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'approved', 'rejected', 'expired')),
    approval_link TEXT UNIQUE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by_name TEXT,
    approved_by_email TEXT,
    rejection_reason TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 7. CRIAR TABELA DE ITENS DO ORÇAMENTO
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'unidade',
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    quality_level TEXT CHECK (quality_level IN ('basic', 'medium', 'luxury')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. HABILITAR ROW LEVEL SECURITY
ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- 9. CRIAR POLÍTICAS DE SEGURANÇA
CREATE POLICY "Anyone can view categories" ON material_categories FOR SELECT USING (true);

CREATE POLICY "Users can manage their materials" ON materials
FOR ALL USING (created_by = auth.uid() OR created_by IS NULL);

CREATE POLICY "Users can manage their clients" ON clients
FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Users can manage their budgets" ON budgets
FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Users can manage budget items" ON budget_items
FOR ALL USING (
    budget_id IN (SELECT id FROM budgets WHERE created_by = auth.uid())
);

-- 10. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category_id);
CREATE INDEX IF NOT EXISTS idx_materials_active ON materials(is_active);
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
CREATE INDEX IF NOT EXISTS idx_budgets_project ON budgets(project_id);
CREATE INDEX IF NOT EXISTS idx_budgets_client ON budgets(client_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_budget ON budget_items(budget_id);

-- 11. INSERIR DADOS INICIAIS - CATEGORIAS
INSERT INTO material_categories (name, description, sort_order) VALUES
('Cerâmica', 'Azulejos, pavimentos cerâmicos, louças sanitárias', 1),
('Tintas e Vernizes', 'Tintas interiores, exteriores, primers, vernizes', 2),
('Pavimentos', 'Laminados, parquet, vinílicos, pedra natural', 3),
('Elétrica', 'Cabos, tomadas, interruptores, quadros elétricos', 4),
('Canalização', 'Tubos, conexões, torneiras, sanitas, bidés', 5),
('Isolamentos', 'Isolamento térmico, acústico, impermeabilizações', 6),
('Carpintaria', 'Madeiras, ferragens, portas, janelas', 7),
('Mão de Obra', 'Serviços de instalação e aplicação', 8)
ON CONFLICT DO NOTHING;

-- 12. INSERIR DADOS INICIAIS - MATERIAIS
INSERT INTO materials (name, description, category_id, basic_price, medium_price, luxury_price, unit) 
SELECT 'Azulejo Cerâmico 30x60', 'Azulejo cerâmico para paredes, várias cores disponíveis', id, 8.50, 15.00, 35.00, 'm²'
FROM material_categories WHERE name = 'Cerâmica'
ON CONFLICT DO NOTHING;

INSERT INTO materials (name, description, category_id, basic_price, medium_price, luxury_price, unit) 
SELECT 'Tinta Plástica Interior', 'Tinta lavável para interiores, várias cores', id, 12.00, 25.00, 45.00, 'L'
FROM material_categories WHERE name = 'Tintas e Vernizes'
ON CONFLICT DO NOTHING;

INSERT INTO materials (name, description, category_id, basic_price, medium_price, luxury_price, unit) 
SELECT 'Pavimento Laminado', 'Pavimento laminado AC4, várias cores', id, 15.00, 35.00, 65.00, 'm²'
FROM material_categories WHERE name = 'Pavimentos'
ON CONFLICT DO NOTHING;

INSERT INTO materials (name, description, category_id, basic_price, medium_price, luxury_price, unit) 
SELECT 'Aplicação de Azulejo', 'Serviço de aplicação de azulejo em paredes', id, 12.00, 18.00, 25.00, 'm²'
FROM material_categories WHERE name = 'Mão de Obra'
ON CONFLICT DO NOTHING;

INSERT INTO materials (name, description, category_id, basic_price, medium_price, luxury_price, unit) 
SELECT 'Pintura de Paredes', 'Serviço de pintura de paredes interiores', id, 8.00, 12.00, 18.00, 'm²'
FROM material_categories WHERE name = 'Mão de Obra'
ON CONFLICT DO NOTHING;

-- 13. FUNÇÃO PARA ATUALIZAR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 14. TRIGGERS PARA UPDATED_AT
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- SCRIPT CONCLUÍDO COM SUCESSO!
-- Todas as tabelas, políticas, índices e dados iniciais foram criados.


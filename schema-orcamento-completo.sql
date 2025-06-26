-- OMNIST BLOCO DE ORÇAMENTO - SCHEMA COMPLETO
-- Reestruturação para suportar funcionalidades de orçamentação profissional

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PERFIS DE UTILIZADOR EXPANDIDOS
-- =====================================================

-- Atualizar tabela de perfis com novos campos
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'common_user' CHECK (user_type IN ('common_user', 'contractor', 'admin')),
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS nif TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- =====================================================
-- 2. CATEGORIAS DE MATERIAIS
-- =====================================================

CREATE TABLE IF NOT EXISTS material_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES material_categories(id),
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. MATERIAIS COM PADRÕES DE QUALIDADE
-- =====================================================

CREATE TABLE IF NOT EXISTS materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES material_categories(id),
    
    -- Preços por padrão de qualidade
    basic_price DECIMAL(10,2) DEFAULT 0,
    medium_price DECIMAL(10,2) DEFAULT 0,
    luxury_price DECIMAL(10,2) DEFAULT 0,
    
    -- Unidade de medida
    unit TEXT NOT NULL DEFAULT 'unidade', -- m², m, kg, unidade, etc.
    
    -- Informações adicionais
    brand TEXT,
    supplier TEXT,
    reference_code TEXT,
    image_url TEXT,
    
    -- Metadados
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. HISTÓRICO DE PREÇOS
-- =====================================================

CREATE TABLE IF NOT EXISTS material_price_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    quality_level TEXT CHECK (quality_level IN ('basic', 'medium', 'luxury')),
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    change_reason TEXT,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. CLIENTES (CRM)
-- =====================================================

CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Dados básicos
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    
    -- Tipo de cliente
    client_type TEXT DEFAULT 'individual' CHECK (client_type IN ('individual', 'company', 'public_entity')),
    
    -- Dados fiscais
    nif TEXT,
    company_name TEXT,
    
    -- Endereço
    address TEXT,
    postal_code TEXT,
    city TEXT,
    district TEXT,
    
    -- Categorização
    category TEXT DEFAULT 'new' CHECK (category IN ('vip', 'high_value', 'recurring', 'new', 'attention')),
    
    -- Preferências
    preferred_contact TEXT DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'sms')),
    default_discount DECIMAL(5,2) DEFAULT 0,
    
    -- Notas e observações
    notes TEXT,
    internal_notes TEXT,
    
    -- Metadados
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. PROJETOS REFORMULADOS
-- =====================================================

-- Atualizar tabela de projetos
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id),
ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'custom' CHECK (project_type IN ('kitchen', 'bathroom', 'full_house', 'exterior', 'custom')),
ADD COLUMN IF NOT EXISTS quality_standard TEXT DEFAULT 'medium' CHECK (quality_standard IN ('basic', 'medium', 'luxury')),
ADD COLUMN IF NOT EXISTS target_budget DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER, -- dias
ADD COLUMN IF NOT EXISTS notes TEXT;

-- =====================================================
-- 7. ORÇAMENTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Referências
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id),
    
    -- Dados do orçamento
    title TEXT NOT NULL,
    description TEXT,
    
    -- Valores
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_percentage DECIMAL(5,2) DEFAULT 23, -- IVA Portugal
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Condições
    validity_days INTEGER DEFAULT 30,
    payment_terms TEXT DEFAULT '50% início, 50% conclusão',
    execution_time TEXT DEFAULT '15 dias úteis',
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'approved', 'rejected', 'expired')),
    
    -- Aprovação
    approval_link TEXT UNIQUE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by_name TEXT,
    approved_by_email TEXT,
    rejection_reason TEXT,
    
    -- Metadados
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 8. ITENS DO ORÇAMENTO
-- =====================================================

CREATE TABLE IF NOT EXISTS budget_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
    
    -- Referência ao material (opcional)
    material_id UUID REFERENCES materials(id),
    
    -- Dados do item
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- Para organização por secções
    
    -- Quantidades e preços
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'unidade',
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    
    -- Qualidade (se baseado em material)
    quality_level TEXT CHECK (quality_level IN ('basic', 'medium', 'luxury')),
    
    -- Ordenação
    sort_order INTEGER DEFAULT 0,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. TEMPLATES DE ORÇAMENTO
-- =====================================================

CREATE TABLE IF NOT EXISTS budget_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    project_type TEXT CHECK (project_type IN ('kitchen', 'bathroom', 'full_house', 'exterior', 'custom')),
    quality_standard TEXT CHECK (quality_standard IN ('basic', 'medium', 'luxury')),
    
    -- Template data (JSON)
    template_data JSONB NOT NULL,
    
    -- Metadados
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Materiais
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category_id);
CREATE INDEX IF NOT EXISTS idx_materials_active ON materials(is_active);
CREATE INDEX IF NOT EXISTS idx_materials_name ON materials(name);

-- Clientes
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
CREATE INDEX IF NOT EXISTS idx_clients_category ON clients(category);
CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(client_type);

-- Projetos
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_quality ON projects(quality_standard);

-- Orçamentos
CREATE INDEX IF NOT EXISTS idx_budgets_project ON budgets(project_id);
CREATE INDEX IF NOT EXISTS idx_budgets_client ON budgets(client_id);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);
CREATE INDEX IF NOT EXISTS idx_budgets_created_by ON budgets(created_by);

-- Itens de orçamento
CREATE INDEX IF NOT EXISTS idx_budget_items_budget ON budget_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_material ON budget_items(material_id);

-- =====================================================
-- 11. TRIGGERS PARA AUDITORIA E CÁLCULOS
-- =====================================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas relevantes
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para recalcular totais do orçamento
CREATE OR REPLACE FUNCTION recalculate_budget_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE budgets 
    SET 
        subtotal = (
            SELECT COALESCE(SUM(total_price), 0) 
            FROM budget_items 
            WHERE budget_id = COALESCE(NEW.budget_id, OLD.budget_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.budget_id, OLD.budget_id);
    
    -- Recalcular discount_amount, tax_amount e total_amount
    UPDATE budgets 
    SET 
        discount_amount = subtotal * (discount_percentage / 100),
        tax_amount = (subtotal - discount_amount) * (tax_percentage / 100),
        total_amount = subtotal - discount_amount + tax_amount,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.budget_id, OLD.budget_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER recalc_budget_on_item_change 
    AFTER INSERT OR UPDATE OR DELETE ON budget_items 
    FOR EACH ROW EXECUTE FUNCTION recalculate_budget_totals();

-- =====================================================
-- 12. POLÍTICAS RLS SIMPLIFICADAS
-- =====================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_templates ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (usuários podem ver/editar seus próprios dados)
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

CREATE POLICY "Users can view public templates" ON budget_templates
    FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can manage their templates" ON budget_templates
    FOR ALL USING (created_by = auth.uid());

-- Categorias são públicas para leitura
CREATE POLICY "Anyone can view categories" ON material_categories
    FOR SELECT USING (true);

-- =====================================================
-- 13. DADOS INICIAIS (SEED DATA)
-- =====================================================

-- Categorias de materiais básicas
INSERT INTO material_categories (name, description, sort_order) VALUES
('Cerâmica', 'Azulejos, pavimentos cerâmicos, louças', 1),
('Tintas e Vernizes', 'Tintas interiores, exteriores, primers, vernizes', 2),
('Pavimentos', 'Laminados, parquet, vinílicos, pedra natural', 3),
('Elétrica', 'Cabos, tomadas, interruptores, quadros elétricos', 4),
('Canalização', 'Tubos, conexões, torneiras, sanitas', 5),
('Isolamentos', 'Isolamento térmico, acústico, impermeabilizações', 6),
('Carpintaria', 'Madeiras, ferragens, portas, janelas', 7),
('Mão de Obra', 'Serviços de instalação e aplicação', 8)
ON CONFLICT DO NOTHING;

-- Materiais de exemplo com preços por padrão
INSERT INTO materials (name, description, category_id, basic_price, medium_price, luxury_price, unit) 
SELECT 
    'Azulejo Cerâmico 30x60', 
    'Azulejo cerâmico para paredes, várias cores disponíveis',
    id,
    8.50,
    15.00,
    35.00,
    'm²'
FROM material_categories WHERE name = 'Cerâmica'
ON CONFLICT DO NOTHING;

INSERT INTO materials (name, description, category_id, basic_price, medium_price, luxury_price, unit) 
SELECT 
    'Tinta Plástica Interior', 
    'Tinta lavável para interiores, várias cores',
    id,
    12.00,
    25.00,
    45.00,
    'L'
FROM material_categories WHERE name = 'Tintas e Vernizes'
ON CONFLICT DO NOTHING;

INSERT INTO materials (name, description, category_id, basic_price, medium_price, luxury_price, unit) 
SELECT 
    'Pavimento Laminado', 
    'Pavimento laminado AC4, várias cores',
    id,
    15.00,
    35.00,
    65.00,
    'm²'
FROM material_categories WHERE name = 'Pavimentos'
ON CONFLICT DO NOTHING;

-- Serviços de mão de obra
INSERT INTO materials (name, description, category_id, basic_price, medium_price, luxury_price, unit) 
SELECT 
    'Aplicação de Azulejo', 
    'Serviço de aplicação de azulejo em paredes',
    id,
    12.00,
    18.00,
    25.00,
    'm²'
FROM material_categories WHERE name = 'Mão de Obra'
ON CONFLICT DO NOTHING;

INSERT INTO materials (name, description, category_id, basic_price, medium_price, luxury_price, unit) 
SELECT 
    'Pintura de Paredes', 
    'Serviço de pintura de paredes interiores',
    id,
    8.00,
    12.00,
    18.00,
    'm²'
FROM material_categories WHERE name = 'Mão de Obra'
ON CONFLICT DO NOTHING;

-- Comentário final
-- Este schema suporta todas as funcionalidades identificadas:
-- 1. Perfis diferenciados (common_user, contractor, admin)
-- 2. Materiais com 3 padrões de qualidade (basic, medium, luxury)
-- 3. CRM completo de clientes
-- 4. Sistema de orçamentos profissional
-- 5. Templates reutilizáveis
-- 6. Histórico de preços
-- 7. Cálculos automáticos
-- 8. Sistema de aprovação online


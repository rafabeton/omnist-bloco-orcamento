-- SOLUÇÃO RADICAL: Eliminar tabela project_members problemática
-- Esta solução remove completamente a dependência da tabela que causa recursão

-- 1. Remover todas as políticas RLS da tabela project_members
DROP POLICY IF EXISTS "Users can view members of accessible projects" ON project_members;
DROP POLICY IF EXISTS "Project owners can manage members" ON project_members;

-- 2. Desabilitar RLS na tabela project_members
ALTER TABLE project_members DISABLE ROW LEVEL SECURITY;

-- 3. Remover a tabela project_members completamente (opcional)
-- DROP TABLE IF EXISTS project_members;

-- 4. Simplificar políticas da tabela projects
DROP POLICY IF EXISTS "Users can view accessible projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- 5. Criar políticas simples para projects baseadas apenas em created_by
CREATE POLICY "Users can view own projects" ON projects FOR SELECT 
USING (created_by = auth.uid());

CREATE POLICY "Users can create own projects" ON projects FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own projects" ON projects FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Users can delete own projects" ON projects FOR DELETE 
USING (created_by = auth.uid());


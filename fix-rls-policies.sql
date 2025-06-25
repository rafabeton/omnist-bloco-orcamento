-- Script de Correção das Políticas RLS
-- Remove políticas problemáticas e cria novas sem recursão

-- Remover políticas existentes que causam recursão
DROP POLICY IF EXISTS "Users can view members of accessible projects" ON project_members;
DROP POLICY IF EXISTS "Project owners can manage members" ON project_members;
DROP POLICY IF EXISTS "Users can view accessible projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;

-- Criar políticas simples e diretas para project_members
CREATE POLICY "project_members_select_policy" ON project_members FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "project_members_insert_policy" ON project_members FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "project_members_update_policy" ON project_members FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "project_members_delete_policy" ON project_members FOR DELETE 
USING (user_id = auth.uid());

-- Criar políticas simples para projects
CREATE POLICY "projects_select_policy" ON projects FOR SELECT 
USING (created_by = auth.uid());

CREATE POLICY "projects_insert_policy" ON projects FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "projects_update_policy" ON projects FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "projects_delete_policy" ON projects FOR DELETE 
USING (created_by = auth.uid());


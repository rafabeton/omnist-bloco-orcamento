-- Função SQL para criar projeto contornando RLS
CREATE OR REPLACE FUNCTION create_project_direct(
  project_name TEXT,
  project_description TEXT DEFAULT NULL,
  project_budget DECIMAL DEFAULT 0,
  project_start_date DATE DEFAULT NULL,
  project_end_date DATE DEFAULT NULL,
  owner_id UUID
)
RETURNS TABLE(id UUID, name TEXT, description TEXT, total_budget DECIMAL, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir projeto diretamente sem verificar RLS
  RETURN QUERY
  INSERT INTO projects (name, description, total_budget, start_date, end_date, created_by)
  VALUES (project_name, project_description, project_budget, project_start_date, project_end_date, owner_id)
  RETURNING projects.id, projects.name, projects.description, projects.total_budget, projects.created_at;
END;
$$;


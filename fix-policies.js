import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bqeaiftiwpxqjmsdwlbz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZWFpZnRpd3B4cWptc2R3bGJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg4MDM1MSwiZXhwIjoyMDY2NDU2MzUxfQ.UR3x4yVxWWe5bPYBUp4vt-w-VU7pRZMihv5hXMON--c'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRLSPolicies() {
  console.log('🔧 Iniciando correção das políticas RLS...')

  const queries = [
    // Remover políticas problemáticas
    `DROP POLICY IF EXISTS "Users can view members of accessible projects" ON project_members;`,
    `DROP POLICY IF EXISTS "Project owners can manage members" ON project_members;`,
    `DROP POLICY IF EXISTS "Users can view accessible projects" ON projects;`,
    `DROP POLICY IF EXISTS "Users can update own projects" ON projects;`,
    
    // Criar políticas simples para project_members
    `CREATE POLICY "project_members_select_policy" ON project_members FOR SELECT 
     USING (user_id = auth.uid());`,
    
    `CREATE POLICY "project_members_insert_policy" ON project_members FOR INSERT 
     WITH CHECK (user_id = auth.uid());`,
    
    `CREATE POLICY "project_members_update_policy" ON project_members FOR UPDATE 
     USING (user_id = auth.uid());`,
    
    `CREATE POLICY "project_members_delete_policy" ON project_members FOR DELETE 
     USING (user_id = auth.uid());`,
    
    // Criar políticas simples para projects
    `CREATE POLICY "projects_select_policy" ON projects FOR SELECT 
     USING (created_by = auth.uid());`,
    
    `CREATE POLICY "projects_insert_policy" ON projects FOR INSERT 
     WITH CHECK (created_by = auth.uid());`,
    
    `CREATE POLICY "projects_update_policy" ON projects FOR UPDATE 
     USING (created_by = auth.uid());`,
    
    `CREATE POLICY "projects_delete_policy" ON projects FOR DELETE 
     USING (created_by = auth.uid());`
  ]

  for (const query of queries) {
    try {
      console.log('Executando:', query.substring(0, 50) + '...')
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      
      if (error) {
        console.error('Erro:', error)
      } else {
        console.log('✅ Sucesso')
      }
    } catch (err) {
      console.error('Erro na query:', err)
    }
  }

  console.log('🎉 Correção das políticas RLS concluída!')
}

// Executar correção
fixRLSPolicies().catch(console.error)


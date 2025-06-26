import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface CreateProjectRequest {
  name: string;
  description?: string;
  budget_total: number;
  start_date?: string;
  end_date?: string;
  categories: Array<{
    name: string;
    budgeted_amount: number;
    description?: string;
  }>;
}

function createErrorResponse(message: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

function createSuccessResponse<T>(data: T, message?: string): Response {
  return new Response(
    JSON.stringify({ success: true, data, message }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { name, description, budget_total, start_date, end_date, categories }: CreateProjectRequest = await req.json()

    if (!name || !budget_total || !categories || categories.length === 0) {
      return createErrorResponse('name, budget_total, and categories are required');
    }

    // Get current user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return createErrorResponse('Authorization header required', 401);
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return createErrorResponse('Invalid token', 401);
    }

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name,
        description,
        budget_total,
        start_date,
        end_date,
        owner_id: user.id,
        status: 'active'
      })
      .select()
      .single()

    if (projectError) {
      throw new Error(`Failed to create project: ${projectError.message}`);
    }

    // Create budget categories
    const categoryInserts = categories.map(cat => ({
      project_id: project.id,
      name: cat.name,
      budgeted_amount: cat.budgeted_amount,
      description: cat.description,
      spent_amount: 0
    }))

    const { data: createdCategories, error: categoriesError } = await supabase
      .from('budget_categories')
      .insert(categoryInserts)
      .select()

    if (categoriesError) {
      // Rollback project creation
      await supabase.from('projects').delete().eq('id', project.id)
      throw new Error(`Failed to create categories: ${categoriesError.message}`);
    }

    return createSuccessResponse({
      project: {
        ...project,
        categories: createdCategories
      }
    }, 'Project created successfully');

  } catch (error: any) {
    console.error('Create project error:', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
})


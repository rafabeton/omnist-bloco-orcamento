import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's projects
  const { data: projectMembers } = await supabase
    .from('project_members')
    .select(`
      project_id,
      role,
      projects (
        id,
        name,
        description,
        status,
        total_budget
      )
    `)
    .eq('user_id', user.id)

  const projects = projectMembers?.map(pm => ({
    ...pm.projects,
    userRole: pm.role
  })) || []

  return (
    <DashboardClient 
      user={user} 
      profile={profile} 
      projects={projects}
    />
  )
}


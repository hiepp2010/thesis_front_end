import { type NextRequest, NextResponse } from "next/server"
import type { Project } from "@/lib/data"
import { createServerClient } from "@/lib/supabase"

// Mock database
const projects: Project[] = [] // Your projects array

// GET /api/projects - Get user's projects
export async function GET(request: NextRequest) {
  const supabase = createServerClient()

  const authHeader = request.headers.get("authorization")
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.replace("Bearer ", "")
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  // Get projects where user is a member
  const { data: projectsData, error: projectsError } = await supabase
    .from("projects")
    .select(`
      *,
      project_members!inner(user_id, role),
      users!projects_owner_id_fkey(name, email)
    `)
    .eq("project_members.user_id", user.id)

  if (projectsError) {
    return NextResponse.json({ error: projectsError.message }, { status: 500 })
  }

  return NextResponse.json({ projects: projectsData })
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  const authHeader = request.headers.get("authorization")
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.replace("Bearer ", "")
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  const body = await request.json()

  // Create project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      name: body.name,
      description: body.description,
      status: body.status || "planning",
      due_date: body.due_date,
      owner_id: user.id,
    })
    .select()
    .single()

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 500 })
  }

  // Add owner as project member
  await supabase.from("project_members").insert({
    project_id: project.id,
    user_id: user.id,
    role: "owner",
  })

  return NextResponse.json({ project }, { status: 201 })
}

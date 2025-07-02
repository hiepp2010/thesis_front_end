import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/tasks - Get tasks with filters
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

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get("project_id")
  const status = searchParams.get("status")
  const priority = searchParams.get("priority")
  const assigneeId = searchParams.get("assignee_id")
  const search = searchParams.get("search")

  let query = supabase.from("tasks").select(`
      *,
      assignee:users!tasks_assignee_id_fkey(name, email, avatar_url),
      created_by_user:users!tasks_created_by_fkey(name, email),
      project:projects(name, owner_id)
    `)

  // Apply filters
  if (projectId) query = query.eq("project_id", projectId)
  if (status) query = query.eq("status", status)
  if (priority) query = query.eq("priority", priority)
  if (assigneeId) query = query.eq("assignee_id", assigneeId)
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data: tasks, error: tasksError } = await query

  if (tasksError) {
    return NextResponse.json({ error: tasksError.message }, { status: 500 })
  }

  return NextResponse.json({ tasks })
}

// POST /api/tasks - Create new task
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

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert({
      ...body,
      created_by: user.id,
    })
    .select(`
      *,
      assignee:users!tasks_assignee_id_fkey(name, email, avatar_url),
      created_by_user:users!tasks_created_by_fkey(name, email),
      project:projects(name, owner_id)
    `)
    .single()

  if (taskError) {
    return NextResponse.json({ error: taskError.message }, { status: 500 })
  }

  return NextResponse.json({ task }, { status: 201 })
}

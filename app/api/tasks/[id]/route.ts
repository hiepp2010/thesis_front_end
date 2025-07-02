import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/tasks/[id] - Get specific task
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select(`
      *,
      assignee:users!tasks_assignee_id_fkey(name, email, avatar_url),
      created_by_user:users!tasks_created_by_fkey(name, email),
      project:projects(name, owner_id),
      task_comments(
        *,
        user:users(name, email, avatar_url)
      ),
      task_attachments(
        *,
        uploaded_by_user:users!task_attachments_uploaded_by_fkey(name, email)
      )
    `)
    .eq("id", params.id)
    .single()

  if (taskError) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  return NextResponse.json({ task })
}

// PUT /api/tasks/[id] - Update task
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    .update(body)
    .eq("id", params.id)
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

  return NextResponse.json({ task })
}

// DELETE /api/tasks/[id] - Delete task (project owner only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

  // The RLS policy will automatically enforce that only project owners can delete
  const { error: deleteError } = await supabase.from("tasks").delete().eq("id", params.id)

  if (deleteError) {
    return NextResponse.json(
      {
        error: "Unauthorized - only project owners can delete tasks",
      },
      { status: 403 },
    )
  }

  return NextResponse.json({ message: "Task deleted successfully" })
}

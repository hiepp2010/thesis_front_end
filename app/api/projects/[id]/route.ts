import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/projects/[id] - Get specific project
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

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(`
      *,
      project_members(
        user_id,
        role,
        users(name, email, avatar_url)
      )
    `)
    .eq("id", params.id)
    .single()

  if (projectError) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json({ project })
}

// PUT /api/projects/[id] - Update project (owner only)
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

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .update(body)
    .eq("id", params.id)
    .eq("owner_id", user.id) // Only owner can update
    .select()
    .single()

  if (projectError) {
    return NextResponse.json({ error: "Unauthorized or project not found" }, { status: 403 })
  }

  return NextResponse.json({ project })
}

// DELETE /api/projects/[id] - Delete project (owner only)
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

  const { error: deleteError } = await supabase.from("projects").delete().eq("id", params.id).eq("owner_id", user.id) // Only owner can delete

  if (deleteError) {
    return NextResponse.json({ error: "Unauthorized or project not found" }, { status: 403 })
  }

  return NextResponse.json({ message: "Project deleted successfully" })
}

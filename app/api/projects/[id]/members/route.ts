import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/projects/[id]/members - Get project members
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

  const { data: members, error: membersError } = await supabase
    .from("project_members")
    .select(`
      *,
      user:users(id, name, email, role, department, avatar_url, availability)
    `)
    .eq("project_id", params.id)

  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 500 })
  }

  return NextResponse.json({ members })
}

// POST /api/projects/[id]/members - Add project member (owner only)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

  const { data: member, error: memberError } = await supabase
    .from("project_members")
    .insert({
      project_id: params.id,
      user_id: body.user_id,
      role: body.role || "member",
    })
    .select(`
      *,
      user:users(id, name, email, role, department, avatar_url, availability)
    `)
    .single()

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 })
  }

  return NextResponse.json({ member }, { status: 201 })
}

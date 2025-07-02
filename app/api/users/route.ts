import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/users - Get all users
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

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, name, email, role, department, avatar_url, availability")

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 })
  }

  return NextResponse.json({ users })
}

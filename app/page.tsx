"use client"
import { redirect } from "next/navigation"

export default function Home() {
  redirect("/login")
  return null

  // const { tasks, projects, users } = useTaskStore()

  // // Calculate stats
  // const completedTasks = tasks.filter((task) => task.status === "done").length
  // const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length
  // const todoTasks = tasks.filter((task) => task.status === "todo").length
  // const reviewTasks = tasks.filter((task) => task.status === "review").length

  // // Get recent tasks (sorted by updatedAt)
  // const recentTasks = [...tasks]
  //   .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  //   .slice(0, 4)

  // return (
  //   <div className="flex min-h-screen bg-slate-50">
  //     {/* Sidebar */}
  //     <div className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 p-4">
  //       <div className="flex items-center gap-2 mb-8">
  //         <div className="bg-blue-600 text-white p-1 rounded">
  //           <ListTodo size={24} />
  //         </div>
  //         <h1 className="text-xl font-bold">TaskFlow</h1>
  //       </div>

  //       <nav className="space-y-1">
  //         <Link href="#" className="flex items-center gap-2 text-slate-900 bg-slate-100 px-3 py-2 rounded-md">
  //           <BarChart3 size={18} />
  //           <span>Dashboard</span>
  //         </Link>
  //         <Link
  //           href="/board"
  //           className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-md"
  //         >
  //           <ListTodo size={18} />
  //           <span>Projects</span>
  //         </Link>
  //         <Link
  //           href="/timeline"
  //           className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-md"
  //         >
  //           <Clock size={18} />
  //           <span>Timeline</span>
  //         </Link>
  //         <Link
  //           href="/team"
  //           className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-md"
  //         >
  //           <Users size={18} />
  //           <span>Team</span>
  //         </Link>
  //         <Link
  //           href="#"
  //           className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-md"
  //         >
  //           <Settings size={18} />
  //           <span>Settings</span>
  //         </Link>
  //       </nav>

  //       <div className="mt-auto">
  //         <div className="flex items-center gap-2 p-3">
  //           <Avatar className="h-8 w-8">
  //             <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
  //             <AvatarFallback>JD</AvatarFallback>
  //           </Avatar>
  //           <div>
  //             <p className="text-sm font-medium">John Doe</p>
  //             <p className="text-xs text-slate-500">Product Manager</p>
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  //     {/* Main content */}
  //     <div className="flex-1 overflow-auto">
  //       {/* Header */}
  //       <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
  //         <div className="flex items-center gap-4">
  //           <Button variant="outline" size="sm" className="md:hidden">
  //             <ListTodo size={18} />
  //           </Button>
  //           <div className="relative">
  //             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
  //             <input
  //               type="search"
  //               placeholder="Search..."
  //               className="pl-8 h-9 w-[200px] md:w-[300px] rounded-md border border-slate-200 bg-white text-sm"
  //             />
  //           </div>
  //         </div>

  //         <div className="flex items-center gap-3">
  //           <Button variant="outline" size="sm">
  //             <Plus className="mr-2 h-4 w-4" />
  //             Create
  //           </Button>
  //           <Avatar className="h-8 w-8">
  //             <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
  //             <AvatarFallback>JD</AvatarFallback>
  //           </Avatar>
  //         </div>
  //       </header>

  //       {/* Dashboard content */}
  //       <main className="p-6">
  //         <div className="mb-8">
  //           <h1 className="text-2xl font-bold mb-2">Welcome back, John!</h1>
  //           <p className="text-slate-600">Here's what's happening with your projects today.</p>
  //         </div>

  //         {/* Stats */}
  //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  //           <Card>
  //             <CardContent className="p-6">
  //               <div className="flex items-center justify-between">
  //                 <div>
  //                   <p className="text-sm font-medium text-slate-500">Total Projects</p>
  //                   <p className="text-3xl font-bold">{projects.length}</p>
  //                 </div>
  //                 <div className="bg-blue-100 p-3 rounded-full">
  //                   <ListTodo className="h-6 w-6 text-blue-600" />
  //                 </div>
  //               </div>
  //             </CardContent>
  //           </Card>

  //           <Card>
  //             <CardContent className="p-6">
  //               <div className="flex items-center justify-between">
  //                 <div>
  //                   <p className="text-sm font-medium text-slate-500">In Progress</p>
  //                   <p className="text-3xl font-bold">{inProgressTasks}</p>
  //                 </div>
  //                 <div className="bg-amber-100 p-3 rounded-full">
  //                   <Clock className="h-6 w-6 text-amber-600" />
  //                 </div>
  //               </div>
  //             </CardContent>
  //           </Card>

  //           <Card>
  //             <CardContent className="p-6">
  //               <div className="flex items-center justify-between">
  //                 <div>
  //                   <p className="text-sm font-medium text-slate-500">Completed</p>
  //                   <p className="text-3xl font-bold">{completedTasks}</p>
  //                 </div>
  //                 <div className="bg-green-100 p-3 rounded-full">
  //                   <CheckCircle2 className="h-6 w-6 text-green-600" />
  //                 </div>
  //               </div>
  //             </CardContent>
  //           </Card>

  //           <Card>
  //             <CardContent className="p-6">
  //               <div className="flex items-center justify-between">
  //                 <div>
  //                   <p className="text-sm font-medium text-slate-500">Team Members</p>
  //                   <p className="text-3xl font-bold">{users.length}</p>
  //                 </div>
  //                 <div className="bg-purple-100 p-3 rounded-full">
  //                   <Users className="h-6 w-6 text-purple-600" />
  //                 </div>
  //               </div>
  //             </CardContent>
  //           </Card>
  //         </div>

  //         {/* Recent Projects */}
  //         <div className="mb-8">
  //           <div className="flex items-center justify-between mb-4">
  //             <h2 className="text-xl font-bold">Recent Projects</h2>
  //             <Button variant="outline" size="sm">
  //               View All
  //             </Button>
  //           </div>

  //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  //             {projects.slice(0, 3).map((project) => (
  //               <Card key={project.id}>
  //                 <CardHeader className="pb-2">
  //                   <div className="flex items-center justify-between">
  //                     <Badge
  //                       className={
  //                         project.status === "in-progress"
  //                           ? "bg-blue-500"
  //                           : project.status === "planning"
  //                             ? "bg-amber-500"
  //                             : "bg-green-500"
  //                       }
  //                     >
  //                       {project.status === "in-progress"
  //                         ? "In Progress"
  //                         : project.status === "planning"
  //                           ? "Planning"
  //                           : "Completed"}
  //                     </Badge>
  //                     <Button variant="ghost" size="icon" className="h-8 w-8">
  //                       <Star
  //                         className={`h-4 w-4 ${project.status === "completed" ? "text-amber-400 fill-amber-400" : ""}`}
  //                       />
  //                     </Button>
  //                   </div>
  //                   <CardTitle className="mt-2">{project.name}</CardTitle>
  //                   <CardDescription>{project.description}</CardDescription>
  //                 </CardHeader>
  //                 <CardContent>
  //                   <div className="space-y-2">
  //                     <div className="flex items-center justify-between text-sm">
  //                       <span className="text-slate-500">Progress</span>
  //                       <span className="font-medium">{project.progress}%</span>
  //                     </div>
  //                     <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
  //                       <div
  //                         className={`h-full rounded-full ${
  //                           project.status === "in-progress"
  //                             ? "bg-blue-500"
  //                             : project.status === "planning"
  //                               ? "bg-amber-500"
  //                               : "bg-green-500"
  //                         }`}
  //                         style={{ width: `${project.progress}%` }}
  //                       ></div>
  //                     </div>
  //                   </div>
  //                 </CardContent>
  //                 <CardFooter className="pt-0">
  //                   <div className="flex items-center justify-between w-full">
  //                     <div className="flex -space-x-2">
  //                       <Avatar className="h-7 w-7 border-2 border-white">
  //                         <AvatarImage src="/diverse-person-portrait.png" alt="User" />
  //                         <AvatarFallback>A</AvatarFallback>
  //                       </Avatar>
  //                       <Avatar className="h-7 w-7 border-2 border-white">
  //                         <AvatarImage src="/diverse-group-conversation.png" alt="User" />
  //                         <AvatarFallback>B</AvatarFallback>
  //                       </Avatar>
  //                       <Avatar className="h-7 w-7 border-2 border-white">
  //                         <AvatarImage src="/diverse-group-meeting.png" alt="User" />
  //                         <AvatarFallback>C</AvatarFallback>
  //                       </Avatar>
  //                     </div>
  //                     <span className="text-sm text-slate-500">
  //                       {project.dueDate
  //                         ? `Due ${new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
  //                         : "No due date"}
  //                     </span>
  //                   </div>
  //                 </CardFooter>
  //               </Card>
  //             ))}
  //           </div>
  //         </div>

  //         {/* Recent Tasks */}
  //         <div>
  //           <div className="flex items-center justify-between mb-4">
  //             <h2 className="text-xl font-bold">Recent Tasks</h2>
  //             <Button variant="outline" size="sm">
  //               View All
  //             </Button>
  //           </div>

  //           <Card>
  //             <CardContent className="p-0">
  //               <div className="divide-y">
  //                 {recentTasks.map((task) => {
  //                   const assignee = users.find((user) => user.id === task.assigneeId)
  //                   return (
  //                     <div key={task.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
  //                       <div className="flex items-center gap-3">
  //                         <div
  //                           className={`p-2 rounded-md ${
  //                             task.tags.includes("Design")
  //                               ? "bg-blue-100"
  //                               : task.tags.includes("Development")
  //                                 ? "bg-purple-100"
  //                                 : "bg-green-100"
  //                           }`}
  //                         >
  //                           <ListTodo
  //                             className={`h-5 w-5 ${
  //                               task.tags.includes("Design")
  //                                 ? "text-blue-600"
  //                                 : task.tags.includes("Development")
  //                                   ? "text-purple-600"
  //                                   : "text-green-600"
  //                             }`}
  //                           />
  //                         </div>
  //                         <div>
  //                           <p className={`font-medium ${task.status === "done" ? "line-through text-slate-500" : ""}`}>
  //                             {task.title}
  //                           </p>
  //                           <p className="text-sm text-slate-500">
  //                             {projects.find((p) => p.id === task.projectId)?.name}
  //                           </p>
  //                         </div>
  //                       </div>
  //                       <div className="flex items-center gap-4">
  //                         <Badge
  //                           variant="outline"
  //                           className={
  //                             task.priority === "high"
  //                               ? "text-red-500 border-red-200 bg-red-50"
  //                               : task.priority === "medium"
  //                                 ? "text-amber-500 border-amber-200 bg-amber-50"
  //                                 : "text-blue-500 border-blue-200 bg-blue-50"
  //                           }
  //                         >
  //                           {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
  //                         </Badge>
  //                         <span className="text-sm text-slate-500">
  //                           {task.dueDate
  //                             ? `Due ${new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
  //                             : "No due date"}
  //                         </span>
  //                         {assignee && (
  //                           <Avatar className="h-7 w-7">
  //                             <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.name} />
  //                             <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
  //                           </Avatar>
  //                         )}
  //                       </div>
  //                     </div>
  //                   )
  //                 })}
  //               </div>
  //             </CardContent>
  //           </Card>
  //         </div>
  //       </main>
  //     </div>
  //   </div>
  // )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import {
  Bell,
  Calendar,
  Clock,
  MessageSquare,
  Users,
  Sun,
  ListTodo,
  Search,
  Settings,
  HelpCircle,
  LogOut,
  User,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface ServiceTile {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  gradient: string
  path: string
  description: string
  notifications?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [greeting, setGreeting] = useState("Good morning")
  const [currentTime, setCurrentTime] = useState("")

  // Update greeting based on time of day
  useEffect(() => {
    const updateTimeInfo = () => {
      const now = new Date()
      const hour = now.getHours()

      // Set greeting based on time of day
      if (hour < 12) setGreeting("Good morning")
      else if (hour < 18) setGreeting("Good afternoon")
      else setGreeting("Good evening")

      // Format current time
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      )
    }

    updateTimeInfo()
    const interval = setInterval(updateTimeInfo, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const services: ServiceTile[] = [
    {
      id: "employee-profiles",
      name: "Employee Profiles",
      icon: <User className="h-8 w-8 text-white" />,
      color: "from-indigo-500 to-indigo-700",
      gradient: "bg-gradient-to-br from-indigo-500 to-indigo-700",
      path: "/employee-profiles",
      description: "Employee directory and profiles",
    },
    {
      id: "asset-management",
      name: "Asset Management",
      icon: <Users className="h-8 w-8 text-white" />,
      color: "from-teal-500 to-teal-700",
      gradient: "bg-gradient-to-br from-teal-500 to-teal-700",
      path: "/asset-management",
      description: "IT assets and equipment",
    },
    {
      id: "discuss",
      name: "Discuss",
      icon: <MessageSquare className="h-8 w-8 text-white" />,
      color: "from-rose-500 to-rose-700",
      gradient: "bg-gradient-to-br from-rose-500 to-rose-700",
      path: "/discuss",
      description: "Team communication",
    },
    {
      id: "calendar",
      name: "Calendar",
      icon: <Calendar className="h-8 w-8 text-white" />,
      color: "from-amber-500 to-amber-700",
      gradient: "bg-gradient-to-br from-amber-500 to-amber-700",
      path: "/calendar",
      description: "Schedule and events",
    },
    {
      id: "working-attendance",
      name: "Working Attendance",
      icon: <Calendar className="h-8 w-8 text-white" />,
      color: "from-yellow-500 to-yellow-700",
      gradient: "bg-gradient-to-br from-yellow-500 to-yellow-700",
      path: "/working-attendance",
      description: "Attendance records",
    },
    {
      id: "over-time",
      name: "Over Time",
      icon: <Clock className="h-8 w-8 text-white" />,
      color: "from-red-600 to-red-800",
      gradient: "bg-gradient-to-br from-red-600 to-red-800",
      path: "/over-time",
      description: "Overtime management",
    },
    {
      id: "time-off",
      name: "Time Off",
      icon: <Sun className="h-8 w-8 text-white" />,
      color: "from-amber-600 to-amber-800",
      gradient: "bg-gradient-to-br from-amber-600 to-amber-800",
      path: "/time-off",
      description: "Leave management",
    },
    {
      id: "taskflow",
      name: "TaskFlow",
      icon: <ListTodo className="h-8 w-8 text-white" />,
      color: "from-purple-500 to-purple-700",
      gradient: "bg-gradient-to-br from-purple-500 to-purple-700",
      path: "/overview",
      description: "Project management",
    },
  ]

  const filteredServices = searchQuery
    ? services.filter(
        (service) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : services

  const handleServiceClick = (path: string, serviceId: string) => {
    if (serviceId === "discuss") {
      router.push("/chat")
    } else {
      router.push(path)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  // Animation variants for staggered animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-20 w-72 h-72 bg-gray-150 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Portal</h1>
            <div className="flex items-center mt-1">
              <p className="text-gray-600 text-sm">
                {greeting}, {user?.username || "User"} • {currentTime}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell className="h-6 w-6 text-gray-600 opacity-80 cursor-pointer hover:opacity-100 transition-opacity" />
            </div>
            <div className="relative group">
              <Avatar className="h-10 w-10 border-2 border-gray-200 cursor-pointer ring-2 ring-transparent hover:ring-gray-300 transition-all">
                <AvatarImage src="/diverse-group.png" alt="User" />
                <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>

              {/* User dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
                <div className="p-3 border-b border-gray-100">
                  <p className="font-medium">{user?.username || "User"}</p>
                  <p className="text-sm text-gray-500">{user?.email || "user@company.com"}</p>
                </div>
                <div className="p-2">
                  <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help & Support
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                    size="sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Services Grid */}
        <div className="p-6 md:p-8">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filteredServices.map((service) => (
              <motion.div
                key={service.id}
                variants={item}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="relative group"
                onClick={() => handleServiceClick(service.path, service.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl transform group-hover:scale-105 transition-transform duration-300 blur-xl opacity-50"></div>
                <div
                  className={`relative flex flex-col h-full rounded-2xl p-6 backdrop-blur-sm bg-white border border-gray-200 shadow-lg cursor-pointer overflow-hidden group-hover:border-gray-300 transition-all duration-300`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
                    <div
                      className={`w-full h-full ${service.gradient} transform rotate-12 scale-150 translate-x-1/4 translate-y-1/4 rounded-full blur-2xl`}
                    ></div>
                  </div>

                  <div className="relative z-10">
                    <div
                      className={`w-16 h-16 rounded-xl ${service.gradient} shadow-lg flex items-center justify-center mb-4 group-hover:shadow-xl transition-all duration-300`}
                    >
                      {service.icon}
                    </div>

                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-gray-900 text-lg font-semibold mb-1">{service.name}</h3>
                        <p className="text-gray-600 text-sm opacity-80">{service.description}</p>
                      </div>

                      {service.notifications && (
                        <Badge className="bg-red-500 hover:bg-red-600">{service.notifications}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  )
}

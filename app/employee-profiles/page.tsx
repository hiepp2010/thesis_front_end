"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { ArrowLeft, User, Users, Search, BarChart3, UserCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { ProfileStatsCards } from "@/components/profile-stats-cards"
import { MyProfileView } from "@/components/my-profile-view"
import { EmployeeDirectoryView } from "@/components/employee-directory-view"
import { ProfileSearchView } from "@/components/profile-search-view"
import { ProfileAnalyticsView } from "@/components/profile-analytics-view"

export default function EmployeeProfilesPage() {
  const router = useRouter()
  const { user, hasRole } = useAuth()
  const [activeTab, setActiveTab] = useState("my-profile")

  const tabs = [
    {
      id: "my-profile",
      label: "My Profile",
      icon: <User className="h-4 w-4" />,
      roles: ["USER", "MANAGER", "HR"],
    },
    {
      id: "directory",
      label: "Directory",
      icon: <Users className="h-4 w-4" />,
      roles: ["USER", "MANAGER", "HR"],
    },
    {
      id: "search",
      label: "Search",
      icon: <Search className="h-4 w-4" />,
      roles: ["MANAGER", "HR"],
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
      roles: ["HR"],
    },
  ]

  const availableTabs = tabs.filter((tab) => tab.roles.some((role) => hasRole(role)))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4 hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Employee Profiles</h1>
                  <p className="text-sm text-gray-600">Manage employee information and directory</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                <UserCheck className="h-3 w-3 mr-1" />
                {user?.username}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ProfileStatsCards />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white border border-gray-200 p-1 rounded-lg">
            {availableTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center space-x-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <TabsContent value="my-profile" className="space-y-6">
              <MyProfileView />
            </TabsContent>

            <TabsContent value="directory" className="space-y-6">
              <EmployeeDirectoryView />
            </TabsContent>

            {hasRole("MANAGER") || hasRole("HR") ? (
              <TabsContent value="search" className="space-y-6">
                <ProfileSearchView />
              </TabsContent>
            ) : null}

            {hasRole("HR") ? (
              <TabsContent value="analytics" className="space-y-6">
                <ProfileAnalyticsView />
              </TabsContent>
            ) : null}
          </motion.div>
        </Tabs>
      </div>
    </div>
  )
}

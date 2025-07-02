"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { User, Mail, Phone, Briefcase, Award, Edit, Save, X, Plus, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { employeeProfileService } from "@/lib/api/employee-profile-service"

interface EmployeeProfile {
  id: number
  authUserId: number
  employeeId: string
  name: string
  email: string
  phone?: string
  departmentName: string
  jobPositionTitle: string
  managerName?: string
  salary?: number
  currency?: string
  hireDate: string
  employmentType: string
  workLocation: string
  bio?: string
  skills: string[]
  profilePictureUrl?: string
}

export function MyProfileView() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<EmployeeProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<EmployeeProfile>>({})
  const [newSkill, setNewSkill] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const profileData = await employeeProfileService.getMyProfile()
        setProfile(profileData)
        setEditForm(profileData)
      } catch (error) {
        console.error("Failed to fetch profile:", error)
        setError(error instanceof Error ? error.message : "Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      const updateData = {
        bio: editForm.bio,
        skills: editForm.skills,
        phone: editForm.phone,
        profilePictureUrl: editForm.profilePictureUrl,
      }

      const updatedProfile = await employeeProfileService.updateMyProfile(updateData)

      // Merge the updated data with existing profile
      if (profile) {
        const mergedProfile = { ...profile, ...updateData }
        setProfile(mergedProfile)
        setEditForm(mergedProfile)
      }

      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
      setError(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditForm(profile || {})
    setIsEditing(false)
    setNewSkill("")
    setError(null)
  }

  const addSkill = () => {
    if (newSkill.trim() && editForm.skills) {
      setEditForm({
        ...editForm,
        skills: [...editForm.skills, newSkill.trim()],
      })
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    if (editForm.skills) {
      setEditForm({
        ...editForm,
        skills: editForm.skills.filter((skill) => skill !== skillToRemove),
      })
    }
  }

  const getEmploymentTypeLabel = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "Full Time"
      case "PART_TIME":
        return "Part Time"
      case "CONTRACT":
        return "Contract"
      default:
        return type
    }
  }

  const getWorkLocationLabel = (location: string) => {
    switch (location) {
      case "OFFICE":
        return "Office"
      case "REMOTE":
        return "Remote"
      case "HYBRID":
        return "Hybrid"
      default:
        return location
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load profile</h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Profile not found</h3>
            <p className="text-gray-600">Unable to load your profile information.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-700">
              <X className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32"></div>
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={profile.profilePictureUrl || "/placeholder.svg"} alt={profile.name} />
              <AvatarFallback className="text-2xl font-bold bg-indigo-100 text-indigo-600">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="mt-4 sm:mt-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                  <p className="text-lg text-gray-600">{profile.jobPositionTitle}</p>
                  <p className="text-sm text-gray-500">{profile.departmentName}</p>
                </div>
                <div className="mt-4 sm:mt-0">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="bg-indigo-600 hover:bg-indigo-700">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                      <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-indigo-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editForm.phone || ""}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={editForm.email || ""} disabled className="bg-gray-50" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{profile.phone || "Not provided"}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{profile.email}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bio Section */}
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editForm.bio || ""}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{profile.bio || "No bio provided yet."}</p>
              )}
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-indigo-600" />
                Skills & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    />
                    <Button onClick={addSkill} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editForm.skills?.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill}
                        <Trash2 className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-indigo-50 text-indigo-700">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No skills added yet.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Work Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-indigo-600" />
                Work Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Employee ID</span>
                  <span className="font-medium">{profile.employeeId}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Department</span>
                  <Badge variant="outline">{profile.departmentName}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Manager</span>
                  <span className="font-medium">{profile.managerName || "Not assigned"}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Employment Type</span>
                  <Badge className="bg-green-50 text-green-700">{getEmploymentTypeLabel(profile.employmentType)}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Work Location</span>
                  <Badge className="bg-blue-50 text-blue-700">{getWorkLocationLabel(profile.workLocation)}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Hire Date</span>
                  <span className="font-medium">{new Date(profile.hireDate).toLocaleDateString()}</span>
                </div>
                {profile.salary && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Salary</span>
                      <span className="font-medium">
                        {profile.currency} {profile.salary.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

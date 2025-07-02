"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { Search, Users, Mail, Building, MapPin, Calendar, Filter, X } from "lucide-react"
import { employeeProfileService } from "@/lib/api/employee-profile-service"

interface SearchResult {
  id: number
  employeeId: string
  name: string
  email: string
  departmentName: string
  jobPositionTitle: string
  status: string
  profilePictureUrl?: string
  hireDate?: string
  workLocation?: string
}

export function ProfileSearchView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    try {
      setIsSearching(true)
      setHasSearched(true)
      setError(null)

      const results = await employeeProfileService.searchEmployees(searchTerm.trim())
      setSearchResults(results)
    } catch (error) {
      console.error("Search failed:", error)
      setError(error instanceof Error ? error.message : "Search failed")
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    setHasSearched(false)
    setError(null)
  }

  const getWorkLocationColor = (location?: string) => {
    switch (location) {
      case "OFFICE":
        return "bg-blue-50 text-blue-700"
      case "REMOTE":
        return "bg-green-50 text-green-700"
      case "HYBRID":
        return "bg-purple-50 text-purple-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  const getWorkLocationLabel = (location?: string) => {
    switch (location) {
      case "OFFICE":
        return "Office"
      case "REMOTE":
        return "Remote"
      case "HYBRID":
        return "Hybrid"
      default:
        return "Unknown"
    }
  }

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
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2 text-indigo-600" />
            Employee Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by name, email, department, or position..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={!searchTerm.trim() || isSearching}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
            {hasSearched && (
              <Button variant="outline" onClick={clearSearch}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-indigo-600" />
                Search Results
              </CardTitle>
              <Badge variant="outline">
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <X className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Search Error</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => setError(null)} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : isSearching ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
                {searchResults.map((employee) => (
                  <motion.div
                    key={employee.id}
                    variants={item}
                    className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                      <AvatarImage src={employee.profilePictureUrl || "/placeholder.svg"} alt={employee.name} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold">
                        {employee.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{employee.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {employee.employeeId}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-2">{employee.jobPositionTitle}</p>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-48">{employee.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Building className="h-3 w-3" />
                          <span>{employee.departmentName}</span>
                        </div>
                        {employee.hireDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(employee.hireDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <Badge
                        className={`${employee.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}`}
                      >
                        {employee.status}
                      </Badge>
                      {employee.workLocation && (
                        <Badge variant="secondary" className={getWorkLocationColor(employee.workLocation)}>
                          <MapPin className="h-3 w-3 mr-1" />
                          {getWorkLocationLabel(employee.workLocation)}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">
                  No employees match your search criteria for "{searchTerm}". Try different keywords or check your
                  spelling.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search Tips */}
      {!hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2 text-indigo-600" />
              Search Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Search by:</h4>
                <ul className="space-y-1">
                  <li>• Employee name (first or last)</li>
                  <li>• Email address</li>
                  <li>• Department name</li>
                  <li>• Job position or title</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Examples:</h4>
                <ul className="space-y-1">
                  <li>• "John" or "john.doe@company.com"</li>
                  <li>• "Engineering" or "Developer"</li>
                  <li>• "Manager" or "Senior"</li>
                  <li>• Partial matches work too!</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

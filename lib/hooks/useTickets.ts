"use client"

import { useState, useEffect, useCallback } from "react"
import { ticketService } from "../api/ticket-service"

interface UseTicketsOptions {
  projectId?: string
  assigneeId?: string
  status?: string
  searchTerm?: string
}

export function useTickets(options: UseTicketsOptions = {}) {
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTickets = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      let result

      if (options.projectId) {
        result = await ticketService.getTicketsByProject(options.projectId)
      } else if (options.assigneeId) {
        result = await ticketService.getTicketsByAssignee(options.assigneeId)
      } else if (options.status) {
        result = await ticketService.getTicketsByStatus(options.status)
      } else if (options.searchTerm) {
        result = await ticketService.searchTickets(options.searchTerm)
      } else {
        result = await ticketService.getAllTickets()
      }

      setTickets(result)
    } catch (err) {
      setError(err)
      console.error("Error fetching tickets:", err)
    } finally {
      setIsLoading(false)
    }
  }, [options.projectId, options.assigneeId, options.status, options.searchTerm])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const createTicket = useCallback(async (ticketData) => {
    setIsLoading(true)
    try {
      const newTicket = await ticketService.createTicket(ticketData)
      setTickets((prev) => [...prev, newTicket])
      return newTicket
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateTicket = useCallback(async (ticketId, ticketData) => {
    setIsLoading(true)
    try {
      const updatedTicket = await ticketService.updateTicket(ticketId, ticketData)
      setTickets((prev) => prev.map((ticket) => (ticket.id === ticketId ? updatedTicket : ticket)))
      return updatedTicket
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteTicket = useCallback(async (ticketId) => {
    setIsLoading(true)
    try {
      await ticketService.deleteTicket(ticketId)
      setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId))
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const moveTicket = useCallback(async (ticketId, newStatus) => {
    setIsLoading(true)
    try {
      const updatedTicket = await ticketService.updateTicketStatus(ticketId, newStatus)
      setTickets((prev) => prev.map((ticket) => (ticket.id === ticketId ? updatedTicket : ticket)))
      return updatedTicket
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    tickets,
    isLoading,
    error,
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    moveTicket,
  }
}

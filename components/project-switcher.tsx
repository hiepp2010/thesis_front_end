"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useState } from "react"
import { useProjects } from "@/lib/hooks/useProjects"

export function ProjectSwitcher() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("Personal")

  const { projects, isLoading } = useProjects()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
          {value}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search project..." />
          <CommandList>
            <CommandEmpty>No project found.</CommandEmpty>
            <CommandGroup>
              {isLoading ? (
                <div className="animate-pulse bg-slate-200 h-8 w-32 rounded"></div>
              ) : (
                projects?.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={project.name}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                  >
                    <Avatar className="mr-2 h-5 w-5">
                      <AvatarImage src={`https://avatar.vercel.sh/${project.name}.png`} />
                      <AvatarFallback>{project.name[0]}</AvatarFallback>
                    </Avatar>
                    {project.name}
                    <Check
                      className="ml-auto h-4 w-4"
                      style={{ visibility: value === project.name ? "visible" : "hidden" }}
                    />
                  </CommandItem>
                ))
              )}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem>
                <Avatar className="mr-2 h-5 w-5 opacity-50">
                  <AvatarFallback>+</AvatarFallback>
                </Avatar>
                Create project
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUp } from "lucide-react"

interface AddAttachmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddAttachment: (attachment: { name: string; size: string; type: string }) => void
}

export function AddAttachmentDialog({ isOpen, onClose, onAddAttachment }: AddAttachmentDialogProps) {
  const [fileName, setFileName] = useState("")
  const [fileSize, setFileSize] = useState("")
  const [fileType, setFileType] = useState("pdf")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFileName(file.name)
      setFileSize(formatFileSize(file.size))

      // Determine file type
      const extension = file.name.split(".").pop()?.toLowerCase() || ""
      if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
        setFileType("image")
      } else if (["pdf"].includes(extension)) {
        setFileType("pdf")
      } else if (["doc", "docx"].includes(extension)) {
        setFileType("document")
      } else {
        setFileType("other")
      }
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const handleSubmit = () => {
    if (fileName) {
      onAddAttachment({
        name: fileName,
        size: fileSize || "0 B",
        type: fileType,
      })
      resetForm()
      onClose()
    }
  }

  const resetForm = () => {
    setFileName("")
    setFileSize("")
    setFileType("pdf")
    setSelectedFile(null)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetForm()
        onClose()
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Attachment</DialogTitle>
          <DialogDescription>Upload a file to attach to this task.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">File</Label>
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              {selectedFile ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">{fileSize}</p>
                  <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                    Change File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <FileUp className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">Drag and drop a file here, or click to select a file</p>
                  <Input id="file" type="file" className="hidden" onChange={handleFileChange} />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById("file")?.click()}>
                    Select File
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fileName">File Name</Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!fileName}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

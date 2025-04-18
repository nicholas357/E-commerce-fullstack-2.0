"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

interface AdminNotesFormProps {
  orderId: string
  initialNotes: string
  onNotesUpdated: () => void
}

export function AdminNotesForm({ orderId, initialNotes, onNotesUpdated }: AdminNotesFormProps) {
  const [notes, setNotes] = useState(initialNotes || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveNotes = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("orders")
        .update({
          admin_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) {
        console.error("Error saving admin notes:", error)
        toast({
          title: "Error",
          description: `Failed to save admin notes: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Admin notes saved successfully",
      })
      onNotesUpdated()
    } catch (error: any) {
      console.error("Error saving admin notes:", error)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes about this order (only visible to admins)"
        className="min-h-[150px] resize-none"
      />
      <Button
        onClick={handleSaveNotes}
        disabled={isSaving || notes === initialNotes}
        className="bg-amber-500 hover:bg-amber-600"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" /> Save Notes
          </>
        )}
      </Button>
    </div>
  )
}

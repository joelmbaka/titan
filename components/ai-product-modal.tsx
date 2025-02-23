"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AIProductModalProps {
  open: boolean
  onClose: () => void
  onGenerate: (title: string, description: string) => void
}

export function AIProductModal({ open, onClose, onGenerate }: AIProductModalProps) {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    if (prompt.length < 20) {
      setError("Please provide at least 20 characters for better results")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("https://titan2-o.onrender.com/generate-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate product details")
      }

      const data = await response.json()
      onGenerate(data.title, data.description)
      onClose()
    } catch (err) {
      console.error("Error generating product:", err)
      setError("Failed to generate product details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Product with AI</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Describe your product</Label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A premium leather wallet with RFID protection..."
              required
            />
            <p className="text-sm text-muted-foreground">
              Minimum 20 characters required
            </p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button 
            onClick={handleGenerate} 
            disabled={loading || prompt.length < 20}
            className="w-full"
          >
            {loading ? "Generating..." : "Generate Product Details"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
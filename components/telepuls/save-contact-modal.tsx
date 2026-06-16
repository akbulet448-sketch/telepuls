"use client"

import { useState } from "react"
import { Save, X, Phone, Mail, Copy, Check } from "lucide-react"
import { useTelePuls } from "@/contexts/telepuls-context"
import type { Conversation } from "@/lib/telepuls-types"
import { genId } from "@/lib/telepuls-types"
import { Avatar } from "./avatar"

interface SaveContactModalProps {
  conversation: Conversation
  onClose: () => void
}

export function SaveContactModal({ conversation, onClose }: SaveContactModalProps) {
  const { addContact, data } = useTelePuls()
  const [copied, setCopied] = useState(false)
  const contactName = conversation.participants[0]
  const contactPhone = conversation.phoneNumbers?.[0]
  const contactPhoto = conversation.participantPhotos?.[contactName]

  const saveContact = () => {
    if (!contactName || !contactPhone) return

    const newContact = {
      id: genId(),
      name: contactName,
      phoneNumber: contactPhone,
      email: "", // Could be added if shared
      photo: contactPhoto,
      notes: `Saved from Teleplus chat`,
      createdAt: Date.now(),
    }

    // Check if contact already exists
    const exists = data.contacts.find(
      (c) => c.phoneNumber === contactPhone || c.name === contactName
    )
    if (exists) {
      alert("Contact already saved")
      return
    }

    addContact(newContact)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
      onClose()
    }, 1500)
  }

  const copyContactInfo = () => {
    const info = `${contactName}\n${contactPhone}`
    navigator.clipboard.writeText(info)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center">
      <div className="w-full rounded-t-2xl bg-card p-5 sm:max-w-sm sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Save Contact</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex flex-col items-center gap-3">
          {contactPhoto ? (
            <img
              src={contactPhoto}
              alt={contactName}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <Avatar name={contactName} color={conversation.avatarColor} size={64} />
          )}
          <div className="text-center">
            <p className="font-semibold">{contactName}</p>
            {contactPhone && (
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                {contactPhone}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4 space-y-2 rounded-lg bg-background p-3">
          {contactPhone && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Phone</span>
              <code className="font-mono text-xs font-medium">{contactPhone}</code>
            </div>
          )}
          {conversation.kind === "direct" && (
            <p className="text-xs text-muted-foreground">
              Direct chat contact - save to your phone book for easy access
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={copyContactInfo}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            aria-label="Copy contact info"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
          <button
            type="button"
            onClick={saveContact}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            aria-label="Save contact"
          >
            <Save className="h-4 w-4" />
            Save Contact
          </button>
        </div>
      </div>
    </div>
  )
}

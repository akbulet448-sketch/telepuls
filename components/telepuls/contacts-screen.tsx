"use client"

import { useState, useRef } from "react"
import { ArrowLeft, Check, Plus, Search, Trash2, User, Mail, MessageSquare } from "lucide-react"
import { useTelePuls } from "@/contexts/telepuls-context"
import { genId } from "@/lib/telepuls-types"
import type { Contact } from "@/lib/telepuls-types"
import { Avatar } from "./avatar"

interface ContactsScreenProps {
  onBack: () => void
  onStartChat: (contact: Contact) => void
}

export function ContactsScreen({ onBack, onStartChat }: ContactsScreenProps) {
  const { data, addContact, deleteContact } = useTelePuls()
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: "", phoneNumber: "", email: "" })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formPhoto, setFormPhoto] = useState("")

  const filtered = data.contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNumber.includes(search)
  )

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.size < 2 * 1024 * 1024) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormPhoto(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addNewContact = () => {
    if (formData.name.trim() && formData.phoneNumber.trim()) {
      const contact: Contact = {
        id: genId(),
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim() || undefined,
        photo: formPhoto || undefined,
        createdAt: Date.now(),
      }
      addContact(contact)
      setFormData({ name: "", phoneNumber: "", email: "" })
      setFormPhoto("")
      setShowForm(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-card px-3 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-secondary"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="flex-1 font-semibold">Contacts ({data.contacts.length})</h2>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-secondary"
          aria-label="Add contact"
        >
          <Plus className="h-5 w-5" />
        </button>
      </header>

      {showForm && (
        <div className="border-b border-border bg-card p-4">
          <div className="mb-4 flex items-center gap-4">
            {formPhoto ? (
              <img
                src={formPhoto}
                alt="Contact"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <User className="h-6 w-6" />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-primary hover:underline"
            >
              {formPhoto ? "Change photo" : "Add photo"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
          <div className="space-y-2.5">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={addNewContact}
              className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              Save Contact
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent py-2 text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <User className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {data.contacts.length === 0 ? "No contacts yet" : "No matches found"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((contact) => (
              <div key={contact.id} className="flex items-center gap-3 px-3 py-3 hover:bg-secondary/50">
                {contact.photo ? (
                  <img
                    src={contact.photo}
                    alt={contact.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.phoneNumber}</p>
                  {contact.email && (
                    <p className="text-xs text-muted-foreground">{contact.email}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onStartChat(contact)}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-primary/20"
                    title="Chat"
                  >
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteContact(contact.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-destructive/20"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

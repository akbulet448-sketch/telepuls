"use client"

import { useState, useRef } from "react"
import { ArrowLeft, Check, Upload, X } from "lucide-react"
import { useTelePuls } from "@/contexts/telepuls-context"
import { AVATAR_COLORS } from "@/lib/telepuls-types"
import { Avatar } from "./avatar"

interface ProfileScreenProps {
  onBack: () => void
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { profile, updateProfile } = useTelePuls()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(profile.name)
  const [status, setStatus] = useState(profile.status)
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber || "")
  const [email, setEmail] = useState(profile.email || "")
  const [photo, setPhoto] = useState(profile.profilePhoto || "")
  const [color, setColor] = useState(profile.avatarColor)
  const [saved, setSaved] = useState(false)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.size < 5 * 1024 * 1024) { // 5MB limit
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhoto(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const save = () => {
    updateProfile({ 
      name: name.trim() || "You", 
      status: status.trim(), 
      avatarColor: color,
      phoneNumber: phoneNumber.trim() || undefined,
      email: email.trim() || undefined,
      profilePhoto: photo || undefined,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
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
        <h2 className="font-semibold">Profile</h2>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {photo ? (
              <img
                src={photo}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover ring-2 ring-primary"
              />
            ) : (
              <Avatar name={name || "You"} color={color} size={96} />
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110"
              aria-label="Upload photo"
            >
              {photo ? <X className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
            aria-label="Photo upload"
          />
          <div className="flex gap-2">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label="Select color"
                className={`h-7 w-7 rounded-full transition-transform ${
                  color === c ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Display name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Your phone number to receive SMS notifications
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Share so others can save your contact
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <input
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={save}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" /> Saved
            </>
          ) : (
            "Save profile"
          )}
        </button>
      </div>
    </div>
  )
}

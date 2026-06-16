"use client"

import type { TelePulsData, Profile } from "./telepuls-types"
import { AVATAR_COLORS } from "./telepuls-types"

const KEY = "telepuls_data_v1"

function defaultData(): TelePulsData {
  const profile: Profile = {
    id: "me",
    name: "You",
    avatarColor: AVATAR_COLORS[0],
    status: "Available",
  }
  return {
    profile,
    conversations: [],
    messages: [],
    rooms: [],
    roomMessages: [],
    contacts: [],
  }
}

export function loadData(): TelePulsData {
  if (typeof window === "undefined") return defaultData()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultData()
    const parsed = JSON.parse(raw) as TelePulsData
    return { ...defaultData(), ...parsed }
  } catch {
    return defaultData()
  }
}

export function saveData(data: TelePulsData): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // ignore quota errors
  }
}

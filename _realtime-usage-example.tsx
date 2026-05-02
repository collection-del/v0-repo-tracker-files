import { useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"
import type { Repo, InventoryItem } from "@/lib/types"

type RepoCallback = (payload: {
  eventType: "INSERT" | "UPDATE" | "DELETE"
  new: Repo | null
  old: Partial<Repo> | null
}) => void

type InventoryCallback = (payload: {
  eventType: "INSERT" | "UPDATE" | "DELETE"
  new: InventoryItem | null
  old: Partial<InventoryItem> | null
}) => void

// ─────────────────────────────────────────────────────────
// useRealtimeRepos
// Subscribe to INSERT / UPDATE / DELETE on the repos table.
// Call this once in the component that owns your repos state.
//
// Usage:
//   useRealtimeRepos((payload) => {
//     if (payload.eventType === "INSERT") setRepos(prev => [...prev, payload.new!])
//     if (payload.eventType === "DELETE")  setRepos(prev => prev.filter(r => r.id !== payload.old!.id))
//     if (payload.eventType === "UPDATE")  setRepos(prev => prev.map(r => r.id === payload.new!.id ? payload.new! : r))
//   })
// ─────────────────────────────────────────────────────────
export function useRealtimeRepos(onEvent: RepoCallback) {
  const stableOnEvent = useCallback(onEvent, []) // eslint-disable-line

  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    channel = supabase
      .channel("realtime:repos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "repos" },
        (payload) => {
          stableOnEvent({
            eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
            new: (payload.new as Repo) ?? null,
            old: (payload.old as Partial<Repo>) ?? null,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [stableOnEvent])
}

// ─────────────────────────────────────────────────────────
// useRealtimeInventory
// Same pattern for the inventory table.
// ─────────────────────────────────────────────────────────
export function useRealtimeInventory(onEvent: InventoryCallback) {
  const stableOnEvent = useCallback(onEvent, []) // eslint-disable-line

  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    channel = supabase
      .channel("realtime:inventory")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory" },
        (payload) => {
          stableOnEvent({
            eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
            new: (payload.new as InventoryItem) ?? null,
            old: (payload.old as Partial<InventoryItem>) ?? null,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [stableOnEvent])
}

// ─────────────────────────────────────────────────────────
// useRealtimeAll
// Convenience hook: subscribe to both tables at once.
// ─────────────────────────────────────────────────────────
export function useRealtimeAll({
  onRepo,
  onInventory,
}: {
  onRepo: RepoCallback
  onInventory: InventoryCallback
}) {
  useRealtimeRepos(onRepo)
  useRealtimeInventory(onInventory)
}

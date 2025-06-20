"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Habit } from "@/lib/types"
import SettingsForm from "@/components/settings/settings-form"

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [habits, setHabits] = useState<Habit[]>([])
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push("/auth/login")
        return
      }
      setUser(data.session.user)
      await fetchHabits(data.session.user.id)
      setLoading(false)
    }

    checkUser()
  }, [router])

  const fetchHabits = async (userId: string) => {
    const { data } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    setHabits(data || [])
  }

  const handleUpdateHabit = async (habitId: string, isActive: boolean, name: string) => {
    if (!user) return

    setUpdating(true)
    try {
      await supabase.from("habits").update({ is_active: isActive, name }).eq("id", habitId).eq("user_id", user.id)

      setHabits((prevHabits) =>
        prevHabits.map((habit) => (habit.id === habitId ? { ...habit, is_active: isActive, name } : habit)),
      )
    } catch (error) {
      console.error("Error updating habit:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteHabit = async (habitId: string) => {
    if (!user) return

    setUpdating(true)
    try {
      // 習慣の削除
      await supabase.from("habits").delete().eq("id", habitId).eq("user_id", user.id)

      // 関連する習慣ログの削除
      await supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("user_id", user.id)

      setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== habitId))
    } catch (error) {
      console.error("Error deleting habit:", error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-main-green to-accent-yellow bg-clip-text text-transparent">
        設定
      </h1>
      <SettingsForm
        habits={habits}
        onUpdateHabit={handleUpdateHabit}
        onDeleteHabit={handleDeleteHabit}
        isLoading={updating}
      />
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Habit, MoodLevel } from "@/lib/types"
import { format } from "date-fns"
import MoodSelector from "@/components/mood/mood-selector"
import HabitList from "@/components/habits/habit-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [habits, setHabits] = useState<{ habit: Habit; completed: boolean }[]>([])
  const [todayMood, setTodayMood] = useState<MoodLevel | undefined>(undefined)
  const [todayNote, setTodayNote] = useState("")
  const [savingMood, setSavingMood] = useState(false)
  const [savingHabit, setSavingHabit] = useState(false)

  const today = format(new Date(), "yyyy-MM-dd")

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push("/auth/login")
        return
      }
      setUser(data.session.user)
      await fetchData(data.session.user.id)
      setLoading(false)
    }

    checkUser()
  }, [router])

  const fetchData = async (userId: string) => {
    const { data: habitsData } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)

    const { data: habitLogsData } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)

    const { data: moodData } = await supabase
      .from("mood_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .single()

    const habitsWithStatus = (habitsData || []).map((habit: Habit) => {
      const log = habitLogsData?.find((log) => log.habit_id === habit.id)
      return {
        habit,
        completed: log ? log.completed : false,
      }
    })

    setHabits(habitsWithStatus)
    if (moodData) {
      setTodayMood(moodData.mood_level as MoodLevel)
      setTodayNote(moodData.note || "")
    }
  }

  const handleSaveMood = async (mood: MoodLevel, note: string) => {
    if (!user) return

    setSavingMood(true)
    try {
      const { data: existingMood } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single()

      if (existingMood) {
        await supabase.from("mood_logs").update({ mood_level: mood, note }).eq("id", existingMood.id)
      } else {
        await supabase.from("mood_logs").insert([
          {
            user_id: user.id,
            date: today,
            mood_level: mood,
            note,
          },
        ])
      }

      setTodayMood(mood)
      setTodayNote(note)
    } catch (error) {
      console.error("Error saving mood:", error)
    } finally {
      setSavingMood(false)
    }
  }

  const handleToggleHabit = async (habitId: string, completed: boolean) => {
    if (!user) return

    setSavingHabit(true)
    try {
      const { data: existingLog } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("habit_id", habitId)
        .eq("date", today)
        .single()

      if (existingLog) {
        await supabase.from("habit_logs").update({ completed }).eq("id", existingLog.id)
      } else {
        await supabase.from("habit_logs").insert([
          {
            user_id: user.id,
            habit_id: habitId,
            date: today,
            completed,
          },
        ])
      }

      setHabits((prevHabits) => prevHabits.map((item) => (item.habit.id === habitId ? { ...item, completed } : item)))
    } catch (error) {
      console.error("Error toggling habit:", error)
    } finally {
      setSavingHabit(false)
    }
  }

  const handleAddHabit = async (habitName: string) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("habits")
        .insert([
          {
            user_id: user.id,
            name: habitName,
            is_active: true,
          },
        ])
        .select()

      if (error) throw error

      if (data && data[0]) {
        setHabits((prevHabits) => [...prevHabits, { habit: data[0] as Habit, completed: false }])
        toast({
          title: "習慣を追加しました",
          description: `「${habitName}」を習慣リストに追加しました`,
        })
      }
    } catch (error: any) {
      console.error("Error adding habit:", error?.message || error)
      console.dir(error)
      toast({
        title: "エラーが発生しました",
        description: "習慣の追加に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleDeleteHabit = async (habitId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("habits")
        .update({ is_active: false })
        .eq("id", habitId)
        .eq("user_id", user.id)

      if (error) throw error

      setHabits((prevHabits) => prevHabits.filter((item) => item.habit.id !== habitId))

      toast({
        title: "習慣を削除しました",
        description: "習慣リストから削除しました",
      })
    } catch (error: any) {
      console.error("Error deleting habit:", error?.message || error)
      toast({
        title: "エラーが発生しました",
        description: "習慣の削除に失敗しました",
        variant: "destructive",
      })
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
      <Card className="bg-gradient-to-r from-main-green/10 to-accent-yellow/10 border-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">モチログ</CardTitle>
          <CardDescription className="text-gray-600">今日の気分と習慣を記録しましょう</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium text-gray-900">{format(new Date(), "yyyy年MM月dd日")}</p>
        </CardContent>
      </Card>

      <MoodSelector initialMood={todayMood} initialNote={todayNote} onSave={handleSaveMood} isLoading={savingMood} />

      <HabitList
        habits={habits}
        onToggleHabit={handleToggleHabit}
        onAddHabit={handleAddHabit}
        onDeleteHabit={handleDeleteHabit}
        isLoading={savingHabit}
      />
    </div>
  )
}

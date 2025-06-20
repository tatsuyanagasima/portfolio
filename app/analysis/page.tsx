"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase, isDemoMode } from "@/lib/supabase"
import type { DailyLog, Habit, HabitLog, MoodLog } from "@/lib/types"
import EnhancedAnalysisCharts from "@/components/analysis/enhanced-analysis-charts"
import { format, subMonths } from "date-fns"

export default function AnalysisPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [habits, setHabits] = useState<Habit[]>([])

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          router.push("/auth/login")
          return
        }
        setUser(data.session.user)
        await fetchData(data.session.user.id)
      } catch (err) {
        console.error("Authentication error:", err)
        setError("認証エラーが発生しました")
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const fetchData = async (userId: string) => {
    try {
      // 過去3ヶ月分のデータを取得
      const threeMonthsAgo = format(subMonths(new Date(), 3), "yyyy-MM-dd")
      const today = format(new Date(), "yyyy-MM-dd")

      // 習慣の取得
      const habitsResponse = await supabase.from("habits").select("*").eq("user_id", userId)
      const habitsData = habitsResponse.data || []
      setHabits(habitsData)

      // 習慣記録の取得
      let habitLogsData = []
      try {
        const habitLogsResponse = await supabase
          .from("habit_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("date", threeMonthsAgo)
          .lte("date", today)
        habitLogsData = habitLogsResponse.data || []
      } catch (err) {
        console.warn("Error fetching habit logs:", err)
      }

      // 気分記録の取得
      let moodLogsData = []
      try {
        const moodLogsResponse = await supabase
          .from("mood_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("date", threeMonthsAgo)
          .lte("date", today)
        moodLogsData = moodLogsResponse.data || []
      } catch (err) {
        console.warn("Error fetching mood logs:", err)
      }

      // データの整形
      const dailyLogs: Record<string, DailyLog> = {}

      // 気分ログの処理
      moodLogsData.forEach((moodLog: MoodLog) => {
        if (!dailyLogs[moodLog.date]) {
          dailyLogs[moodLog.date] = {
            date: moodLog.date,
            habits: [],
          }
        }
        dailyLogs[moodLog.date].mood = moodLog
      })

      // 習慣ログの処理
      habitLogsData.forEach((habitLog: HabitLog) => {
        const habit = habitsData.find((h: Habit) => h.id === habitLog.habit_id)
        if (!habit) return

        if (!dailyLogs[habitLog.date]) {
          dailyLogs[habitLog.date] = {
            date: habitLog.date,
            habits: [],
          }
        }

        dailyLogs[habitLog.date].habits.push({
          habit,
          completed: habitLog.completed,
          count: habitLog.count || 0,
          notes: habitLog.notes || "",
        })
      })

      setLogs(Object.values(dailyLogs))
    } catch (err) {
      console.error("Data fetch error:", err)
      setError("データの取得に失敗しました")
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main-green mx-auto"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-main-green text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-main-green to-accent-yellow bg-clip-text text-transparent">
          分析
        </h1>
        
      </div>
      <EnhancedAnalysisCharts logs={logs} habits={habits} />
    </div>
  )
}

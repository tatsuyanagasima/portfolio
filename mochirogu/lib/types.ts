export type MoodLevel = 1 | 2 | 3 | 4 | 5 // 1: 悲しい, 5: 嬉しい

export interface Habit {
  id: string
  user_id: string
  name: string
  created_at: string
  is_active: boolean
}

export interface HabitLog {
  id: string
  user_id: string
  habit_id: string
  date: string
  completed: boolean
}

export interface MoodLog {
  id: string
  user_id: string
  date: string
  mood_level: MoodLevel
  note?: string
}

export interface DailyLog {
  date: string
  mood?: MoodLog
  habits: {
    habit: Habit
    completed: boolean
  }[]
  note?: string
}

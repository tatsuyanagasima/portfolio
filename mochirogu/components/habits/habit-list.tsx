"use client"

import React from "react"

type Habit = {
  id: string
  name: string
}

type Props = {
  habits: { habit: Habit; completed: boolean }[]
  onToggleHabit: (habitId: string, completed: boolean) => void
  onAddHabit: (habitName: string) => void
  onDeleteHabit: (habitId: string) => void
  isLoading: boolean
}

export default function HabitList({
  habits,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
  isLoading,
}: Props) {
  return (
    <div className="space-y-4">
      {habits.length === 0 ? (
        <p className="text-gray-500">習慣が登録されていません</p>
      ) : (
        habits.map(({ habit, completed }) => (
          <div
            key={habit.id}
            className="flex items-center justify-between border p-3 rounded-md shadow-sm bg-white"
          >
            <span className="font-medium text-gray-800">{habit.name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => onToggleHabit(habit.id, !completed)}
                className={`text-sm px-3 py-1 rounded ${
                  completed
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {completed ? "完了済み" : "未完了"}
              </button>
              <button
                onClick={() => onDeleteHabit(habit.id)}
                className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                削除
              </button>
            </div>
          </div>
        ))
      )}

      <div className="pt-4">
        <button
          onClick={() => {
            const habitName = prompt("新しい習慣を入力してください")
            if (habitName && habitName.trim() !== "") {
              onAddHabit(habitName.trim())
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={isLoading}
        >
          習慣を追加
        </button>
      </div>
    </div>
  )
}

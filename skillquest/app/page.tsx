'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {

  const [goals, setGoals] = useState<any[]>([])
  const [gaps, setGaps] = useState<any[]>([])
  const [quests, setQuests] = useState<any[]>([])
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)

  async function addGoal(goalName: string) {
    const { data } = await supabase
      .from('goals')
      .insert([{ goal_name: goalName, readiness: 0 }])
      .select()

    if (data) {
      const goalId = data[0].id

      const { data: gapData } = await supabase.from('gaps').insert([
        { goal_id: goalId, name: 'DSA', status: 'weak', priority: 'high' },
        { goal_id: goalId, name: 'Projects', status: 'weak', priority: 'high' },
        { goal_id: goalId, name: 'Core CS', status: 'weak', priority: 'medium' }
      ]).select()

      if (gapData) {
        for (let gap of gapData) {
          await supabase.from('quests').insert([
            { gap_id: gap.id, title: 'Complete 1 task', xp_reward: 10 },
            { gap_id: gap.id, title: 'Practice basics', xp_reward: 20 }
          ])
        }
      }
    }

    fetchGoals()
  }

  async function fetchGoals() {
    const { data } = await supabase.from('goals').select('*')
    if (data) setGoals(data)
  }

  async function fetchGaps(goalId: string) {
    const { data } = await supabase
      .from('gaps')
      .select('*')
      .eq('goal_id', goalId)

    if (data) setGaps(data)
  }

  async function fetchQuests(gapId: string) {
    const { data } = await supabase
      .from('quests')
      .select('*')
      .eq('gap_id', gapId)

    if (data) setQuests(data)
  }

  async function submitProof(quest: any) {
    const input = document.getElementById(`proof-${quest.id}`) as HTMLInputElement
    const proof = input?.value

    if (!proof) return alert("Enter proof ❌")

    const res = await fetch('http://localhost:3000/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proof }),
    })

    const data = await res.json()

    if (data.result?.toUpperCase().startsWith("YES")) {
      await supabase
        .from('quests')
        .update({ status: 'completed' })
        .eq('id', quest.id)

      const newXp = xp + quest.xp_reward
      setXp(newXp)

      if (newXp >= level * 50) setLevel(level + 1)

      fetchQuests(quest.gap_id)
    } else {
      alert("AI rejected ❌")
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      <h1 className="text-3xl font-bold mb-4">🎮 SkillQuest</h1>

      <div className="mb-6">
        <p className="text-lg">Level: {level}</p>
        <p className="text-lg">XP: {xp}</p>
      </div>

      {/* GOALS */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">🎯 Select Goal</h2>

        <div className="flex gap-4">
          <button className="bg-blue-500 px-4 py-2 rounded" onClick={() => addGoal("Software Job")}>Software Job</button>
          <button className="bg-green-500 px-4 py-2 rounded" onClick={() => addGoal("Internship")}>Internship</button>
          <button className="bg-purple-500 px-4 py-2 rounded" onClick={() => addGoal("GATE Exam")}>GATE</button>
        </div>
      </div>

      {/* GOALS LIST */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">📌 Your Goals</h2>

        <div className="grid grid-cols-2 gap-4">
          {goals.map(goal => (
            <div key={goal.id} className="bg-gray-800 p-4 rounded shadow">
              <p>{goal.goal_name}</p>
              <button className="mt-2 bg-yellow-500 px-3 py-1 rounded" onClick={() => fetchGaps(goal.id)}>View Gaps</button>
            </div>
          ))}
        </div>
      </div>

      {/* GAPS */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">⚔️ Gaps</h2>

        <div className="grid grid-cols-2 gap-4">
          {gaps.map(gap => (
            <div key={gap.id} className="bg-gray-800 p-4 rounded">
              <p>{gap.name}</p>
              <button className="mt-2 bg-red-500 px-3 py-1 rounded" onClick={() => fetchQuests(gap.id)}>View Quests</button>
            </div>
          ))}
        </div>
      </div>

      {/* QUESTS */}
      <div>
        <h2 className="text-xl mb-2">🧩 Quests</h2>

        {quests.map(quest => (
          <div key={quest.id} className="bg-gray-800 p-4 mb-3 rounded">
            <p>{quest.title} (+{quest.xp_reward} XP)</p>

            {quest.status !== 'completed' ? (
              <>
                <input
                  className="mt-2 p-2 text-black"
                  placeholder="Paste proof"
                  id={`proof-${quest.id}`}
                />
                <button
                  className="ml-2 bg-green-500 px-3 py-1 rounded"
                  onClick={() => submitProof(quest)}
                >
                  Submit
                </button>
              </>
            ) : (
              <span className="text-green-400">✅ Completed</span>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}
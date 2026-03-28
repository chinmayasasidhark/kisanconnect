'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'

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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">

      <h1 className="text-4xl font-bold mb-6 text-center">🎮 SkillQuest</h1>

      {/* XP BAR */}
      <div className="mb-6">
        <p>Level {level}</p>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className="bg-green-400 h-4 rounded-full transition-all duration-500"
            style={{ width: `${(xp % 50) * 2}%` }}
          ></div>
        </div>
        <p>{xp} XP</p>
      </div>

      {/* GOALS */}
      <div className="mb-6">
        <h2 className="text-xl mb-3">🎯 Choose Goal</h2>

        <div className="flex gap-4">
          {["Software Job", "Internship", "GATE Exam"].map((g) => (
            <motion.button
              key={g}
              whileHover={{ scale: 1.1 }}
              className="bg-blue-600 px-4 py-2 rounded-xl"
              onClick={() => addGoal(g)}
            >
              {g}
            </motion.button>
          ))}
        </div>
      </div>

      {/* GOALS LIST */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {goals.map(goal => (
          <motion.div
            key={goal.id}
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-lg p-4 rounded-xl border border-white/20"
          >
            <p>{goal.goal_name}</p>
            <button
              className="mt-2 bg-yellow-500 px-3 py-1 rounded"
              onClick={() => fetchGaps(goal.id)}
            >
              View Gaps
            </button>
          </motion.div>
        ))}
      </div>

      {/* GAPS */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {gaps.map(gap => (
          <motion.div
            key={gap.id}
            whileHover={{ scale: 1.05 }}
            className="bg-red-500/20 backdrop-blur-lg p-4 rounded-xl"
          >
            <p>⚔️ {gap.name}</p>
            <button
              className="mt-2 bg-red-600 px-3 py-1 rounded"
              onClick={() => fetchQuests(gap.id)}
            >
              View Quests
            </button>
          </motion.div>
        ))}
      </div>

      {/* QUESTS */}
      <div>
        {quests.map(quest => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 backdrop-blur-lg p-4 mb-3 rounded-xl"
          >
            <p>{quest.title} (+{quest.xp_reward} XP)</p>

            {quest.status !== 'completed' ? (
              <>
                <input
                  className="mt-2 p-2 text-black"
                  placeholder="Paste proof"
                  id={`proof-${quest.id}`}
                />
                <button
                  className="ml-2 bg-green-600 px-3 py-1 rounded"
                  onClick={() => submitProof(quest)}
                >
                  Submit
                </button>
              </>
            ) : (
              <span className="text-green-400">✅ Completed</span>
            )}
          </motion.div>
        ))}
      </div>

    </div>
  )
}
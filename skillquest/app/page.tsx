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

  async function completeQuest(quest: any) {
    // mark as completed
    await supabase
      .from('quests')
      .update({ status: 'completed' })
      .eq('id', quest.id)

    // update XP
    const newXp = xp + quest.xp_reward
    setXp(newXp)

    // level logic
    if (newXp >= level * 50) {
      setLevel(level + 1)
    }

    fetchQuests(quest.gap_id)
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>SkillQuest 🚀</h1>

      <h2>Level: {level} | XP: {xp}</h2>

      <h2>Select Your Goal</h2>

      <button onClick={() => addGoal("Software Job")}>
        Software Job
      </button>

      <br /><br />

      <button onClick={() => addGoal("Internship")}>
        Internship
      </button>

      <br /><br />

      <button onClick={() => addGoal("GATE Exam")}>
        GATE Exam
      </button>

      <hr />

      <h2>Your Goals</h2>

      {goals.map((goal) => (
        <div key={goal.id}>
          👉 {goal.goal_name}

          <button onClick={() => fetchGaps(goal.id)}>
            View Gaps
          </button>
        </div>
      ))}

      <hr />

      <h2>Gaps</h2>

      {gaps.map((gap) => (
        <div key={gap.id}>
          ⚔️ {gap.name}

          <button onClick={() => fetchQuests(gap.id)}>
            View Quests
          </button>
        </div>
      ))}

      <hr />

      <h2>Quests</h2>

      {quests.map((quest) => (
        <div key={quest.id}>
          🧩 {quest.title} (+{quest.xp_reward} XP)

          {quest.status !== 'completed' && (
            <button
              style={{ marginLeft: 10 }}
              onClick={() => completeQuest(quest)}
            >
              Complete
            </button>
          )}

          {quest.status === 'completed' && (
            <span style={{ marginLeft: 10 }}>✅ Done</span>
          )}
        </div>
      ))}

    </div>
  )
}
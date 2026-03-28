'use client'

import { supabase } from '../lib/supabase'

export default function Home() {

  async function addGoal(goalName: string) {
    const { data, error } = await supabase
      .from('goals')
      .insert([
        {
          goal_name: goalName,
          readiness: 0
        }
      ])

    console.log(data, error)
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>SkillQuest 🚀</h1>

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
    </div>
  )
}
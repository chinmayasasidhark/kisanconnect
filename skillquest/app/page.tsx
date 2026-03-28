'use client'

import { supabase } from '../lib/supabase'

export default function Home() {

  async function testConnection() {
    console.log("Button clicked")

    const { data, error } = await supabase
      .from('users')
      .insert([{ email: 'test@gmail.com' }])

    console.log(data, error)
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>SkillQuest 🚀</h1>

      <button onClick={testConnection}>
        Test Supabase
      </button>
    </div>
  )
}
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: `student-${Date.now()}@yopmail.com`,
    password: 'StrongPass123!',
    options: {
      data: { name: 'Test User', role: 'STUDENT', college: 'Test College', collegeId: '' },
    },
  })
  console.log('Data:', data)
  console.log('Error:', error)
}
test()

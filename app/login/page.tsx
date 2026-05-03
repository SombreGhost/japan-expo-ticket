"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error("Accès refusé : " + error.message)
    } else {
      toast.success("Bienvenue, Admin")
      router.push('/admin')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1628] p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-[#0f2035] p-8 shadow-2xl">
        <h2 className="text-center font-orbitron text-3xl font-black text-white">ADMIN <span className="text-[#c41e3a]">ACCESS</span></h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="bg-white/5 border-white/10 text-white" />
          <Input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} className="bg-white/5 border-white/10 text-white" />
          <Button type="submit" className="w-full bg-[#c41e3a] hover:bg-[#a01530]">S'identifier</Button>
        </form>
      </div>
    </div>
  )
}

import 'react-native-url-polyfill/auto';
import React from 'react';
import HomeScreen from '../jwt-auth-app/app/homepage/home';

export default function App() {
  return <HomeScreen />;
}
  
/*
import { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import Account from './components/Account'
import Auth from './components/Auth'
import { supabase } from './lib/supabase'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <View>
      {session && session.user ? <Account key={session.user.id} session={session} /> : <Auth />}
    </View>
  )
}
  */
import React from 'react'
import {AuthProvider} from './auth-context'

function AppProviders({children}) {
  //Kan legge til formio-provider og?
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
export default AppProviders
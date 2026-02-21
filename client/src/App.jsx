import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AppShell } from './components/AppShell'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { NotFound } from './pages/NotFound'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import AiAssitance from './pages/AiAssitance'
import Dashboard from './pages/Dashboard'


import './App.css'


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ai-assistance" element={<AiAssitance />} />
          <Route path="/dashboard" element={<Dashboard />} />

        </Route>

        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
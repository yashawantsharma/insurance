import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import Profile from './Profile'
import Login from './Login'
import Reset from './Reset'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <BrowserRouter>
    <Header/>
    <Sidebar/>
    <Routes>
      <Route path='/profile' element={<Profile/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/reset' element={<Reset/>}/>
    
    </Routes>
    </BrowserRouter>
    
    </>
  )
}

export default App

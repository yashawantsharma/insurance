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
import LocationSelector from './LocationSelecto'
import Police from './Police'
import Agent from './Agent'

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
      <Route path='/location' element={<LocationSelector/>}/>
       <Route path='/police' element={<Police/>}/>
       <Route path='/agent' element={<Agent/>}/>
    
    </Routes>
    </BrowserRouter>
    
    </>
  )
}

export default App

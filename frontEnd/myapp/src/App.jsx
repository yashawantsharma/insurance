import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <BrowserRouter>
    <Header/>
    <Sidebar/>
    <Routes>
    
    </Routes>
    </BrowserRouter>
    
    </>
  )
}

export default App

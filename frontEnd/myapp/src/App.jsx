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
import User from './User'
import AllBranch from './AllBranch'
import Dashboard from './Dashboard'
import UserSidebar from '../user/UserSidebar'
import AgentSidebar from '../agent/AgentSidebar'
import ProtectedRoute from './ProtectedRoute'
import AgentDashboard from '../agent/AgentDashboard'
import UserDashboard from '../user/UserDashboard'
import UserPolice from '../user/UserPolice'

function App() {
  const [count, setCount] = useState(0)
  const role = (localStorage.getItem("role") || "")

  return (
    <>
    <BrowserRouter>
    <Header/>
    {/* <Sidebar/> */}
    {role === "admin" && <Sidebar />}
      {role === "agent" && <AgentSidebar />}
      {role === "user" && <UserSidebar />}
    <Routes>
      <Route path='/profile' element={
        <ProtectedRoute allowedRoles={["admin","agent","user"]}>
        <Profile/>
        </ProtectedRoute>}
        />
      <Route path='/login' element={
        <Login/>}/>
      <Route path='/reset' element={
        <Reset/>}/>
      <Route path='/location' element={<LocationSelector/>}/>
       <Route path='/police' element={<Police/>}/>
       <Route path='/agent' element={<Agent/>}/>
       <Route path='/user' element={<User/>}/>
       <Route path='/allbranch' element={<AllBranch/>}/>
       <Route path='/' element={
         <ProtectedRoute allowedRoles={["admin"]}>
        <Dashboard/>
        </ProtectedRoute>}/>
        <Route path='/agentdashboard' element={
         <ProtectedRoute allowedRoles={["agent"]}>
        <AgentDashboard/>
        </ProtectedRoute>}/>
         <Route path='/userdashboard' element={
         <ProtectedRoute allowedRoles={["user"]}>
        <UserDashboard/>
        </ProtectedRoute>}/>
         <Route path='/userpolice' element={
         <ProtectedRoute allowedRoles={["user"]}>
        <UserPolice/>
        </ProtectedRoute>}/>
        
        


    
    </Routes>
    </BrowserRouter>
    
    </>
  )
}

export default App

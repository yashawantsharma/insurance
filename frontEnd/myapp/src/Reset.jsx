import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Reset = () => {
  const[theme,setTheme]=useState("")
    const [data,setData]=useState({
        email:"",
        oldpassword:"",
        newpassword:"",
        confrompassword:""
    })
    const navigate=useNavigate()

    useEffect(()=>{
      const token = localStorage.getItem("token")
      if (!token) {
        alert("login first")
        navigate("/login")
      }
      const fetchTheme = async () => {
      const res = await axios.get(
        "http://localhost:5050/user/theme",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTheme(res.data.theme); 
    };
    fetchTheme()
    },[])


    const submitdata=async(e)=>{
        e.preventDefault()
        const token = localStorage.getItem("token")
        if(!token){
            alert("login first")
            navigate("/login")
            return;
        }
        const result=await axios.post("http://localhost:5050/user/reset",data)
        alert("successfully")
        navigate("/profile")
    }
  return (
    <div className={`min-h-screen mt-14 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
   <div className={`border max-w-md mx-auto p-6 rounded shadow-md ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
  <form onSubmit={submitdata} className="space-y-4">

    <h1 className="text-3xl font-bold text-center mb-4">Change Password</h1>

    <label className="block font-medium">
      Email:
      <input
        type="email"
        value={data.email}
        onChange={(e)=>setData({...data,email:e.target.value})}
        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Enter your email"
      />
    </label>

    <label className="block font-medium">
      Old Password:
      <input
        type="password"
        value={data.oldpassword}
        onChange={(e)=>setData({...data,oldpassword:e.target.value})}
        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Enter old password"
      />
    </label>

    <label className="block font-medium">
      New Password:
      <input
        type="password"
        value={data.newpassword}
        onChange={(e)=>setData({...data,newpassword:e.target.value})}
        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Enter new password"
      />
    </label>

    <label className="block  font-medium">
      Confirm Password:
      <input
        type="password"
        value={data.confrompassword}
        onChange={(e)=>setData({...data,confrompassword:e.target.value})}
        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Confirm new password"
      />
    </label>

    <button
      type="submit"
      className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition mt-2"
    >
      Submit
    </button>

  </form>
</div>
</div>
  )
}

export default Reset

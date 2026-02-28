import axios from 'axios';
import React, { useState } from 'react'

const Agent = () => {
    const [showForm, setShowForm] = useState(false);
    const [input, setInput] = useState({
        fullName:"",
            email:"",
            phone:"",
            education:"",
            aadhaarNumber:"",
            aadhaarImage:"",
            profileImage:"",
            address:"",
            joiningDate:"",
            experienceYears:"",
    });

    const handleSubmit=async(e)=>{
        e.preventDefault();
        const formData = new FormData();
        formData.append("fullName", input.fullName);
        formData.append("email", input.email);
        formData.append("phone", input.phone);
        formData.append("education", input.education);
        formData.append("aadhaarNumber", input.aadhaarNumber);
        formData.append("aadhaarImage", input.aadhaarImage);
        formData.append("profileImage", input.profileImage);
        formData.append("address", input.address);
        formData.append("joiningDate", input.joiningDate);
        formData.append("experienceYears", input.experienceYears);

        try {
            await axios.post("http://localhost:5050/agent/", formData
            )
            alert("Agent added successfully");
            setShowForm(false);
        } catch (error) {
            console.error("Error adding agent:", error);
            alert("Failed to add agent");
        }
    }

  return (
    <div className='mt-10 ml-58'>
      <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        add agent
      </button>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <label htmlFor="">Full Name
            <input type="text" placeholder="Agent Name" value={input.fullName} onChange={(e) => setInput({...input, fullName: e.target.value})} />
          </label>

            <label htmlFor="">Email
            <input type="email" placeholder="Agent Email" value={input.email} onChange={(e) => setInput({...input, email: e.target.value})} />
          </label>

            <label htmlFor="">Phone
            <input type="text" placeholder="Agent Phone" value={input.phone} onChange={(e) => setInput({...input, phone: e.target.value})} />
            </label>

            <label htmlFor="">Education
            <select
  value={input.education}
  onChange={(e) => setInput({...input, education: e.target.value})}
>
  <option value="">Select Education</option>
  <option value="12th">12th</option>
  <option value="graduate">Graduate</option>
  <option value="postgraduate">Post Graduate</option>
</select>
            </label>

            <label htmlFor="">Aadhaar Number
            <input type="text" placeholder="Agent Aadhaar Number" value={input.aadhaarNumber} onChange={(e) => setInput({...input, aadhaarNumber: e.target.value})} />
            </label>

            <label htmlFor="">Aadhaar Image
            <input type="file" placeholder="Agent Aadhaar Image" onChange={(e) => setInput({...input, aadhaarImage: e.target.files[0]})} />
            </label>

            <label htmlFor="">Profile Image
            <input type="file" placeholder="Agent Profile Image" onChange={(e) => setInput({...input, profileImage: e.target.files[0]})} />
            </label>

            <label htmlFor="">Address
            <input type="text" placeholder="Agent Address" value={input.address} onChange={(e) => setInput({...input, address: e.target.value})} />
            </label>

            <label htmlFor="">Joining Date
            <input type="date" placeholder="Agent Joining Date" value={input.joiningDate} onChange={(e) => setInput({...input, joiningDate: e.target.value})} />
            </label>

            <label htmlFor="">Experience Years
            <input type="number" placeholder="Agent Experience Years" value={input.experienceYears} onChange={(e) => setInput({...input, experienceYears: e.target.value})} />
            </label>

            <button type="submit">Submit</button>
        </form>
        )}
    </div>
  )
}

export default Agent

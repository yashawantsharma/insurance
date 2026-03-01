import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md';

const Agent = () => {
  const [showForm, setShowForm] = useState(false);
  const [theme, setTheme] = useState("light");
  const [data, setData] = useState([]);
  const [view, setView] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("")
  const [input, setInput] = useState({
    fullName: "",
    email: "",
    phone: "",
    education: "",
    aadhaarNumber: "",
    aadhaarImage: "",
    profileImage: "",
    address: "",
    joiningDate: "",
    experienceYears: "",
  });


  const [editinput, setEditInput] = useState({
    fullName: "",
    endDate: "",
    phone: "",
    education: "",
    aadhaarNumber: "",
    address: "",
    joiningDate: "",
    experienceYears: "",
  });

  useEffect(() => {
    getTheme()
    fatchAgents()
  }, [])


  const getTheme = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first.");
      return;
    }
    try {
      const res = await axios.get("http://localhost:5050/user/theme", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTheme(res.data.theme);
      fatchAgents();
    } catch (error) {
      console.error("Error fetching theme:", error);

    }
  }

  const handleSubmit = async (e) => {
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
      fatchAgents()
    } catch (error) {
      console.error("Error adding agent:", error);
      alert("Failed to add agent");
    }
  }


  const fatchAgents = async () => {
    try {
      const res = await axios.get("http://localhost:5050/agent/findall");
      setData(res.data);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  }

  const handleView = async (x) => {
    try {
      const res = await axios.get(`http://localhost:5050/agent/findone/${x._id}`);
      setSelectedItem(res.data);
      setView(true);

    }
    catch (error) {
      console.error("Error fetching record details:", error);
    }
  }


  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5050/agent/delete/${id}`);
      alert("Record deleted successfully!");
      fatchAgents();
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  }


  const handlEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5050/agent/update/${editData._id}`, editinput);
      alert("Record updated successfully!");
      setIsOpen(false);
      fatchAgents();
    } catch (error) {
      console.error("Error updating record:", error);
    }
  }


    const filteredData = data.filter((item) =>
        item.fullName.toLowerCase().includes(search.toLowerCase())
    );

  // console.log(data);

  return (
    <div
      className={`${theme === "dark"
        ? "bg-gray-900 text-white"
        : "bg-gray-100 text-black"
        } min-h-screen ml-64 mt-14`}
    >
      <h2 className='font-bold text-2xl'>Agent</h2>
      <div className="flex justify-end">

        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          + Add Agent
        </button>
      </div>
      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 rounded-md mb-4 w-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />


      {filteredData.length > 0 ? (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full  rounded-lg shadow">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Profile Image
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Education
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Aadhaar Number
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Aadhaar Image
                </th>

                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Joining Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((agent) => (
                <tr key={agent._id}>
                  <td className="py-3 px-6 border-b border-gray-200">
                    <img
                      src={agent.profileImage}
                      alt="Profile"
                      className="w-16 h-16 object-cover rounded-full"
                    />
                  </td>
                  <td className="py-3 px-6 border-b border-gray-200">{agent.fullName}</td>
                  <td className="py-3 px-6 border-b border-gray-200">{agent.email}</td>
                  <td className="py-3 px-6 border-b border-gray-200">{agent.phone}</td>
                  <td className="py-3 px-6 border-b border-gray-200">{agent.education}</td>
                  <td className="py-3 px-6 border-b border-gray-200">{agent.aadhaarNumber}</td>
                  <td className="py-3 px-6 border-b border-gray-200">
                    <img
                      src={agent.aadhaarImage}
                      alt="Aadhaar"
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>

                  <td className="py-3 px-6 border-b border-gray-200">{agent.address}</td>
                  <td className="py-3 px-6 border-b border-gray-200">{new Date(agent.joiningDate).toLocaleDateString()}</td>
                  <td className="py-3 px-6 border-b border-gray-200">{agent.experienceYears} years</td>
                  <td className="py-3 px-6 border-b border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleView(agent)}
                        className="text-gray-600 hover:text-gray-800"
                        title="View"
                      >
                        <MdVisibility size={20} />
                      </button>

                      <button
                        onClick={() => {
                          setEditData(agent);
                          setIsOpen(true);
                        }}
                        className="text-yellow-500 hover:text-yellow-600"
                        title="Edit"
                      >
                        <MdEdit size={20} />
                      </button>

                      <button
                        onClick={() => handleDelete(agent._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </td>
                </tr>

              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-6 ml-8">No agents available.</p>
      )}


      {view && selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setView(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className=" rounded-2xl shadow-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">📋 Agent Details</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Full Name:</span>
                <span>{selectedItem?.fullName}</span>
              </div>

              <div className="flex justify-between">
                <span>email:</span>
                <span>
                  {selectedItem?.email}
                </span>
              </div>

              <div className="flex justify-between">
                <span>education:</span>
                <span>{selectedItem?.education}</span>
              </div>

              <div className="flex justify-between">
                <span>aadhaarNumber:</span>
                <span>{selectedItem?.aadhaarNumber}</span>
              </div>

              <div className="flex justify-between font-bold  pt-2">
                <span>address:</span>
                <span>{selectedItem?.address}</span>
              </div>
              <div className="flex justify-between font-bold  pt-2">
                <span>joiningDate:</span>
                <span>{selectedItem?.joiningDate.split('T')[0]}</span>
              </div>
              <div className="flex justify-between font-bold  pt-2">
                <span>experienceYears:</span>
                <span>{selectedItem?.experienceYears}</span>
              </div>
            </div>

            <button
              onClick={() => setView(false)}
              className="mt-5 w-full py-2 bg-blue-500 text-white rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}





      {isOpen && editData && (
        <>
          <div className={`fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
            <form onSubmit={handlEdit} className=" rounded-lg shadow-xl px-8 pt-6 pb-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6">Edit Agent</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editinput.fullName}
                    onChange={(e) => setEditInput({ ...editinput, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email :
                  </label>
                  <input
                    type="text"
                    value={editinput.email}
                    onChange={(e) => setEditInput({ ...editinput, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    phone
                  </label>
                  <input
                    type="number"

                    value={editinput.phone}
                    onChange={(e) => setEditInput({ ...editinput, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Education :
                  </label>
                  <select
                    value={editinput.education}
                    onChange={(e) =>
                      setEditInput({ ...editinput, education: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Education</option>
                    <option value="12th">12th</option>
                    <option value="graduate">Graduate</option>
                    <option value="postgraduate">Post Graduate</option>
                  </select>
                </div>


                <div>
                  <label className="block text-sm font-medium mb-2">
                    aadhaarNumber
                  </label>
                  <input
                    type="number"
                    name="totalAmount"
                    value={editinput.aadhaarNumber}
                    onChange={(e) => setEditInput({ ...editinput, aadhaarNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className=" text-sm font-medium mb-2">
                    address
                  </label>
                  <input
                    type="text"
                    value={editinput.address}
                    name="installmentAmount"
                    onChange={(e) => setEditInput({ ...editinput, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className=" text-sm font-medium mb-2">
                    joiningDate
                  </label>
                  <input
                    type="date"
                    value={editinput.joiningDate}
                    name="installmentAmount"
                    onChange={(e) => setEditInput({ ...editinput, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className=" text-sm font-medium mb-2">
                    experienceYears
                  </label>
                  <input
                    type="number"
                    value={editinput.experienceYears}
                    name="installmentAmount"
                    onChange={(e) => setEditInput({ ...editinput, experienceYears: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

        </>
      )}



      {showForm && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSubmit}
            className={`${theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-white text-black"
              } w-full max-w-4xl p-8 rounded-2xl shadow-xl`}
          >
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Agent Registration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Agent Name"
                  value={input.fullName}
                  onChange={(e) =>
                    setInput({ ...input, fullName: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Agent Email"
                  value={input.email}
                  onChange={(e) =>
                    setInput({ ...input, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Phone
                </label>
                <input
                  type="text"
                  placeholder="Agent Phone"
                  value={input.phone}
                  onChange={(e) =>
                    setInput({ ...input, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Education
                </label>
                <select
                  value={input.education}
                  onChange={(e) =>
                    setInput({ ...input, education: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Education</option>
                  <option value="12th">12th</option>
                  <option value="graduate">Graduate</option>
                  <option value="postgraduate">Post Graduate</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  placeholder="Aadhaar Number"
                  value={input.aadhaarNumber}
                  onChange={(e) =>
                    setInput({ ...input, aadhaarNumber: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Aadhaar Image
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setInput({
                      ...input,
                      aadhaarImage: e.target.files[0],
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Profile Image
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setInput({
                      ...input,
                      profileImage: e.target.files[0],
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Agent Address"
                  value={input.address}
                  onChange={(e) =>
                    setInput({ ...input, address: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Joining Date
                </label>
                <input
                  type="date"
                  value={input.joiningDate}
                  onChange={(e) =>
                    setInput({
                      ...input,
                      joiningDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Experience Years
                </label>
                <input
                  type="number"
                  placeholder="Experience"
                  value={input.experienceYears}
                  onChange={(e) =>
                    setInput({
                      ...input,
                      experienceYears: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>



            <div className="flex justify-end mt-8">
              <button
                type="close"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border rounded-lg transition"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Agent

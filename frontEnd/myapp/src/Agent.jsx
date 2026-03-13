import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md';
import { FaUsers, FaGraduationCap, FaBriefcase, FaCalendarAlt, FaIdCard, FaEnvelope, FaPhone } from 'react-icons/fa';

const Agent = () => {
  const [showForm, setShowForm] = useState(false);
  const [theme, setTheme] = useState("light");
  const [data, setData] = useState([]);
  const [view, setView] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("")
  const [branches, setBranches] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({
    education: "",
    experienceRange: "",
    branchId: "",
    status: ""
  });
  const [summaryData, setSummaryData] = useState({
    totalAgents: 0,
    activeAgents: 0,
    averageExperience: 0,
    graduateCount: 0
  });
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
    branchId: "",
    duration: ""
  });

  const [editinput, setEditInput] = useState({
    fullName: "",
    email: "",
    phone: "",
    education: "",
    aadhaarNumber: "",
    address: "",
    joiningDate: "",
    experienceYears: "",
    branchId: "",
    isActive: ""
  });

  useEffect(() => {
    axios.get("http://localhost:5050/branch/findall")
      .then(res => setBranches(res.data.data))
    getTheme()
    fatchAgents()
  }, [])

  useEffect(() => {
    calculateSummary();
    const handleThemeChange = (event) => {
            setTheme(event.detail);
            applyThemeToDocument(event.detail);
        };
        window.addEventListener('themeChange', handleThemeChange);
        return () => {
            window.removeEventListener('themeChange', handleThemeChange);
        };
  }, [data]);

  const calculateSummary = () => {
    const totalAgents = data.length;
    const activeAgents = data.filter(item => item.isActive === true).length;
    const totalExperience = data.reduce((sum, item) => sum + (item.experienceYears || 0), 0);
    const averageExperience = totalAgents > 0 ? (totalExperience / totalAgents).toFixed(1) : 0;
    const graduateCount = data.filter(item =>
      item.education === "graduate" || item.education === "postgraduate"
    ).length;

    setSummaryData({
      totalAgents,
      activeAgents,
      averageExperience,
      graduateCount
    });
  };

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
    formData.append("branchId", input.branchId);
    formData.append("duration", input.duration);

    try {
      await axios.post("http://localhost:5050/agent/", formData)
      alert("Agent added successfully");
      setShowForm(false);
      setInput({
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
        branchId: "",
        duration: ""
      });
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
    } catch (error) {
      console.error("Error fetching record details:", error);
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      try {
        await axios.delete(`http://localhost:5050/agent/delete/${id}`);
        alert("Record deleted successfully!");
        fatchAgents();
      } catch (error) {
        console.error("Error deleting record:", error);
      }
    }
  }

  const handleEditClick = (agent) => {
    setEditData(agent);
    setEditInput({
      fullName: agent.fullName || "",
      email: agent.email || "",
      phone: agent.phone || "",
      education: agent.education || "",
      aadhaarNumber: agent.aadhaarNumber || "",
      address: agent.address || "",
      joiningDate: agent.joiningDate ? agent.joiningDate.split('T')[0] : "",
      experienceYears: agent.experienceYears || "",
      branchId: agent.branchId || "",
    });
    setIsOpen(true);
  };

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

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b._id === branchId);
    return branch ? branch.branchName : 'N/A';
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = item.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      item.email?.toLowerCase().includes(search.toLowerCase()) ||
      item.phone?.includes(search);

    const matchesEducation = filterCriteria.education === "" || item.education === filterCriteria.education;

    let matchesExperience = true;
    if (filterCriteria.experienceRange === "0-2") {
      matchesExperience = item.experienceYears >= 0 && item.experienceYears <= 2;
    } else if (filterCriteria.experienceRange === "3-5") {
      matchesExperience = item.experienceYears >= 3 && item.experienceYears <= 5;
    } else if (filterCriteria.experienceRange === "5+") {
      matchesExperience = item.experienceYears > 5;
    }

    const matchesBranch = filterCriteria.branchId === "" || item.branchId === filterCriteria.branchId;

    const matchesStatus = filterCriteria.status === "" ||
      (filterCriteria.status === "active" && item.isActive === true) ||
      (filterCriteria.status === "inactive" && item.isActive === false);

    return matchesSearch && matchesEducation && matchesExperience && matchesBranch && matchesStatus;
  });
  // console.log(filterCriteria);


  const clearFilters = () => {
    setFilterCriteria({
      education: "",
      experienceRange: "",
      branchId: "",
      status: ""
    });
    setSearch("");
  };

  return (
    <div
      className={`${theme === "dark"
        ? "bg-gray-900 text-white"
        : "bg-gray-100 text-black"
        } min-h-screen ml-64 mt-14 p-6`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className='font-bold text-3xl'>Agent Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition transform hover:scale-105"
        >
          + Add Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg shadow-lg transform hover:scale-102 transition duration-200 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Agents</p>
              <p className="text-2xl font-bold">{summaryData.totalAgents}</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-full text-white">
              <FaUsers size={24} />
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg shadow-lg transform hover:scale-102 transition duration-200 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Agents</p>
              <p className="text-2xl font-bold">{summaryData.activeAgents}</p>
            </div>
            <div className="p-3 bg-green-500 rounded-full text-white">
              <FaBriefcase size={24} />
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg shadow-lg transform hover:scale-102 transition duration-200 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Experience</p>
              <p className="text-2xl font-bold">{summaryData.averageExperience} yrs</p>
            </div>
            <div className="p-3 bg-purple-500 rounded-full text-white">
              <FaCalendarAlt size={24} />
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg shadow-lg transform hover:scale-102 transition duration-200 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Graduates</p>
              <p className="text-2xl font-bold">{summaryData.graduateCount}</p>
            </div>
            <div className="p-3 bg-yellow-500 rounded-full text-white">
              <FaGraduationCap size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
        />

        <select
          value={filterCriteria.education}
          onChange={(e) => setFilterCriteria({ ...filterCriteria, education: e.target.value })}
          className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
        >
          <option value="">All Education</option>
          <option value="12th">12th</option>
          <option value="graduate">Graduate</option>
          <option value="postgraduate">Post Graduate</option>
        </select>

        <select
          value={filterCriteria.experienceRange}
          onChange={(e) => setFilterCriteria({ ...filterCriteria, experienceRange: e.target.value })}
          className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
        >
          <option value="">All Experience</option>
          <option value="0-2">0-2 years</option>
          <option value="3-5">3-5 years</option>
          <option value="5+">5+ years</option>
        </select>

        <select
          value={filterCriteria.branchId}
          onChange={(e) => setFilterCriteria({ ...filterCriteria, branchId: e.target.value })}
          className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
        >
          <option value="">All Branches</option>
          {branches.map((branch) => (
            <option key={branch._id} value={branch._id}>
              {branch.branchName}
            </option>
          ))}
        </select>

        <select
          value={filterCriteria.status}
          onChange={(e) => setFilterCriteria({ ...filterCriteria, status: e.target.value })}
          className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {(search || filterCriteria.education || filterCriteria.experienceRange || filterCriteria.branchId || filterCriteria.status) && (
        <div className="flex justify-end mb-2">
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear Filters
          </button>
        </div>
      )}

      {filteredData.length > 0 ? (
        <div className="overflow-x-auto mt-6 rounded-lg shadow">
          <table className="min-w-full">
            <thead className={`${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  Profile
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  Name & Contact
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  Education
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  Aadhaar
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  Joining Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"}`}>
              {filteredData.map((agent) => (
                <tr key={agent._id} className={`${theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition duration-150`}>
                  <td className="py-3 px-4">
                    <img
                      src={agent.profileImage}
                      alt="Profile"
                      className="w-12 h-12 object-cover rounded-full"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{agent.fullName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <FaEnvelope size={12} /> {agent.email}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <FaPhone size={12} /> {agent.phone}
                    </div>
                  </td>
                  <td className="py-3 px-4">{agent.education}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FaIdCard className="text-gray-500" />
                      <span className="text-sm">{agent.aadhaarNumber}</span>
                    </div>
                    <img
                      src={agent.aadhaarImage}
                      alt="Aadhaar"
                      className="w-16 h-10 object-cover rounded mt-1"
                    />
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate">{agent.address}</td>
                  <td className="py-3 px-4">{new Date(agent.joiningDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{agent.experienceYears} years</td>
                  <td className="py-3 px-4">{getBranchName(agent.branchId)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${agent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {agent.isActive}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(agent)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition duration-200"
                        title="View"
                      >
                        <MdVisibility size={20} />
                      </button>
                      <button
                        onClick={() => handleEditClick(agent)}
                        className="text-yellow-500 hover:text-yellow-600 p-1 rounded-full hover:bg-yellow-100 transition duration-200"
                        title="Edit"
                      >
                        <MdEdit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(agent._id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition duration-200"
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
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No agents available matching your criteria.
        </div>
      )}

      {view && selectedItem && (
        <div
          className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setView(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`rounded-2xl shadow-2xl p-6 w-full max-w-md ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}
          >
            <h2 className="text-xl font-bold mb-4">📋 Agent Details</h2>
            <div className="space-y-3">
              <div className="flex justify-center mb-4">
                <img
                  src={selectedItem?.profileImage}
                  alt="Profile"
                  className="w-24 h-24 object-cover rounded-full border-4 border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-semibold">Full Name:</span>
                <span>{selectedItem?.fullName}</span>

                <span className="font-semibold">Email:</span>
                <span>{selectedItem?.email}</span>

                <span className="font-semibold">Phone:</span>
                <span>{selectedItem?.phone}</span>

                <span className="font-semibold">Education:</span>
                <span>{selectedItem?.education}</span>

                <span className="font-semibold">Aadhaar:</span>
                <span>{selectedItem?.aadhaarNumber}</span>

                <span className="font-semibold">Address:</span>
                <span>{selectedItem?.address}</span>

                <span className="font-semibold">Joining Date:</span>
                <span>{selectedItem?.joiningDate?.split('T')[0]}</span>

                <span className="font-semibold">Experience:</span>
                <span>{selectedItem?.experienceYears} years</span>

                <span className="font-semibold">Branch:</span>
                <span>{getBranchName(selectedItem?.branchId)}</span>

                <span className="font-semibold">Status:</span>
                <span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedItem?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedItem?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </span>
              </div>
              <div className="mt-4">
                <span className="font-semibold">Aadhaar Image:</span>
                <img
                  src={selectedItem?.aadhaarImage}
                  alt="Aadhaar"
                  className="w-full h-32 object-cover rounded mt-2"
                />
              </div>
            </div>
            <button
              onClick={() => setView(false)}
              className="mt-5 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isOpen && editData && (
        <div className={`fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto`}>
          <form onSubmit={handlEdit} className={`rounded-lg shadow-xl px-8 pt-6 pb-8 w-full max-w-md ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
            <h2 className="text-2xl font-bold mb-6">Edit Agent</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={editinput.fullName}
                  onChange={(e) => setEditInput({ ...editinput, fullName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={editinput.email}
                  onChange={(e) => setEditInput({ ...editinput, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="text"
                  value={editinput.phone}
                  onChange={(e) => setEditInput({ ...editinput, phone: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Education</label>
                <select
                  value={editinput.education}
                  onChange={(e) => setEditInput({ ...editinput, education: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  required
                >
                  <option value="">Select Education</option>
                  <option value="12th">12th</option>
                  <option value="graduate">Graduate</option>
                  <option value="postgraduate">Post Graduate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Aadhaar Number</label>
                <input
                  type="text"
                  value={editinput.aadhaarNumber}
                  onChange={(e) => setEditInput({ ...editinput, aadhaarNumber: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <input
                  type="text"
                  value={editinput.address}
                  onChange={(e) => setEditInput({ ...editinput, address: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Joining Date</label>
                <input
                  type="date"
                  value={editinput.joiningDate}
                  onChange={(e) => setEditInput({ ...editinput, joiningDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Experience Years</label>
                <input
                  type="number"
                  value={editinput.experienceYears}
                  onChange={(e) => setEditInput({ ...editinput, experienceYears: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Branch</label>
                <select
                  value={editinput.branchId}
                  onChange={(e) => setEditInput({ ...editinput, branchId: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">status</label>
                <select
                  value={editinput.isActive}
                  onChange={(e) => setEditInput({ ...editinput, isActive: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  required
                >
                  <option value="">Select Education</option>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Update
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
      )}

      {showForm && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className={`${theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-white text-black"
              } w-full max-w-4xl p-8 rounded-2xl shadow-xl my-8`}
          >
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Agent Registration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  placeholder="Agent Name"
                  value={input.fullName}
                  onChange={(e) => setInput({ ...input, fullName: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  placeholder="Agent Email"
                  value={input.email}
                  onChange={(e) => setInput({ ...input, email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Phone</label>
                <input
                  type="text"
                  placeholder="Agent Phone"
                  value={input.phone}
                  onChange={(e) => setInput({ ...input, phone: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Education</label>
                <select
                  value={input.education}
                  onChange={(e) => setInput({ ...input, education: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-black"
                    }`}
                  required
                >
                  <option value="">Select Education</option>
                  <option value="12th">12th</option>
                  <option value="graduate">Graduate</option>
                  <option value="postgraduate">Post Graduate</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Aadhaar Number</label>
                <input
                  type="text"
                  placeholder="Aadhaar Number"
                  value={input.aadhaarNumber}
                  onChange={(e) => setInput({ ...input, aadhaarNumber: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Aadhaar Image</label>
                <input
                  type="file"
                  onChange={(e) => setInput({ ...input, aadhaarImage: e.target.files[0] })}
                  className="w-full"
                  accept="image/*"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Profile Image</label>
                <input
                  type="file"
                  onChange={(e) => setInput({ ...input, profileImage: e.target.files[0] })}
                  className="w-full"
                  accept="image/*"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Address</label>
                <input
                  type="text"
                  placeholder="Agent Address"
                  value={input.address}
                  onChange={(e) => setInput({ ...input, address: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Joining Date</label>
                <input
                  type="date"
                  value={input.joiningDate}
                  onChange={(e) => setInput({ ...input, joiningDate: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Experience Years</label>
                <input
                  type="number"
                  placeholder="Experience"
                  value={input.experienceYears}
                  onChange={(e) => setInput({ ...input, experienceYears: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Branch</label>
                <select
                  value={input.branchId}
                  onChange={(e) => setInput({ ...input, branchId: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-black"
                    }`}
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Duration</label>
                <input
                  type="number"
                  name='duration'
                  placeholder="Duration in months"
                  value={input.duration}
                  onChange={(e) => setInput({ ...input, duration: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Cancel
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
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md';
import { FaUsers, FaUserTie, FaMale, FaFemale, FaEnvelope, FaPhone } from 'react-icons/fa';

const User = () => {
    const [data, setData] = useState([])
    const [agents, setAgents] = useState([])
    const [theme, setTheme] = useState("");
    const [view, setView] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showForm, setShowForm] = useState(false)
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [editData, setEditData] = useState(null);
    const [filterCriteria, setFilterCriteria] = useState({
        gender: "",
        role: ""
    });
    const [summaryData, setSummaryData] = useState({
        totalUsers: 0,
        maleUsers: 0,
        femaleUsers: 0,
        otherUsers: 0
    });
    const [input, setInput] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "user",
        gender: "",
        agentId: ""
    })

    const [editinput, setEditInput] = useState({
        name: "",
        email: "",
        phone: "",
        role: "",
        gender: "",
        agentId: ""
    });

    useEffect(() => {
        fatchdata()
        fetchAgents()
        fatchTheme()
    }, [])

    useEffect(() => {
        calculateSummary();
    }, [data]);

    const calculateSummary = () => {
        const users = data.filter(x => x.role === "user");
        const totalUsers = users.length;
        const maleUsers = users.filter(x => x.gender === "male").length;
        const femaleUsers = users.filter(x => x.gender === "female").length;
        const otherUsers = users.filter(x => x.gender === "other" || (x.gender && !['male', 'female'].includes(x.gender))).length;

        setSummaryData({
            totalUsers,
            maleUsers,
            femaleUsers,
            otherUsers
        });
    };

    const fatchdata = async () => {
        try {
            const res = await axios.get("http://localhost:5050/user/findall")
            setData(res.data)
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    const fetchAgents = async () => {
        try {
            const res = await axios.get("http://localhost:5050/agent/findall")
            setAgents(res.data)
        } catch (error) {
            console.error("Error fetching agents:", error);
        }
    }

    const users = data.filter((x) => x.role === "user")

    const fatchTheme = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                `http://localhost:5050/user/theme/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setTheme(res.data.theme);
        } catch (error) {
            console.error("Error fetching theme data:", error);
        }
    }

    const handleView = async (x) => {
        try {
            const res = await axios.get(`http://localhost:5050/user/findone/${x._id}`);
            setSelectedItem(res.data);
            setView(true);
        } catch (error) {
            console.error("Error fetching record details:", error);
        }
    }

    const handlsubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            await axios.post("http://localhost:5050/user/", input, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert("User added successfully!");
            fatchdata()
            setShowForm(false);
            setInput({
                name: "",
                email: "",
                phone: "",
                password: "",
                role: "user",
                gender: "",
                agentId: ""
            });
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Failed to add user");
        }
    }

    const handledit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5050/user/update/${editData._id}`, editinput)
            alert("User updated successfully!")
            fatchdata()
            setIsOpen(false)
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user");
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`http://localhost:5050/user/delete/${id}`)
                alert("User deleted successfully!")
                fatchdata()
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Failed to delete user");
            }
        }
    }

    const editdatashow = (item) => {
        setEditInput({
            name: item.name || "",
            email: item.email || "",
            password: "",
            role: item.role || "user",
            gender: item.gender || "",
            phone: item.phone || "",
            agentId: item.agentId || "",
        });
        setEditData(item);
        setIsOpen(true);
    }

    const getAgentName = (agentId) => {
        if (!agentId) return 'N/A';
        const agent = agents.find(a => a._id === agentId);
        return agent ? agent.fullName : 'N/A';
    }

    const filteredData = users.filter((item) => {
        const matchesSearch = search === "" || 
            (item.name && item.name.toLowerCase().includes(search.toLowerCase())) ||
            (item.email && item.email.toLowerCase().includes(search.toLowerCase())) ||
            (item.phone && item.phone.toString().includes(search));
        
        const matchesGender = filterCriteria.gender === "" || item.gender === filterCriteria.gender;
        const matchesRole = filterCriteria.role === "" || item.role === filterCriteria.role;
        
        return matchesSearch && matchesGender && matchesRole;
    });

    const clearFilters = () => {
        setFilterCriteria({
            gender: "",
            role: ""
        });
        setSearch("");
    };

    return (
        <div
            className={`ml-64 mt-14 p-6 min-h-screen ${theme === "dark"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-black"
                }`}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">User Management</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition transform hover:scale-105"
                >
                    + Add User
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-lg shadow-lg transform hover:scale-102 transition duration-200 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                            <p className="text-2xl font-bold">{summaryData.totalUsers}</p>
                        </div>
                        <div className="p-3 bg-blue-500 rounded-full text-white">
                            <FaUsers size={24} />
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-lg shadow-lg transform hover:scale-102 transition duration-200 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Male Users</p>
                            <p className="text-2xl font-bold">{summaryData.maleUsers}</p>
                        </div>
                        <div className="p-3 bg-green-500 rounded-full text-white">
                            <FaMale size={24} />
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-lg shadow-lg transform hover:scale-102 transition duration-200 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Female Users</p>
                            <p className="text-2xl font-bold">{summaryData.femaleUsers}</p>
                        </div>
                        <div className="p-3 bg-purple-500 rounded-full text-white">
                            <FaFemale size={24} />
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-lg shadow-lg transform hover:scale-102 transition duration-200 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Other Users</p>
                            <p className="text-2xl font-bold">{summaryData.otherUsers}</p>
                        </div>
                        <div className="p-3 bg-yellow-500 rounded-full text-white">
                            <FaUserTie size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <input
                    type="text"
                    placeholder="Search by name, email or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                />

                <select
                    value={filterCriteria.gender}
                    onChange={(e) => setFilterCriteria({ ...filterCriteria, gender: e.target.value })}
                    className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                >
                    <option value="">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>

                <select
                    value={filterCriteria.role}
                    onChange={(e) => setFilterCriteria({ ...filterCriteria, role: e.target.value })}
                    className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            {(search || filterCriteria.gender || filterCriteria.role) && (
                <div className="flex justify-end mb-2">
                    <button
                        onClick={clearFilters}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            <div className="overflow-x-auto dark:bg-gray-800 rounded-xl shadow">
                <table className="min-w-full text-sm text-left">
                    <thead className="dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Gender</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Assigned Agent</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((x) => (
                                <tr
                                    key={x._id}
                                    className={`border-b dark:border-gray-700 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition`}
                                >
                                    <td className="px-4 py-3 font-medium">
                                        {x.name || "N/A"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <FaEnvelope size={12} className="text-gray-500" />
                                            {x.email}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <FaPhone size={12} className="text-gray-500" />
                                            {x.phone}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                            ${x.gender === 'male' ? 'bg-blue-100 text-blue-800' : 
                                              x.gender === 'female' ? 'bg-pink-100 text-pink-800' : 
                                              'bg-purple-100 text-purple-800'}`}>
                                            {x.gender || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                            ${x.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {x.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {getAgentName(x.agentId)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleView(x)}
                                                className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition duration-200"
                                                title="View"
                                            >
                                                <MdVisibility size={20} />
                                            </button>

                                            <button
                                                onClick={() => editdatashow(x)}
                                                className="text-yellow-500 hover:text-yellow-600 p-1 rounded-full hover:bg-yellow-100 transition duration-200"
                                                title="Edit"
                                            >
                                                <MdEdit size={20} />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(x._id)}
                                                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition duration-200"
                                                title="Delete"
                                            >
                                                <MdDelete size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-8 text-gray-500">
                                    No users found matching your criteria
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {view && selectedItem && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={() => setView(false)}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className={`rounded-2xl shadow-2xl p-6 w-full max-w-md ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}
                        >
                            <h2 className="text-xl font-bold mb-4">📋 User Details</h2>

                            <div className="space-y-3">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Name:</span>
                                    <span>{selectedItem?.name}</span>
                                </div>

                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Email:</span>
                                    <span>{selectedItem?.email}</span>
                                </div>

                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Phone:</span>
                                    <span>{selectedItem?.phone}</span>
                                </div>

                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Gender:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                        ${selectedItem?.gender === 'male' ? 'bg-blue-100 text-blue-800' : 
                                          selectedItem?.gender === 'female' ? 'bg-pink-100 text-pink-800' : 
                                          'bg-purple-100 text-purple-800'}`}>
                                        {selectedItem?.gender}
                                    </span>
                                </div>

                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Role:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                        ${selectedItem?.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {selectedItem?.role}
                                    </span>
                                </div>

                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Assigned Agent:</span>
                                    <span>{getAgentName(selectedItem?.agentId)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="font-semibold">Theme:</span>
                                    <span>{selectedItem?.theme || 'light'}</span>
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
            </div>

            {isOpen && editinput && (
                <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50`}>
                    <form onSubmit={handledit} className={`rounded-lg shadow-xl px-8 pt-6 pb-8 w-full max-w-md ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
                        <h2 className="text-2xl font-bold mb-6">Edit User</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <input
                                    type="text"
                                    value={editinput.name}
                                    onChange={(e) => setEditInput({ ...editinput, name: e.target.value })}
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
                                    type="number"
                                    value={editinput.phone}
                                    onChange={(e) => setEditInput({ ...editinput, phone: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Gender</label>
                                <select
                                    value={editinput.gender}
                                    onChange={(e) => setEditInput({ ...editinput, gender: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Role</label>
                                <select
                                    value={editinput.role}
                                    onChange={(e) => setEditInput({ ...editinput, role: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                >
                                    <option value="">Select role</option>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Assign Agent</label>
                                <select
                                    value={editinput.agentId}
                                    onChange={(e) => setEditInput({ ...editinput, agentId: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                >
                                    <option value="">Select Agent (Optional)</option>
                                    {Array.isArray(agents) && agents.map((agent) => (
                                        <option key={agent._id} value={agent._id}>
                                            {agent.fullName} - {agent.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">New Password (leave blank to keep current)</label>
                                <input
                                    type="password"
                                    value={editinput.password}
                                    onChange={(e) => setEditInput({ ...editinput, password: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    placeholder="Enter new password"
                                />
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
                <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50`}>
                    <form onSubmit={handlsubmit} className={`rounded-lg shadow-xl px-8 pt-6 pb-8 w-full max-w-md ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
                        <h2 className="text-2xl font-bold mb-6">Add New User</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <input
                                    type="text"
                                    value={input.name}
                                    onChange={(e) => setInput({ ...input, name: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    value={input.email}
                                    onChange={(e) => setInput({ ...input, email: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Phone</label>
                                <input
                                    type="number"
                                    value={input.phone}
                                    onChange={(e) => setInput({ ...input, phone: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Password</label>
                                <input
                                    type="password"
                                    value={input.password}
                                    onChange={(e) => setInput({ ...input, password: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Gender</label>
                                <select
                                    value={input.gender}
                                    onChange={(e) => setInput({ ...input, gender: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Role</label>
                                <select
                                    value={input.role}
                                    onChange={(e) => setInput({ ...input, role: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Assign Agent</label>
                                <select
                                    value={input.agentId}
                                    onChange={(e) => setInput({ ...input, agentId: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                >
                                    <option value="">Select Agent (Optional)</option>
                                    {Array.isArray(agents) && agents.map((agent) => (
                                        <option key={agent._id} value={agent._id}>
                                            {agent.fullName} - {agent.email}
                                        </option>
                                    ))}
                                </select>
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
                                onClick={() => setShowForm(false)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

export default User
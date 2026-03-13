import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md'
import { FaUsers, FaUserTie, FaMale, FaFemale, FaEnvelope, FaPhone, FaSearch, FaFilter, FaTimes, FaPlus } from 'react-icons/fa'

const Agentuser = () => {
    const [data, setData] = useState([])
    const [theme, setTheme] = useState("")
    const [view, setView] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [search, setSearch] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [editId, setEditId] = useState(null)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "",
        role: "user"
    })
    const [filterCriteria, setFilterCriteria] = useState({
        gender: "",
        role: ""
    })
    const [summaryData, setSummaryData] = useState({
        totalUsers: 0,
        maleUsers: 0,
        femaleUsers: 0,
        otherUsers: 0
    })
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        fatchdata()
        fatchTheme()
    }, [])

    useEffect(() => {
        calculateSummary()
    }, [data])

    const calculateSummary = () => {
        const users = data.filter((x) => x.role === "user")
        const totalUsers = users.length
        const maleUsers = users.filter((x) => x.gender === "male").length
        const femaleUsers = users.filter((x) => x.gender === "female").length
        const otherUsers = users.filter((x) => x.gender === "other" || (x.gender && !["male", "female"].includes(x.gender))).length

        setSummaryData({
            totalUsers,
            maleUsers,
            femaleUsers,
            otherUsers
        })
    }

    const fatchdata = async () => {
        const token = localStorage.getItem("token")
        try {
            const res = await axios.get("http://localhost:5050/user/oneuser", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setData(res.data.users || [])
        } catch (error) {
            console.error("Error fetching data:", error)
        }
    }

    const fatchTheme = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await axios.get("http://localhost:5050/user/theme/", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setTheme(res.data.theme)
        } catch (error) {
            console.error("Error fetching theme data:", error)
        }
    }

    const handleView = async (x) => {
        try {
            const res = await axios.get(`http://localhost:5050/user/findone/${x._id}`)
            setSelectedItem(res.data)
            setView(true)
        } catch (error) {
            console.error("Error fetching record details:", error)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`http://localhost:5050/user/delete/${id}`)
                alert("User deleted successfully!")
                fatchdata()
            } catch (error) {
                console.error("Error deleting user:", error)
                alert("Failed to delete user")
            }
        }
    }

    const handleEdit = (user) => {
        setFormData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            gender: user.gender || "",
            role: user.role || "user"
        })
        setEditId(user._id)
        setIsEdit(true)
        setShowForm(true)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const token = localStorage.getItem("token")

        try {
            if (isEdit) {
                // Update user
                await axios.put(`http://localhost:5050/user/update/${editId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                alert("User updated successfully!")
            } else {
                // Add new user
                await axios.post("http://localhost:5050/user/", formData, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                alert("User added successfully!")
            }

            setShowForm(false)
            setIsEdit(false)
            setEditId(null)
            setFormData({
                name: "",
                email: "",
                phone: "",
                gender: "",
                role: "user"
            })
            fatchdata()
        } catch (error) {
            console.error("Error saving user:", error)
            alert("Failed to save user")
        }
    }

    const users = data.filter((x) => x.role === "user")

    const filteredData = users.filter((item) => {
        const searchTerm = search.toLowerCase()
        const matchesSearch = search === "" ||
            (item.name && item.name.toLowerCase().includes(searchTerm)) ||
            (item.email && item.email.toLowerCase().includes(searchTerm)) ||
            (item.phone && item.phone.toString().includes(searchTerm))

        const matchesGender = filterCriteria.gender === "" || item.gender === filterCriteria.gender
        const matchesRole = filterCriteria.role === "" || item.role === filterCriteria.role

        return matchesSearch && matchesGender && matchesRole
    })

    const clearFilters = () => {
        setFilterCriteria({
            gender: "",
            role: ""
        })
        setSearch("")
    }

    const getGenderBadge = (gender) => {
        switch (gender) {
            case "male":
                return "bg-blue-100 text-blue-800 border border-blue-300"
            case "female":
                return "bg-pink-100 text-pink-800 border border-pink-300"
            default:
                return "bg-purple-100 text-purple-800 border border-purple-300"
        }
    }

    const getRoleBadge = (role) => {
        return role === "admin"
            ? "bg-red-100 text-red-800 border border-red-300"
            : "bg-green-100 text-green-800 border border-green-300"
    }

    const hasActiveFilters = search || filterCriteria.gender || filterCriteria.role

    return (
        <div
            className={`ml-64 mt-14 p-6 min-h-screen transition-all duration-300 ${theme === "dark"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-black"
                }`}
        >
            <div className="flex justify-between items-center mb-8">
                <h2 className={`text-3xl font-bold text-transparent ${theme === "dark"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-black"
                    }`}>
                    User Management
                </h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-5 py-2.5 border  rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                        <FaFilter size={16} />
                        {showFilters ? "Hide Filters" : "Show Filters"}
                    </button>
                    <button
                        onClick={() => {
                            setFormData({
                                name: "",
                                email: "",
                                phone: "",
                                gender: "",
                                role: "user"
                            })
                            setIsEdit(false)
                            setShowForm(true)
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                        <FaPlus size={16} />
                        Add User
                    </button>
                </div>
            </div>

          

            <div className="mb-6 space-y-4">
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
                                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                                : "bg-white border-gray-200 text-black placeholder-gray-400"
                            }`}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes size={16} />
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                            value={filterCriteria.gender}
                            onChange={(e) => setFilterCriteria({ ...filterCriteria, gender: e.target.value })}
                            className={`px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
                                    ? "bg-gray-800 border-gray-700 text-white"
                                    : "bg-white border-gray-200 text-black"
                                }`}
                        >
                            <option value="">All Genders</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>

                        <select
                            value={filterCriteria.role}
                            onChange={(e) => setFilterCriteria({ ...filterCriteria, role: e.target.value })}
                            className={`px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
                                    ? "bg-gray-800 border-gray-700 text-white"
                                    : "bg-white border-gray-200 text-black"
                                }`}
                        >
                            <option value="">All Roles</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                )}

                {hasActiveFilters && (
                    <div className="flex justify-end">
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-all duration-300"
                        >
                            <FaTimes size={14} />
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>

            <div className={`overflow-x-auto rounded-xl shadow-2xl ${theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}>
                <table className="min-w-full text-sm text-left">
                    <thead className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                        }`}>
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Gender</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((x) => (
                                <tr
                                    key={x._id}
                                    className={`border-b transition-all duration-300 hover:shadow-lg ${theme === "dark"
                                            ? "border-gray-700 hover:bg-gray-700"
                                            : "border-gray-200 hover:bg-gray-100"
                                        }`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
                                                {x.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium">{x.name || "N/A"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                <FaEnvelope className="text-gray-500" size={12} />
                                                <span className="truncate max-w-[200px]">{x.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <FaPhone className="text-gray-500" size={12} />
                                                <span>{x.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getGenderBadge(x.gender)}`}>
                                            {x.gender || "N/A"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getRoleBadge(x.role)}`}>
                                            {x.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => handleView(x)}
                                                className="p-2.5 text-blue-500  transform hover:scale-110 transition-all duration-300 shadow-md hover:shadow-xl"
                                                title="View Details"
                                            >
                                                <MdVisibility size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(x)}
                                                className="p-2.5 text-yellow-500 transform hover:scale-110 transition-all duration-300 shadow-md hover:shadow-xl"
                                                title="Edit User"
                                            >
                                                <MdEdit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(x._id)}
                                                className="p-2.5 text-red-500 rounded-lg transform hover:scale-110 transition-all duration-300 shadow-md hover:shadow-xl"
                                                title="Delete User"
                                            >
                                                <MdDelete size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-16">
                                    <div className="flex flex-col items-center gap-4">
                                        <FaUsers size={64} className="text-gray-400" />
                                        <p className="text-xl text-gray-500">No users found</p>
                                        {hasActiveFilters && (
                                            <button
                                                onClick={clearFilters}
                                                className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-md"
                                            >
                                                Clear Filters
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {view && selectedItem && (
                    <div
                        className="fixed inset-0  bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
                        onClick={() => setView(false)}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className={`rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
                                }`}
                        >
                            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                User Details
                            </h2>

                            <div className="space-y-4">
                                <div className="flex justify-center mb-6">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                                        {selectedItem?.name?.charAt(0).toUpperCase()}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 border-b pb-3">
                                        <span className="text-sm text-gray-500 block">Full Name</span>
                                        <p className="text-lg font-semibold mt-1">{selectedItem?.name}</p>
                                    </div>

                                    <div className="col-span-2 border-b pb-3">
                                        <span className="text-sm text-gray-500 block">Email Address</span>
                                        <p className="text-lg mt-1 flex items-center gap-2">
                                            <FaEnvelope className="text-gray-400" size={16} />
                                            {selectedItem?.email}
                                        </p>
                                    </div>

                                    <div className="col-span-2 border-b pb-3">
                                        <span className="text-sm text-gray-500 block">Phone Number</span>
                                        <p className="text-lg mt-1 flex items-center gap-2">
                                            <FaPhone className="text-gray-400" size={16} />
                                            {selectedItem?.phone}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-sm text-gray-500 block">Gender</span>
                                        <p className="mt-2">
                                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getGenderBadge(selectedItem?.gender)}`}>
                                                {selectedItem?.gender}
                                            </span>
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-sm text-gray-500 block">Role</span>
                                        <p className="mt-2">
                                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getRoleBadge(selectedItem?.role)}`}>
                                                {selectedItem?.role}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setView(false)}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showForm && (
                    <div
                        className="fixed inset-0  bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
                        onClick={() => {
                            setShowForm(false)
                            setIsEdit(false)
                            setEditId(null)
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className={`rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
                                }`}
                        >
                            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {isEdit ? "Edit User" : "Add New User"}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-white border-gray-200 text-black"
                                            }`}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-white border-gray-200 text-black"
                                            }`}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Phone *</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-white border-gray-200 text-black"
                                            }`}
                                        required
                                    />
                                </div>

                                {!isEdit && (
                                    <div>

                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-2">Gender *</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-white border-gray-200 text-black"
                                            }`}
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-white border-gray-200 text-black"
                                            }`}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                                    >
                                        {isEdit ? "Update User" : "Add User"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false)
                                            setIsEdit(false)
                                            setEditId(null)
                                        }}
                                        className="flex-1 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 text-sm text-gray-500 text-right">
                Showing {filteredData.length} of {users.length} users
            </div>
        </div>
    )
}

export default Agentuser
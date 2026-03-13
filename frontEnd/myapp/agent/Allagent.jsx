import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { MdVisibility } from 'react-icons/md';
import { FaUsers, FaGraduationCap, FaBriefcase, FaCalendarAlt, FaIdCard, FaEnvelope, FaPhone, FaFilter, FaTimes, FaSearch } from 'react-icons/fa';

const Allagent = () => {
  const [theme, setTheme] = useState("light");
  const [data, setData] = useState([]);
  const [view, setView] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("")
  const [branches, setBranches] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
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

  useEffect(() => {
    axios.get("http://localhost:5050/branch/findall")
      .then(res => setBranches(res.data.data))
    getTheme()
    fatchAgents()
  }, [])

  useEffect(() => {
    calculateSummary();
  }, [data]);

  const calculateSummary = () => {
    const totalAgents = data.length;
    const activeAgents = data.filter(item => item.isActive === true).length;
    const totalExperience = data.reduce((sum, item) => sum + (Number(item.experienceYears) || 0), 0);
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

  const getBranchName = (branchId) => {
    if (!branchId) return 'N/A';
    const branch = branches.find(b => b?._id === branchId);
    return branch ? branch.branchName : 'N/A';
  };

  const filteredData = data.filter((item) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = search === "" || 
      (item.fullName && item.fullName.toLowerCase().includes(searchTerm)) ||
      (item.email && item.email.toLowerCase().includes(searchTerm)) ||
      (item.phone && item.phone.toString().includes(searchTerm));
    
    const matchesEducation = filterCriteria.education === "" || item.education === filterCriteria.education;
    
    const exp = Number(item.experienceYears) || 0;
    let matchesExperience = true;
    if (filterCriteria.experienceRange === "0-2") {
      matchesExperience = exp >= 0 && exp <= 2;
    } else if (filterCriteria.experienceRange === "3-5") {
      matchesExperience = exp >= 3 && exp <= 5;
    } else if (filterCriteria.experienceRange === "5+") {
      matchesExperience = exp > 5;
    }
    
    const matchesBranch = filterCriteria.branchId === "" || item.branchId === filterCriteria.branchId;
    
    const matchesStatus = filterCriteria.status === "" || 
                         (filterCriteria.status === "active" && item.isActive === true) ||
                         (filterCriteria.status === "inactive" && item.isActive === false);
    
    return matchesSearch && matchesEducation && matchesExperience && matchesBranch && matchesStatus;
  });

  const clearFilters = () => {
    setFilterCriteria({
      education: "",
      experienceRange: "",
      branchId: "",
      status: ""
    });
    setSearch("");
  };

  const hasActiveFilters = search || filterCriteria.education || filterCriteria.experienceRange || filterCriteria.branchId || filterCriteria.status;

  const getStatusBadge = (status) => {
    return status === true 
      ? "bg-green-100 text-green-800 border border-green-300" 
      : "bg-red-100 text-red-800 border border-red-300";
  };

  const getEducationBadge = (education) => {
    switch(education) {
      case "12th":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "graduate":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      case "postgraduate":
        return "bg-indigo-100 text-indigo-800 border border-indigo-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  return (
    <div
      className={`${theme === "dark"
        ? "bg-gray-900 text-white"
        : "bg-gray-100 text-black"
        } min-h-screen ml-64 mt-14 p-6 transition-all duration-300`}
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className={`text-3xl font-bold bg-clip-text text-transparent ${theme === "dark"
        ? "bg-gray-900 text-white"
        : "bg-gray-100 text-black"
        }`}>
          Agent Directory
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-5 py-2.5 border text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <FaFilter size={16} />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

    

      <div className="mb-6 space-y-4">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
              theme === "dark" 
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filterCriteria.education}
              onChange={(e) => setFilterCriteria({...filterCriteria, education: e.target.value})}
              className={`px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                theme === "dark" 
                  ? "bg-gray-800 border-gray-700 text-white" 
                  : "bg-white border-gray-200 text-black"
              }`}
            >
              <option value="">All Education</option>
              <option value="12th">12th</option>
              <option value="graduate">Graduate</option>
              <option value="postgraduate">Post Graduate</option>
            </select>

            <select
              value={filterCriteria.experienceRange}
              onChange={(e) => setFilterCriteria({...filterCriteria, experienceRange: e.target.value})}
              className={`px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                theme === "dark" 
                  ? "bg-gray-800 border-gray-700 text-white" 
                  : "bg-white border-gray-200 text-black"
              }`}
            >
              <option value="">All Experience</option>
              <option value="0-2">0-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5+">5+ years</option>
            </select>

            <select
              value={filterCriteria.branchId}
              onChange={(e) => setFilterCriteria({...filterCriteria, branchId: e.target.value})}
              className={`px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                theme === "dark" 
                  ? "bg-gray-800 border-gray-700 text-white" 
                  : "bg-white border-gray-200 text-black"
              }`}
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
              onChange={(e) => setFilterCriteria({...filterCriteria, status: e.target.value})}
              className={`px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                theme === "dark" 
                  ? "bg-gray-800 border-gray-700 text-white" 
                  : "bg-white border-gray-200 text-black"
              }`}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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

      {filteredData.length > 0 ? (
        <div className="overflow-x-auto rounded-xl shadow-2xl">
          <table className="min-w-full text-sm text-left">
            <thead className={`${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}>
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Agent</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Education</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Experience</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Branch</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"}`}>
              {filteredData.map((agent) => (
                <tr key={agent._id} className={`${theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-all duration-300 hover:shadow-lg`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={agent.profileImage}
                        alt="Profile"
                        className="w-12 h-12 object-cover rounded-full border-2 border-blue-400"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/48';
                        }}
                      />
                      <span className="font-medium">{agent.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <FaEnvelope className="text-gray-500" size={12} />
                        <span className="truncate max-w-[150px]">{agent.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FaPhone className="text-gray-500" size={12} />
                        <span>{agent.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getEducationBadge(agent.education)}`}>
                      {agent.education}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-500" size={14} />
                      <span>{agent.experienceYears} years</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Joined: {new Date(agent.joiningDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{getBranchName(agent.branchId)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusBadge(agent.isActive)}`}>
                      {agent.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => handleView(agent)}
                        className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                        title="View Details"
                      >
                        <MdVisibility size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="flex flex-col items-center gap-4">
            <FaUsers size={64} className="text-gray-400" />
            <p className="text-xl text-gray-500">No agents found matching your criteria</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-md"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {view && selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setView(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`rounded-2xl shadow-2xl p-8 w-full max-w-2xl transform transition-all duration-300 scale-100 ${
              theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Agent Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <img
                  src={selectedItem?.profileImage}
                  alt="Profile"
                  className="w-32 h-32 object-cover rounded-full border-4 border-blue-500 shadow-xl"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/128';
                  }}
                />
                <h3 className="text-xl font-bold mt-4">{selectedItem?.fullName}</h3>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold mt-2 ${getStatusBadge(selectedItem?.isActive)}`}>
                  {selectedItem?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="border-b pb-3">
                  <span className="text-sm text-gray-500 block">Contact Information</span>
                  <div className="mt-2 space-y-2">
                    <p className="flex items-center gap-2">
                      <FaEnvelope className="text-gray-400" size={16} />
                      {selectedItem?.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaPhone className="text-gray-400" size={16} />
                      {selectedItem?.phone}
                    </p>
                  </div>
                </div>

                <div className="border-b pb-3">
                  <span className="text-sm text-gray-500 block">Personal Information</span>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-semibold">Education:</span> {selectedItem?.education}</p>
                    <p><span className="font-semibold">Aadhaar:</span> {selectedItem?.aadhaarNumber}</p>
                    <p><span className="font-semibold">Address:</span> {selectedItem?.address}</p>
                  </div>
                </div>

                <div className="border-b pb-3">
                  <span className="text-sm text-gray-500 block">Professional Information</span>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-semibold">Experience:</span> {selectedItem?.experienceYears} years</p>
                    <p><span className="font-semibold">Joining Date:</span> {new Date(selectedItem?.joiningDate).toLocaleDateString()}</p>
                    <p><span className="font-semibold">Branch:</span> {getBranchName(selectedItem?.branchId)}</p>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-500 block">Aadhaar Image</span>
                  <img
                    src={selectedItem?.aadhaarImage}
                    alt="Aadhaar"
                    className="w-full h-32 object-cover rounded-lg mt-2 border"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x128';
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setView(false)}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 text-right">
        Showing {filteredData.length} of {data.length} agents
      </div>
    </div>
  )
}

export default Allagent
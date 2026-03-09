import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  MdDelete, MdEdit, MdVisibility, 
  MdFilterList, MdSearch, MdClear,
  MdPhone, MdEmail, MdLocationOn,
  MdCheckCircle, MdCancel,
  MdRefresh, MdAdd, MdClose,
  MdBusiness, MdPeople,
  MdPolicy, MdDashboard
} from 'react-icons/md';
import { FaUsers, FaUserTie } from 'react-icons/fa';

const LocationSelector = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [theme, setTheme] = useState("light");
  const [open, setOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterManager, setFilterManager] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [statsView, setStatsView] = useState(false);
  const [locationSelected, setLocationSelected] = useState(false);

  const [input, setInput] = useState({
    branchName: "",
    branchCode: "",
    address: "",
    district: "",
    pincode: "",
    phone: "",
    email: "",
    branchManager: "",
    createdBy: "",
  });

  const [editinput, setEditInput] = useState({
    branchName: "",
    branchCode: "",
    address: "",
    pincode: "",
    phone: "",
    email: "",
    isActive: true
  });

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [allBranch, setAllBranch] = useState([]);
  const [view, setView] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [districtId, setDistrictId] = useState("");
  const [agent, setAgent] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first.");
      return;
    }
    
    fetchInitialData();
    getTheme();
    getBranch();
    fetchAgents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allBranch, searchTerm, filterStatus, filterManager, selectedDistrict]);

  const fetchInitialData = async () => {
    try {
      const res = await axios.get("http://localhost:5050/location/countries");
      setCountries(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getTheme = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      const res = await axios.get("http://localhost:5050/user/theme", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTheme(res.data.theme);
    } catch (error) {
      console.error("Error fetching theme:", error);
    }
  };

  const getBranch = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5050/branch/findall", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Branch data received:", res.data);
      setAllBranch(res.data.data || []);
      setFilteredBranches(res.data.data || []);
    } catch (error) {
      console.error("Error fetching Branch:", error);
      alert("Error fetching Branch");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await axios.get("http://localhost:5050/agent/findall");
      setAgent(res.data);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const applyFilters = () => {
    console.log("Filtering by district:", selectedDistrict);
    console.log("All branches:", allBranch);
    
    let filtered = [...allBranch];

    // District filter - case insensitive comparison
    if (selectedDistrict) {
      filtered = filtered.filter(item => {
        // Case 1: district is an object with name property
        if (item.district && typeof item.district === 'object' && item.district.name) {
          console.log(`Comparing: ${item.district.name} with ${selectedDistrict}`);
          // Compare in lowercase to ignore case
          return item.district.name.toLowerCase() === selectedDistrict.toLowerCase();
        }
        
        // Case 2: district is just a string
        if (typeof item.district === 'string') {
          return item.district.toLowerCase() === selectedDistrict.toLowerCase();
        }
        
        return false;
      });
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.branchName?.toLowerCase().includes(term) ||
        item.branchCode?.toLowerCase().includes(term) ||
        item.address?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.phone?.includes(term) ||
        item.pincode?.includes(term)
      );
    }

    // Status filter
    if (filterStatus === "active") {
      filtered = filtered.filter(item => item.isActive === true);
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter(item => item.isActive === false);
    }

    // Manager filter
    if (filterManager) {
      filtered = filtered.filter(item => {
        if (typeof item.branchManager === 'object' && item.branchManager) {
          return item.branchManager._id === filterManager;
        }
        return item.branchManager === filterManager;
      });
    }

    console.log("Filtered branches:", filtered);
    setFilteredBranches(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterManager("");
  };

  const resetLocation = () => {
    setSelectedCountry("");
    setSelectedState("");
    setSelectedDistrict("");
    setCities([]);
    setStates([]);
    setLocationSelected(false);
    setOpen(true);
  };

  const handleCountryChange = (e) => {
    const countryName = e.target.value;
    setSelectedCountry(countryName);
    setSelectedState("");
    setSelectedDistrict("");
    setCities([]);
    setLocationSelected(false);
    
    axios.post(`http://localhost:5050/Country/`, {
      countryname: countryName
    });

    const selectedCountryObj = countries.find(
      (c) => c.name === countryName
    );

    if (selectedCountryObj) {
      axios.get(`http://localhost:5050/location/states/${selectedCountryObj.isoCode}`)
        .then(res => setStates(res.data))
        .catch(err => console.log(err));
    }
  };

  const handleStateChange = async (e) => {
    const stateName = e.target.value;
    setSelectedState(stateName);
    setSelectedDistrict("");
    setCities([]);
    setLocationSelected(false);

    try {
      await axios.post("http://localhost:5050/State", {
        name: stateName,
      });

      const selectedStateObj = states.find(
        (s) => s.name === stateName
      );

      const selectedCountryObj = countries.find(
        (c) => c.name === selectedCountry
      );

      if (!selectedStateObj || !selectedCountryObj) return;

      const res = await axios.get(
        `http://localhost:5050/location/cities/${selectedCountryObj.isoCode}/${selectedStateObj.isoCode}`
      );
      setCities(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDistrictChange = async (e) => {
    const districtname = e.target.value;
    setSelectedDistrict(districtname);
    setLocationSelected(true);
    setOpen(false);

    try {
      const res = await axios.post("http://localhost:5050/District/", {
        name: districtname,
      });
      setDistrictId(res.data._id);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...input,
      district: districtId,
    };

    try {
      await axios.post("http://localhost:5050/branch/", data);
      alert("Branch added successfully");
      setShowForm(false);
      getBranch();
    } catch (error) {
      alert(error.response?.data);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      try {
        await axios.delete(`http://localhost:5050/branch/delete/${id}`);
        alert("Record deleted successfully!");
        getBranch();
      } catch (error) {
        console.error("Error deleting record:", error);
      }
    }
  };

  const handleView = async (x) => {
    try {
      const res = await axios.get(`http://localhost:5050/branch/findone/${x._id}`);
      setSelectedItem(res.data);
      setView(true);
    } catch (error) {
      console.error("Error fetching record details:", error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5050/branch/update/${editData._id}`, editinput);
      alert("Record updated successfully!");
      setIsOpen(false);
      getBranch();
    } catch (error) {
      console.error("Error updating record:", error);
    }
  };

  const handleEditClick = (item) => {
    setEditData(item);
    setEditInput({
      branchName: item.branchName || "",
      branchCode: item.branchCode || "",
      address: item.address || "",
      pincode: item.pincode || "",
      phone: item.phone || "",
      email: item.email || "",
      isActive: item.isActive
    });
    setIsOpen(true);
  };

  const getManagerName = (manager) => {
    if (!manager) return "Not Assigned";
    if (typeof manager === 'object' && manager.fullName) {
      return manager.fullName;
    }
    if (typeof manager === 'string') {
      const found = agent.find(a => a._id === manager);
      return found ? found.fullName : "Not Assigned";
    }
    return "Not Assigned";
  };

  const getDistrictName = (district) => {
    if (!district) return "N/A";
    if (typeof district === 'object' && district.name) {
      return district.name;
    }
    return district.toString();
  };

  const getStats = () => {
    const total = allBranch.length;
    const active = allBranch.filter(b => b.isActive).length;
    const inactive = total - active;
    const totalAgents = allBranch.reduce((sum, b) => sum + (b.totalAgents || 0), 0);
    const totalCustomers = allBranch.reduce((sum, b) => sum + (b.totalCustomers || 0), 0);
    const totalPolicies = allBranch.reduce((sum, b) => sum + (b.totalPolicies || 0), 0);
    
    return { total, active, inactive, totalAgents, totalCustomers, totalPolicies };
  };

  const stats = getStats();

  return (
    <div className={`ml-64 mt-14 min-h-screen px-4 py-8 ${
      theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
    }`}>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Branch Management</h1>
        <button
          onClick={() => setStatsView(!statsView)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            theme === "dark" 
              ? "bg-gray-800 hover:bg-gray-700" 
              : "bg-white hover:bg-gray-100"
          }`}
        >
          <MdDashboard size={20} />
          {statsView ? "Hide Dashboard" : "Show Dashboard"}
        </button>
      </div>

      {statsView && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`p-6 rounded-lg shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Branches</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <MdBusiness className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded">Active: {stats.active}</span>
              <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded">Inactive: {stats.inactive}</span>
            </div>
          </div>

          <div className={`p-6 rounded-lg shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Agents</p>
                <p className="text-3xl font-bold">{stats.totalAgents}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaUsers className="text-green-600" size={24} />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">Avg {(stats.totalAgents / (stats.total || 1)).toFixed(1)} per branch</p>
          </div>

          <div className={`p-6 rounded-lg shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Customers</p>
                <p className="text-3xl font-bold">{stats.totalCustomers}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <MdPeople className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Policies</p>
                <p className="text-3xl font-bold">{stats.totalPolicies}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <MdPolicy className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50  bg-opacity-50">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-6 ${
            theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
          }`}>
            <h2 className="text-2xl font-bold text-center">Select Location</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <select
                onChange={handleCountryChange}
                value={selectedCountry}
                className={`w-full rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"
                }`}
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.isoCode} value={country.name}>{country.name}</option>
                ))}
              </select>
            </div>

            {selectedCountry && (
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <select
                  onChange={handleStateChange}
                  value={selectedState}
                  className={`w-full rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"
                  }`}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.isoCode} value={state.name}>{state.name}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedState && (
              <div>
                <label className="block text-sm font-medium mb-2">District / City</label>
                <select
                  onChange={handleDistrictChange}
                  value={selectedDistrict}
                  className={`w-full rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"
                  }`}
                >
                  <option value="">Select District / City</option>
                  {cities.map((city, index) => (
                    <option key={index} value={city.name}>{city.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {locationSelected && (
        <div className={`shadow-lg rounded-xl p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">
                Branches in {selectedDistrict} ({filteredBranches.length})
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedCountry} → {selectedState} → {selectedDistrict}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={resetLocation}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <MdRefresh size={20} />
                Change Location
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <MdFilterList size={20} />
                Filters
              </button>
              
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <MdAdd size={20} />
                New Branch
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-4 mb-6">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"
                }`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <MdClear size={20} />
                </button>
              )}
            </div>

            {showFilters && (
              <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 ${
                        theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-black"
                      }`}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Branch Manager</label>
                    <select
                      value={filterManager}
                      onChange={(e) => setFilterManager(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 ${
                        theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-black"
                      }`}
                    >
                      <option value="">All Managers</option>
                      {agent.map((a) => (
                        <option key={a._id} value={a._id}>{a.fullName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <MdRefresh size={20} />
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2">Loading branches...</p>
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="text-center py-12">
              <MdBusiness size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No branches found in {selectedDistrict}</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add First Branch
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Branch Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Manager</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statistics</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-200 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                  {filteredBranches.map((item) => (
                    <tr key={item._id} className={`${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"} transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            <MdBusiness className="text-blue-500" />
                            {item.branchName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Code: {item.branchCode}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <MdLocationOn size={14} />
                            {item.address}, {item.pincode}
                          </div>
                          <div className="text-xs text-gray-400">
                            District: {getDistrictName(item.district)}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm flex items-center gap-1">
                            <MdPhone size={14} className="text-gray-400" />
                            {item.phone || "N/A"}
                          </div>
                          <div className="text-sm flex items-center gap-1">
                            <MdEmail size={14} className="text-gray-400" />
                            {item.email || "N/A"}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaUserTie className="text-purple-500" />
                          <span className="text-sm">{getManagerName(item.branchManager)}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <FaUsers size={12} className="text-green-500" />
                            <span>Agents: {item.totalAgents || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MdPeople size={12} className="text-blue-500" />
                            <span>Customers: {item.totalCustomers || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MdPolicy size={12} className="text-yellow-500" />
                            <span>Policies: {item.totalPolicies || 0}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {item.isActive ? (
                          <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
                            <MdCheckCircle size={14} />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">
                            <MdCancel size={14} />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleView(item)} className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition" title="View Details">
                            <MdVisibility size={20} />
                          </button>
                          <button onClick={() => handleEditClick(item)} className="p-2 text-yellow-500 hover:text-yellow-600 hover:bg-gray-100 rounded-lg transition" title="Edit">
                            <MdEdit size={20} />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="p-2 text-red-600 hover:text-red-800 hover:bg-gray-100 rounded-lg transition" title="Delete">
                            <MdDelete size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {view && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setView(false)}>
          <div onClick={(e) => e.stopPropagation()} className={`rounded-2xl shadow-2xl p-6 w-full max-w-2xl ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Branch Details</h2>
              <button onClick={() => setView(false)} className="text-gray-500 hover:text-gray-700">
                <MdClose size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Branch Name</p>
                <p className="font-medium flex items-center gap-2">
                  <MdBusiness className="text-blue-500" />
                  {selectedItem?.branchName}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Branch Code</p>
                <p className="font-medium">{selectedItem?.branchCode}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{selectedItem?.address}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Pincode</p>
                <p className="font-medium">{selectedItem?.pincode}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium flex items-center gap-2">
                  <MdPhone className="text-gray-400" />
                  {selectedItem?.phone}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium flex items-center gap-2">
                  <MdEmail className="text-gray-400" />
                  {selectedItem?.email}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Branch Manager</p>
                <p className="font-medium flex items-center gap-2">
                  <FaUserTie className="text-purple-500" />
                  {getManagerName(selectedItem?.branchManager)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">District</p>
                <p className="font-medium">{getDistrictName(selectedItem?.district)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Total Agents</p>
                <p className="font-medium">{selectedItem?.totalAgents || 0}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Total Customers</p>
                <p className="font-medium">{selectedItem?.totalCustomers || 0}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Total Policies</p>
                <p className="font-medium">{selectedItem?.totalPolicies || 0}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Status</p>
                <p className={`font-medium flex items-center gap-2 ${selectedItem?.isActive ? "text-green-600" : "text-red-600"}`}>
                  {selectedItem?.isActive ? <MdCheckCircle /> : <MdCancel />}
                  {selectedItem?.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>

            <button onClick={() => setView(false)} className="mt-6 w-full py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition">
              Close
            </button>
          </div>
        </div>
      )}

      {isOpen && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleEdit} className={`rounded-lg shadow-xl px-8 pt-6 pb-8 w-full max-w-md ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Edit Branch</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <MdClose size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Branch Name</label>
                <input type="text" value={editinput.branchName} onChange={(e) => setEditInput({ ...editinput, branchName: e.target.value })} 
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"
                  }`} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Branch Code</label>
                <input type="text" value={editinput.branchCode} onChange={(e) => setEditInput({ ...editinput, branchCode: e.target.value })} 
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"
                  }`} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <input type="text" value={editinput.address} onChange={(e) => setEditInput({ ...editinput, address: e.target.value })} 
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"
                  }`} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Pincode</label>
                <input type="text" value={editinput.pincode} onChange={(e) => setEditInput({ ...editinput, pincode: e.target.value })} 
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"
                  }`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input type="tel" value={editinput.phone} onChange={(e) => setEditInput({ ...editinput, phone: e.target.value })} 
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"
                  }`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input type="email" value={editinput.email} onChange={(e) => setEditInput({ ...editinput, email: e.target.value })} 
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"
                  }`} />
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="isActive" checked={editinput.isActive} onChange={(e) => setEditInput({ ...editinput, isActive: e.target.checked })} 
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium">Active Branch</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">Update Branch</button>
              <button type="button" onClick={() => setIsOpen(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl shadow-2xl w-full max-w-md p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Branch in {selectedDistrict}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                <MdClose size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Branch Name</label>
                <input type="text" value={input.branchName} onChange={(e) => setInput({ ...input, branchName: e.target.value })} 
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"
                  }`} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Branch Code</label>
                <input type="text" value={input.branchCode} onChange={(e) => setInput({ ...input, branchCode: e.target.value })} 
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"
                  }`} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input type="text" value={input.address} onChange={(e) => setInput({ ...input, address: e.target.value })} 
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"
                  }`} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pincode</label>
                <input type="text" value={input.pincode} onChange={(e) => setInput({ ...input, pincode: e.target.value })} 
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"
                  }`} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input type="tel" value={input.phone} onChange={(e) => setInput({ ...input, phone: e.target.value })} 
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"
                  }`} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" value={input.email} onChange={(e) => setInput({ ...input, email: e.target.value })} 
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"
                  }`} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Branch Manager</label>
                <select value={input.branchManager} onChange={(e) => setInput({ ...input, branchManager: e.target.value })} 
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"
                  }`} required>
                  <option value="">Select Agent</option>
                  {agent.map((agent) => (
                    <option key={agent._id} value={agent._id}>{agent.fullName}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">Create Branch</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
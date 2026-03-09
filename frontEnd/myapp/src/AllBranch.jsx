import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  MdDelete, MdEdit, MdVisibility, 
  MdFilterList, MdSearch, MdClear,
  MdPhone, MdEmail, MdLocationOn,
  MdPerson, MdCheckCircle, MdCancel,
  MdRefresh
} from 'react-icons/md';

const AllBranch = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [filteredBranches, setFilteredBranches] = useState([]);

  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [theme, setTheme] = useState("light");
  const [allBranch, setAllBranch] = useState([]);
  const [view, setView] = useState(false);
  const [editData, setEditData] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive
  const [filterDistrict, setFilterDistrict] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editinput, setEditInput] = useState({
    branchName: "",
    branchCode: "",
    address: "",
    district: "",
    pincode: "",
    phone: "",
    email: "",
    branchManager: "",
    isActive: true
  });

  useEffect(() => {
    fetchCountries();
    getTheme();
    getBranch();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allBranch, searchTerm, filterStatus, filterDistrict, selectedCityId]);

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
      setAllBranch(res.data);
      setFilteredBranches(res.data);
    } catch (error) {
      alert("Error fetching Branch:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await axios.get("http://localhost:5050/location/countri");
      setCountries(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCountryChange = async (e) => {
    const countryId = e.target.value;
    setSelectedCountryId(countryId);
    setSelectedStateId("");
    setSelectedCityId("");
    setCities([]);

    if (!countryId) return;

    try {
      const res = await axios.get(`http://localhost:5050/location/states`);
      setStates(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setSelectedStateId(stateId);
    setSelectedCityId("");

    if (!stateId) return;

    try {
      const res = await axios.get(`http://localhost:5050/location/cities`);
      setCities(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCityChange = (e) => {
    setSelectedCityId(e.target.value);
    setIsOpen(false);
  };

  const applyFilters = () => {
    let filtered = [...allBranch];

    // Filter by selected city
    if (selectedCityId) {
      filtered = filtered.filter(item => item.district === selectedCityId);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.branchName?.toLowerCase().includes(term) ||
        item.branchCode?.toLowerCase().includes(term) ||
        item.address?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.phone?.includes(term)
      );
    }

    // Filter by status
    if (filterStatus === "active") {
      filtered = filtered.filter(item => item.isActive === true);
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter(item => item.isActive === false);
    }

    // Filter by district
    if (filterDistrict) {
      filtered = filtered.filter(item => item.district === filterDistrict);
    }

    setFilteredBranches(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterDistrict("");
    setSelectedCityId("");
    setSelectedCountryId("");
    setSelectedStateId("");
    setIsOpen(true);
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

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5050/branch/update/${editData._id}`, editinput);
      alert("Record updated successfully!");
      setOpen(false);
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
      district: item.district || "",
      pincode: item.pincode || "",
      phone: item.phone || "",
      email: item.email || "",
      branchManager: item.branchManager || "",
      isActive: item.isActive
    });
    setOpen(true);
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
      
    
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className={`p-4 rounded-lg shadow-md ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Branches</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        
        <div className={`p-4 rounded-lg shadow-md ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        
        <div className={`p-4 rounded-lg shadow-md ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Inactive</div>
          <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
        </div>
        
        <div className={`p-4 rounded-lg shadow-md ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Agents</div>
          <div className="text-2xl font-bold">{stats.totalAgents}</div>
        </div>
        
        <div className={`p-4 rounded-lg shadow-md ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Customers</div>
          <div className="text-2xl font-bold">{stats.totalCustomers}</div>
        </div>
        
        <div className={`p-4 rounded-lg shadow-md ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Policies</div>
          <div className="text-2xl font-bold">{stats.totalPolicies}</div>
        </div>
      </div>

      {isOpen && (
        <div className={`shadow-xl rounded-2xl p-8 w-full max-w-md mx-auto mb-6 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <h2 className="text-2xl font-bold text-center mb-6">
            Select Location
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Country
              </label>
              <select
                value={selectedCountryId}
                onChange={handleCountryChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  theme === "dark" 
                    ? "bg-gray-700 border-gray-600 text-white" 
                    : "bg-white border-gray-300 text-black"
                }`}
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country._id} value={country._id}>
                    {country.countryname}
                  </option>
                ))}
              </select>
            </div>

            {selectedCountryId && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  State
                </label>
                <select
                  value={selectedStateId}
                  onChange={handleStateChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    theme === "dark" 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-black"
                  }`}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state._id} value={state._id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedStateId && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  City
                </label>
                <select
                  value={selectedCityId}
                  onChange={handleCityChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    theme === "dark" 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-black"
                  }`}
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedCityId && (
        <div className={`shadow-lg rounded-xl p-6 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                Branches in Selected Location ({filteredBranches.length})
              </h2>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  theme === "dark" 
                    ? "bg-gray-700 hover:bg-gray-600" 
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <MdFilterList size={20} />
                Filters
              </button>
            </div>

            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, code, address, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  theme === "dark" 
                    ? "bg-gray-700 border-gray-600 text-white" 
                    : "bg-white border-gray-300 text-black"
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
              <div className={`p-4 rounded-lg ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 ${
                        theme === "dark" 
                          ? "bg-gray-600 border-gray-500 text-white" 
                          : "bg-white border-gray-300 text-black"
                      }`}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      District
                    </label>
                    <select
                      value={filterDistrict}
                      onChange={(e) => setFilterDistrict(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 ${
                        theme === "dark" 
                          ? "bg-gray-600 border-gray-500 text-white" 
                          : "bg-white border-gray-300 text-black"
                      }`}
                    >
                      <option value="">All Districts</option>
                      {cities.map((city) => (
                        <option key={city._id} value={city._id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <MdRefresh size={20} />
                      Clear Filters
                    </button>
                  </div>
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
            <div className="text-center py-8 text-gray-500">
              No branches found in this location
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Branch Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Statistics
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-200 ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}>
                  {filteredBranches.map((item) => (
                    <tr key={item._id} className={`${
                      theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="font-medium">{item.branchName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Code: {item.branchCode}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <MdLocationOn size={14} />
                            {item.address}, {item.pincode}
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
                        <div className="space-y-1 text-sm">
                          <div>Agents: {item.totalAgents || 0}</div>
                          <div>Customers: {item.totalCustomers || 0}</div>
                          <div>Policies: {item.totalPolicies || 0}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {item.isActive ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <MdCheckCircle size={16} />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <MdCancel size={16} />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(item)}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                            title="View"
                          >
                            <MdVisibility size={20} />
                          </button>

                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-2 text-yellow-500 hover:text-yellow-600 hover:bg-gray-100 rounded-lg"
                            title="Edit"
                          >
                            <MdEdit size={20} />
                          </button>

                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-gray-100 rounded-lg"
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
          )}
        </div>
      )}

      {view && selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setView(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`rounded-2xl shadow-2xl p-6 w-full max-w-2xl ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">Branch Details</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Branch Name</p>
                <p className="font-medium">{selectedItem?.branchName}</p>
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
                <p className="font-medium">{selectedItem?.phone}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedItem?.email}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Total Agents</p>
                <p className="font-medium">{selectedItem?.totalAgents}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Total Customers</p>
                <p className="font-medium">{selectedItem?.totalCustomers}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Total Policies</p>
                <p className="font-medium">{selectedItem?.totalPolicies}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Status</p>
                <p className={`font-medium ${
                  selectedItem?.isActive ? "text-green-600" : "text-red-600"
                }`}>
                  {selectedItem?.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setView(false)}
              className="mt-6 w-full py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {open && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleEdit} className={`rounded-lg shadow-xl px-8 pt-6 pb-8 w-full max-w-md ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}>
            <h2 className="text-2xl font-bold mb-6">Edit Branch</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={editinput.branchName}
                  onChange={(e) => setEditInput({ ...editinput, branchName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark" 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-black"
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Branch Code
                </label>
                <input
                  type="text"
                  value={editinput.branchCode}
                  onChange={(e) => setEditInput({ ...editinput, branchCode: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark" 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-black"
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={editinput.address}
                  onChange={(e) => setEditInput({ ...editinput, address: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark" 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-black"
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  value={editinput.pincode}
                  onChange={(e) => setEditInput({ ...editinput, pincode: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark" 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-black"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editinput.phone}
                  onChange={(e) => setEditInput({ ...editinput, phone: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark" 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-black"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editinput.email}
                  onChange={(e) => setEditInput({ ...editinput, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === "dark" 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-black"
                  }`}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editinput.isActive}
                  onChange={(e) => setEditInput({ ...editinput, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium">
                  Active
                </label>
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
                onClick={() => setOpen(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AllBranch;
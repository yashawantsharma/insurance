import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { MdVisibility } from 'react-icons/md';
import { FaRupeeSign, FaCalendarAlt, FaFilter, FaTimes, FaSearch, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';

const UserPolice = () => {
    const [data, setData] = useState([]);
    const [input, setInput] = useState({
        premiumAmount: "",
        purchaseDate: "",
        startDate: "",
        policyId: "",
        nextInstallmentDate: "",
        paymentMode: "",
    })
    const [formOpen, setFormOpen] = useState(false);
    const [theme, setTheme] = useState("light");
    const [view, setView] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedPolicyId, setSelectedPolicyId] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filterCriteria, setFilterCriteria] = useState({
        minAmount: "",
        maxAmount: "",
        duration: "",
        status: ""
    });
    const [summaryData, setSummaryData] = useState({
        totalPolicies: 0,
        totalInvestment: 0,
        totalProfit: 0,
        averageAmount: 0
    });

    useEffect(() => {
        fatchall();
        getTheme();
    }, [])

    useEffect(() => {
        calculateSummary();
    }, [data]);

    const calculateSummary = () => {
        const totalPolicies = data.length;
        const totalInvestment = data.reduce((sum, item) => sum + (item.amount || 0), 0);
        const totalProfit = data.reduce((sum, item) => sum + (item.profitAmount || 0), 0);
        const averageAmount = totalPolicies > 0 ? (totalInvestment / totalPolicies).toFixed(2) : 0;

        setSummaryData({
            totalPolicies,
            totalInvestment,
            totalProfit,
            averageAmount
        });
    };

    const fatchall = async () => {
        try {
            const res = await axios.get("http://localhost:5050/police/findall");
            setData(res.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

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
    }

    const handleView = async (x) => {
        try {
            const res = await axios.get(`http://localhost:5050/police/findone/${x._id}`);
            setSelectedItem(res.data);
            setView(true);
        } catch (error) {
            console.error("Error fetching record details:", error);
        }
    }

    const handlsubmit = async (e) => {
        const token = localStorage.getItem("token")
        e.preventDefault();
        try {
            await axios.post("http://localhost:5050/CustomerPolicy/", input, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Policy purchased successfully!");
            setFormOpen(false);
            setInput({
                premiumAmount: "",
                purchaseDate: "",
                startDate: "",
                policyId: "",
                nextInstallmentDate: "",
                paymentMode: "",
            });
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Failed to purchase policy");
        }
    }

    const handelselect = (e) => {
        const { name, value } = e.target;
        setInput(prev => ({ ...prev, [name]: value }));
    };

    const policyId = (id) => {
        setInput(prev => ({ ...prev, policyId: id }));
    }

    const selectedData = data.find((item) => item._id === selectedPolicyId);

    const handleStartDate = (e) => {
        const startDate = e.target.value;
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + 6);
        const nextDate = date.toISOString().split("T")[0];

        setInput(prev => ({
            ...prev,
            purchaseDate: startDate,
            startDate: startDate,
            nextInstallmentDate: nextDate
        }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const filteredData = data.filter((item) => {
        const searchTerm = search.toLowerCase();
        const matchesSearch = search === "" ||
            (item.fullName && item.fullName.toLowerCase().includes(searchTerm));

        const amount = Number(item.amount) || 0;
        const matchesMinAmount = filterCriteria.minAmount === "" ||
            amount >= Number(filterCriteria.minAmount);
        const matchesMaxAmount = filterCriteria.maxAmount === "" ||
            amount <= Number(filterCriteria.maxAmount);

        const matchesDuration = filterCriteria.duration === "" ||
            item.installmentDuration?.toString() === filterCriteria.duration;

        const matchesStatus = filterCriteria.status === "" ||
            (filterCriteria.status === "active" && item.isActive === true) ||
            (filterCriteria.status === "inactive" && item.isActive === false);

        return matchesSearch && matchesMinAmount && matchesMaxAmount && matchesDuration && matchesStatus;
    });

    const clearFilters = () => {
        setFilterCriteria({
            minAmount: "",
            maxAmount: "",
            duration: "",
            status: ""
        });
        setSearch("");
    };

    const hasActiveFilters = search || filterCriteria.minAmount || filterCriteria.maxAmount ||
        filterCriteria.duration || filterCriteria.status;

    return (
        <div className={`ml-64 mt-14 min-h-screen items-center justify-center px-4 py-8 transition-all duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
            }`}>
            <div className="flex justify-between items-center mb-6 mt-10">
                <h1 className={`text-3xl font-bold   ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
                    }`}>
                    Available Policies
                </h1>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-5 py-2.5 border rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
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
                        placeholder="Search by policy name..."
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="number"
                            placeholder="Min Amount"
                            value={filterCriteria.minAmount}
                            onChange={(e) => setFilterCriteria({ ...filterCriteria, minAmount: e.target.value })}
                            className={`px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
                                    ? "bg-gray-800 border-gray-700 text-white"
                                    : "bg-white border-gray-200 text-black"
                                }`}
                        />

                        <input
                            type="number"
                            placeholder="Max Amount"
                            value={filterCriteria.maxAmount}
                            onChange={(e) => setFilterCriteria({ ...filterCriteria, maxAmount: e.target.value })}
                            className={`px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
                                    ? "bg-gray-800 border-gray-700 text-white"
                                    : "bg-white border-gray-200 text-black"
                                }`}
                        />

                        <select
                            value={filterCriteria.duration}
                            onChange={(e) => setFilterCriteria({ ...filterCriteria, duration: e.target.value })}
                            className={`px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
                                    ? "bg-gray-800 border-gray-700 text-white"
                                    : "bg-white border-gray-200 text-black"
                                }`}
                        >
                            <option value="">All Durations</option>
                            <option value="6">6 Months</option>
                            <option value="12">12 Months</option>
                            <option value="24">24 Months</option>
                        </select>

                        <select
                            value={filterCriteria.status}
                            onChange={(e) => setFilterCriteria({ ...filterCriteria, status: e.target.value })}
                            className={`px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
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

            <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl shadow-2xl overflow-hidden`}>
                <table className="min-w-full">
                    <thead className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Policy Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">End Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Profit</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Total</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Per Installment</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"}`}>
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                <tr key={index} className={`${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-all duration-300 hover:shadow-lg transform hover:scale-[1.01]`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {item.fullName?.charAt(0).toUpperCase()}
                                            </div>
                                            {item.fullName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center gap-2">
                                            <FaCalendarAlt className="text-gray-500" size={12} />
                                            {item.endDate?.split("T")[0]}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold ">
                                        {formatCurrency(item.amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                                        {formatCurrency(item.profitAmount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                        {formatCurrency(item.totalAmount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {item.installmentDuration} months
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {formatCurrency(item.installmentAmount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${item.isActive
                                                ? 'bg-green-100 text-green-800 border border-green-300'
                                                : 'bg-red-100 text-red-800 border border-red-300'
                                            }`}>
                                            {item.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => handleView(item)}
                                                className="p-2.5  transform hover:scale-110 transition-all duration-300 shadow-md hover:shadow-xl"
                                                title="View Details"
                                            >
                                                <MdVisibility size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    policyId(item._id);
                                                    setSelectedPolicyId(item._id);
                                                    setFormOpen(true);
                                                }}
                                                className="px-4 py-2.5 border rounded-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 font-semibold text-sm"
                                                title="Buy Policy"
                                            >
                                                Buy Now
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center py-16">
                                    <div className="flex flex-col items-center gap-4">
                                        <FaMoneyBillWave size={64} className="text-gray-400" />
                                        <p className="text-xl text-gray-500">No policies available matching your criteria</p>
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
                                Policy Details
                            </h2>

                            <div className="space-y-4">
                                <div className="flex justify-center mb-4">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                                        {selectedItem?.fullName?.charAt(0).toUpperCase()}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 border-b pb-3">
                                        <span className="text-sm text-gray-500 block">Policy Name</span>
                                        <p className="text-lg font-semibold mt-1">{selectedItem?.fullName}</p>
                                    </div>

                                    <div>
                                        <span className="text-sm text-gray-500 block">Amount</span>
                                        <p className="text-lg font-bold text-green-600 mt-1">{formatCurrency(selectedItem?.amount)}</p>
                                    </div>

                                    <div>
                                        <span className="text-sm text-gray-500 block">Profit</span>
                                        <p className="text-lg font-bold text-blue-600 mt-1">{formatCurrency(selectedItem?.profitAmount)}</p>
                                    </div>

                                    <div className="col-span-2 border-t pt-3">
                                        <span className="text-sm text-gray-500 block">Total Amount</span>
                                        <p className="text-2xl font-bold text-purple-600 mt-1">{formatCurrency(selectedItem?.totalAmount)}</p>
                                    </div>

                                    <div>
                                        <span className="text-sm text-gray-500 block">Duration</span>
                                        <p className="text-lg mt-1">{selectedItem?.installmentDuration} months</p>
                                    </div>

                                    <div>
                                        <span className="text-sm text-gray-500 block">Per Installment</span>
                                        <p className="text-lg mt-1">{formatCurrency(selectedItem?.installmentAmount)}</p>
                                    </div>

                                    <div className="col-span-2">
                                        <span className="text-sm text-gray-500 block">End Date</span>
                                        <p className="text-lg mt-1 flex items-center gap-2">
                                            <FaCalendarAlt className="text-gray-400" size={16} />
                                            {selectedItem?.endDate?.split("T")[0]}
                                        </p>
                                    </div>

                                    <div className="col-span-2">
                                        <span className="text-sm text-gray-500 block">Status</span>
                                        <p className="mt-2">
                                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${selectedItem?.isActive
                                                    ? 'bg-green-100 text-green-800 border border-green-300'
                                                    : 'bg-red-100 text-red-800 border border-red-300'
                                                }`}>
                                                {selectedItem?.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => {
                                        setView(false);
                                        policyId(selectedItem._id);
                                        setSelectedPolicyId(selectedItem._id);
                                        setFormOpen(true);
                                    }}
                                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                                >
                                    Buy This Policy
                                </button>
                                <button
                                    onClick={() => setView(false)}
                                    className="flex-1 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {filteredData.length > 0 && (
                <div className="mt-4 text-sm text-gray-500 text-right">
                    Showing {filteredData.length} of {data.length} policies
                </div>
            )}

            {formOpen && selectedData && (
                <div
                    className="fixed inset-0  bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
                    onClick={() => setFormOpen(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
                            }`}
                    >
                        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Purchase Policy
                        </h2>

                        <div className="mb-4 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                            <p className="font-semibold">Selected Policy: {selectedData.fullName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                Installment Amount: {formatCurrency(selectedData.installmentAmount)} •
                                Duration: {selectedData.installmentDuration} months
                            </p>
                        </div>

                        <form onSubmit={handlsubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Premium Amount *</label>
                                <input
                                    type="number"
                                    value={input.premiumAmount}
                                    onChange={(e) => setInput({ ...input, premiumAmount: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
                                            ? "bg-gray-700 border-gray-600 text-white"
                                            : "bg-white border-gray-200 text-black"
                                        }`}
                                    placeholder="Enter premium amount"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Suggested: {formatCurrency(selectedData.installmentAmount)}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Purchase Date *</label>
                                <input
                                    type="date"
                                    value={input.purchaseDate}
                                    onChange={handleStartDate}
                                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
                                            ? "bg-gray-700 border-gray-600 text-white"
                                            : "bg-white border-gray-200 text-black"
                                        }`}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Next Installment Date</label>
                                <input
                                    type="date"
                                    value={input.nextInstallmentDate}
                                    readOnly
                                    className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-100 ${theme === "dark"
                                            ? "bg-gray-600 border-gray-600 text-white"
                                            : "bg-gray-100 border-gray-200 text-black"
                                        }`}
                                />
                                <p className="text-xs text-gray-500 mt-1">Auto-calculated (6 months from purchase)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Payment Mode *</label>
                                <select
                                    name="paymentMode"
                                    value={input.paymentMode}
                                    onChange={handelselect}
                                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
                                            ? "bg-gray-700 border-gray-600 text-white"
                                            : "bg-white border-gray-200 text-black"
                                        }`}
                                    required
                                >
                                    <option value="">Select Payment Mode</option>
                                    <option value="cash">Cash</option>
                                    <option value="upi">UPI</option>
                                    <option value="card">Card</option>
                                    <option value="bank">Bank Transfer</option>
                                </select>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                                >
                                    Purchase Policy
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormOpen(false)}
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
    )
}

export default UserPolice
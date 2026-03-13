import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { MdVisibility } from 'react-icons/md';
import { FaRupeeSign, FaCalendarAlt, FaChartLine, FaFilter } from 'react-icons/fa';

const AgentPolicy = () => {
    const [data, setData] = useState([]);
    const [theme, setTheme] = useState("light");
    const [view, setView] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [search, setSearch] = useState("");
    const [filterCriteria, setFilterCriteria] = useState({
        duration: "",
        minAmount: "",
        maxAmount: ""
    });
    const [summaryData, setSummaryData] = useState({
        totalPolicies: 0,
        totalInvestment: 0,
        totalProfit: 0,
        averageAmount: 0
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fatchall();
        getTheme();
    }, []);

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
        } catch (error) {
            console.error("Error fetching theme:", error);
        }
    };

    const handleView = async (x) => {
        try {
            const res = await axios.get(`http://localhost:5050/police/findone/${x._id}`);
            setSelectedItem(res.data);
            setView(true);
        } catch (error) {
            console.error("Error fetching record details:", error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const filteredData = data.filter((item) => {
        const matchesSearch = search === "" || 
            (item.fullName && item.fullName.toLowerCase().includes(search.toLowerCase()));
        
        const matchesDuration = filterCriteria.duration === "" || 
            item.installmentDuration?.toString() === filterCriteria.duration;
        
        const amount = Number(item.amount) || 0;
        const matchesMinAmount = filterCriteria.minAmount === "" || 
            amount >= Number(filterCriteria.minAmount);
        const matchesMaxAmount = filterCriteria.maxAmount === "" || 
            amount <= Number(filterCriteria.maxAmount);
        
        return matchesSearch && matchesDuration && matchesMinAmount && matchesMaxAmount;
    });

    const clearFilters = () => {
        setFilterCriteria({
            duration: "",
            minAmount: "",
            maxAmount: ""
        });
        setSearch("");
    };

    return (
        <div className={`ml-64 mt-14 min-h-screen items-center justify-center px-4 py-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
            <div className="flex justify-between items-center mb-6 mt-10">
                <h1 className="text-3xl font-bold">Policy Records</h1>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition transform hover:scale-105"
                >
                    <FaFilter size={16} />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-lg shadow-lg transform hover:scale-102 transition duration-200 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Policies</p>
                            <p className="text-2xl font-bold">{summaryData.totalPolicies}</p>
                        </div>
                        <div className="p-3 bg-blue-500 rounded-full text-white">
                            <FaChartLine size={24} />
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-lg shadow-lg transform hover:scale-102 transition duration-200 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Investment</p>
                            <p className="text-2xl font-bold">{formatCurrency(summaryData.totalInvestment)}</p>
                        </div>
                        <div className="p-3 bg-green-500 rounded-full text-white">
                            <FaRupeeSign size={24} />
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-lg shadow-lg transform hover:scale-102 transition duration-200 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Profit</p>
                            <p className="text-2xl font-bold">{formatCurrency(summaryData.totalProfit)}</p>
                        </div>
                        <div className="p-3 bg-purple-500 rounded-full text-white">
                            <FaChartLine size={24} />
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-lg shadow-lg transform hover:scale-102 transition duration-200 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Average Amount</p>
                            <p className="text-2xl font-bold">{formatCurrency(summaryData.averageAmount)}</p>
                        </div>
                        <div className="p-3 bg-yellow-500 rounded-full text-white">
                            <FaCalendarAlt size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by policy name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                />

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select
                            value={filterCriteria.duration}
                            onChange={(e) => setFilterCriteria({...filterCriteria, duration: e.target.value})}
                            className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                        >
                            <option value="">All Durations</option>
                            <option value="6">6 Months</option>
                            <option value="12">12 Months</option>
                            <option value="24">24 Months</option>
                        </select>

                        <input
                            type="number"
                            placeholder="Min Amount"
                            value={filterCriteria.minAmount}
                            onChange={(e) => setFilterCriteria({...filterCriteria, minAmount: e.target.value})}
                            className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                        />

                        <input
                            type="number"
                            placeholder="Max Amount"
                            value={filterCriteria.maxAmount}
                            onChange={(e) => setFilterCriteria({...filterCriteria, maxAmount: e.target.value})}
                            className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                        />
                    </div>
                )}
            </div>

            {(search || filterCriteria.duration || filterCriteria.minAmount || filterCriteria.maxAmount) && (
                <div className="flex justify-end mb-2">
                    <button
                        onClick={clearFilters}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-lg shadow overflow-hidden`}>
                <table className="min-w-full">
                    <thead className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Policy Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                End Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Profit
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Duration
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Per Installment
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === "dark" ? "bg-gray-900 text-white divide-gray-700" : "bg-gray-100 text-black divide-gray-200"}`}>
                        {filteredData.map((item, index) => (
                            <tr key={index} className={`${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"} transition duration-150`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {item.fullName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {item.endDate?.split("T")[0]}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    ₹{item.amount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    ₹{item.profitAmount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                    ₹{item.totalAmount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {item.installmentDuration} months
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    ₹{item.installmentAmount?.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {item.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex items-center justify-center">
                                        <button
                                            onClick={() => handleView(item)}
                                            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition duration-200 transform hover:scale-110"
                                            title="View Details"
                                        >
                                            <MdVisibility size={22} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
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
                            <h2 className="text-xl font-bold mb-4">📋 Policy Details</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Policy Name:</span>
                                    <span>{selectedItem?.fullName}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">End Date:</span>
                                    <span>{selectedItem?.endDate?.split("T")[0]}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Amount:</span>
                                    <span className="text-green-600 font-semibold">₹{selectedItem?.amount}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Profit:</span>
                                    <span className="text-blue-600 font-semibold">₹{selectedItem?.profitAmount}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Total Amount:</span>
                                    <span className="text-purple-600 font-semibold">₹{selectedItem?.totalAmount}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Duration:</span>
                                    <span>{selectedItem?.installmentDuration} months</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Per Installment:</span>
                                    <span>₹{selectedItem?.installmentAmount?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Role:</span>
                                    <span className="capitalize">{selectedItem?.role}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Status:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedItem?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {selectedItem?.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setView(false)}
                                className="mt-5 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition duration-200 transform hover:scale-105"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {filteredData.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p className="text-lg">No policies available matching your criteria</p>
                        <button
                            onClick={clearFilters}
                            className="mt-2 text-blue-500 hover:text-blue-700"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentPolicy;
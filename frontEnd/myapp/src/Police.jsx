import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md';
import { FaUsers, FaRupeeSign, FaChartLine } from 'react-icons/fa';

const Police = () => {
    const [data, setData] = useState([]);
    const [input, setInput] = useState({
        fullName: "",
        endDate: "",
        amount: "",
        installmentDuration: "",
        installmentAmount: "",
        totalAmount: "",
        profitAmount: "",
        duration: "",
        commissionPercent: ""
    })
    const [editinput, setEditInput] = useState({
        fullName: "",
        endDate: "",
        amount: "",
        installmentDuration: "",
        installmentAmount: "",
        totalAmount: "",
        profitAmount: "",
        duration: "",
        commissionPercent: ""
    })
    const [formOpen, setFormOpen] = useState(false);
    const [theme, setTheme] = useState("light");
    const [view, setView] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [summaryData, setSummaryData] = useState({
        totalInvestment: 0,
        totalProfit: 0,
        activePolicies: 0
    });

    useEffect(() => {
        fatchall();
        getTheme();
    }, [])

    useEffect(() => {
        calculateSummary();
    }, [data]);

    const calculateSummary = () => {
        const totalInvestment = data.reduce((sum, item) => sum + (item.amount || 0), 0);
        const totalProfit = data.reduce((sum, item) => sum + (item.profitAmount || 0), 0);
        const activePolicies = data.filter(item => item.isActive === true).length;
        
        setSummaryData({
            totalInvestment,
            totalProfit,
            activePolicies
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedData = {
            ...input,
            [name]: value
        };

        const amount = Number(updatedData.amount) || 0;
        const profit = Number(updatedData.profitAmount) || 0;

        updatedData.totalAmount = amount + profit;

        setInput(updatedData);
    };

    const handelselect = (e) => {
        const { name, value } = e.target;
        const updatedData = {
            ...input,
            [name]: value
        };

        const totalAmount = Number(updatedData.totalAmount) || 0;
        const installmentDuration = Number(updatedData.installmentDuration) || 0;

        updatedData.installmentAmount = totalAmount / installmentDuration;

        setInput(updatedData);
    };

    const handlsubmit = async (e) => {
        e.preventDefault();
        try {
            const submissionData = {
                ...input,
                isActive: true,
                status: "active"
            };
            await axios.post("http://localhost:5050/police/", submissionData);
            alert("Data submitted successfully!");
            const res = await axios.get("http://localhost:5050/police/findall");
            setData(res.data);
            setFormOpen(false);
            setInput({
                fullName: "",
                endDate: "",
                amount: "",
                installmentDuration: "",
                installmentAmount: "",
                totalAmount: "",
                profitAmount: "",
                duration: "",
                commissionPercent: ""
            });
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    }

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
        }
        catch (error) {
            console.error("Error fetching theme:", error);
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                await axios.delete(`http://localhost:5050/police/delete/${id}`);
                alert("Record deleted successfully!");
                fatchall();
            } catch (error) {
                console.error("Error deleting record:", error);
            }
        }
    }

    const handleView = async (x) => {
        try {
            const res = await axios.get(`http://localhost:5050/police/findone/${x._id}`);
            setSelectedItem(res.data);
            setView(true);
        }
        catch (error) {
            console.error("Error fetching record details:", error);
        }
    }

    const handleEditClick = (item) => {
        setEditData(item);
        setEditInput({
            fullName: item.fullName || "",
            endDate: item.endDate ? item.endDate.split('T')[0] : "",
            amount: item.amount || "",
            installmentDuration: item.installmentDuration || "",
            installmentAmount: item.installmentAmount || "",
            totalAmount: item.totalAmount || "",
            profitAmount: item.profitAmount || "",
            duration: item.duration || "",
            commissionPercent: item.commissionPercent || ""
        });
        setIsOpen(true);
    };

    const handlEdit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5050/police/update/${editData._id}`, editinput);
            alert("Record updated successfully!");
            setIsOpen(false);
            fatchall();
        } catch (error) {
            console.error("Error updating record:", error);
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const filteredData = data.filter((item) =>
        item.fullName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={`ml-64 mt-14 min-h-screen items-center justify-center px-4 py-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
            <div className="flex justify-between items-center mb-6 mt-10">
                <h1 className="text-2xl font-bold">Investment Records</h1>
                <button
                    onClick={() => setFormOpen(!formOpen)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200 transform hover:scale-105"
                >
                    Add New
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-lg shadow-lg transform hover:scale-102 transition duration-200 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Investment</p>
                            <p className="text-2xl font-bold">{formatCurrency(summaryData.totalInvestment)}</p>
                        </div>
                        <div className="p-3 bg-blue-500 rounded-full text-white">
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
                        <div className="p-3 bg-green-500 rounded-full text-white">
                            <FaChartLine size={24} />
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-lg shadow-lg transform hover:scale-102 transition duration-200 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Active Policies</p>
                            <p className="text-2xl font-bold">{summaryData.activePolicies}</p>
                        </div>
                        <div className="p-3 bg-purple-500 rounded-full text-white">
                            <FaUsers size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`border px-3 py-2 rounded-md mb-4 w-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
            />

            <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-lg shadow overflow-hidden`}>
                <table className="min-w-full">
                    <thead className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Full Name
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
                                Installment
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
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleView(item)}
                                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition duration-200"
                                            title="View"
                                        >
                                            <MdVisibility size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(item)}
                                            className="text-yellow-500 hover:text-yellow-600 p-1 rounded-full hover:bg-yellow-100 transition duration-200"
                                            title="Edit"
                                        >
                                            <MdEdit size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
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

                {view && selectedItem && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={() => setView(false)}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className={`rounded-2xl shadow-2xl p-6 w-full max-w-md ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}
                        >
                            <h2 className="text-xl font-bold mb-4">📋 Record Details</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Full Name:</span>
                                    <span>{selectedItem?.fullName}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">End Date:</span>
                                    <span>{selectedItem?.endDate?.split("T")[0]}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Amount:</span>
                                    <span>₹{selectedItem?.amount}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Profit:</span>
                                    <span>₹{selectedItem?.profitAmount}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Total:</span>
                                    <span className="font-bold">₹{selectedItem?.totalAmount}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Duration:</span>
                                    <span>{selectedItem?.duration} months</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Commission:</span>
                                    <span>{selectedItem?.commissionPercent}%</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Status:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedItem?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {selectedItem?.isActive ? 'Active' : 'Inactive'}
                                    </span>
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

                {data.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No records available
                    </div>
                )}
            </div>

            {isOpen && editData && (
                <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50`}>
                    <form onSubmit={handlEdit} className={`rounded-lg shadow-xl px-8 pt-6 pb-8 w-full max-w-md ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
                        <h2 className="text-2xl font-bold mb-6">Edit Police Record</h2>
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
                                <label className="block text-sm font-medium mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={editinput.endDate}
                                    onChange={(e) => setEditInput({ ...editinput, endDate: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Amount</label>
                                <input
                                    type="number"
                                    value={editinput.amount}
                                    onChange={(e) => setEditInput({ ...editinput, amount: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Profit Amount</label>
                                <input
                                    type="number"
                                    value={editinput.profitAmount}
                                    onChange={(e) => setEditInput({ ...editinput, profitAmount: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Total Amount</label>
                                <input
                                    type="number"
                                    value={editinput.totalAmount}
                                    onChange={(e) => setEditInput({ ...editinput, totalAmount: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2">Installment Duration</label>
                                <select
                                    value={editinput.installmentDuration}
                                    onChange={(e) => setEditInput({ ...editinput, installmentDuration: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                >
                                    <option value="">Select Duration</option>
                                    <option value="6">6 months</option>
                                    <option value="12">12 months</option>
                                    <option value="24">24 months</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2">Installment Amount</label>
                                <input
                                    type="number"
                                    value={editinput.installmentAmount}
                                    onChange={(e) => setEditInput({ ...editinput, installmentAmount: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2">Commission Percent</label>
                                <input
                                    type="number"
                                    value={editinput.commissionPercent}
                                    onChange={(e) => setEditInput({ ...editinput, commissionPercent: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2">Policy Duration</label>
                                <input
                                    type="number"
                                    value={editinput.duration}
                                    onChange={(e) => setEditInput({ ...editinput, duration: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
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

            {formOpen && (
                <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50`}>
                    <form onSubmit={handlsubmit} className={`rounded-lg shadow-xl px-8 pt-6 pb-8 w-full max-w-md ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
                        <h2 className="text-2xl font-bold mb-6">Add New Record</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={input.fullName}
                                    onChange={(e) => setInput({ ...input, fullName: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={input.endDate}
                                    onChange={(e) => setInput({ ...input, endDate: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Amount</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={input.amount}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Profit Amount</label>
                                <input
                                    type="number"
                                    name="profitAmount"
                                    value={input.profitAmount}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Total Amount</label>
                                <input
                                    type="number"
                                    name="totalAmount"
                                    value={input.totalAmount}
                                    readOnly
                                    className={`w-full px-3 py-2 border rounded-lg bg-gray-100 ${theme === "dark" ? "bg-gray-600 border-gray-600 text-white" : "bg-gray-100 border-gray-300"}`}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2">Installment Duration</label>
                                <select
                                    value={input.installmentDuration}
                                    name="installmentDuration"
                                    onChange={handelselect}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                >
                                    <option value="">Select Duration</option>
                                    <option value="6">6 months</option>
                                    <option value="12">12 months</option>
                                    <option value="24">24 months</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2">Installment Amount</label>
                                <input
                                    type="number"
                                    value={input.installmentAmount}
                                    name="installmentAmount"
                                    readOnly
                                    className={`w-full px-3 py-2 border rounded-lg bg-gray-100 ${theme === "dark" ? "bg-gray-600 border-gray-600 text-white" : "bg-gray-100 border-gray-300"}`}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2">Commission Percent</label>
                                <input
                                    type="number"
                                    value={input.commissionPercent}
                                    onChange={(e) => setInput({ ...input, commissionPercent: e.target.value })}
                                    name="commissionPercent"
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2">Policy Duration</label>
                                <input
                                    type="number"
                                    value={input.duration}
                                    onChange={(e) => setInput({ ...input, duration: e.target.value })}
                                    name="duration"
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
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
                                onClick={() => setFormOpen(false)}
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

export default Police
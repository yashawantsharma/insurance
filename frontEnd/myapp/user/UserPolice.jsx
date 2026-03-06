import axios from 'axios';
import { set } from 'mongoose';
import React, { useEffect, useState } from 'react'
import { MdDelete, MdEdit, MdViewCozy, MdVisibility } from 'react-icons/md';

const UserPolice = () => {
    const [data, setData] = useState([]);
    const [input, setInput] = useState({
        fullName: "",
        endDate: "",
        amount: "",
        installmentDuration: "",
        installmentAmount: "",
        totalAmount: "",
        profitAmount: "",
    })
    const [editinput, setEditInput] = useState({
        fullName: "",
        endDate: "",
        amount: "",
        installmentDuration: "",
        installmentAmount: "",
        totalAmount: "",
        profitAmount: "",
    })
    const [formOpen, setFormOpen] = useState(false);
    const [theme, setTheme] = useState("light");
    const [view, setView] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
  const [editData, setEditData] = useState(null);

    useEffect(() => {
        fatchall();
        getTheme();
    }, [])



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


    const formopen=async(x)=>{
        try {
            
        } catch (error) {
            
        }
    }


    const filteredData = data.filter((item) =>
        item.fullName.toLowerCase().includes(search.toLowerCase())
    );

    return (

        <div className={`ml-64 mt-14 min-h-screen items-center justify-center px-4 py-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>

            <div className="flex justify-between items-center mb-6 mt-10">
                <h1 className="text-2xl font-bold">Investment Records</h1>
        
            </div>
            <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border px-3 py-2 rounded-md mb-4 w-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />



            <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-lg shadow overflow-hidden`}>
                <table className="min-w-full">
                    <thead className="bg-gray-50 ">
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
                                Profit Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Total Amount
                            </th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                               installmentDuration
                            </th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                installmentAmount
                            </th>   
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Action
                            </th>

                        </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
                        {filteredData.map((item, index) => (
                            <tr key={index} className={`${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm ">
                                    {item.fullName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {item.endDate?.split("T")[0]}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm ">
                                    ${item.amount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    ${item.profitAmount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    ${item.totalAmount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {item.installmentDuration}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {item.installmentAmount}
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleView(item)}
                                            className="text-white-600 hover:text-gray-800"
                                            title="View"
                                        >
                                            <MdVisibility size={20} />
                                        </button>

                                        <button
                                            onClick={() => formopen(item._id)}
                                            className=" bg-red-600 h-8 w-15  hover:text-red-800"
                                            title="Delete"
                                        >
                                            Bay
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
                            className=" rounded-2xl shadow-2xl p-6 w-full max-w-md"
                        >
                            <h2 className="text-xl font-bold mb-4">📋 Record Details</h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span>Full Name:</span>
                                    <span>{selectedItem?.fullName}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>End Date:</span>
                                    <span>
                                        {selectedItem?.endDate?.split("T")[0]}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Amount:</span>
                                    <span>₹{selectedItem?.amount}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Profit:</span>
                                    <span>₹{selectedItem?.profitAmount}</span>
                                </div>

                                <div className="flex justify-between font-bold border-t pt-2">
                                    <span>Total:</span>
                                    <span>₹{selectedItem?.totalAmount}</span>
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


                {data.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No records available
                    </div>
                )}
            </div>




            {formOpen && (
                <div className={`fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
                    <form onSubmit={handlsubmit} className=" rounded-lg shadow-xl px-8 pt-6 pb-8 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6">Add New Record</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={input.fullName}
                                    onChange={(e) => setInput({ ...input, fullName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={input.endDate}
                                    onChange={(e) => setInput({ ...input, endDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={input.amount}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Profit Amount
                                </label>
                                <input
                                    type="number"
                                    name="profitAmount"

                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>


                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Total Amount
                                </label>
                                <input
                                    type="number"
                                    name="totalAmount"
                                    value={input.totalAmount}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>



                            <div>
                                <label className=" text-sm font-medium mb-2">
                                    installmentDuration
                                </label>
                                <select
                                    value={input.installmentDuration}
                                    name="installmentDuration"
                                    onChange={handelselect}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    required
                                >
                                    <option value="">Select Duration</option>
                                    <option value="6">6 months</option>
                                    <option value="12">12 months</option>
                                    <option value="24">24 months</option>
                                </select>
                            </div>

                            <div>
                                <label className=" text-sm font-medium mb-2">
                                    installmentAmount
                                </label>
                                <input
                                    type="number"
                                    value={input.installmentAmount}
                                    name="installmentAmount"
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

export default UserPolice

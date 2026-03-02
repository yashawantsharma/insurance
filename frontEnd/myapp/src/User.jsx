import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md';

const User = () => {
    const [data, setData] = useState([])
    const [theme, setTheme] = useState("");
    const [view, setView] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showForm, setShowForm] = useState(false)
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [editData, setEditData] = useState(null);
    const [input, setInput] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "",
        gender: ""
    })

    const [editinput, setEditInput] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "",
        gender: ""
    });

    useEffect(() => {
        fatchdata()
        fatchTheme()
    }, [])

    const fatchdata = async (e) => {
        // e.preventDefault()
        // e.preventDefault();
        try {
            const res = await axios.get("http://localhost:5050/user/findall")
            setData(res.data)
        }
        catch (error) {

        }
    }
    // console.log(data)

    const filtredata = data.filter((x) => x.role === "user")

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
            // console.log(res.data);
        } catch (error) {
            console.error("Error fetching theme data:", error);
        }
    }


    const handleView = async (x) => {
        try {
            const res = await axios.get(`http://localhost:5050/user/findone/${x._id}`);
            setSelectedItem(res.data);
            setView(true);

        }
        catch (error) {
            console.error("Error fetching record details:", error);
        }
    }


    const handlsubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5050/user/", input);
            alert("Data submitted successfully!");
            fatchdata()
            setShowForm(false);

        } catch (error) {
            console.error("Error submitting form:", error);
        }
    }


    const handledit = async (x) => {
        x.preventDefault();
        try {
            await axios.put(`http://localhost:5050/user/update/${editData._id}`, editinput)
            alert("Data Update Successfully")
            fatchdata()
            setIsOpen(false)
        } catch (error) {

        }
    }

    const handleDelete=async(x)=>{
        try {
            await axios.delete(`http://localhost:5050/user/delete/${x}`)
            alert("Data Delete Successfully")
            fatchdata()
        } catch (error) {
            
        }
    }

    const editdatashow = (item) => {
  setEditInput({
    name: item.name || "",
    email: item.email || "",
    password: "",
    role: item.role || "",
    gender: item.gender || "",
    phone: item.phone || "",
  });

  setIsOpen(true);
};

 const filteredData = filtredata.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div
            className={`ml-64 mt-14 p-6 min-h-screen ${theme === "dark"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-black"
                }`}
        >
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Agent List</h2>

                <button
                    onClick={() => setShowForm(true)}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                >
                    + Add User
                </button>
            </div>

             <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border px-3 py-2 rounded-md mb-4 w-100  focus:ring-2 focus:ring-blue-500"
            />

            <div className="overflow-x-auto  dark:bg-gray-800 rounded-xl shadow">
                <table className="min-w-full text-sm text-left">
                    <thead className=" dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">gender</th>
                            <th className="px-4 py-3">role</th>
                            <th className="px-4 py-3">actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((x) => (
                                <tr
                                    key={x._id}
                                    className="border-b  dark:hover:bg-gray-700 transition"
                                >
                                    <td className="px-4 py-3">
                                        {x.fullName || x.name || "N/A"}
                                    </td>
                                    <td className="px-4 py-3">{x.email}</td>
                                    <td className="px-4 py-3">{x.phone}</td>
                                    <td className="px-4 py-3">{x.gender}</td>
                                    <td className="px-4 py-3">
                                        {x.role}
                                    </td>
                                    <td className="">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleView(x)}
                                                className="text-gray-600 hover:text-gray-800"
                                                title="View"
                                            >
                                                <MdVisibility size={20} />
                                            </button>

                                            <button
                                                onClick={() => {
                                                    editdatashow(x)
                                                    setEditData(x);
                                                    setIsOpen(true);
                                                }}
                                                className="text-yellow-500 hover:text-yellow-600"
                                                title="Edit"
                                            >
                                                <MdEdit size={20} />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(x._id)}
                                                className="text-red-600 hover:text-red-800"
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
                                <td colSpan="6" className="text-center py-4">
                                    No Data Found
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
                            className=" rounded-2xl shadow-2xl p-6 w-full max-w-md"
                        >
                            <h2 className="text-xl font-bold mb-4">📋 User Details</h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span>Name:</span>
                                    <span>{selectedItem?.name}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Email:</span>
                                    <span>
                                        {selectedItem?.email}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Phone:</span>
                                    <span>{selectedItem?.phone}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>role:</span>
                                    <span>₹{selectedItem?.role}</span>
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
            </div>

            {isOpen && editinput && (
                <div className={`fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
                    <form onSubmit={handledit} className=" rounded-lg shadow-xl px-8 pt-6 pb-8 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6">Edit Record</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={editinput.name}
                                    onChange={(e) => setEditInput({ ...editinput, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    email :
                                </label>
                                <input
                                    type="email"
                                    value={editinput.email}
                                    onChange={(e) => setEditInput({ ...editinput, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>


                            <div>
                                <label className=" text-sm font-medium mb-2">
                                    password
                                </label>
                                <input
                                    type="number"
                                    value={editinput.password}
                                    onChange={(e) => setEditInput({ ...editinput, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>







                            <div>
                                <label className=" text-sm font-medium mb-2">
                                    role
                                </label>
                                <select
                                    value={editinput.role}
                                    name='role'
                                    onChange={(e) => setEditInput({ ...editinput, role: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    required
                                >
                                    <option value="">Select ...</option>
                                    <option value="user">user</option>
                                </select>
                            </div>

                            <div>
                                <label className=" text-sm font-medium mb-2">
                                    gender
                                </label>
                                <select
                                    value={editinput.gender}
                                    name='role'
                                    onChange={(e) => setEditInput({ ...editinput, gender: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    required
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">male</option>
                                    <option value="female">female</option>
                                    <option value="outher">outher</option>
                                </select>
                            </div>

                            <div>
                                <label className=" text-sm font-medium mb-2">
                                    phone
                                </label>
                                <input
                                    type="number"
                                    value={editinput.phone}
                                    onChange={(e) => setEditInput({ ...editinput, phone: e.target.value })}
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
                <div className={`fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
                    <form onSubmit={handlsubmit} className=" rounded-lg shadow-xl px-8 pt-6 pb-8 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6">Add New Record</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={input.name}
                                    onChange={(e) => setInput({ ...input, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    email :
                                </label>
                                <input
                                    type="email"
                                    value={input.email}
                                    onChange={(e) => setInput({ ...input, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>


                            <div>
                                <label className=" text-sm font-medium mb-2">
                                    password
                                </label>
                                <input
                                    type="number"
                                    value={input.password}
                                    onChange={(e) => setInput({ ...input, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>







                            <div>
                                <label className=" text-sm font-medium mb-2">
                                    role
                                </label>
                                <select
                                    value={input.role}
                                    name='role'
                                    onChange={(e) => setInput({ ...input, role: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    required
                                >
                                    <option value="">Select ...</option>
                                    <option value="user">user</option>
                                </select>
                            </div>

                            <div>
                                <label className=" text-sm font-medium mb-2">
                                    gender
                                </label>
                                <select
                                    value={input.gender}
                                    name='role'
                                    onChange={(e) => setInput({ ...input, gender: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    required
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">male</option>
                                    <option value="female">female</option>
                                    <option value="outher">outher</option>
                                </select>
                            </div>

                            <div>
                                <label className=" text-sm font-medium mb-2">
                                    phone
                                </label>
                                <input
                                    type="number"
                                    value={input.phone}
                                    onChange={(e) => setInput({ ...input, phone: e.target.value })}
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

export default User

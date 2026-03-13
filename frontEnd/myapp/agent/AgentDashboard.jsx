import React, { useEffect, useState } from "react";
import axios from "axios";
import ViewModal from "./modal/ViewModal";

const AgentDashboard = () => {

    const [branches, setBranches] = useState([])
    const [agents, setAgents] = useState([])
    const [policies, setPolicies] = useState([])
    const [theme, setTheme] = useState("light");
    const [showModal, setShowModal] = useState(false)
    useEffect(() => {
        fetchData()
        getTheme()
    }, [])

    const fetchData = async () => {
        try {

            const branchRes = await axios.get("http://localhost:5050/branch/findall")
            const agentRes = await axios.get("http://localhost:5050/agent/findall")
            const policyRes = await axios.get("http://localhost:5050/police/findall")

            setBranches(branchRes.data.data)
            setAgents(agentRes.data)
            setPolicies(policyRes.data)

        } catch (err) {
            console.log(err)
        }
    }


    const handleModal = () => {

        setShowModal(!showModal)

    }
    const getTheme = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

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

    return (
        <div className={`ml-64 mt-14 p-8 min-h-screen transition-all duration-300 
        ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>

            <h1 className="text-3xl font-bold mb-8 tracking-wide">
                Agent Dashboard
            </h1>

            <div className="grid grid-cols-4 gap-6">

                <div onClick={handleModal} className="bg-gradient-to-from-blue-500 border   text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition">
                    <p className="text-sm opacity-80">Total Branch</p>
                    <h2 className="text-4xl font-bold mt-2">
                        {branches.length}
                    </h2>
                </div>

                <div className="bg-gradient-to-r from-green-500 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition">
                    <p className="text-sm opacity-80">Total Agents</p>
                    <h2 className="text-4xl font-bold mt-2">
                        {agents.length}
                    </h2>
                </div>

                <div className="bg-gradient-to-r from-purple-500 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition">
                    <p className="text-sm opacity-80">Total Policies</p>
                    <h2 className="text-4xl font-bold mt-2">
                        {policies.length}
                    </h2>
                </div>

                <div className="bg-gradient-to-r from-orange-400 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition">
                    <p className="text-sm opacity-80">Revenue</p>
                    <h2 className="text-4xl font-bold mt-2">
                        ₹2,45,000
                    </h2>
                </div>

            </div>

            <div className="grid grid-cols-2 gap-6 mt-10">

                <div className={`p-6 rounded-2xl shadow-lg backdrop-blur-lg 
                ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>

                    <h2 className="font-semibold mb-4 text-lg">
                        Branch Overview
                    </h2>

                    <div className="h-40 flex items-center justify-center text-gray-400">
                        Chart Here
                    </div>

                </div>

                <div className={`p-6 rounded-2xl shadow-lg backdrop-blur-lg 
                ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>

                    <h2 className="font-semibold mb-4 text-lg">
                        Agent Performance
                    </h2>

                    <div className="h-40 flex items-center justify-center text-gray-400">
                        Chart Here
                    </div>

                </div>

            </div>


            <div className={`p-6 rounded-2xl shadow-lg mt-10 
            ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>

                <h2 className="font-semibold mb-6 text-lg">
                    Recent Branch
                </h2>

                <div className="overflow-x-auto">

                    <table className="w-full text-left border-collapse">

                        <thead>

                            <tr className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">

                                <th className="p-3">Branch Name</th>
                                <th className="p-3">Code</th>
                                <th className="p-3">Address</th>

                            </tr>

                        </thead>

                        <tbody>

                            {branches.slice(0, 5).map((b, index) => (

                                <tr
                                    key={b._id}
                                    className={`border-b transition hover:bg-gray-200 
                                    ${theme === "dark" ? "hover:bg-gray-700 border-gray-700" : ""}`}
                                >

                                    <td className="p-3 font-medium">
                                        {b.branchName}
                                    </td>

                                    <td className="p-3">
                                        {b.branchCode}
                                    </td>

                                    <td className="p-3">
                                        {b.address}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

            {showModal &&
                <ViewModal
                    close={handleModal}
                ></ViewModal>
            }
        </div>


    );
};





export default AgentDashboard;
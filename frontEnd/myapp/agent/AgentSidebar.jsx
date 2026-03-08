import { useNavigate, useLocation } from "react-router-dom";

const AgentSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigate = (path) => {
        navigate(path);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="fixed top-14 left-0 h-[calc(100vh-56px)] w-64 bg-gray-900 text-white z-30 overflow-y-auto shadow-lg">
            

            <div className="flex flex-col p-4 space-y-2">
                <button
                    onClick={() => handleNavigate("/agentdashboard")}
                    className={`text-left px-4 py-3 rounded-lg font-semibold transitio
                            ? "bg-indigo-600 text-white"
                            : "hover:bg-gray-700 text-gray-300"
                        }`}
                >
                    📊 Dashboard
                </button>

                {/* <button
                    onClick={() => handleNavigate("/role")}
                    className="text-left px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300 font-semibold transition"
                >
                    📖 My Courses
                </button> */}
               


                <button
                    onClick={() => handleNavigate("/agentpolicy")}
                    className="text-left px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300 font-semibold transition"
                >
                    Policy
                </button> 
                <button
                    onClick={() => handleNavigate("/agent")}
                    className="text-left px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300 font-semibold transition"
                >
                Agent
                </button>

                <button
                    onClick={() => handleNavigate("/agentuser")}
                    className="text-left px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300 font-semibold transition"
                >
                    User List
                </button>

                {/* <button
                    onClick={() => handleNavigate("/studentdashboard")}
                    className="text-left px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300 font-semibold transition"
                >
                    📋 Assignments
                </button>

                {/* <button
                    onClick={() => handleNavigate("/studentdashboard")}
                    className="text-left px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300 font-semibold transition"
                >
                    🎓 Results
                </button> */}

                <button
                    onClick={() => handleNavigate("/allbranch")}
                    className="text-left px-4 py-3 rounded-lg hover:bg-gray-700 text-gray-300 font-semibold transition"
                >
                    All Branch
                </button>
            </div>

            <div className="px-4 py-4 border-t border-gray-700 mt-auto">
                <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition">
                    🚪 Logout
                </button>
            </div>
        </div>
    );
};

export default AgentSidebar;

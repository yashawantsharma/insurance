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
                    className={`text-left px-4 py-3 rounded-lg font-semibold transition ${
                        isActive("/agentdashboard") 
                            ? "bg-indigo-600 text-white" 
                            : "hover:bg-gray-700 text-gray-300"
                    }`}
                >
                    📊 Dashboard
                </button>

                <button
                    onClick={() => handleNavigate("/agentpolicy")}
                    className={`text-left px-4 py-3 rounded-lg font-semibold transition ${
                        isActive("/agentpolicy") 
                            ? "hover:bg-gray-700 text-white" 
                            : "hover:bg-gray-700 text-gray-300"
                    }`}
                >
                    📋 Policy
                </button>

                <button
                    onClick={() => handleNavigate("/allagent")}
                    className={`text-left px-4 py-3 rounded-lg font-semibold transition ${
                        isActive("/agent") 
                            ? "hover:bg-gray-700 text-white" 
                            : "hover:bg-gray-700 text-gray-300"
                    }`}
                >
                    👤 Agent
                </button>

                <button
                    onClick={() => handleNavigate("/agentuser")}
                    className={`text-left px-4 py-3 rounded-lg font-semibold transition ${
                        isActive("/agentuser") 
                            ? "hover:bg-gray-700 text-white" 
                            : "hover:bg-gray-700 text-gray-300"
                    }`}
                >
                    👥 User List
                </button>

                <button
                    onClick={() => handleNavigate("/allbranch")}
                    className={`text-left px-4 py-3 rounded-lg font-semibold transition ${
                        isActive("/allbranch") 
                            ? "hover:bg-gray-700 text-white" 
                            : "hover:bg-gray-700 text-gray-300"
                    }`}
                >
                    🏢 All Branch
                </button>

                  <button
                    onClick={() => handleNavigate("/payment")}
                    className={`text-left px-4 py-3 rounded-lg font-semibold transition ${
                        isActive("/payment") 
                            ? "hover:bg-gray-700 text-white" 
                            : "hover:bg-gray-700 text-gray-300"
                    }`}
                >
                    payment
                </button>
            </div>

            <div className="px-4 py-4 border-t border-gray-700 mt-auto">
                <button 
                    onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("userRole");
                        navigate("/login");
                    }}
                    className="w-full px-4 py-2 border rounded-lg font-semibold transition transform hover:scale-105"
                >
                    🚪 Logout
                </button>
            </div>
        </div>
    );
};

export default AgentSidebar;
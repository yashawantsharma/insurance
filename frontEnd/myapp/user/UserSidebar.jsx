import { useNavigate, useLocation } from "react-router-dom";

const UserSidebar = () => {
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
                    onClick={() => handleNavigate("/userdashboard")}
                    className={`text-left px-4 py-3 rounded-lg font-semibold transition ${
                        isActive("/userdashboard") 
                            ? "bg-indigo-600 text-white" 
                            : "hover:bg-gray-700 text-gray-300"
                    }`}
                >
                    📊 Dashboard
                </button>

                <button
                    onClick={() => handleNavigate("/userpolice")}
                    className={`text-left px-4 py-3 rounded-lg font-semibold transition ${
                        isActive("/userpolice") 
                            ? "bg-indigo-600 text-white" 
                            : "hover:bg-gray-700 text-gray-300"
                    }`}
                >
                    📋 Available Policies
                </button>

                <button
                    onClick={() => handleNavigate("/usermypolicy")}
                    className={`text-left px-4 py-3 rounded-lg font-semibold transition ${
                        isActive("/usermypolicy") 
                            ? "bg-indigo-600 text-white" 
                            : "hover:bg-gray-700 text-gray-300"
                    }`}
                >
                    📄 My Policies
                </button>
            </div>

            <div className="px-4 py-4 border-t border-gray-700 mt-auto">
                <button 
                    onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("userId");
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

export default UserSidebar;
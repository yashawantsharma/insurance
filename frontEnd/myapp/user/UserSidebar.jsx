import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { MdDashboard, MdPolicy, MdDescription } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import api from "../src/api/apis";

const NAV_ITEMS = [
    { path: "/userdashboard", label: "Dashboard",           icon: MdDashboard   },
    { path: "/userpolice",    label: "Available Policies",  icon: MdPolicy      },
    { path: "/usermypolicy",  label: "My Policies",         icon: MdDescription },
];

const UserSidebar = () => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        getTheme();
        const handleThemeChange = (event) => {
            setTheme(event.detail);
        };
        window.addEventListener("themeChange", handleThemeChange);
        return () => {
            window.removeEventListener("themeChange", handleThemeChange);
        };
    }, []);

    const getTheme = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get(`${api}/user/theme`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTheme(res.data.theme);
            if (res.data.theme === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        } catch (error) {
            console.error("Error fetching theme:", error);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div
            className={`
                fixed top-14 left-0 h-[calc(100vh-56px)] w-64 z-30 overflow-y-auto
                transition-all duration-300 shadow-xl
                ${theme === "dark"
                    ? "bg-gradient-to-b from-gray-900 to-gray-800 text-white"
                    : "bg-gradient-to-b from-white to-gray-100 text-gray-800"
                }
            `}
        >
            <div className="flex flex-col p-4 space-y-1">
                {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
                    <button
                        key={path}
                        onClick={() => navigate(path)}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg
                            font-medium text-sm transition-all duration-200
                            ${isActive(path)
                                ? theme === "dark"
                                    ? "bg-gray-800 text-white shadow-sm"
                                    : "bg-gray-900 text-white shadow-sm"
                                : theme === "dark"
                                    ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }
                        `}
                    >
                        <span className={isActive(path) ? "text-white" : ""}>
                            <Icon size={20} />
                        </span>
                        <span>{label}</span>
                        {isActive(path) && (
                            <span className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
                        )}
                    </button>
                ))}
            </div>

            <button
                onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    localStorage.removeItem("userRole");
                    navigate("/login");
                }}
                className={`
                    flex items-center gap-3 w-full px-4 py-3 rounded-xl
                    font-medium transition-all duration-200
                    ${theme === "dark"
                        ? "bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    }
                `}
            >
                <FiLogOut size={18} />
                <span>Logout</span>
            </button>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    © 2024 User Panel
                </p>
            </div>
        </div>
    );
};

export default UserSidebar;
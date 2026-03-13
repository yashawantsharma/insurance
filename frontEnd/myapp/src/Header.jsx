import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdDarkMode, MdLightMode, MdLogout, MdPerson } from "react-icons/md";

const Header = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState("light"); 

  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName") || "User";
  const userEmail = localStorage.getItem("userEmail") || "user@example.com";

  const fetchTheme = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get(
        "http://localhost:5050/user/theme",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const fetchedTheme = res.data.theme;
      setTheme(fetchedTheme);
      
  
      if (fetchedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:5050/user/updatetheme",
        { theme: newTheme },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setTheme(newTheme);
      
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      window.dispatchEvent(new CustomEvent('themeChange', { detail: newTheme }));

    } catch (err) {
      console.error("Theme update failed", err);
    }
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-full h-16 flex items-center justify-between px-6 border-b backdrop-blur-md z-50
        ${theme === "dark"
            ? "bg-gray-900/90 border-gray-700 text-white"
            : "bg-white/90 border-gray-200 text-gray-800"
          }`}
      >
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-lg tracking-wide">
            {role === "admin"
              ? "Admin Dashboard"
              : role === "agent"
                ? "Agent Dashboard"
                : "User Dashboard"}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition shadow-sm
            ${theme === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <MdLightMode size={20} />
            ) : (
              <MdDarkMode size={20} />
            )}
          </button>

          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {userName.charAt(0).toUpperCase()}
          </button>

          {profileOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setProfileOpen(false)}
              ></div>
              
              <div
                className={`absolute right-6 top-16 w-64 rounded-xl shadow-lg border z-50
                ${theme === "dark"
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"
                  }`}
              >
                <div className="p-4 border-b flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <p className="font-semibold text-sm">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {userEmail}
                    </p>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                    className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition text-sm
                      ${theme === "dark"
                        ? "hover:bg-gray-800 text-gray-300"
                        : "hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    <MdPerson size={18} />
                    View Profile
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      localStorage.clear();
                      navigate("/login");
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition text-sm"
                  >
                    <MdLogout size={18} />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
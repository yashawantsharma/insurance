import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdLogout, MdLock, MdHome, MdSave, MdClose, MdPhone, MdEmail, MdPerson } from "react-icons/md";
const api = import.meta.env.API_URL;

export default function Profile() {
  const navigate = useNavigate();
  const [userdata, setUserdata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aditpopup, setAditPopup] = useState(false);
  const [theme, setTheme] = useState("");
  const [updatedata, setUpdateData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const id = localStorage.getItem("userid");


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fatchTheme();
    fetchUser();
  }, [theme]);

  useEffect(() => {
    if (userdata) {
      setUpdateData({
        name: userdata.name || "",
        email: userdata.email || "",
        phone: userdata.phone || "",
      });
    }
  }, [userdata]);

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

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5050/user/findone/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserdata(res.data);
      // console.log(res.data);

    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userid");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const handleResetPassword = () => {
    navigate("/reset");
  };

  const profileadit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5050/user/update/${id}`,
        updatedata,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Profile updated successfully");
      setAditPopup(false);
      fetchUser();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const nav = async () => {
    const role = localStorage.getItem("role")
    if (role === "agent") {
      navigate("/agentdashboard");
    }
    else if (role === "admin") {
      navigate("/");
    }
    else if (role === "user") {
      navigate("/userdashboard");
    }
  }

  return (
    <div className={`min-h-screen  flex items-center justify-center px-4 py-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-white bg-indigo-600 text-white">
              {userdata?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className={`pt-20 pb-6 px-8 border ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
          <div className={`text-center mb-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
            <h2 className="text-2xl font-bold mb-1">{userdata?.name}</h2>
            <p className="flex items-center justify-center gap-1 text-gray-500">
              <MdEmail className="inline" /> {userdata?.email}
            </p>
            <span className="inline-block mt-2 px-4 py-1 text-sm rounded-full bg-indigo-100 text-indigo-600 capitalize">
              {userdata?.roll || "user"}
            </span>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 rounded-lg bg-gray-50 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
            <div className="flex items-center gap-3">
              <MdPhone className="text-xl text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{userdata?.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Theme</p>
                <p className="font-medium">{userdata?.theme || "Not provided"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setAditPopup(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
            >
              <MdEdit size={18} />
              Update Profile
            </button>

            <button
              onClick={handleResetPassword}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition border border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              <MdLock size={18} />
              Reset Password
            </button>

            <button
              onClick={() => nav()}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition bg-gray-700 text-white hover:bg-gray-800"
            >
              <MdHome size={18} />
              Back to Dashboard
            </button>

            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition bg-red-600 text-white hover:bg-red-700"
            >
              <MdLogout size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {aditpopup && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 `}>
          <div className={`w-full max-w-md rounded-xl shadow-xl p-6 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Update Profile</h3>
              <button
                onClick={() => setAditPopup(false)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <MdClose size={20} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); profileadit(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MdPerson className="inline mr-1" /> Full Name
                </label>
                <input
                  type="text"
                  value={updatedata.name}
                  onChange={(e) => setUpdateData({ ...updatedata, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MdEmail className="inline mr-1" /> Email Address
                </label>
                <input
                  type="email"
                  value={updatedata.email}
                  onChange={(e) => setUpdateData({ ...updatedata, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MdPhone className="inline mr-1" /> Phone Number
                </label>
                <input
                  type="text"
                  value={updatedata.phone}
                  onChange={(e) => setUpdateData({ ...updatedata, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <MdSave size={18} />
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setAditPopup(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  <MdClose size={18} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
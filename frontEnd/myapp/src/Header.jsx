import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const api = import.meta.env.API_URL;



const Header = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [viewTheme, setViewTheme] = useState("");
  // const [rolle, setRolle] = useState("");
  const navigate = useNavigate();
  // console.log(api);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  const role = localStorage.getItem("role");

   useEffect(() => {
    
    // document.documentElement.classList.toggle("dark", theme === "dark");
    const fetchTheme = async () => {
       const token = localStorage.getItem("token");
      //  if (!token){
      //   alert("Please login is first");
      //   navigate("/login");
      //   return;
      //  }
      const res = await axios.get(
        `http://localhost:5050/user/theme`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setViewTheme(res.data.theme);     
    };
    fetchTheme();
  }, [theme]);
  // setRolle(role);
  // console.log(viewtheme);
  


   const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    // const token=JSON.parse(localStorage.getItem("token")) 
    // const token = JSON.parse(localStorage.getItem("token"));
    const token = localStorage.getItem("token");


    try {
                

   await axios.post(
  `http://localhost:5050/user/updatetheme`,
  { theme: newTheme },
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);
      setTheme(newTheme);

    } catch (err) {
      console.error("Theme update failed", err);
    }
  }

  return (
    <>
  
      <div className={`fixed top-0 border left-0 w-full h-14  flex items-center justify-between px-4 shadow z-50 ${viewTheme=== "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
        <h2 className="font-semibold">{role === "admin" ? "Admin Dashboard" : role === "student" ? "Student Dashboard" : "HR Dashboard"}</h2>

        

        <div className="flex items-center gap-3">
           <button
        onClick={toggleTheme}
        className={`px-4 py-2 rounded ${viewTheme === "dark" ? "bg-white text-black" : "bg-gray-900 text-white"}`}
      >
        {viewTheme === "dark" ? "☀️" : "🌙"}
      </button>
            <button
              onClick={() => handleNavigate("/login")}
              className=" border p-1 "
            >
              Login
            </button>
          <span className="hidden md:block text-sm">
            Yashawant Sharma
          </span>

          <button
            onClick={() => setProfileOpen(true)}
            className="rounded-full w-10 h-10  font-bold uppercase"
          >
            YS
          </button>
        </div>
      </div>

     
      

     
      {profileOpen && (
        <>
          <div
            onClick={() => setProfileOpen(false)}
            className="fixed inset-0 bg-black/40 z-30"
          />

          <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          ${viewTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"} rounded-xl shadow-lg p-6 z-50 w-72`}>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                YS
              </div>

              <div>
                <p className="font-semibold">Yashawant Sharma</p>
                <p className="text-sm text-gray-500">
                  yash@gmail.com
                </p>
              </div>
            </div>

            <button
              onClick={() => 
               { setProfileOpen(false)
                handleNavigate("/profile")}}
              className={`w-full mb-2 border py-2 rounded ${viewTheme === "dark" ? "hover:bg-gray-700 border-gray-600 text-white" : "hover:bg-gray-100 text-black"}`}
            >
              View Profile
            </button>

            <button
              onClick={()=>{
                setProfileOpen(false)
                handleLogout()}}
              className="w-full border py-2 rounded "
            >
              Logout
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default Header;

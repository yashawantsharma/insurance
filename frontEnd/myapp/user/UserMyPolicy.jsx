import axios from "axios";
import React, { useEffect, useState } from "react";

const UserMyPolicy = () => {

  const [data,setData] = useState([]);
  const [loading,setLoading] = useState(true);
   const [theme, setTheme] = useState("light");

  useEffect(()=>{
    fetchPolicies();
     getTheme()
  },[])

  const fetchPolicies = async ()=>{

    const token = localStorage.getItem("token");

    try{

      const res = await axios.get(
        "http://localhost:5050/CustomerPolicy/mypolicies",
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );

      setData(res.data);
      setLoading(false);

    }catch(error){
      console.error(error);
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
    console.log(data);
    
  return (

    <div className={`ml-64 mt-14 min-h-screen p-6 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>

      <h1 className="text-3xl font-bold mb-6 ">
        My Policies
      </h1>

      {loading && (
        <p className="">Loading policies...</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {data.map((item)=>(
          <div
            key={item._id}
            className=" rounded-xl shadow-lg p-6 hover:shadow-2xl transition duration-300 border"
          >

            <h2 className="text-xl font-semibold  mb-2">
              {item.policy?.fullName}
            </h2>

            <p className="text-sm mb-4">
              Policy ID: {item.policy?._id}
            </p>

            <div className="space-y-2">

              <div className="flex justify-between">
                <span className="">Premium</span>
                <span className="font-medium ">
                  ₹{item.premiumAmount}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="">Start Date</span>
                <span>
                  {item.startDate?.split("T")[0]}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="">Next Installment</span>
                <span className="text-red-500 font-medium">
                  {item.nextInstallmentDate?.split("T")[0]}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="">Payment Mode</span>
                <span className="capitalize">
                  {item.paymentMode}
                </span>
              </div>

            </div>

            <button
              className="mt-5 w-full border text-white py-2 rounded-lg transition"
            >
              View Details
            </button>

          </div>
        ))}

      </div>

      {data.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-10">
          No policies purchased yet
        </div>
      )}

    </div>
  );
};

export default UserMyPolicy
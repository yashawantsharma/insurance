import React, { useEffect, useState } from "react";
import axios from "axios";

const UserDashboard = () => {

  const [policies, setPolicies] = useState([]);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    fetchPolicies();
    getTheme();
  }, []);

  const fetchPolicies = async () => {

    const token = localStorage.getItem("token");

    try {

      const res = await axios.get(
        "http://localhost:5050/CustomerPolicy/mypolicies",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPolicies(res.data);

    } catch (error) {
      console.log(error);
    }

  };

  const getTheme = async () => {

    const token = localStorage.getItem("token");

    try {

      const res = await axios.get(
        "http://localhost:5050/user/theme",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setTheme(res.data.theme);

    } catch (error) {
      console.log(error);
    }

  };

  const totalPremium = policies.reduce(
    (sum, item) => sum + Number(item.premiumAmount || 0),
    0
  );

  return (

    <div
      className={`ml-64 mt-14 p-8 min-h-screen 
      ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}
    >

      <h1 className="text-3xl font-bold mb-8">
        User Dashboard
      </h1>

      

      <div className="grid grid-cols-3 gap-6">

        <div className=" text-white p-6 rounded-xl shadow-lg">
          <p>Total Policies</p>
          <h2 className="text-4xl font-bold">
            {policies.length}
          </h2>
        </div>

        <div className=" text-white p-6 rounded-xl shadow-lg">
          <p>Total Premium Paid</p>
          <h2 className="text-4xl font-bold">
            ₹{totalPremium}
          </h2>
        </div>

        <div className=" text-white p-6 rounded-xl shadow-lg">
          <p>Next Installment</p>
          <h2 className="text-xl font-bold">
            {policies[0]?.nextInstallmentDate?.split("T")[0] || "N/A"}
          </h2>
        </div>

      </div>

      

      <div
        className={`mt-10 p-6 rounded-xl shadow 
        ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
      >

        <h2 className="text-xl font-semibold mb-6">
          My Policies
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-blue-500 text-white">

                <th className="p-3">Policy Name</th>
                <th className="p-3">Premium</th>
                <th className="p-3">Start Date</th>
                <th className="p-3">Next Installment</th>
                <th className="p-3">Payment Mode</th>

              </tr>

            </thead>

            <tbody>

              {policies.map((item) => (

                <tr
                  key={item._id}
                  className="border-b "
                >

                  <td className="p-3">
                    {item.policy?.fullName}
                  </td>

                  <td className="p-3">
                    ₹{item.premiumAmount}
                  </td>

                  <td className="p-3">
                    {item.startDate?.split("T")[0]}
                  </td>

                  <td className="p-3 text-red-500">
                    {item.nextInstallmentDate?.split("T")[0]}
                  </td>

                  <td className="p-3 capitalize">
                    {item.paymentMode}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default UserDashboard;
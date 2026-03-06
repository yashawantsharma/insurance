import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdDelete, MdEdit, MdViewCozy, MdVisibility } from 'react-icons/md';

const AllBranch = () => {

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isOpen, setIsOpen] = useState(true)

  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [theme, setTheme] = useState("light")
  const [allBranch, setAllBranch] = useState([])
  const [view, setView] = useState(false);
  const [editData, setEditData] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  // console.log(states)
  const [editinput, setEditInput] = useState({
          branchName: "",
          branchCode: "",
          address: "",
        
      })

  useEffect(() => {
    fetchCountries();
    getTheme();
    getBranch();
  }, []);

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


  const getBranch = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first.");
      return;
    }
    try {
      const res = await axios.get("http://localhost:5050/branch/findall", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllBranch(res.data);
    } catch (error) {
      alert("Error fetching Branch:", error);
    }
  }

  const fetchCountries = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5050/location/countri"
      );
      setCountries(res.data);
    } catch (error) {
      console.log(error);
    }
  };


  const handleCountryChange = async (e) => {
    const countryId = e.target.value;

    setSelectedCountryId(countryId);
    console.log(countryId);

    setSelectedStateId("");
    setSelectedCityId("");
    setCities([]);

    if (!countryId) return;

    try {
      const res = await axios.get(
        `http://localhost:5050/location/states`
      );
      setStates(res.data);
    } catch (error) {
      console.log(error);
    }
  };


  const handleStateChange = async (e) => {
    const stateId = e.target.value;

    setSelectedStateId(stateId);
    console.log(stateId)
    setSelectedCityId("");

    if (!stateId) return;

    try {
      const res = await axios.get(
        `http://localhost:5050/location/cities`
      );
      setCities(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  const handleCityChange = (e) => {
    setSelectedCityId(e.target.value);
    setIsOpen(false)

  };


  const handleView = async (x) => {
    try {
      const res = await axios.get(`http://localhost:5050/branch/findone/${x._id}`);
      setSelectedItem(res.data);
      setView(true);

    }
    catch (error) {
      console.error("Error fetching record details:", error);
    }
  }


  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5050/branch/delete/${id}`);
      alert("Record deleted successfully!");
      getBranch()
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  }


  const handlEdit = async (e) => {
        e.preventDefault();
        try {            await axios.put(`http://localhost:5050/branch/update/${editData._id}`, editinput);
            alert("Record updated successfully!");
            setOpen(false);
            getBranch();
        } catch (error) {
            console.error("Error updating record:", error);
        }   
    }


  // const fatchdata=allBranch.filter((x)=>x.address)
  // console.log(fatchdata);
  // console.log(selectedCityId);



  return (
    <div className={`ml-64 mt-14 min-h-screen items-center justify-center px-4 py-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      {isOpen &&
        <div className={`shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>

          <h2 className="text-2xl font-bold text-center ">
            Select Location
          </h2>

          <div>
            <label className="block text-sm font-medium  mb-1">
              Country
            </label>
            <select
              value={selectedCountryId}
              onChange={handleCountryChange}
              className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none  ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country._id} value={country._id}>
                  {country.countryname}
                </option>
              ))}
            </select>
          </div>

          {/* State Dropdown */}
          {selectedCountryId && (
            <div>
              <label className="block text-sm font-medium  mb-1">
                State
              </label>
              <select
                value={selectedStateId}
                onChange={handleStateChange}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none  ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state._id} value={state._id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          )}


          {selectedStateId && (
            <div>
              <label className="block text-sm font-medium  mb-1">
                City
              </label>
              <select
                value={selectedCityId}
                onChange={handleCityChange}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none  ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city._id} value={city._id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          )}


        </div>
      }



      {selectedCityId && (
        <div className={` shadow-lg rounded-xl p-6 relative  ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              Branches
            </h2>


          </div>

          <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-lg shadow overflow-hidden`}>
            <table className="min-w-full">
              <thead className="bg-gray-50 ">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Branch Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Branch Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    totalAgents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>



                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Action
                  </th>

                </tr>
              </thead>
              <tbody className={`divide-y ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
                {allBranch.map((item, index) => (
                  <tr key={item._id} className={`${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                      {item.branchName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.branchCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                      {item.totalAgents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.address}
                    </td>

                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(item)}
                          className="text-gray-600 hover:text-gray-800"
                          title="View"
                        >
                          <MdVisibility size={20} />
                        </button>

                        <button
                          onClick={() => {
                            setEditData(item);
                            setOpen(true);
                          }}
                          className="text-yellow-500 hover:text-yellow-600"
                          title="Edit"
                        >
                          <MdEdit size={20} />
                        </button>

                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>


            {view && selectedItem && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                onClick={() => setView(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className=" rounded-2xl shadow-2xl p-6 w-full max-w-md"
                >
                  <h2 className="text-xl font-bold mb-4">📋 Record Details</h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Branch Name:</span>
                      <span>{selectedItem?.branchName}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>branchCode:</span>
                      <span>
                        {selectedItem?.branchCode}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>totalAgents:</span>
                      <span>{selectedItem?.totalAgents}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>address:</span>
                      <span>{selectedItem?.address}</span>
                    </div>


                  </div>

                  <button
                    onClick={() => setView(false)}
                    className="mt-5 w-full py-2 bg-blue-500 text-white rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}


            {open && editData && (
        <>
        <div className={`fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
                    <form onSubmit={handlEdit} className=" rounded-lg shadow-xl px-8 pt-6 pb-8 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6">Edit Branch</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Branch Name
                                </label>
                                <input
                                    type="text"
                                    value={editinput.branchName}
                                    onChange={(e) => setEditInput({ ...editinput, branchName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    branchCode
                                </label>
                                <input
                                    type="number"
                                   
                                    value={editinput.branchCode}
                                    onChange={(e) => setEditInput({ ...editinput, branchCode: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-2">
                                    address
                                </label>
                                <input
                                    type="text"
                                    value={editinput.address}
                                    onChange={(e) => setEditInput({ ...editinput, address: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                            >
                                Submit
                            </button>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
          
        </>
      )}


    </div>
  );
};

export default AllBranch;



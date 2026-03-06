import React, { useEffect, useState } from "react";
import axios from "axios";
import { Country, State, City } from "country-state-city";
import { MdDelete, MdEdit, MdViewCozy, MdVisibility } from 'react-icons/md';

const LocationSelector = () => {

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [theme, setTheme] = useState("light")
  const [open, setOpen] = useState(true)
  const [showForm, setShowForm] = useState(false);
  const [input, setInput] = useState({
    branchName: "",
    branchCode: "",
    address: "",
  })


  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [allBranch, setAllBranch] = useState([])

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first.");
      return;
    }
    axios.get("http://localhost:5050/location/countries")
      .then(res => setCountries(res.data))
      .catch(err => console.log(err));

    getTheme()
    getBranch()
  }, []);

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

  const handleCountryChange = (e) => {
    const countryName = e.target.value;

    setSelectedCountry(countryName);
    // console.log(selectedCountry)
    // const countryname=countryCode
    setSelectedState("");
    setCities([]);
    axios.post(`http://localhost:5050/Country/`, {
      countryname: countryName
    })

    const selectedCountryObj = countries.find(
      (c) => c.name === countryName
    );

    axios.get(`http://localhost:5050/location/states/${selectedCountryObj.isoCode}`)
      .then(res => setStates(res.data))
      .catch(err => console.log(err));
  };



  const handleStateChange = async (e) => {
    const stateName = e.target.value;

    setSelectedState(stateName);
    setCities([]);

    try {
      await axios.post("http://localhost:5050/State", {
        name: stateName,
      });

      const selectedStateObj = states.find(
        (s) => s.name === stateName
      );

      const selectedCountryObj = countries.find(
        (c) => c.name === selectedCountry
      );

      if (!selectedStateObj || !selectedCountryObj) return;

      const res = await axios.get(
        `http://localhost:5050/location/cities/${selectedCountryObj.isoCode}/${selectedStateObj.isoCode}`
      );

      setCities(res.data);

    } catch (err) {
      console.log(err);
    }
  };


  const handleDistrictChange = async (e) => {
    const districtname = e.target.value;
    setSelectedDistrict(districtname)
    try {
      await axios.post("http://localhost:5050/District/", {
        name: districtname,
      });
      setOpen(false)


    } catch (err) {
      console.log(err);
    }
  }

  const handelsubmit = async (e) => {
    e.preventDefault()
    console.log(input);

    try {
      await axios.post("http://localhost:5050/branch/", input)
      alert("Branch add successfully")
    } catch (error) {
      alert(error.response?.data);
    }
  }
// console.log(allBranch)
  return (
    <div className={`ml-64 mt-14 min-h-screen items-center justify-center px-4 py-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-6 transition-all duration-300 
      ${theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-white text-black"
              }`}
          >

            <h2 className="text-2xl font-bold text-center">
              Select Location
            </h2>

            <div>
              <label className="block text-sm font-medium mb-2">
                Country
              </label>
              <select
                onChange={handleCountryChange}
                value={selectedCountry}
                className={`w-full rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 transition
            ${theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-black"
                  }`}
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option
                    key={country.isoCode}
                    value={country.name}
                  >
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCountry && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  State
                </label>
                <select
                  onChange={handleStateChange}
                  value={selectedState}
                  className={`w-full rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 transition
              ${theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-black"
                    }`}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option
                      key={state.isoCode}
                      value={state.name}
                    >
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedState && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  District / City
                </label>
                <select
                  onChange={handleDistrictChange}
                  className={`w-full rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 transition
              ${theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-black"
                    }`}
                >
                  <option value="">Select District / City</option>
                  {cities.map((city, index) => (
                    <option
                      key={index}
                      value={city.name}
                    >
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

          </div>
        </div>
      )}

      {selectedDistrict && (
        <div className={` shadow-lg rounded-xl p-6 relative  ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              Branches
            </h2>

            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + New Branch
            </button>
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
                          // onClick={() => handleView(item)}
                          className="text-gray-600 hover:text-gray-800"
                          title="View"
                        >
                          <MdVisibility size={20} />
                        </button>

                        <button
                          // onClick={() => {
                          //   setEditData(item);
                          //   setIsOpen(true);
                          // }}
                          className="text-yellow-500 hover:text-yellow-600"
                          title="Edit"
                        >
                          <MdEdit size={20} />
                        </button>

                        <button
                          // onClick={() => handleDelete(item._id)}
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
          </div>

        </div>
       )} 

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

          <div className="rounded-xl shadow-2xl w-full max-w-md p-6">

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Create New Branch
              </h3>

              <button
                onClick={() => setShowForm(false)}
                className="text-red-500 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handelsubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-medium mb-1">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={input.branchName}
                  onChange={(e) => setInput({ ...input, branchName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  branchCode
                </label>
                <input
                  type="text"
                  value={input.branchCode}
                  onChange={(e) => setInput({ ...input, branchCode: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  address
                </label>
                <input
                  type="text"
                  value={input.address
                  }
                  onChange={(e) => setInput({ ...input, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium mb-1">
                  totalAgents
                </label>
                <input
                  type="text"
                  value={input.}
                  onChange={(e) => setInput({...input,totalAgents:e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div> */}




              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Create Branch
              </button>

            </form>
          </div>

        </div>
      )}
    </div>
  );
};

export default LocationSelector;
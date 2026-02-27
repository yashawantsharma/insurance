import React, { useEffect, useState } from "react";
import axios from "axios";

const LocationSelector = () => {

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5050/location/countries")
      .then(res => setCountries(res.data))
      .catch(err => console.log(err));
  }, []);

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;

    setSelectedCountry(countryCode);
    setSelectedState("");
    setCities([]);

    axios.get(`http://localhost:5050/location/states/${countryCode}`)
      .then(res => setStates(res.data))
      .catch(err => console.log(err));
  };

  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    setSelectedState(stateCode);

    axios.get(`http://localhost:5050/location/cities/${selectedCountry}/${stateCode}`)
      .then(res => setCities(res.data))
      .catch(err => console.log(err));
  };

    return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    
    <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-4">
      
      <h2 className="text-xl font-semibold text-gray-700 text-center">
        Select Location
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Country
        </label>
        <select
          onChange={handleCountryChange}
          value={selectedCountry}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Country</option>
          {countries.map((country) => (
            <option key={country.isoCode} value={country.isoCode}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCountry && (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            State
          </label>
          <select
            onChange={handleStateChange}
            value={selectedState}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state.isoCode} value={state.isoCode}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
      )}

     
      {selectedState && (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            District / City
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select District / City</option>
            {cities.map((city, index) => (
              <option key={index} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      )}

    </div>
  </div>
);
};

export default LocationSelector;
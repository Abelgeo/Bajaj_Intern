import React, { useState, useEffect } from "react";

const specialtiesList = [
  "General Physician", "Dentist", "Dermatologist", "Paediatrician", "Gynaecologist",
  "ENT", "Diabetologist", "Cardiologist", "Physiotherapist", "Endocrinologist",
  "Orthopaedic", "Ophthalmologist", "Gastroenterologist", "Pulmonologist", "Psychiatrist",
  "Urologist", "Dietitian/Nutritionist", "Psychologist", "Sexologist", "Nephrologist",
  "Neurologist", "Oncologist", "Ayurveda", "Homeopath"
];

const App = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [consultType, setConsultType] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [sortBy, setSortBy] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetch("https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json")
      .then((response) => response.json())
      .then((data) => {
        const normalizedData = data.map(normalizeDoctor);
        setDoctors(normalizedData);
        setFilteredDoctors(normalizedData);
        loadFromQueryParams(normalizedData);
      });
  }, []);

  const normalizeDoctor = (doctor) => ({
    ...doctor,
    specialities: doctor.specialities.map((spec) => spec.name),
    fees: parseInt(doctor.fees.replace("₹ ", "")),
    experience: parseInt(doctor.experience.split(" ")[0]),
  });

  const loadFromQueryParams = (data) => {
};

  const filterDoctors = (data, search, consult, specialties, sort) => {
    let result = [...data];

    if (search) {
      result = result.filter((doctor) =>
        doctor.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (consult) {
      result = result.filter((doctor) =>
        consult === "Video Consult" ? doctor.video_consult : doctor.in_clinic
      );
    }

    if (specialties.length > 0) {
      result = result.filter((doctor) =>
        specialties.some((spec) => doctor.specialities.includes(spec))
      );
    }

    if (sort) {
      result.sort((a, b) => {
        if (sort.includes("fees")) return a.fees - b.fees;
        if (sort.includes("experience")) return b.experience - a.experience;
        return 0;
      });
    }

    setFilteredDoctors(result);

    if (search) {
      const matches = result
        .filter((doctor) => doctor.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 3)
        .map((doctor) => doctor.name);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    filterDoctors(doctors, searchTerm, consultType, selectedSpecialties, sortBy);
  }, [searchTerm, consultType, selectedSpecialties, sortBy, doctors]);

  useEffect(() => {
    const handlePopState = () => {
      loadFromQueryParams(doctors);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [doctors]);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 relative max-w-2xl mx-auto">
        <input
          data-testid="autocomplete-input"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Symptoms, Doctors, Specialists, Clinics"
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {suggestions.length > 0 && (
          <ul className="absolute bg-white border w-full mt-1 rounded shadow-lg z-10">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                data-testid="suggestion-item"
                onClick={() => {
                  setSearchTerm(suggestion);
                  setSuggestions([]);
                }}
                className="p-2 cursor-pointer hover:bg-gray-100"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="flex">
        {/* Filter sidebar */}
        <div className="w-1/4 pr-8">
          {/* Sort by section */}
          <div className="mb-6">
            <h3 className="text-lg mb-4">Sort by</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sort"
                  checked={sortBy.includes("fees")}
                  onChange={() => {
                    setSortBy(["fees"]);
                  }}
                  className="w-4 h-4 mr-2 text-blue-600"
                />
                <span className="text-gray-700">Price: Low-High</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sort"
                  checked={sortBy.includes("experience")}
                  onChange={() => {
                    setSortBy(["experience"]);
                  }}
                  className="w-4 h-4 mr-2 text-blue-600"
                />
                <span className="text-gray-700">Experience: Most Experienced First</span>
              </label>
            </div>
          </div>

          {/* Filters section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg">Filters</h3>
              <button 
                className="text-blue-600 text-sm hover:text-blue-800"
                onClick={() => {
                  setSelectedSpecialties([]);
                  setConsultType("");
                }}
              >
                Clear All
              </button>
            </div>

            {/* Specialities section */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Specialities</h4>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Specialities"
                  className="w-full p-2 pr-8 border rounded text-sm mb-2"
                />
                <svg className="w-4 h-4 absolute right-2 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {specialtiesList.map((specialty) => (
                  <label key={specialty} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedSpecialties.includes(specialty)}
                      onChange={() => {
                        setSelectedSpecialties((prev) =>
                          prev.includes(specialty)
                            ? prev.filter((s) => s !== specialty)
                            : [...prev, specialty]
                        );
                      }}
                      className="w-4 h-4 mr-2 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">{specialty}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mode of Consultation */}
            <div>
              <h4 className="font-medium mb-3">Mode of Consultation</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="consult"
                    value="Video Consult"
                    checked={consultType === "Video Consult"}
                    onChange={(e) => setConsultType(e.target.value)}
                    className="w-4 h-4 mr-2 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Video Consult</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="consult"
                    value="In Clinic"
                    checked={consultType === "In Clinic"}
                    onChange={(e) => setConsultType(e.target.value)}
                    className="w-4 h-4 mr-2 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">In Clinic</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="consult"
                    value=""
                    checked={consultType === ""}
                    onChange={(e) => setConsultType(e.target.value)}
                    className="w-4 h-4 mr-2 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">All</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor card section */}
        <div className="w-3/4">
          <div className="space-y-4">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                data-testid="doctor-card"
                className="bg-white p-6 rounded-lg shadow-md flex justify-between items-start"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                    <img
                      src={doctor.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random`}
                      alt={`Dr. ${doctor.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random`;
                      }}
                    />
                  </div>
                  <div>
                    <h3 data-testid="doctor-name" className="text-lg font-bold text-blue-900">
                      {doctor.name}
                    </h3>
                    <p className="text-sm text-gray-600">General Physician</p>
                    <p className="text-sm text-gray-600">MBBS</p>
                    <p data-testid="doctor-experience" className="text-sm text-gray-600">
                      {doctor.experience} yrs exp.
                    </p>
                    <p data-testid="doctor-specialty" className="text-sm text-gray-600 mt-2">
                      {doctor.specialities.join(", ")}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{doctor.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p data-testid="doctor-fee" className="text-lg font-bold text-gray-900">
                    ₹{doctor.fees}
                  </p>
                  <button className="mt-4 w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
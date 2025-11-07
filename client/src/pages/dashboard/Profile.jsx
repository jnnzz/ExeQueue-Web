import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthProvider"; // adjust path if needed

export default function Profile() {
  const { user, userFullName, setUserFullName } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  // separated saved vs editable states
  const [savedData, setSavedData] = useState({
    fullName: "Default Name",
    username: "defaultUser",
    email: "default@example.com",
    password: "*******************",
  });
  const [formData, setFormData] = useState(savedData);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // initialize when user or userFullName changes
  useEffect(() => {
    const initData = {
      fullName: userFullName || user?.fullName || user?.name || "Default Name",
      username: user?.username || user?.userName || "defaultUser",
      email: user?.email || "default@example.com",
      password: "*******************",
    };
    setSavedData(initData);
    setFormData(initData);
    setIsEditing(false);
  }, [user, userFullName]);

  // detect unsaved changes
  useEffect(() => {
    const changed = Object.keys(formData).some(
      (key) => formData[key] !== savedData[key]
    );
    setHasChanges(changed);
  }, [formData, savedData]);

  // handle input typing
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // save changes
  const handleSave = () => {
    if (!hasChanges) return;
    setSavedData(formData); // commit to saved state
    if (typeof setUserFullName === "function") {
      setUserFullName(formData.fullName);
    }
    setIsEditing(false);
    setIsHovered(false);
    console.log("✅ Saved:", formData);
  };

  // discard changes
  const handleDiscard = () => {
    setFormData(savedData); // restore last saved version
    setIsEditing(false);
    console.log("❌ Discarded changes, restored:", savedData);
  };

  // role checks
  const isPersonnel = user?.role === "PERSONNEL";
  const isWorkingScholar = user?.role === "WORKING_SCHOLAR";

  return (
    <div className="min-h-screen flex items-start xl:items-center py-7 lg:py-20 xl:pt-7 xl:pb-7 px-6 sm:px-10 xl:px-0 xl:pl-1 xl:pr-7">
      <div className="h-full w-full flex flex-col text-start rounded-3xl p-5 sm:p-8 xl:p-10 bg-white mt-12 lg:mt-0 shadow-xs">
        <h1 className="text-2xl sm:text-3xl xl:text-4xl font-semibold">
          Profile
        </h1>
        <span className="text-sm sm:text-base xl:text-lg text-[#686969] mb-6 xl:mb-14">
          Manage your profile and account settings
        </span>

        <div
          className={`w-full flex flex-col p-5 lg:p-6 border border-gray-300 rounded-2xl ${
            isPersonnel ? "xl:mb-12" : "md:mb-40"
          }`}
        >
          <div className="flex flex-row justify-between items-start sm:items-center gap-3 mb-5 lg:mb-8">
            <div className="flex gap-2 items-center">
              <img
                src="/assets/Profile/MyAccountProfile.png"
                alt="Profile Icon"
                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8"
              />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-medium">
                Personal Details
              </h3>
            </div>

            {isPersonnel && (
              <>
                {isEditing ? (
                  <button
                    onClick={handleDiscard}
                    className="flex cursor-pointer border border-red-500 text-red-500 font-medium items-center 
                    py-2 px-3 lg:py-2.5 lg:px-4 gap-2 rounded-lg sm:rounded-xl text-sm lg:text-base w-auto 
                    hover:bg-red-500 hover:text-white transition-all duration-200"
                  >
                    Discard
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="flex cursor-pointer border border-[#1A73E8] text-[#1A73E8] font-medium items-center 
                    py-2 px-3 lg:py-2.5 lg:px-4 gap-2 rounded-lg sm:rounded-xl text-sm lg:text-base w-auto 
                    hover:bg-[#1A73E8] hover:text-white transition-all duration-200"
                  >
                    <img
                      src={
                        isHovered
                          ? "/assets/Profile/edit-white.png"
                          : "/assets/Profile/edit.png"
                      }
                      alt="Edit"
                      className="w-4 h-4"
                    />
                    Edit
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col xl:flex-row gap-6 xl:gap-10">
            {/* LEFT SIDE: NAME + ROLE */}
            <div className="flex flex-col items-center xl:items-start text-center xl:text-left w-full xl:w-1/3">
              <p className="text-xl sm:text-2xl lg:text-3xl xl:text-5xl font-semibold leading-normal mb-2">
                {savedData.fullName}
              </p>
              <span className="text-sm sm:text-base lg:text-lg font-medium text-[#686969]">
                {isWorkingScholar ? "Working Scholar" : "Personnel"}
              </span>
            </div>

            {/* RIGHT SIDE: FORM */}
            <div
              className={`w-full xl:w-2/3 space-y-4 sm:space-y-5 lg:space-y-6 ${
                isPersonnel ? "" : "md:pb-20"
              }`}
            >
              {["fullName", "username", "email"]
                .concat(isPersonnel ? ["password"] : [])
                .map((field) => (
                  <div key={field}>
                    <label className="text-xs sm:text-sm lg:text-base font-semibold capitalize">
                      {field === "fullName" ? "Full name" : field}
                    </label>
                    <input
                      type={field === "password" ? "password" : "text"}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      className={`w-full bg-[#F5F5F5] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 lg:py-4 text-sm lg:text-base border border-transparent 
                        focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-[#1A73E8] 
                        ${isEditing ? "text-black" : "text-gray-500"}`}
                      disabled={!isEditing}
                    />
                  </div>
                ))}

              {/* ✅ SAVE BUTTON ALWAYS VISIBLE */}
              {isPersonnel && (
                <div className="flex justify-center lg:justify-end">
                  <button
                    onClick={handleSave}
                    disabled={!isEditing || !hasChanges}
                    className={`w-full sm:w-auto font-medium py-2.5 sm:py-3 px-4 sm:px-5 
                    rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-200
                    ${
                      isEditing && hasChanges
                        ? "bg-[#1A73E8] text-white hover:bg-[#155fc9] cursor-pointer "
                        : "bg-[#1A73E8]/40 text-white cursor-not-allowed"
                    }`}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";

export default function DisplayQueue() {
  return (
    <div className="min-h-[90vh] w-full flex justify-center items-center flex-col px-4 py-6">
      {/* Main Card */}
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl xl:w-[50vh] xl:min-h-[70vh] bg-white rounded-3xl shadow-2xl flex flex-col items-center p-6 sm:p-8 lg:p-10">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-4">
          <h2 className="text-base sm:text-lg font-semibold">Your Queue Number</h2>
          <span className="px-2 sm:px-3 py-1 bg-[#F9AB00]/20 text-[#F9AB00] rounded-full text-[10px] sm:text-xs font-medium">
            Priority
          </span>
        </div>

        {/* Queue Number */}
        <div className="w-full bg-[#F9AB00]/20 rounded-xl flex justify-center items-center py-15 mb-6">
          <span className="text-6xl font-bold text-[#F9AB00]">P01</span>
        </div>

        {/* Divider */}
        <div className="w-full flex justify-center my-2">
          <div className="w-full border-t-2 border-dashed border-gray-300"></div>
        </div>

        {/* Details Label */}
        <div className="w-full text-xs sm:text-sm font-medium mb-6 sm:mb-10">
          <span className="text-gray-500">Details</span>
        </div>

        {/* Details */}
        <div className="w-full pt-2 space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name</span>
            <span className="text-blue-600 font-medium">Jan Lorenz Laroco</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Student ID</span>
            <span className="text-blue-600 font-medium">23123457</span>
          </div>

          {/* Requests */}
          <div className="flex justify-between items-start">
            <span className="text-gray-600">Requests</span>
            <div className="flex flex-col items-end text-blue-600 font-medium space-y-1 text-right mb-4">
              <span>Good Moral Certificate</span>
              <span>Insurance Payment</span>
              <span>Temporary Gate Pass</span>
               <span>Good Moral Certificate</span>

            </div>
          </div>
        </div>

        {/* Reference */}
        <div className="text-[10px] sm:text-xs text-gray-500 mt-10 sm:mt-14 xl:mt-auto text-center flex flex-col gap-2">
          <p>
            Ref no. <span className="text-blue-600 font-semibold">0019-142-323</span>
          </p>
          <p>September 19, 2025  9:01 AM</p>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl xl:w-[50vh] flex flex-col items-center mt-5">
        {/* Note */}
        <p className="text-red-500 text-[10px] sm:text-xs mt-4 text-center flex items-center">
           Take a picture to keep note of your queue
        </p>

        {/* Button */}
        <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 sm:px-6 py-3 rounded-xl w-full text-sm sm:text-base flex items-center justify-center gap-2">
          ← Back to Homepage
        </button>
      </div>
    </div>
  );
}

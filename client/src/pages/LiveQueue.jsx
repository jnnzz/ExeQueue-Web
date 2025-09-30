import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Link } from 'react-router-dom'

export default function LiveQueue() {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center py-6 px-4 sm:px-10 lg:px-20 ">
      <div className="w-full max-w-2xl mb-6 ">
        <div className="flex items-center border border-gray-300 rounded-[20px] px-4 py-2 focus-within:ring-2 focus-within:ring-blue-400 bg-white">
          {query === "" && (
            <FontAwesomeIcon
              icon={faSearch}
              className="text-gray-400 mr-2 text-base"
            />
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Student ID"
            className="flex-1 outline-none bg-transparent text-sm sm:text-base font-light p-1 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full flex justify-center m-10">
        <div className="bg-white rounded-2xl w-full max-w-md shadow p-6 sm:p-8 flex flex-col gap-6 border border-gray-200 ">
          {/* Title */}
          <h3 className="font-semibold text-gray-800 text-lg sm:text-xl text-start mb-3">
            Your Information
          </h3>

          {/* Full Name */}
          <div className="flex justify-between text-sm sm:text-base">
            <span className="text-gray-600">Full name:</span>
            <span className="font-medium text-gray-800 text-right">
              Laroco, Jan Lorenz A.
            </span>
          </div>

          {/* Student ID */}
          <div className="flex justify-between text-sm sm:text-base">
            <span className="text-gray-600">Student ID:</span>
            <span className="font-semibold text-gray-900 text-right">
              23123457
            </span>
          </div>

          {/* Queue Type */}
          <div className="flex justify-between text-sm sm:text-base items-center">
            <span className="text-gray-600">Queue Type:</span>
            <span className="ml-2 px-3 py-2 rounded-full bg-blue-50 text-blue-600 text-xs sm:text-xs font-semibold">
              Regular
            </span>
          </div>

          {/* Service List */}
         <div className="flex justify-between text-sm sm:text-base items-start">
          <span className="text-gray-600">Service:</span>
          <ul className="text-right space-y-1 text-sm sm:text-base font-medium text-gray-800">
            <li>Good Moral Certificate</li>
            <li>Insurance Payment</li>
            <li>Temporary Gate Pass</li>
          </ul>
        </div>

          {/* Queue Number */}
          <div className="bg-blue-50 p-5 rounded-xl text-center">
            <p className="text-gray-600 text-sm mb-1">Your Queue Number</p>
            <p className="text-3xl sm:text-4xl font-bold text-blue-600">P08</p>
          </div>

          {/* Button */}
          <Link to="/student/live-queue/display-queue">
                <div className="mt-2 flex justify-center">
                  <button className="bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition w-full sm:w-auto sm:min-w-[200px]">
                    Back to Home
                  </button>
                </div>
          </Link>
      
        </div>
      </div>
    </div>
  );
}

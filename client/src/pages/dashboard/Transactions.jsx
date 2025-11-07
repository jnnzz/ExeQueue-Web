import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export default function Transactions() {
  const allTransactions = [
    {
      id: 1,
      studentId: "23123457",
      name: "Jan Lorenz Laroco",
      course: "BSIT",
      request: "Good Moral Certificate",
      status: "Completed",
      date: "Sept. 25, 2025",
    },
    {
      id: 2,
      studentId: "23123457",
      name: "Jan Lorenz Laroco",
      course: "BSIT",
      request: "Insurance Payment",
      status: "Completed",
      date: "Sept. 25, 2025",
    },
    {
      id: 3,
      studentId: "23123457",
      name: "Jan Lorenz Laroco",
      course: "BSIT",
      request: "Temporary Gate Pass",
      status: "Completed",
      date: "Sept. 25, 2025",
    },
    {
      id: 4,
      studentId: "23651094",
      name: "Lewis Hamilton",
      course: "BSME",
      request: "Transmittal Letter",
      status: "Cancelled",
      date: "Sept. 25, 2025",
    },
    {
      id: 5,
      studentId: "23984217",
      name: "Alex Albon",
      course: "BEED",
      request: "Uniform Exemption",
      status: "Stalled",
      date: "Sept. 25, 2025",
    },
    {
      id: 6,
      studentId: "23746350",
      name: "Carlos Sainz",
      course: "BSA",
      request: "Transmittal Letter",
      status: "Completed",
      date: "Sept. 25, 2025",
    },
    {
      id: 7,
      studentId: "23479182",
      name: "Charles Leclerc",
      course: "BSCS",
      request: "Transmittal Letter",
      status: "Completed",
      date: "Sept. 25, 2025",
    },
    {
      id: 8,
      studentId: "23043761",
      name: "Pierre Gaisly",
      course: "BSIT",
      request: "Temporary Gate Pass",
      status: "Completed",
      date: "Sept. 25, 2025",
    },
    {
      id: 9,
      studentId: "23124567",
      name: "Lando Norris",
      course: "BSME",
      request: "Good Moral Certificate",
      status: "Completed",
      date: "Sept. 26, 2025",
    },
    {
      id: 11,
      studentId: "23987654",
      name: "George Russell",
      course: "BSCS",
      request: "Transmittal Letter",
      status: "Completed",
      date: "Sept. 26, 2025",
    },
    {
      id: 12,
      studentId: "23876543",
      name: "Max Verstappen",
      course: "BSIT",
      request: "Temporary Gate Pass",
      status: "Cancelled",
      date: "Sept. 26, 2025",
    },
    {
      id: 13,
      studentId: "23765432",
      name: "Sergio Perez",
      course: "BEED",
      request: "Uniform Exemption",
      status: "Stalled",
      date: "Sept. 27, 2025",
    },
    {
      id: 14,
      studentId: "23654321",
      name: "Fernando Alonso",
      course: "BSA",
      request: "Good Moral Certificate",
      status: "Completed",
      date: "Sept. 27, 2025",
    },
    {
      id: 15,
      studentId: "23543210",
      name: "Esteban Ocon",
      course: "BSME",
      request: "Insurance Payment",
      status: "Completed",
      date: "Sept. 27, 2025",
    },
    {
      id: 17,
      studentId: "23321098",
      name: "Nico Hulkenberg",
      course: "BSIT",
      request: "Temporary Gate Pass",
      status: "Completed",
      date: "Sept. 28, 2025",
    },
    {
      id: 18,
      studentId: "23210987",
      name: "Yuki Tsunoda",
      course: "BEED",
      request: "Uniform Exemption",
      status: "Cancelled",
      date: "Sept. 28, 2025",
    },
    {
      id: 19,
      studentId: "23109876",
      name: "Daniel Ricciardo",
      course: "BSA",
      request: "Good Moral Certificate",
      status: "Completed",
      date: "Sept. 29, 2025",
    },
    {
      id: 20,
      studentId: "23098765",
      name: "Valtteri Bottas",
      course: "BSME",
      request: "Insurance Payment",
      status: "Stalled",
      date: "Sept. 29, 2025",
    },
  ];

  const courseFull = {
    BSIT: "Bachelor of Science in Information Technology",
    BSCS: "Bachelor of Science in Computer Science",
    BSME: "Bachelor of Science in Mechanical Engineering",
    BSA: "Bachelor of Science in Accountancy",
    BEED: "Bachelor of Elementary Education",
  };

  const [filters, setFilters] = useState({
    course: "",
    request: "",
    status: "",
    date: "",
  });

  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const itemsPerPage = 8;

  const dropdownRefs = {
    course: useRef(null),
    request: useRef(null),
    status: useRef(null),
    date: useRef(null),
  };

  const courses = [...new Set(allTransactions.map((item) => item.course))];
  const requests = [...new Set(allTransactions.map((item) => item.request))];
  const statuses = [...new Set(allTransactions.map((item) => item.status))];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openDropdown &&
        dropdownRefs[openDropdown]?.current &&
        !dropdownRefs[openDropdown].current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  const filteredTransactions = allTransactions.filter((transaction) => {
    const matchesSearch =
      searchQuery === "" ||
      transaction.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.request.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.status.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      matchesSearch &&
      (filters.course === "" || transaction.course === filters.course) &&
      (filters.request === "" || transaction.request === filters.request) &&
      (filters.status === "" || transaction.status === filters.status) &&
      (filters.date === "" || transaction.date.includes(filters.date))
    );
  });

  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
    setOpenDropdown(null);
  };

  const clearFilters = () => {
    setFilters({ course: "", request: "", status: "", date: "" });
    setSearchQuery("");
    setSelectedDate(null);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-[#26BA33]";

      case "Stalled":
        return " text-[#686969]";
      case "Cancelled":
        return "text-[#EA4335]";
      default:
        return "text-blue-800";
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        startPage = 2;
        endPage = 4;
      }
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      }

      if (startPage > 2) pageNumbers.push("...");
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
      if (endPage < totalPages - 1) pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const formatDateDisplay = (date) => {
    if (!date) return "Date";
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${
      months[date.getMonth()]
    }. ${date.getDate()}, ${date.getFullYear()}`;
  };

  const handleDateSelect = (day) => {
    const selected = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      day
    );
    setSelectedDate(selected);
    handleFilterChange("date", formatDateDisplay(selected));
  };

  const changeMonth = (offset) => {
    setCalendarDate(
      new Date(calendarDate.getFullYear(), calendarDate.getMonth() + offset, 1)
    );
  };

  const CustomDropdown = ({ label, filterType, options, displayFn }) => (
    <div ref={dropdownRefs[filterType]} className="relative">
      <div className="relative">
        <button
          onClick={() =>
            setOpenDropdown(openDropdown === filterType ? null : filterType)
          }
          className={`w-full cursor-pointer flex items-center justify-between rounded-lg py-2.5 text-sm text-gray-700 transition-colors min-h-[42px]
          ${filters[filterType] ? "pl-10 pr-4" : "px-4"}
          ${
            openDropdown === filterType || filters[filterType]
              ? "border border-[#F9AB00]/40 bg-white"
              : "bg-gray-50 hover:bg-gray-100 border border-transparent"
          }`}
        >
          <span className="truncate mr-2 flex items-center gap-1">
            {filterType === "course" && filters[filterType] ? (
              <>
                <span className="text-[#88898A] font-light">Course</span>
                <span className="text-[#88898A]">|</span>
                <span className="text-[#1A73E8] font-normal">
                  {filters[filterType]}
                </span>
              </>
            ) : (
              <span
                className={`${
                  filters[filterType]
                    ? "text-[#1A73E8] font-normal"
                    : "text-gray-500"
                }`}
              >
                {displayFn && filters[filterType]
                  ? displayFn(filters[filterType])
                  : filters[label] || label}
              </span>
            )}
          </span>

          <ChevronDown
            className={`w-4 h-4 flex-shrink-0 transition-transform ${
              openDropdown === filterType
                ? "rotate-180 text-yellow-500"
                : "text-gray-500"
            }`}
          />
        </button>
        {filters[filterType] && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFilterChange(filterType, "");
            }}
            className={`absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors cursor-pointer ${
              filters[filterType]
                ? "bg-[#88898A] hover:bg-gray-700"
                : "hover:bg-gray-200"
            }`}
          >
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {openDropdown === filterType && (
        <div className="absolute z-50 mt-2 w-full bg-white px-1 py-1 rounded-lg shadow-lg border border-gray-200 max-h-72 overflow-y-auto scrollbar-custom">
          <button
            onClick={() => handleFilterChange(filterType, "")}
            className={`w-full text-left rounded-xl px-4 py-3 cursor-pointer text-sm hover:bg-gray-50 transition-colors  ${
              filters[filterType] === ""
                ? "bg-[#E8F1FD] text-[#1A73E8]  font-medium"
                : "border-transparent text-gray-700"
            }`}
          >
            All
          </button>
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleFilterChange(filterType, option)}
              className={`w-full text-left rounded-xl px-4 py-3 cursor-pointer text-sm hover:bg-gray-50 transition-colors  ${
                filters[filterType] === option
                  ? "bg-[#E8F1FD] text-[#1A73E8] font-medium"
                  : "border-transparent text-gray-700"
              }`}
            >
              {displayFn ? displayFn(option) : option}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );

  const CalendarPicker = () => {
    const { daysInMonth, startingDayOfWeek, year, month } =
      getDaysInMonth(calendarDate);
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <div ref={dropdownRefs.date} className="relative">
        <div className="relative">
          <button
            onClick={() =>
              setOpenDropdown(openDropdown === "date" ? null : "date")
            }
            className={`w-full flex items-center justify-between cursor-pointer rounded-lg py-2.5 text-sm text-gray-700 transition-all min-h-[42px]
          ${selectedDate ? "pl-10 pr-4" : "px-4"}
          ${
            openDropdown === "date" || selectedDate
              ? "border border-[#F9AB00]/40 bg-white"
              : "bg-gray-50 hover:bg-gray-100 border border-transparent"
          }`}
          >
            <span
              className={`truncate ${
                selectedDate ? "text-[#1A73E8] font-normal" : "text-gray-500"
              }`}
            >
              {selectedDate ? formatDateDisplay(selectedDate) : "Date"}
            </span>

            <ChevronDown
              className={`w-4 h-4 flex-shrink-0 transition-transform ${
                openDropdown === "date"
                  ? "rotate-180 text-yellow-500"
                  : "text-gray-500"
              }`}
            />
          </button>

          {/* ❌ Clear Button */}
          {selectedDate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDate(null);
                handleFilterChange("date", "");
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-[#88898A] hover:bg-gray-700 transition-colors"
            >
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {openDropdown === "date" && (
          <div className="absolute z-50 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => changeMonth(-1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="font-medium text-gray-900">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const isSelected =
                  selectedDate &&
                  selectedDate.getDate() === day &&
                  selectedDate.getMonth() === month &&
                  selectedDate.getFullYear() === year;

                return day ? (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(day)}
                    className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? "bg-[#F9AB00] text-white"
                        : "hover:bg-gray-100 text-gray-900"
                    }`}
                  >
                    {day}
                  </button>
                ) : (
                  <div key={index} />
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-transparent min-h-screen flex flex-col">
      <div className="flex flex-col flex-1 bg-transparent w-full xl:justify-between pr-8 sm:px-6 md:pl-15 xl:px-9">
        <div className="flex flex-col lg:flex-row items-start lg:items-center pt-15 lg:pt-11 xl:pt-14 justify-between  lg:pr-9 gap-4">
          <div>
            <h1 className="text-3xl sm:text-3xl font-semibold text-left text-[#202124]">
              Transactions
            </h1>
            <p className="text-left text-[#686969] text-sm sm:text-base">
              View and track all past requests and activities
            </p>
          </div>

          <div className="rounded-lg w-full lg:w-md p-0 lg:p-4 mb-4">
            <div className="relative lg:top-2 lg:left-13">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, ID, course, request, or status."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className=" block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-xs  p-4 mb-6">
            <div className="flex flex-wrap lg:flex-nowrap gap-4 items-end w-full">
              <div className="flex items-center h-full justify-center gap-2 text-[#88898A] font-medium text-sm whitespace-nowrap mb-2">
                <img
                  src="/assets/transactions/Filter.png"
                  alt="Filter"
                  className="w-6 h-6"
                />
                Filter
              </div>

              <div className="flex-1 min-w-[150px]">
                <CustomDropdown
                  label="Course"
                  filterType="course"
                  options={courses}
                  displayFn={(course) => courseFull[course] || course}
                />
              </div>

              <div className="flex-1 min-w-[150px]">
                <CustomDropdown
                  label="Request"
                  filterType="request"
                  options={requests}
                />
              </div>

              <div className="flex-1 min-w-[150px]">
                <CustomDropdown
                  label="Status"
                  filterType="status"
                  options={statuses}
                />
              </div>

              <div className="flex-1 min-w-[150px]">
                <CalendarPicker />
              </div>

              <button
                onClick={clearFilters}
                className="bg-transparent text-[#1A73E8] cursor-pointer font-medium py-2.5 px-6 rounded-lg text-sm  whitespace-nowrap"
              >
                Clear Filter
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xs border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200 h-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 w-32">
                    Student ID
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 w-48">
                    Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 w-40">
                    Course
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 w-56">
                    Request
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 w-32">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 w-36">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTransactions.length > 0 ? (
                  currentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left w-32">
                        {transaction.studentId}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left w-48">
                        {transaction.name}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left w-40">
                        {transaction.course}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left w-56">
                        {transaction.request}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-left w-32">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left w-36">
                        {transaction.date}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 sm:px-6 py-8 text-center text-sm text-gray-500"
                    >
                      No transactions found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-transparent mt-4 mb-6 ">
          <div className="py-3 flex flex-col sm:flex-row items-center gap-4 ">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, totalItems)}
                </span>{" "}
                of <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div className="flex flex-1 flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 sm:px-3 py-2  text-xs sm:text-sm font-medium rounded-md cursor-pointer${
                  currentPage === 1
                    ? " text-gray-400 cursor-not-allowed"
                    : " text-gray-700 "
                }`}
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNum, index) => {
                  if (pageNum === "...") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 sm:px-3 py-2 text-gray-500 text-xs sm:text-sm"
                      >
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-[#1A73E8] text-white "
                          : " text-gray-700  "
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 sm:px-3 py-2  text-xs sm:text-sm font-medium rounded-md cursor-pointer ${
                  currentPage === totalPages
                    ? " text-[#88898A] cursor-not-allowed"
                    : " text-gray-700 "
                }`}
              >
                Next
              </button>

              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 sm:px-3 py-2 -300 text-xs sm:text-sm font-medium rounded-md cursor-pointer ${
                  currentPage === totalPages
                    ? " text-[#88898A] cursor-not-allowed"
                    : " text-gray-700 "
                }`}
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { useLoading } from "../../../context/LoadingProvider";
import { login } from "../../../api/auth";

export default function StaffLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [formData, setFormData] = useState({ username: "", password: "" });

  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const { setIsLoading, setProgress, setLoadingText } = useLoading();

  // Example local data for testing
  const exampleUsers = [
    { username: "staff01", password: "password123" },
    { username: "admin", password: "admin123" },
  ];

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoading(true);
    setLoadingText("Logging In...");
    setProgress(20);

    try {
      // Try backend login first
      const res = await login(formData);

      if (res?.success) {
        setProgress(80);
        await new Promise((r) => setTimeout(r, 500));
        await refreshAuth();
        setProgress(100);
        navigate("/staff/dashboard", { replace: true });
        setTimeout(() => setIsLoading(false), 500);
        setLoading(false);
        return;
      }

      // Backend says invalid user
      // Try local example users instead (for testing)
      const userFound = exampleUsers.find(
        (user) => user.username === formData.username
      );

      if (!userFound) {
        setErrors({
          username: "Account not found",
          password: "Account not found",
        });
        setIsLoading(false);
        setLoading(false);
        return;
      }

      if (userFound.password !== formData.password) {
        setErrors({
          username: "",
          password: "Invalid password",
        });
        setIsLoading(false);
        setLoading(false);
        return;
      }

      //Logged in with example data
      setProgress(80);
      await new Promise((r) => setTimeout(r, 500));
      await refreshAuth();
      setProgress(100);
      navigate("/staff/dashboard", { replace: true });
      setTimeout(() => setIsLoading(false), 500);
      setLoading(false);
    } catch (error) {
      // If backend completely fails to fetch
      setErrors({
        username: "Account not found",
        password: "Account not found",
      });
      setIsLoading(false);
      setLoading(false);
    }
  };

  // Determine if both fields should turn red (for account not found)
  const isAccountNotFound =
    errors.username === "Account not found" &&
    errors.password === "Account not found";

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-transparent p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-20 mt-5">
          <img src="/assets/login-logo.png" alt="Logo" className="w-14 h-13" />
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            ExeQueue
          </h1>
        </div>

        <h1 className="text-3xl text-gray-900 font-semibold text-center mb-6">
          Welcome!
        </h1>
        <p className="text-gray-600 text-center mb-8 text-sm">
          Enter to manage queue
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* USERNAME */}
          <div className="relative">
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder=" "
              className={`peer w-full px-4 py-3 border rounded-2xl bg-white 
                focus:outline-none transition-all 
                ${
                  errors.username || isAccountNotFound
                    ? "border-red-500 border-2 focus:ring-red-500"
                    : "border-[#DDEAFC] focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                }`}
            />
            <label
              htmlFor="username"
              className={`absolute left-5 transition-all duration-200 bg-white px-1 pointer-events-none 
                text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base 
                peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-xs 
                 -top-2.5  text-xs 
                  ${
                    errors.username || isAccountNotFound
                      ? "peer-focus:text-red-500"
                      : "peer-focus:text-blue-500"
                  }
                ${
                  errors.username || isAccountNotFound
                    ? "text-red-500 "
                    : formData.username
                    ? "text-blue-500"
                    : ""
                }`}
            >
              Username
            </label>
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder=" "
              className={`peer w-full px-4 py-3 pr-12 border rounded-2xl bg-white 
                focus:outline-none transition-all
                ${
                  errors.password || isAccountNotFound
                    ? "border-red-500 border-2 focus:ring-red-500"
                    : "border-[#DDEAFC] focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                }`}
            />
            <label
              htmlFor="password"
              className={`absolute left-5 transition-all duration-200 bg-white px-1 pointer-events-none 
                text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base 
                peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-xs 
                peer-focus:text-blue-500 -top-2.5 text-xs 
                 ${
                   errors.password || isAccountNotFound
                     ? "peer-focus:text-red-500"
                     : "peer-focus:text-blue-500"
                 }
                ${
                  errors.password || isAccountNotFound
                    ? "text-red-500"
                    : formData.password
                    ? "text-blue-500"
                    : ""
                }`}
            >
              Password
            </label>

            {formData.password && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            )}

            {/* Show error message below password only */}
          </div>

          {/* Forgot Password */}
          <div
            className={`flex  -mt-2 ${
              errors.password || isAccountNotFound
                ? "justify-between"
                : "justify-end"
            }`}
          >
            {(errors.password || isAccountNotFound) && (
              <p className="text-red-500 text-left text-xs">
                {isAccountNotFound
                  ? "Account not found"
                  : errors.password || ""}
              </p>
            )}

            <button
              type="button"
              onClick={() => navigate("/staff/forgot-password")}
              className="text-sm text-[#1A73E8] cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-3 rounded-xl transition-all cursor-pointer ${
              loading
                ? "bg-[#1A73E8] cursor-not-allowed text-white"
                : "bg-[#1A73E8] hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>

        {/* Back to Homepage */}
        <div className="flex justify-center items-center mt-6">
          <ArrowLeft size={16} className="mr-2 text-gray-700" />
          <button
            onClick={() => navigate("/")}
            className="text-sm text-gray-700 cursor-pointer"
          >
            Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}

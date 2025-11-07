import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import icon from "/assets/icon.svg";
import { motion } from "framer-motion";
import ConfirmModal from "./modal/ConfirmModal";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [targetLink, setTargetLink] = useState("");
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const isRequestPage = location.pathname === "/student/request";

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const getActiveClass = (sectionId) => {
    // If on the Request page, disable active/highlight
    if (location.pathname === "/student/request") {
      return "text-gray-700 cursor-pointer hover:text-blue-600";
    }

    // Normal behavior - compare with activeSection
    return activeSection === sectionId
      ? "text-blue-600 cursor-pointer"
      : "text-gray-700 hover:text-blue-600 cursor-pointer";
  };
  const handleLinkClick = (link, event) => {
    event.preventDefault();

    // Check if user has selected a queue in Request page
    const hasQueueSelected =
      sessionStorage.getItem("hasRequestInProgress") === "true";

    if (isRequestPage && hasQueueSelected) {
      setTargetLink(link);
      setShowModal(true);
      // setShowConfirmation(true);
    } else {
      navigateToLink(link);
    }
    closeMenu();
  };

  const handleDesktopNavigation = (link) => {
    // Check if user has selected a queue in Request page
    const hasQueueSelected =
      sessionStorage.getItem("hasRequestInProgress") === "true";

    // Only show confirmation if we're on Request page AND user selected a queue
    if (isRequestPage && hasQueueSelected) {
      setTargetLink(link);
      setShowModal(true);
      // setShowConfirmation(true);
    } else {
      navigateToLink(link);
    }
  };

  const navigateToLink = (link) => {
    if (link === "/#" || link === "/") {
      navigate("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const hashIndex = link.indexOf("#");
      if (hashIndex !== -1) {
        const path = link.substring(0, hashIndex) || "/";
        const hash = link.substring(hashIndex + 1);

        navigate(path);
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 60);
      } else {
        navigate(link);
      }
    }
  };

  const confirmNavigation = () => {
    // Clear the session storage when user confirms navigation
    sessionStorage.removeItem("hasRequestInProgress");
    // setShowConfirmation(false);
    setShowModal(false);
    if (targetLink) {
      navigateToLink(targetLink);
    }
  };

  const cancelNavigation = () => {
    setShowModal(false);
    // setShowConfirmation(false);
    setTargetLink("");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // 👇 Scroll spy to detect active section
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px", // Adjust these values to control when section becomes active
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  // Alternative scroll spy using scroll event (if IntersectionObserver doesn't work well)
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      const scrollPos = window.scrollY + 100; // Adjust offset as needed

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute("id");

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          setActiveSection(sectionId);
        }
      });
    };

    // Use IntersectionObserver as primary, scroll event as fallback
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div className="flex justify-between min-h-[10vh] sticky top-0 backdrop-blur-md z-50">
        <div className="flex items-center lg:ml-20 ml-0 ">
          <img src={icon} alt="Exequeue Logo" className="w-[10vh]" />
          <h1
            className="text-2xl font-bold "
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            ExeQueue
          </h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center mr-25 pr-10 gap-7 scroll-smooth">
          <button
            onClick={() => handleDesktopNavigation("/#")}
            className={`px-4 py-2 rounded-lg font-medium group relative ${getActiveClass(
              "home"
            )}`}
          >
            Home
          </button>
          <button
            onClick={() => handleDesktopNavigation("/#about")}
            className={`px-4 py-2 rounded-lg font-medium group relative ${getActiveClass(
              "about"
            )}`}
          >
            About
          </button>
          <button
            onClick={() => handleDesktopNavigation("/#help")}
            className={`px-4 py-2 rounded-lg font-medium group relative ${getActiveClass(
              "help"
            )}`}
          >
            Help
          </button>
          <button
            onClick={() => handleDesktopNavigation("/#faq")}
            className={`px-4 py-2 rounded-lg font-medium group relative ${getActiveClass(
              "faq"
            )}`}
          >
            FAQs
          </button>
        </div>

        <div className="lg:hidden flex items-center mr-10">
          <button
            ref={buttonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 min-h-10 text-gray-700 hover:text-blue-600"
          >
            {isMenuOpen ? (
              <i className="fas fa-times text-2xl"></i>
            ) : (
              <i className="fas fa-bars text-2xl"></i>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="lg:hidden absolute top-16 right-10 w-40 rounded-xl bg-white shadow-lg border border-gray-100 z-50"
          >
            <div className="flex flex-col space-y-4 p-2 font-light">
              <button
                onClick={(e) => handleLinkClick("/#", e)}
                className={`px-4 py-2 rounded-lg font-medium text-left ${getActiveClass(
                  "home"
                )}`}
              >
                Home
              </button>
              <button
                onClick={(e) => handleLinkClick("/#about", e)}
                className={`px-4 py-2 rounded-lg font-medium text-left ${getActiveClass(
                  "about"
                )}`}
              >
                Help
              </button>
              <button
                onClick={(e) => handleLinkClick("/#help", e)}
                className={`px-4 py-2 rounded-lg font-medium text-left ${getActiveClass(
                  "help"
                )}`}
              >
                About
              </button>
              <button
                onClick={(e) => handleLinkClick("/#faq", e)}
                className={`px-4 py-2 rounded-lg font-medium text-left ${getActiveClass(
                  "faq"
                )}`}
              >
                FAQs
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal - Only shows when queue is selected */}
      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmNavigation}
        loading={loading}
        title="Leave Request Page?"
        description={
          <>
            You have unsaved changes.
            <br />
            Are you sure you want to leave this page?
          </>
        }
        icon="/assets/Caution Icon.png"
        iconAlt="Warning"
        iconSize="w-12 h-12"
        progress={progress}
        showLoading={false}
        loadingText="Submitting your request..."
        showCloseButton={false}
        hideActions={false}
      />
      {showConfirmation && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-xs flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white rounded-2xl p-8 w-md sm:w-[45vh] mx-4 shadow-2xl"
          >
            <div className="text-center">
              <div className="w-10 h-10 bg-orange-400 rounded-[12px] flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-white text-xl"></i>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-6 mt-6">
                Leave Request Page?
              </h3>

              <p className="text-gray-600 text-sm">You have unsaved changes.</p>
              <p className="text-gray-600 text-sm  mb-6">
                Are you sure you want to leave this page?
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={cancelNavigation}
                  className="px-10 py-2  text-gray-700 rounded-lg bg-[#F4F8FE] hover:bg-gray-300 transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmNavigation}
                  className="px-10 py-2 bg-[#1A73E8] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

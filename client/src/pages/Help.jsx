export default function Help() {
  return (
    <div className="w-full flex justify-center mt-24 sm:mt-20 lg:mt-35 items-center">
      <div className="flex flex-col xl:flex-row bg-[#DDEAFC]/55 sm:mx-10 md:mx-20 rounded-2xl justify-start items-start lg:justify-center lg:items-baseline p-10 sm:p-0">

        {/* Left side */}
        <div className="w-full py-10 md:py-10 xl:py-0 md:w-full xl:w-[40%] flex flex-col text-center xl:text-start xl:ml-10 mb-10 xl:mb-0 2xl:ml-20 ">
          <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-4xl xl:text-4xl 2xl:text-5xl font-semibold text-gray-900 leading-tight">
            How Does it Work?
          </h1>
          <p className="mt-4 text-lg sm:text-xl md:text-xl lg:text-xl xl:text-xl text-gray-700">
            No lines, no stress—just follow these steps.
          </p>
        </div>

        {/* Right side - single column for mobile AND iPad Pro, two columns only on xl screens (large PC) */}
        <div className="w-full md:w-full xl:w-1/2 xl:min-h-[80vh] grid grid-cols-1 2xl:grid-cols-2 gap-6 xl:gap-8 xl:mr-5 2xl:mr-20 sm:p-10 md:p-10 xl:p-0 xl:pt-20 2xl:pt-40">
          
          {/* Step 1 */}
          <div className="flex items-start gap-4 xl:gap-5">
            <span className="text-4xl md:text-4xl xl:text-4xl 2xl:text-6xl font-extrabold text-amber-500 min-w-[40px] xl:min-w-[50px]">1</span>
            <p className="text-base md:text-lg xl:text-base 2xl:text-xl text-start font-light pt-2 xl:pt-2">
              Choose your queue type — Priority (for PWDs, seniors, etc.) or Standard for regular requests.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 xl:gap-5">
            <span className="text-4xl md:text-4xl xl:text-4xl 2xl:text-6xl font-extrabold text-amber-500 min-w-[40px] xl:min-w-[50px]">2</span>
            <p className="text-base md:text-lg xl:text-base 2xl:text-xl text-start font-light pt-2 xl:pt-2">
              Fill in your details like name, ID number, and contact information.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4 xl:gap-5">
            <span className="text-4xl md:text-4xl xl:text-4xl 2xl:text-6xl font-extrabold text-amber-500 min-w-[40px] xl:min-w-[50px]">3</span>
            <p className="text-base md:text-lg xl:text-base 2xl:text-xl text-start font-light pt-2 xl:pt-2">
              Select the service you need, such as Good Moral Certificate, Insurance Payment, Gate Pass, and more.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-4 xl:gap-5">
            <span className="text-4xl md:text-4xl xl:text-4xl 2xl:text-6xl font-extrabold text-amber-500 min-w-[40px] xl:min-w-[50px]">4</span>
            <p className="text-base md:text-lg xl:text-base 2xl:text-xl text-start font-light pt-2 xl:pt-2">
              Review your information and confirm to get your queue number.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
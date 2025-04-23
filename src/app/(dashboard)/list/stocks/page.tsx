"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Prisma } from "@prisma/client";
import { useSession } from "@clerk/nextjs";

// get the stock details from the database
type LotteryWithStock = Prisma.LotteryGetPayload<{
  include: {
    Stock: true;
  };
}>;

export default function StaffLotteryView() {
  const [nlbTickets, setNlbTickets] = useState<LotteryWithStock[]>([]);
  const [dlbTickets, setDlbTickets] = useState<LotteryWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const { session } = useSession();
  const role = session?.user.publicMetadata?.role;

 // Get today's date in YYYY-MM-DD format for the min attribute
 const today = new Date().toISOString().split('T')[0];


  useEffect(() => {
    document.title = "Staff Lottery Availability";
    fetchLotteryData(searchDate);
  }, [searchDate]);
// fetch the lottery data based on the selected date.
  const fetchLotteryData = async (date: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lotteries?date=${date}`);
      const data = await response.json();
      
      if (data.success) {
        setNlbTickets(data.data.filter((ticket: LotteryWithStock) => 
          ticket.LotteryType === 'NLB'
        ));
        setDlbTickets(data.data.filter((ticket: LotteryWithStock) => 
          ticket.LotteryType === 'DLB'
        ));
      }
    } catch (error) {
      console.error("Error fetching lottery data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    
    // Prevent selecting dates before today
    if (selectedDate >= today) {
      setSearchDate(selectedDate);
    } else {
      // If user somehow selects a past date, reset to today
      setSearchDate(today);
    }
  };
  

  const handleSearch = () => {
    fetchLotteryData(searchDate);
  };

  const getAvailabilityStatus = (ticket: LotteryWithStock) => {
    return ticket.Stock?.Availability || "Unavailable";
  };

  const isTicketAvailable = (ticket: LotteryWithStock) => {
    return ticket.Stock?.Availability === "Available";
  };

  const DateSearchSection = () => (
    <div className="bg-white rounded-lg shadow-md px-6 py-4 mb-8">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-NavBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <label className="text-lg font-semibold text-gray-700">Lottery Date:</label>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <input 
            type="date" 
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-NavBlue focus:border-NavBlue w-full sm:w-auto"
            value={searchDate}
            onChange={handleDateChange}
            min={today} // Prevent selecting past dates
          />
          <button 
            className="hidden md:table-cell bg-NavBlue hover:bg-NavBlueDark text-white px-6 py-2 rounded-md transition-colors font-medium flex items-center gap-2"
            onClick={handleSearch}
          >
          
            Search
          </button>
        </div>
      </div>
    </div>
  );
// setion header
  const CategoryHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-4 mb-6">
      <div className="h-1 w-10 bg-NavBlue rounded-full"></div>
      <h1 className="font-bold text-2xl text-gray-700">{title}</h1>
      <div className="h-1 flex-grow bg-gray-200 rounded-full"></div>
    </div>
  );

  return (
    <div className="p-6 overflow-y-auto">
      {/* Date search section - Remains visible during loading */}
      <DateSearchSection />
      
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-NavBlue mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading lottery data...</p>
        </div>
      ) : (
        <>
          <CategoryHeader title="NATIONAL LOTTERY BOARD" />

          <div className="overflow-x-auto">
            {nlbTickets.length > 0 ? (
              <div className="tickets grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                {nlbTickets.map((ticket) => (
                  <div 
                    key={ticket.LotteryID} 
                    className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1 ${
                      isTicketAvailable(ticket) 
                        ? "border-l-4 border-green-500" 
                        : "border-l-4 border-red-500"
                    }`}
                    style={{ maxWidth: "280px" }}
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      
                      <Image 
                        src={ticket.ImageUrl || "/default-image.png"} 
                        alt={ticket.LotteryName}
                        fill
                        sizes="(max-width: 280px) 100vw, 280px"
                        className="object-cover"
                        priority
                      />
                      <div className={`absolute top-0 right-0 px-3 py-1 m-2 rounded-full text-xs font-bold ${
                        isTicketAvailable(ticket)
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {getAvailabilityStatus(ticket)}
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-b from-white to-gray-50">
                      <h3 className="font-semibold text-lg truncate text-gray-800 mb-1">{ticket.LotteryName}</h3>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-gray-600 text-sm">
                            Commission: <span className="font-medium">{ticket.UnitCommission?.toFixed(2)}</span>
                          </p>
                        </div>
                        <p className="text-NavBlue font-bold text-base">
                          Rs {ticket.UnitPrice?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 mb-10 rounded-md shadow-sm">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="font-medium">No NLB tickets available for selected date</p>
                </div>
              </div>
            )}
          </div>

          <CategoryHeader title="DEVELOPMENT LOTTERY BOARD" />

          <div className="overflow-x-auto">
            {dlbTickets.length > 0 ? (
              <div className="tickets grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                {dlbTickets.map((ticket) => (
                  <div 
                    key={ticket.LotteryID} 
                    className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1 ${
                      isTicketAvailable(ticket) 
                        ? "border-l-4 border-green-500" 
                        : "border-l-4 border-red-500"
                    }`}
                    style={{ maxWidth: "280px" }}
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image 
                        src={ticket.ImageUrl || "/default-image.png"} 
                        alt={ticket.LotteryName}
                        fill
                        sizes="(max-width: 280px) 100vw, 280px"
                        className="object-cover"
                        priority
                      />
                      <div className={`absolute top-0 right-0 px-3 py-1 m-2 rounded-full text-xs font-bold ${
                        isTicketAvailable(ticket)
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {getAvailabilityStatus(ticket)}
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-b from-white to-gray-50">
                      <h3 className="font-semibold text-lg truncate text-gray-800 mb-1">{ticket.LotteryName}</h3>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-gray-600 text-sm">
                            Commission: <span className="font-medium">{ticket.UnitCommission?.toFixed(2)}</span>
                          </p>
                        </div>
                        <p className="text-NavBlue font-bold text-base">
                          Rs {ticket.UnitPrice?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-md shadow-sm">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="font-medium">No DLB tickets available for selected date</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
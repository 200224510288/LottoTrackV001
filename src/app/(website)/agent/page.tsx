"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { Prisma } from "@prisma/client";
import { useSession } from "@clerk/nextjs";
import { useCart } from "@/components/CartContext";

// fetch the available lotteries from the date base
type LotteryWithStock = Prisma.LotteryGetPayload<{
  include: {
    Stock: true;
  };
}>;

export default function AgentLotteryView() {
  const [nlbTickets, setNlbTickets] = useState<LotteryWithStock[]>([]);
  const [dlbTickets, setDlbTickets] = useState<LotteryWithStock[]>([]);
  const [quantities, setQuantities] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const { session } = useSession();
  const role = session?.user.publicMetadata?.role;

  // Get today's date in YYYY-MM-DD format for the min attribute
  const today = new Date().toISOString().split("T")[0];

  // Use cart context for add lotteries
  const { addToCart } = useCart();

  useEffect(() => {
    document.title = "Agent Lottery View";
    fetchLotteryData(searchDate);
  }, [searchDate]);

  const fetchLotteryData = async (date: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lotteries?date=${date}`);
      const data = await response.json();

      if (data.success) {
        setNlbTickets(
          data.data.filter(
            (ticket: LotteryWithStock) => ticket.LotteryType === "NLB"
          )
        );
        setDlbTickets(
          data.data.filter(
            (ticket: LotteryWithStock) => ticket.LotteryType === "DLB"
          )
        );
      }
    } catch (error) {
      console.error("Error fetching lottery data:", error);
    } finally {
      setLoading(false);
    }
  };
// update the prices based on the quantities
  const handleQuantityChange = (ticketId: number, value: number) => {
    setQuantities((prev) => {
      const newQuantities = new Map(prev);
      const newQty = Math.max(0, value); // Prevent negative quantities
      newQuantities.set(ticketId, newQty);
      return newQuantities;
    });
  };

  const handleAddToCart = (ticket: LotteryWithStock) => {
    const quantity = quantities.get(ticket.LotteryID) || 0;
    if (quantity > 0) {
      // Use the addToCart function from context
      addToCart(ticket, quantity);

      // Reset quantity input after adding to cart
      setQuantities((prev) => {
        const newQuantities = new Map(prev);
        newQuantities.set(ticket.LotteryID, 0);
        return newQuantities;
      });
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
// fetch the lottery availability
  const getAvailabilityStatus = (ticket: LotteryWithStock) => {
    return ticket.Stock?.Availability || "Unavailable";
  };

  const isTicketAvailable = (ticket: LotteryWithStock) => {
    return ticket.Stock?.Availability === "Available";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-NavBlue"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Agent Lottery View</title>
        <meta name="description" content="Agent view of lottery tickets" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div
        className="min-h-screen bg-fixed bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.png')" }}
      >
        <div className="left-0 p-5 sm:p-10 w-full sm:w-3/4 overflow-y-auto max-h-screen">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center ml-0 sm:ml-10 mt-10 sm:mt-20">
            <label className="text-lg font-bold text-gray-700">
              Search Date:
            </label>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <input
                type="date"
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-NavBlue focus:border-transparent"
                value={searchDate}
                onChange={handleDateChange}
                min={today} // Prevent selecting past dates
              />
              <button
                className="search-btn-agent bg-NavBlue hover:bg-NavBlueDark text-white px-4 py-2 rounded transition-colors"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>

          <h1 className="font-bold text-3xl mt-8 sm:mt-10 mb-6 ml-0 sm:ml-10 text-gray-600">
            NLB TICKETS
          </h1>

          <div className="overflow-x-auto">
            {nlbTickets.length > 0 ? (
              <div className="tickets grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-16 ml-0 sm:ml-10 mb-16 sm:mb-20">
                {nlbTickets.map((ticket) => (
                  <div
                    key={ticket.LotteryID}
                    className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl"
                  >
                    <div className="relative aspect-[1/] w-full overflow-hidden">
                      <Image
                        src={ticket.ImageUrl || "/default-image.png"}
                        alt={ticket.LotteryName}
                        width={320}
                        height={240}
                        className="object-cover w-full h-full"
                        priority
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg truncate">
                          {ticket.LotteryName}
                        </h3>
                        <span className="px-2 py-1 rounded-full text-xs font-medium">
                          {getAvailabilityStatus(ticket)}
                        </span>
                      </div>
                      <div className="space-y-1 mb-3">
                        <p className="text-gray-600 text-sm">
                          commission: {ticket.UnitCommission?.toFixed(2)}
                        </p>
                        <p className="text-NavBlue font-semibold text-sm">
                          Unit Price: Rs {ticket.UnitPrice?.toFixed(2)}
                        </p>
                      </div>
                      {isTicketAvailable(ticket) && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <div className="flex items-center space-x-2 ml-5">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  ticket.LotteryID,
                                  (quantities.get(ticket.LotteryID) || 0) - 1
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-lg font-medium"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={quantities.get(ticket.LotteryID) || 0}
                              onChange={(e) =>
                                handleQuantityChange(
                                  ticket.LotteryID,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-16 text-center border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-NavBlue"
                              min="0"
                            />
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  ticket.LotteryID,
                                  (quantities.get(ticket.LotteryID) || 0) + 1
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-lg font-medium"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => handleAddToCart(ticket)}
                            className="bg-NavBlue hover:bg-NavBlueDark text-white px-2 py-2 rounded-md transition-colors text-xs"
                          >
                            Add to Cart
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ml-0 sm:ml-10 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
                <p>No NLB tickets available for selected date</p>
              </div>
            )}
          </div>

          <h1 className="font-bold text-3xl mt-8 sm:mt-10 mb-6 ml-0 sm:ml-10 text-gray-600">
            DLB TICKETS
          </h1>

          <div className="overflow-x-auto">
            {dlbTickets.length > 0 ? (
              <div className="tickets grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-16 ml-0 sm:ml-10 mb-16 sm:mb-20">
                {dlbTickets.map((ticket) => (
                  <div
                    key={ticket.LotteryID}
                    className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border-2"
                  >
                    <div className="relative aspect-[1/] w-full overflow-hidden">
                      <Image
                        src={ticket.ImageUrl || "/default-image.png"}
                        alt={ticket.LotteryName}
                        width={320}
                        height={240}
                        className="object-cover w-full h-full"
                        priority
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg truncate">
                          {ticket.LotteryName}
                        </h3>
                        <span className="px-2 py-1 rounded-full text-xs font-medium">
                          {getAvailabilityStatus(ticket)}
                        </span>
                      </div>
                      <div className="space-y-1 mb-3">
                        <p className="text-gray-600 text-sm">
                          commission: {ticket.UnitCommission?.toFixed(2)}
                        </p>
                        <p className="text-NavBlue font-semibold text-sm">
                          Unit Price: Rs {ticket.UnitPrice?.toFixed(2)}
                        </p>
                      </div>
                      {isTicketAvailable(ticket) && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <div className="flex items-center space-x-2 ml-5">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  ticket.LotteryID,
                                  (quantities.get(ticket.LotteryID) || 0) - 1
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-lg font-medium"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={quantities.get(ticket.LotteryID) || 0}
                              onChange={(e) =>
                                handleQuantityChange(
                                  ticket.LotteryID,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-16 text-center border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-NavBlue"
                              min="0"
                            />
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  ticket.LotteryID,
                                  (quantities.get(ticket.LotteryID) || 0) + 1
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-lg font-medium"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => handleAddToCart(ticket)}
                            className="bg-NavBlue hover:bg-NavBlueDark text-white px-2 py-2 rounded-md transition-colors text-xs"
                          >
                            Add to Cart
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ml-0 sm:ml-10 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
                <p>No DLB tickets available for selected date</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
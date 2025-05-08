'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

// Components
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import ClientOrderTable from "@/components/ClientOrderTable";
import SalesAnalyticsChart from "@/components/SalesAnalyticsChart";
import DateRangePicker from "@/components/DateRangePicker";
import { OrderWithRelations } from "@/components/Ordertypes";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

// Constants
const ITEM_PER_PAGE = 10;
const doc = new jsPDF();

// Date formatting function
const formatDate = (date: string | number | Date) => {
  return new Date(date).toISOString().split('T')[0];
};

// Transform API data to match OrderWithRelations
function transformOrderData(apiOrders: any[]): OrderWithRelations[] {
  return apiOrders.map((order) => {
    console.log('Processing order:', order.OrderID, {
      Agent: order.Agent,
      Staff: order.Staff,
      Delivery: order.Delivery,
      ContainedLotteries: order.ContainedLotteries,
    });

    return {
      OrderID: order.OrderID,
      Status: order.Status,
      TotalAmount: order.TotalAmount,
      OrderDate: new Date(order.OrderTime), // Add OrderDate
      OrderTime: new Date(order.OrderTime),
      AgentID: order.Agent?.AgentID || '',
      StaffID: order.Staff?.StaffID || null,
      totalQuantity: order.totalQuantity || 0,
      TotalCommission: order.TotalCommission || 0, // Add TotalCommission
      Agent: order.Agent
        ? {
            FirstName: order.Agent.FirstName || 'Unknown',
            LastName: order.Agent.LastName || '',
            City: order.Agent.City || 'Unknown',
            AgentID: order.Agent.AgentID || '',
          }
        : null,
      Staff: order.Staff
        ? {
            FirstName: order.Staff.FirstName || 'Unassigned',
            LastName: order.Staff.LastName || '',
            StaffID: order.Staff.StaffID || '',
          }
        : null,
      Delivery: order.Delivery
        ? {
            BusType: order.Delivery.BusType || 'Self-Pickup',
            StaffID: order.Delivery.StaffID || '',
            NumberPlate: order.Delivery.NumberPlate || '',
            ArrivalTime: order.Delivery.ArrivalTime ? new Date(order.Delivery.ArrivalTime) : new Date(),
            DispatchTime: order.Delivery.DispatchTime ? new Date(order.Delivery.DispatchTime) : new Date(),
          }
        : null,
      ContainedLotteries: order.ContainedLotteries.map((item: any) => ({
        Quantity: item.Quantity,
        Lottery: {
          LotteryID: item.Lottery.LotteryID,
          LotteryName: item.Lottery.LotteryName,
          UnitPrice: item.Lottery.UnitPrice,
          DrawDate: item.Lottery.DrawDate,
        },
      })),
      // Add the missing required properties
      Customer: order.Customer || {},
      CreatedAt: order.CreatedAt || order.OrderTime || new Date().toISOString(),
      UpdatedAt: order.UpdatedAt || order.OrderTime || new Date().toISOString()
    };
  });
}

const OrderHistory = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();

  // Extract URL parameters
  const page = parseInt(searchParams.get('page') || '1');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const view = searchParams.get('view') || 'newest';
  const search = searchParams.get('search');

  // State for all the data
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [count, setCount] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("guest");

  // Default date range if not provided
  const defaultStartDate = new Date(new Date().setDate(new Date().getDate() - 30));
  const defaultEndDate = new Date();

  // Initialize date range state
  const [dateRange, setDateRange] = useState({
    startDate: startDate ? new Date(startDate) : defaultStartDate,
    endDate: endDate ? new Date(endDate) : defaultEndDate,
  });

  // Set user role when user data is loaded
  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.publicMetadata?.role as string;
      setRole(userRole || "admin");
      console.log("User role set to:", userRole || "admin");
    }
  }, [isLoaded, user]);

  // Fetch data when parameters change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiUrl = `/api/orders?page=${page}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}${search ? `&search=${search}` : ''}${view ? `&view=${view}` : ''}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        const transformedOrders = transformOrderData(data.orders || []);
        setOrders(transformedOrders);
        setCount(data.count || 0);
        setSalesData(data.salesData || []);
        setTotalSales(data.totalSales || 0);
        setTotalQuantity(data.totalQuantity || 0);
      } catch (error) {
        console.error("Error fetching order data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, startDate, endDate, view, search]);

  // Handle date change
  const handleDateChange = (range: { startDate: Date; endDate: Date }) => {
    setDateRange(range);

    const params = new URLSearchParams(searchParams);
    params.set('startDate', formatDate(range.startDate));
    params.set('endDate', formatDate(range.endDate));
    params.delete('page');

    router.push(`?${params.toString()}`);
  };



  const handleGenerateReport = () => {
    // Create PDF document with portrait orientation
    const doc = new jsPDF({ orientation: 'portrait' });
    
    // Add company letterhead with black border
    doc.setDrawColor(0);
    doc.setFillColor(255, 255, 255);
    doc.rect(10, 10, doc.internal.pageSize.width - 20, 25, 'D');
    
    // Add company name and details in header
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.setFontSize(16);
    doc.text("NLB & DLB KANDY LOTTERY", doc.internal.pageSize.width / 2, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Distribution Office: 204, Central Market, Kandy", doc.internal.pageSize.width / 2, 28, { align: "center" });
    doc.text("Tel: 0812223306 / 0777803096", doc.internal.pageSize.width / 2, 34, { align: "center" });
    
    // Add report title with underline
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("SALES REPORT", doc.internal.pageSize.width / 2, 45, { align: "center" });
    doc.line(70, 47, doc.internal.pageSize.width - 70, 47);
    
    // Report period
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Report Period: ${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`, 
      doc.internal.pageSize.width / 2, 55, { align: "center" });
    
    // Generated date and time
    const now = new Date();
    const formattedDateTime = `${formatDate(now)} at ${now.toLocaleTimeString()}`;
    doc.setFontSize(9);
    doc.text(`Generated on: ${formattedDateTime}`, doc.internal.pageSize.width - 15, 65, { align: "right" });
    
    // Summary section with bordered boxes
    const summaryY = 75;
    
    // Sales box
    doc.setDrawColor(0);
    doc.setFillColor(240, 240, 240);
    doc.rect(15, summaryY, doc.internal.pageSize.width - 30, 20, 'FD');
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL SALES:", 25, summaryY + 13);
    doc.text(`Rs. ${totalSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 
      doc.internal.pageSize.width - 25, summaryY + 13, { align: "right" });
    
    // Tickets box
    doc.setDrawColor(0);
    doc.setFillColor(240, 240, 240);
    doc.rect(15, summaryY + 25, doc.internal.pageSize.width - 30, 20, 'FD');
    doc.text("TOTAL TICKETS SOLD:", 25, summaryY + 38);
    doc.text(`${totalQuantity.toLocaleString()}`, 
      doc.internal.pageSize.width - 25, summaryY + 38, { align: "right" });
    
    // Add order statistics in a table format
    const statsY = summaryY + 55;
    doc.setFillColor(255, 255, 255);
    doc.rect(15, statsY, doc.internal.pageSize.width - 30, 40, 'D');
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Order Statistics", doc.internal.pageSize.width / 2, statsY + 10, { align: "center" });
    
    // Calculate statistics
    const completedOrders = orders.filter(order => order.Status === "Completed").length;
    const pendingOrders = orders.filter(order => order.Status === "Pending").length;
    const totalOrders = orders.length;
    const completionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : "0";
    
    // Add statistics text in two columns
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const col1 = 30;
    const col2 = doc.internal.pageSize.width / 2 + 15;
    
    doc.text(`Total Orders: ${totalOrders}`, col1, statsY + 20);
    doc.text(`Completed Orders: ${completedOrders}`, col1, statsY + 30);
    doc.text(`Pending Orders: ${pendingOrders}`, col2, statsY + 20);
    doc.text(`Order Completion Rate: ${completionRate}%`, col2, statsY + 30);
    
    // Add table heading
    const tableY = statsY + 50;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Order Details", 15, tableY - 5);
    
    // Prepare table data
    const tableData = orders.map((order, index) => [
      order.OrderID,
      order.Agent ? `${order.Agent.FirstName} ${order.Agent.LastName}` : "Unknown",
      order.totalQuantity.toString(),
      order.Status,
      `Rs. ${order.TotalAmount.toFixed(2)}`,
      formatDate(order.OrderTime),
      order.Agent?.City || "Unknown",
      order.TotalCommission ? `Rs. ${order.TotalCommission.toFixed(2)}` : "Rs. 0.00"
    ]);
    
    // Add table with black and white styling
    const tableHeaders = [
      "Order ID", 
      "Agent", 
      "Qty", 
      "Status", 
      "Amount",
      "Date", 
      "City", 
      "Commission"
    ];
    
    autoTable(doc, {
      startY: tableY,
      head: [tableHeaders],
      body: tableData,
      headStyles: { 
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 35 },
        2: { cellWidth: 10, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 25 },
        7: { cellWidth: 22, halign: 'right' }
      },
      didDrawPage: (data) => {
        // Add page number at the bottom
        const pageCount = doc.internal.getNumberOfPages();
        const currentPage = data.pageNumber;
        doc.setFontSize(8);
        doc.text(`Page ${currentPage} of ${pageCount}`, 
          doc.internal.pageSize.width / 2, 
          doc.internal.pageSize.height - 10, 
          { align: 'center' });
          
        // Add footer on each page
        doc.setFontSize(8);
        doc.setTextColor(0);
        doc.text("NLB & DLB Kandy Lottery Distribution Office", 15, doc.internal.pageSize.height - 10);
        doc.text("This is an official document", doc.internal.pageSize.width - 15, doc.internal.pageSize.height - 10, { align: 'right' });
        
        // Add header on each page (except first)
        if (currentPage > 1) {
          doc.setDrawColor(0);
          doc.rect(10, 10, doc.internal.pageSize.width - 20, 15, 'D');
          
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0);
          doc.setFontSize(10);
          doc.text("NLB & DLB KANDY LOTTERY - SALES REPORT", doc.internal.pageSize.width / 2, 18, { align: "center" });
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text(`Period: ${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`, 
            doc.internal.pageSize.width - 15, 25, { align: "right" });
        }
      }
    });
    
    // Add summary metrics after table
    const pageCount = doc.internal.getNumberOfPages();
    doc.setPage(pageCount);
    
    let finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // If we're close to the bottom of the page, start a new page
    if (finalY > doc.internal.pageSize.height - 60) {
      doc.addPage();
      finalY = 30;
    }
    
    // Add summary box
    doc.setDrawColor(0);
    doc.setFillColor(240, 240, 240);
    doc.rect(15, finalY, doc.internal.pageSize.width - 30, 40, 'FD');
    
    // Add summary text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Summary", doc.internal.pageSize.width / 2, finalY + 10, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    // Add summary metrics in two columns
    const summaryCol1 = 25;
    const summaryCol2 = doc.internal.pageSize.width / 2 + 10;
    
    // Calculate average order value
    const avgOrderValue = totalSales / (orders.length || 1);
    doc.text(`Total Number of Orders: ${orders.length}`, summaryCol1, finalY + 20);
    doc.text(`Average Order Value: Rs. ${avgOrderValue.toFixed(2)}`, summaryCol1, finalY + 30);
    
    // Calculate total commission if available
    const totalCommission = orders.reduce((sum, order) => sum + (order.TotalCommission || 0), 0);
    doc.text(`Total Commission Paid: Rs. ${totalCommission.toFixed(2)}`, summaryCol2, finalY + 20);
    const netRevenue = totalSales - totalCommission;
    doc.text(`Total Ticket Quantity: Rs. ${totalQuantity.toLocaleString()}`, summaryCol2, finalY + 30);
    
    // Save the PDF
    doc.save(`NLB_DLB_Sales_Report_${formatDate(dateRange.startDate)}_to_${formatDate(dateRange.endDate)}.pdf`);
  };

  // Table columns definition
  const columns = [
    { header: "Order ID", accessor: "OrderID" },
    { header: "Agent Name", accessor: "AgentName" },
    { header: "Total Quantity", accessor: "TotalQuantity", className: "hidden md:table-cell" },
    { header: "Status", accessor: "Status", className: "hidden md:table-cell" },
    { header: "Total Amount", accessor: "TotalAmount", className: "hidden md:table-cell" },
    { header: "Ordered Time", accessor: "OrderTime", className: "hidden md:table-cell" },
    { header: "Type", accessor: "DeliveryType", className: "hidden md:table-cell" },
    { header: "City", accessor: "City", className: "hidden md:table-cell" },
    { header: "Staff Name", accessor: "StaffName", className: "hidden md:table-cell" },
    ...(["admin", "district_agent", "office_staff", "agent"].includes(role)
      ? [{ header: "Actions", accessor: "actions" }]
      : []),
  ];

  return (
    <div className="flex flex-col space-y-6 p-4">
      {/* Header with title and summary stats */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800">Order History & Sales Analysis</h1>
          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900"
          >
            Generate PDF Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-2">Date Range</div>
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={handleDateChange}
            />
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 text-white shadow-md">
            <div className="text-sm opacity-80">Total Sales</div>
            <div className="text-2xl font-bold">Rs {totalSales.toFixed(2)}</div>
            <div className="text-xs mt-2 opacity-70">For selected period</div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white shadow-md">
            <div className="text-sm opacity-80">Total Tickets Sold</div>
            <div className="text-2xl font-bold">{totalQuantity.toLocaleString()}</div>
            <div className="text-xs mt-2 opacity-70">For selected period</div>
          </div>
        </div>

        {salesData.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Sales Trend</h2>
            <div className="h-64 lg:h-80">
              <SalesAnalyticsChart data={salesData} />
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Order Details</h2>
          <div className="flex items-center gap-4">
            <ViewToggle currentView={view} />
            <TableSearch />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading order data...</div>
        ) : (
          <>
            <ClientOrderTable orders={orders} columns={columns} role={role || ""} />
            <Pagination page={page} count={count} />
          </>
        )}
      </div>
    </div>
  );
};

// View toggle component for sorting by newest/oldest
const ViewToggle = ({ currentView }: { currentView: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('view', view);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex rounded-md overflow-hidden border border-gray-300">
      <button
        onClick={() => handleViewChange('newest')}
        className={`px-3 py-1.5 text-sm ${
          currentView === 'newest'
            ? 'bg-blue-800 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        Newest First
      </button>
      <button
        onClick={() => handleViewChange('oldest')}
        className={`px-3 py-1.5 text-sm ${
          currentView === 'oldest'
            ? 'bg-blue-800 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        Oldest First
      </button>
    </div>
  );
};

export default OrderHistory;
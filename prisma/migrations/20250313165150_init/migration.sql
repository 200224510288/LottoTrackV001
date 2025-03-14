-- CreateTable
CREATE TABLE "User" (
    "UserID" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "UserName" TEXT NOT NULL,
    "Password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("UserID")
);

-- CreateTable
CREATE TABLE "Agent" (
    "AgentID" TEXT NOT NULL,
    "FirstName" TEXT NOT NULL,
    "LastName" TEXT NOT NULL,
    "OfficeAddress" TEXT,
    "HomeAddress" TEXT,
    "City" TEXT NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("AgentID")
);

-- CreateTable
CREATE TABLE "Agent_Contact_Number" (
    "AgentID" TEXT NOT NULL,
    "ContactNumber" TEXT NOT NULL,

    CONSTRAINT "Agent_Contact_Number_pkey" PRIMARY KEY ("AgentID","ContactNumber")
);

-- CreateTable
CREATE TABLE "Staff" (
    "StaffID" TEXT NOT NULL,
    "Section" TEXT,
    "FirstName" TEXT NOT NULL,
    "LastName" TEXT NOT NULL,
    "SuperviserID" INTEGER,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("StaffID")
);

-- CreateTable
CREATE TABLE "Order" (
    "OrderID" SERIAL NOT NULL,
    "AgentID" TEXT NOT NULL,
    "StaffID" TEXT,
    "OrderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "OrderTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Status" TEXT NOT NULL,
    "TotalAmount" DOUBLE PRECISION NOT NULL,
    "TotalCommission" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("OrderID")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "DeliveryID" SERIAL NOT NULL,
    "StaffID" TEXT NOT NULL,
    "OrderID" INTEGER NOT NULL,
    "NumberPlate" TEXT NOT NULL,
    "BusType" TEXT,
    "ArrivalTime" TIMESTAMP(3),
    "DispatchTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("DeliveryID")
);

-- CreateTable
CREATE TABLE "Lottery" (
    "LotteryID" SERIAL NOT NULL,
    "StaffID" TEXT NOT NULL,
    "LotteryName" TEXT NOT NULL,
    "ImageUrl" TEXT NOT NULL,
    "DrawDate" TIMESTAMP(3) NOT NULL,
    "UnitPrice" DOUBLE PRECISION NOT NULL,
    "UnitCommission" DOUBLE PRECISION NOT NULL,
    "LastUpdateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lottery_pkey" PRIMARY KEY ("LotteryID")
);

-- CreateTable
CREATE TABLE "Order_Contain_Lottery" (
    "LotteryID" INTEGER NOT NULL,
    "OrderID" INTEGER NOT NULL,
    "Quantity" INTEGER NOT NULL,

    CONSTRAINT "Order_Contain_Lottery_pkey" PRIMARY KEY ("LotteryID","OrderID")
);

-- CreateTable
CREATE TABLE "Stock" (
    "StockID" INTEGER NOT NULL,
    "StaffID" TEXT NOT NULL,
    "Availability" TEXT NOT NULL,
    "LastUpdateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("StockID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_OrderID_key" ON "Delivery"("OrderID");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_AgentID_fkey" FOREIGN KEY ("AgentID") REFERENCES "User"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent_Contact_Number" ADD CONSTRAINT "Agent_Contact_Number_AgentID_fkey" FOREIGN KEY ("AgentID") REFERENCES "Agent"("AgentID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_StaffID_fkey" FOREIGN KEY ("StaffID") REFERENCES "User"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_AgentID_fkey" FOREIGN KEY ("AgentID") REFERENCES "Agent"("AgentID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_StaffID_fkey" FOREIGN KEY ("StaffID") REFERENCES "Staff"("StaffID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_OrderID_fkey" FOREIGN KEY ("OrderID") REFERENCES "Order"("OrderID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_StaffID_fkey" FOREIGN KEY ("StaffID") REFERENCES "Staff"("StaffID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lottery" ADD CONSTRAINT "Lottery_StaffID_fkey" FOREIGN KEY ("StaffID") REFERENCES "Staff"("StaffID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order_Contain_Lottery" ADD CONSTRAINT "Order_Contain_Lottery_LotteryID_fkey" FOREIGN KEY ("LotteryID") REFERENCES "Lottery"("LotteryID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order_Contain_Lottery" ADD CONSTRAINT "Order_Contain_Lottery_OrderID_fkey" FOREIGN KEY ("OrderID") REFERENCES "Order"("OrderID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_StaffID_fkey" FOREIGN KEY ("StaffID") REFERENCES "Staff"("StaffID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_StockID_fkey" FOREIGN KEY ("StockID") REFERENCES "Lottery"("LotteryID") ON DELETE RESTRICT ON UPDATE CASCADE;

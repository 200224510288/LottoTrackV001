// components/Ordertypes.ts
import { Order, Delivery, Staff, Agent } from "@prisma/client";

export interface OrderWithRelations {
  Customer: any;
  OrderID: number;
  TotalAmount: number;
  Status: string;
  OrderTime: string;
  StaffID: string | null;
  CreatedAt: string; // Add this
  UpdatedAt: string; // Add this
  Agent?: {
    AgentID: string;
    FirstName: string;
    LastName: string;
    City: string;
  };
  Staff?: {
    FirstName: string;
    LastName: string;
  };
  Delivery?: {
    BusType: string;
    StaffID: string;
    NumberPlate: string;
    ArrivalTime: Date;
    DispatchTime: Date;
  };
  ContainedLotteries: Array<any>;
  totalQuantity: number;
}
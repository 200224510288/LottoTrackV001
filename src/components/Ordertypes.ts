import { Order as PrismaOrder, Delivery, Staff, Agent } from "@prisma/client";

export interface OrderWithRelations {
  OrderID: number;
  TotalAmount: number;
  Status: string;
  OrderTime: string | Date;
  OrderDate?: Date;
  StaffID: string | null;
  AgentID?: string;
  TotalCommission?: number;
  totalQuantity: number;
  Agent?: {
    AgentID: string;
    FirstName: string;
    LastName: string;
    City: string;
  } | null;
  Staff?: {
    FirstName: string;
    LastName: string;
    StaffID?: string;
  } | null;
  Delivery?: {
    BusType: string;
    StaffID: string;
    NumberPlate: string;
    ArrivalTime: Date;
    DispatchTime: Date;
  } | null;
  ContainedLotteries: Array<any>;
  Customer: any;
  CreatedAt: string;
  UpdatedAt: string;
}
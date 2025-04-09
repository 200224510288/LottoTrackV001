// types.ts
import { Order, Delivery, Staff, Agent } from "@prisma/client";

export type OrderWithRelations = Order & { 
  Delivery: { 
    BusType: string;
    StaffID: string;
    NumberPlate: string;
    ArrivalTime: Date;
    DispatchTime: Date;
  } | null; 
  Staff: {
    FirstName: string;
    LastName: string;
    StaffID: string;
  } | null; 
  Agent: {
    FirstName: string;
    LastName: string;
    City: string;
    AgentID: string;
  } | null;
  ContainedLotteries: {
    Quantity: number;
    Lottery: {
      LotteryID: number;
      LotteryName: string;
      UnitPrice: number;
    };
  }[];
  totalQuantity: number;
};
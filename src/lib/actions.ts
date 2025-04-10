"use server";

import { revalidatePath } from "next/cache";
import { AgentSchema, LotterySchema, StaffSchema, staffSchema } from "./formValidationSchemas";
import { clerkClient } from "@clerk/clerk-sdk-node";  
import prisma from "./prisma";
import { error } from "console";
import { boolean } from "zod";
import { z } from "zod";
import { CartItem } from "@/components/CartContext"; 
import { auth } from '@clerk/nextjs/server';

type DeliveryInfo = {
  deliveryOption: "selfPick" | "dispatch";
  busStop?: string;
};

export const createOrder = async (
  agentID: string,
  cartItems: CartItem[],
  deliveryInfo: DeliveryInfo
) => {
  try {
    // Calculate totals
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (item.ticket.UnitPrice || 0) * item.quantity,
      0
    );
    
    const totalCommission = cartItems.reduce(
      (sum, item) => sum + (item.ticket.UnitCommission || 0) * item.quantity,
      0
    );

    // Create the order and its relationships in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create the order
      const newOrder = await tx.order.create({
        data: {
          AgentID: agentID,
          OrderDate: new Date(),
          OrderTime: new Date(),
          Status: "Pending", // Initial status
          TotalAmount: totalAmount,
          TotalCommission: totalCommission,
        },
      });

      // Step 2: Create order_contain_lottery entries for each item
      for (const item of cartItems) {
        await tx.order_Contain_Lottery.create({
          data: {
            OrderID: newOrder.OrderID,
            LotteryID: item.ticket.LotteryID,
            Quantity: item.quantity,
          },
        });
      }

      // Step 3: If delivery option is "dispatch", create delivery entry 
      if (deliveryInfo.deliveryOption === "dispatch" && deliveryInfo.busStop) {
        await tx.delivery.create({
          data: {
            OrderID: newOrder.OrderID,
            StaffID: "user_2u9IzPhBE1W70P7QuUSpQN0o6AL",
            NumberPlate: "Will Confirm Soon ...", 
            BusType: deliveryInfo.busStop,
            DispatchTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
            ArrivalTime: new Date(Date.now() + 48 * 60 * 60 * 1000), 
          },
        });
      }

      return newOrder;
    });

    return { 
      success: true, 
      error: false, 
      order: result 
    };
  } catch (err: any) {
    console.error("Create Order Error:", err);
    const errorMessage = err.message || "An error occurred during checkout";
    return { 
      success: false, 
      error: true, 
      message: errorMessage 
    };
  }
};


export type Order = {
  OrderID: number;
  TotalAmount: number;
  Status: string;
  StaffID: string | null;
  CreatedAt: string;
  UpdatedAt: string;
  Delivery: {
    BusType: string;
    StaffID: string;
    NumberPlate: string;
    ArrivalTime: Date;
    DispatchTime: Date;
  } | null;
  ContainedLotteries: {
    Quantity: number;
    Lottery: {
      LotteryID: number;
      LotteryName: string;
      UnitPrice: number;
    };
  }[];
  Customer: {
    CustomerID: number;
    FullName: string;
    Email: string;
    Phone: string;
  };
  totalQuantity: number;
};

export async function fetchAgentOrders() {
  try {
    // Get the current agent ID from auth
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: true,
        message: "Authentication required",
        orders: []
      };
    }
    
    // Log to debug
    console.log("Fetching orders for user:", userId);
    
    // Fetch orders with safer approach
    const rawOrders = await prisma.order.findMany({
      where: {
        AgentID: userId
      },
      orderBy: {
        OrderID: 'desc'
      }
    });
    
    // Log intermediate result
    console.log(`Found ${rawOrders.length} raw orders`);
    
    // Process each order individually to avoid map issues
    const transformedOrders: Order[] = [];
    
    for (const order of rawOrders) {
      try {
        // Fetch related data separately to avoid complex join issues
        const containedLotteries = await prisma.order_Contain_Lottery.findMany({
          where: { 
            OrderID: order.OrderID 
          },
          include: {
            Lottery: true
          }
        });
        
        const delivery = await prisma.delivery.findUnique({
          where: { 
            OrderID: order.OrderID 
          }
        });
        
        const agent = await prisma.agent.findUnique({
          where: { 
            AgentID: order.AgentID 
          }
        });
        
        // Safely construct the transformed order
        const transformedOrder: Order = {
          OrderID: order.OrderID,
          TotalAmount: order.TotalAmount,
          Status: order.Status,
          StaffID: order.StaffID,
          CreatedAt: order.OrderDate.toISOString(),
          UpdatedAt: order.OrderDate.toISOString(), // Using OrderDate for UpdatedAt
          
          // Safely handle Delivery
          Delivery: delivery ? {
            BusType: delivery.BusType || "Unknown", // Provide a default value for BusType
            StaffID: delivery.StaffID,
            NumberPlate: delivery.NumberPlate,
            ArrivalTime: delivery.ArrivalTime || new Date(),
            DispatchTime: delivery.DispatchTime || new Date()
          } : null,
          
          // Safely handle ContainedLotteries
          ContainedLotteries: containedLotteries.map(item => ({
            Quantity: item.Quantity,
            Lottery: {
              LotteryID: item.Lottery.LotteryID,
              LotteryName: item.Lottery.LotteryName,
              UnitPrice: item.Lottery.UnitPrice
            }
          })),
          
          // Safely handle Customer
          Customer: agent ? {
            CustomerID: parseInt(agent.AgentID),
            FullName: agent.FirstName || "Unknown Customer",
            Email: agent.City || "",
            Phone: agent.HomeAddress || ""
          } : {
            CustomerID: 0,
            FullName: "Unknown Customer",
            Email: "",
            Phone: ""
          },
          
          // Calculate totalQuantity
          totalQuantity: containedLotteries.reduce(
            (sum, item) => sum + item.Quantity, 0
          )
        };
        
        transformedOrders.push(transformedOrder);
      } catch (orderErr) {
        console.error(`Error processing order ${order.OrderID}:`, orderErr);
        // Continue with other orders instead of failing completely
      }
    }

    return {
      success: true,
      error: false,
      orders: transformedOrders
    };
    
  } catch (err: any) {
    console.error("Fetch Agent Orders Error:", err);
    return {
      success: false,
      error: true,
      message: err.message || "Failed to fetch orders",
      orders: []
    };
  }
}



export const deleteOrder = async (orderID: string) => {
  try {
    await prisma.$transaction(async (tx) => {
      // Step 1: Delete from the delivery table if related to this order
      await tx.delivery.deleteMany({
        where: {
          OrderID: Number(orderID),
        },
      });

      // Step 2: Delete associated order_Contain_Lottery entries
      await tx.order_Contain_Lottery.deleteMany({
        where: {
          OrderID: Number(orderID),
        },
      });

      // Step 3: Delete the main order
      await tx.order.delete({
        where: {
          OrderID: Number(orderID),
        },
      });
    });

    return {
      success: true,
      error: false,
      message: "Order and all related data deleted successfully.",
    };
  } catch (err: any) {
    console.error("Delete Order Error:", err);
    return {
      success: false,
      error: true,
      message: err.message || "Failed to delete the order.",
    };
  }
};












type CurrentState = { success: boolean; error: boolean };

export const createAgent = async (currentState: CurrentState, data: AgentSchema) => {
  try {
    // Step 1: Create a user in Clerk with username, password, and metadata
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [data.email],
      username: data.userName,
      password: data.password ?? "", // Handle case where password might be undefined
      publicMetadata: {
        role: "agent", // Add metadata with the role "agent"
      },
    });

    // Step 2: Check if the user already exists in Prisma by email
    let createdUser;
    const user = await prisma.user.findUnique({
      where: {
        Email: data.email,
      },
    });

    if (!user) {
      // If user doesn't exist, create the user in Prisma and store Clerk's UserID
      createdUser = await prisma.user.create({
        data: {
          UserID: clerkUser.id, // Use Clerk's UserID as a string
          Email: data.email,
          UserName: data.userName,
          Password: data.password ?? "", // Handle password case
        },
      });
    } else {
      // If the user exists, use the existing Prisma user
      createdUser = user;
    }

    // Step 3: Create the agent in Prisma and link it to the created user
    const newAgent = await prisma.agent.create({
      data: {
        FirstName: data.firstName,
        LastName: data.lastName,
        OfficeAddress: data.officeAddress,
        HomeAddress: data.homeAddress,
        City: data.city,
        User: {
          connect: { UserID: createdUser.UserID }, // Link Prisma user to agent
        },
        Agent_Contact_Number: {
          create: [
            { ContactNumber: data.ContactNumber1 },
            { ContactNumber: data.ContactNumber2 ?? "" },
          ],
        },
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Create Agent Error:", err);
  
    // Check if it's a Clerk error with an array of messages
    const errorMessages = err.errors?.map((e: any) => e.message).join(" ") || "An unknown error occurred.";
  
    return { success: false, error: true, message: errorMessages };
  }
};



export const updateAgent = async (currentState: CurrentState, data: AgentSchema) => {
  try {
    // Step 1: Update the user in Clerk
    const clerkUser = await clerkClient.users.updateUser(data.id, {
      username: data.userName,
      password: data.password ?? "", // If password is provided, update it
    });

    // Step 2: Update the agent and contact numbers in Prisma
    const updatedAgent = await prisma.agent.update({
      where: {
        AgentID: data.id?.toString(),
      },
      data: {
        FirstName: data.firstName,
        LastName: data.lastName,
        OfficeAddress: data.officeAddress,
        HomeAddress: data.homeAddress,
        City: data.city,
        User: {
          update: {
            Email: data.email,
            UserName: data.userName,
            Password: data.password ?? "", // Update password if provided
          },
        },
        Agent_Contact_Number: {
          deleteMany: {}, // Clear existing contact numbers
          create: [
            { ContactNumber: data.ContactNumber1 },
            { ContactNumber: data.ContactNumber2 ?? "" },
          ],
        },
      },
      include: { User: true, Agent_Contact_Number: true },
    });

    return { success: true, error: false, updatedAgent };
  } catch (err: any) {
    console.error("Update Agent Error:", err);
  
    // Check if it's a Clerk error with an array of messages
    const errorMessages = err.errors?.map((e: any) => e.message).join(" ") || "An unknown error occurred.";
  
    return { success: false, error: true, message: errorMessages };
  }
};

export const deleteAgent = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;

  try {
    if (!id) {
      return { success: false, error: true };
    }

    //  delete from Prisma: agent, contact numbers, and user
    await prisma.$transaction([
      prisma.agent_Contact_Number.deleteMany({
        where: { AgentID: id }, 
      }),

      // Deleting the agent by AgentID (UserID)
      prisma.agent.delete({
        where: { AgentID: id },
      }),

      // Deleting the user by UserID
      prisma.user.delete({
        where: { UserID: id },
      }),
    ]);

    // Delete the user from Clerk
    await clerkClient.users.deleteUser(id);

    // revalidatePath("/list/agents");

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Delete Agent Error:", err);
  
    // Check if it's a Clerk error with an array of messages
    const errorMessages = err.errors?.map((e: any) => e.message).join(" ") || "An unknown error occurred.";
  
    return { success: false, error: true, message: errorMessages };
  }
};





export const createStaff = async (currentState: CurrentState, data: StaffSchema) => {
  try {
    // Step 1: Create a user in Clerk
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [data.email],
      username: data.userName,
      password: data.password ?? "", // Handle case where password might be undefined
      publicMetadata: {
        role: "office_staff", // Add metadata with the role "staff"
      },
    });

    // Step 2: Check if the user already exists in Prisma by email
    let createdUser;
    const user = await prisma.user.findUnique({
      where: { Email: data.email },
    });

    if (!user) {
      createdUser = await prisma.user.create({
        data: {
          UserID: clerkUser.id, // Use Clerk's UserID as a string
          Email: data.email,
          UserName: data.userName,
          Password: data.password ?? "",
        },
      });
    } else {
      createdUser = user;
    }

    // Step 3: Create the staff and link to Prisma user
    const newStaff = await prisma.staff.create({
      data: {
        FirstName: data.firstName,
        LastName: data.lastName,
        Section: data.section,
        SuperviserID: data.superviserID ? Number(data.superviserID) : null,
        User: {
          connect: { UserID: createdUser.UserID },
        },
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Create Staff Error:", err);
    const errorMessages = err.errors?.map((e: any) => e.message).join(" ") || "An unknown error occurred.";
    return { success: false, error: true, message: errorMessages };
  }
};




export const updateStaff = async (currentState: CurrentState, data: StaffSchema) => {
  try {
    // Ensure data.id is defined before calling Clerk's updateUser
    if (!data.id) {
      throw new Error("Staff ID is required for updating.");
    }

    // Step 1: Update the user in Clerk
    const clerkUser = await clerkClient.users.updateUser(data.id, {
      username: data.userName,
      password: data.password ?? "", // If password is provided, update it
    });

    // Step 2: Update the staff and contact numbers in Prisma
    const updatedStaff = await prisma.staff.update({
      where: { 
        StaffID: data.id.toString(), // Ensure the ID is treated as a string
      },
      data: {
        FirstName: data.firstName,
        LastName: data.lastName,
        Section: data.section,
        SuperviserID: data.superviserID ? Number(data.superviserID) : null,
        User: {
          update: {
            Email: data.email,
            UserName: data.userName,
            Password: data.password ?? "",
          },
        },
      },
      include: { User: true },
    });

    return { success: true, error: false, updatedStaff };
  } catch (err: any) {
    console.error("Update Staff Error:", err);
    const errorMessages = err.errors?.map((e: any) => e.message).join(" ") || "An unknown error occurred.";
    return { success: false, error: true, message: errorMessages };
  }
};



export const deleteStaff = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;

  try {
    // Check if id is provided and is a valid string 
    if (!id) {
      return { success: false, error: true, message: "Staff ID is required." };
    }

    // Perform the deletion in Prisma and Clerk using a transaction
    await prisma.$transaction([
      // Delete the staff from Prisma
      prisma.staff.delete({
        where: { StaffID: id },
      }),

      // Delete the user from Prisma
      prisma.user.delete({
        where: { UserID: id },
      }),
    ]);

    // Delete the user from Clerk
    await clerkClient.users.deleteUser(id); // Use the same UserID to delete the user from Clerk

    // revalidatePath("/list/staff");

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Deletion failed:", err);

    // Check if the error is from Clerk (and capture the message)
    const errorMessages = err.errors?.map((e: any) => e.message).join(" ") || "An unknown error occurred.";
    
    return { success: false, error: true, message: errorMessages };
  }
}; 



export const createLottery = async (data: LotterySchema) => {
  try {
    // Create the lottery and stock entry in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create the lottery entry
      const newLottery = await tx.lottery.create({
        data: {
          StaffID: data.StaffID,
          LotteryName: data.LotteryName,
          ImageUrl: data.ImageUrl,
          DrawDate: data.DrawDate,
          UnitPrice: data.UnitPrice,
          UnitCommission: data.UnitCommission,
          LotteryType: data.LotteryType,
          LastUpdateDate: data.LastUpdateDate ?? new Date(),
        },
      });

      // Step 2: Create the stock entry
      const newStock = await tx.stock.create({
        data: {
          StockID: newLottery.LotteryID, // Use the LotteryID as StockID
          StaffID: data.StaffID,
          Availability: data.Availability,
          LastUpdateDate: new Date(),
        },
      });

      // Return the created records
      return { newLottery, newStock };
    });

    return { success: true, error: false, lottery: result.newLottery, stock: result.newStock };
  } catch (err: any) {
    console.error("Create Lottery & Stock Error:", err);
    const errorMessages =
      err.errors?.map((e: any) => e.message).join(" ") || "An unknown error occurred.";
    return { success: false, error: true, message: errorMessages };
  }
};



export const updateLottery = async (data: LotterySchema) => {
  try {
    // Ensure LotteryID is defined
    if (!data.LotteryID) {
      throw new Error("Lottery ID is required for updating.");
    }

    const lotteryID = Number(data.LotteryID);
    if (isNaN(lotteryID)) {
      throw new Error("Invalid Lottery ID.");
    }

    // Perform the update in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Update the lottery entry
      const updatedLottery = await tx.lottery.update({
        where: { LotteryID: lotteryID },
        data: {
          LotteryName: data.LotteryName,
          ImageUrl: data.ImageUrl,
          DrawDate: data.DrawDate,
          UnitPrice: data.UnitPrice,
          UnitCommission: data.UnitCommission,
          LotteryType: data.LotteryType,
          LastUpdateDate: new Date(),
        },
      });

      // Step 2: Update the stock entry
      const updatedStock = await tx.stock.update({
        where: { StockID: lotteryID },
        data: {
          StaffID: data.StaffID,
          Availability: data.Availability,
          LastUpdateDate: new Date(),
        },
      });

      // Return the updated records
      return { updatedLottery, updatedStock };
    });

    return { success: true, error: false, lottery: result.updatedLottery, stock: result.updatedStock };
  } catch (err: any) {
    console.error("Update Lottery Error:", err);
    const errorMessages =
      err.errors?.map((e: any) => e.message).join(" ") || "An unknown error occurred.";
    return { success: false, error: true, message: errorMessages };
  }
};



export const deleteLottery = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;

  try {
    // Check if id is provided and is a valid string 
    if (!id) {
      return { success: false, error: true, message: "Lottery ID is required." };
    }

    // Delete the associated stock first
    await prisma.stock.delete({
      where: { StockID: Number(id) },
    });

    // Then delete the lottery
    await prisma.lottery.delete({
      where: { LotteryID: Number(id) },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Deletion failed:", err);
    const errorMessages = err.errors?.map((e: any) => e.message).join(" ") || "An unknown error occurred.";
    return { success: false, error: true, message: errorMessages };
  }
};





type UpdateOrderData = {
  OrderID: number;
  TotalAmount: number;
  Status?: string;
  StaffID?: string;
  Delivery?: {
    BusType: string;
    NumberPlate: string;
    StaffID: string;
    DispatchTime: Date | null;
    ArrivalTime: Date | null;
  };
  ContainedLotteries?: {
    Quantity: number;
    Lottery: {
      LotteryID: number;
      LotteryName: string;
      UnitPrice: number;
    };
  }[];
};

export const updateOrder = async (orderData: UpdateOrderData) => {
  try {
    // Start a transaction to ensure all updates happen together
    const result = await prisma.$transaction(async (tx) => {
      // Prepare order update data
      const orderUpdateData: any = {};
      
      // Add total amount if provided
      if (orderData.TotalAmount !== undefined) {
        orderUpdateData.TotalAmount = orderData.TotalAmount;
      }
      
      // Add status if provided
      if (orderData.Status) {
        orderUpdateData.Status = orderData.Status;
      }
      
      // Add staff ID if provided
      if (orderData.StaffID) {
        orderUpdateData.StaffID = orderData.StaffID;
      }
      
      // Step 1: Update the main order
      const updatedOrder = await tx.order.update({
        where: {
          OrderID: orderData.OrderID
        },
        data: orderUpdateData,
        include: {
          Agent: true,
          Staff: true,
          Delivery: true,
          ContainedLotteries: {
            include: {
              Lottery: true
            }
          }
        }
      });

      // Step 2: Update lottery quantities if provided
      if (orderData.ContainedLotteries && orderData.ContainedLotteries.length > 0) {
        for (const item of orderData.ContainedLotteries) {
          await tx.order_Contain_Lottery.update({
            where: {
              LotteryID_OrderID: {
                OrderID: orderData.OrderID,
                LotteryID: item.Lottery.LotteryID
              }
            },
            data: {
              Quantity: item.Quantity
            }
          });
        }
      }
      
      // Step 3: Handle delivery information for dispatched orders
      if (orderData.Status === 'Dispatched' && orderData.Delivery) {
        // Check if delivery record already exists
        const existingDelivery = await tx.delivery.findFirst({
          where: { OrderID: orderData.OrderID }
        });
        
        if (existingDelivery) {
          // Update existing delivery record
          await tx.delivery.update({
            where: { DeliveryID: existingDelivery.DeliveryID },
            data: {
              BusType: orderData.Delivery.BusType,
              NumberPlate: orderData.Delivery.NumberPlate,
              StaffID: orderData.Delivery.StaffID,
              DispatchTime: orderData.Delivery.DispatchTime ?? new Date(),
              ArrivalTime: orderData.Delivery.ArrivalTime
            }
          });
        } else {
          // Create new delivery record
          await tx.delivery.create({
            data: {
              OrderID: orderData.OrderID,
              BusType: orderData.Delivery.BusType,
              NumberPlate: orderData.Delivery.NumberPlate,
              StaffID: orderData.Delivery.StaffID,
              DispatchTime: orderData.Delivery.DispatchTime ?? new Date(),
              ArrivalTime: orderData.Delivery.ArrivalTime
            }
          });
        }
      }
      
      // Fetch the updated order with all its relations
      const completeOrder = await tx.order.findUnique({
        where: { OrderID: orderData.OrderID },
        include: {
          Agent: true,
          Staff: true,
          Delivery: true,
          ContainedLotteries: {
            include: {
              Lottery: true
            }
          }
        }
      });
      
      // Calculate total quantity
      const totalQuantity = completeOrder?.ContainedLotteries.reduce(
        (sum, item) => sum + item.Quantity, 0
      ) || 0;
      
      return { ...completeOrder, totalQuantity };
    });

    // Revalidate the orders page to show updated data
    revalidatePath('/list/orders');

    return {
      success: true,
      error: false,
      data: result,
      message: "Order updated successfully"
    };
  } catch (err: any) {
    console.error("Update Order Error:", err);
    const errorMessage = err.message || "An error occurred while updating the order";
    
    return {
      success: false,
      error: true,
      message: errorMessage
    };
  }
};
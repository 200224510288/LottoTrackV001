"use server";

import { revalidatePath } from "next/cache";
import { AgentSchema, LotterySchema, StaffSchema, staffSchema } from "./formValidationSchemas";
import { clerkClient } from "@clerk/clerk-sdk-node"; // Clerk SDK for Node.js
import prisma from "./prisma";
import { error } from "console";
import { boolean } from "zod";
import { z } from "zod";


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
      email: data.email,
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
      email: data.email,
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

    // Perform the deletion in Prisma and Clerk using a transaction
    await prisma.$transaction([
      // Delete the staff from Prisma
      prisma.lottery.delete({
        where: { LotteryID: Number(id) },
      }),

      // Delete the user from Prisma
      prisma.stock.delete({
        where: { StockID: Number(id) },
      }),
    ]);


    // revalidatePath("/list/staff");

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Deletion failed:", err);
    const errorMessages = err.errors?.map((e: any) => e.message).join(" ") || "An unknown error occurred.";
    
    return { success: false, error: true, message: errorMessages };
  }
}; 

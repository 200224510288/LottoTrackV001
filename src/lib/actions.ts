"use server";

import { revalidatePath } from "next/cache";
import { AgentSchema, StaffSchema, staffSchema } from "./formValidationSchemas";
import { clerkClient } from "@clerk/clerk-sdk-node"; // Clerk SDK for Node.js
import prisma from "./prisma";
import { error } from "console";
import { boolean } from "zod";
import { z } from "zod";


type CurrentState = { success: boolean; error: boolean };

export const createAgent = async (currentState: CurrentState, data: AgentSchema) => {
  try {
    //Create a user in Clerk with username and password
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [data.email],
      username: data.userName,
      password: data.password ?? "", // Handle case where password might be undefined
      publicMetadata: {
        role: "agent", // Add metadata with the role "agent"
      },
    });

    //Check if the user already exists by email 
    const user = await prisma.user.findUnique({
      where: {
        Email: data.email,
      },
    });

    // If user doesn't exist, create the user in Prisma database.
    let createdUser;
    if (!user) {
      createdUser = await prisma.user.create({
        data: {
          Email: data.email,
          UserName: data.userName,
          Password: data.password ?? "", // Password could be null or empty.
        },
      });
    } else {
      createdUser = user; // User already exists
    }

    //Create the agent in Prisma and link the Clerk user
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

    // Optional: Revalidate paths after creation (if needed)
    // revalidatePath("/list/agents");

    return { success: true, error: false };
  } catch (err) {
    console.error("Create Agent Error:", err);
    return { success: false, error: true };
  }
};


export const updateAgent = async (currentState: CurrentState, data: AgentSchema) => {
  try {
    // Update the agent and contact numbers
    const updatedAgent = await prisma.agent.update({
      where: {
        AgentID: data.id,
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
            Password: data.password ?? "",
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

   // revalidatePath("/list/agents");
    return { success: true, error: false, updatedAgent };
  } catch (err) {
    console.error("Update Agent Error:", err);
    return { success: false, error: true };
  }
};

export const deleteAgent = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;

  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return { success: false, error: true };
    }

    await prisma.$transaction([
      prisma.agent_Contact_Number.deleteMany({
        where: { AgentID: parsedId },
      }),
      prisma.agent.delete({
        where: { AgentID: parsedId },
      }),
      prisma.user.delete({
        where: { UserID: parsedId },
      }),
    ]);

   // revalidatePath("/list/agents");
    return { success: true, error: false };
  } catch (err) {
    console.error("Deletion failed:", err);
    return { success: false, error: true };
  }
};









export const createStaff = async (currentState: CurrentState, data: StaffSchema) => {
  try {
    // Check if the user already exists by email
    const user = await prisma.user.findUnique({
      where: {
        Email: data.email,
      },
    });

    if (!user) {
      // Create a new user if not found
      const newUser = await prisma.user.create({
        data: {
          Email: data.email,
          UserName: data.userName,
          Password: data.password ?? "",
        },
      });

      // Create the staff and add contact numbers
      const newStaff = await prisma.staff.create({
        data: {
          FirstName: data.firstName,
          LastName: data.lastName,
          Section: data.section,
          SuperviserID: data.superviserID ? Number(data.superviserID) : null,

          User: {
            connect: { UserID: newUser.UserID },
          },
        },
      });

      return { success: true, error: false, staff: newStaff };
    } else {
      // If user exists, just create the staff
      const existingStaff = await prisma.staff.create({
        data: {
          FirstName: data.firstName,
          LastName: data.lastName,
          Section: data.section,
          SuperviserID: data.superviserID ? Number(data.superviserID) : null, // Ensure it's a number
          User: {
            connect: { UserID: user.UserID },
          },
        },
      });

      return { success: true, error: false, staff: existingStaff };
    }
  } catch (err) {
    console.error("Create Staff Error:", err);
    return { success: false, error: true };
  }
};



// Update Staff
export const updateStaff = async (currentState: CurrentState, data: StaffSchema) => {
  try {
    // Update the staff and contact numbers
    const updatedStaff = await prisma.staff.update({
      where: {
        StaffID: data.id,
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
    });

   // revalidatePath("/list/agents");
    return { success: true, error: false, updatedStaff };
  } catch (err) {
    console.error("Update Agent Error:", err);
    return { success: false, error: true };
  }
};

export const deleteStaff = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;

  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return { success: false, error: true };
    }

    await prisma.$transaction([

      prisma.staff.delete({
        where: { StaffID: parsedId },
      }),
      prisma.user.delete({
        where: { UserID: parsedId },
      }),
    ]);

   // revalidatePath("/list/agents");
    return { success: true, error: false };
  } catch (err) {
    console.error("Deletion failed:", err);
    return { success: false, error: true };
  }
};

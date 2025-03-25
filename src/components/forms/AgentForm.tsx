"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { agentSchema, AgentSchema } from "@/lib/formValidationSchemas";
import { createAgent, updateAgent } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AgentForm = ({ 
  type,
   data,
    setOpen, 

}: { type: "create" | "update" | "delete"; data?: any; setOpen: Dispatch<SetStateAction<boolean>> }) => {

  console.log("AgentForm received data:", data); 
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AgentSchema>({
    resolver: zodResolver(agentSchema),

  });

  // user action state

  const [state, formAction] = useFormState(
    type === "create" ? createAgent : updateAgent, 
    { success: false, error: false }
  );

  //const [passwordVisible, setPasswordVisible] = useState(false); 


  const onSubmit = handleSubmit((formData) => {
    if (type === "update" && !data?.AgentID) {
      console.error("AgentID is missing in update mode!");
      toast.error("Error: Agent ID is missing.");
      return;
    }
  
    const payload = { ...formData, id: data?.AgentID }; // Ensure ID is included
    console.log("Submitting payload:", payload);
    formAction(payload);
  });

const router = useRouter();

useEffect(() => {
  if (state.success) {
    toast(`Agent has been ${type === "create" ? "created" : "updated"}!`);
    setOpen(false);
    router.refresh();
  }

  // Display the error message from the backend (Clerk or Prisma)
  if (state.error) {
    toast.error(state.message || "Something went wrong!");
  }
}, [router, setOpen, state, type]);

  

  return (
    <form className="flex flex-col gap-8 overflow-y-auto max-h-[calc(100vh-40px)] p-4" onSubmit={onSubmit}>
      <h1 className="text-xl text-gray-700 font-semibold text-center w-full">
        {type === "create" ? "Create a new Agent" : "Update Agent"}
      </h1>
      <span className="text-md text-gray-900 ">Authentication Information</span>
      <div className="grid grid-cols-2 items-center gap-1 "> 
      <label className="text-sm text-gray-800 ">Username</label>
        <InputField
          label=""
          name="userName"
          defaultValue={data?.User.UserName}
          register={register}
          error={errors?.userName}
        
          
        />
        <label className="text-sm text-gray-800 ">Email</label>
        <InputField
          label=""
          name="email"
          type="email"
          defaultValue={data?.User.Email}
          register={register}
          error={errors?.email}
        />
        <label className="text-sm text-gray-800">Password</label>
          <InputField
            label=""
            name="password"
            type="password"
            defaultValue={data?.User.Password}
            register={register}
            error={errors?.password}
          />
        
      </div>
      <span className="text-md text-gray-900 ">Personal Information</span>

      
      <div className="flex justify-between gap-4">
        <InputField
          label="First Name"
          name="firstName"
          defaultValue={data?.FirstName}
          register={register}
          error={errors.firstName}
        />

        <InputField
          label="Last Name"
          name="lastName"
          defaultValue={data?.LastName}
          register={register}
          error={errors.lastName}
        />
      </div>
      <span className="text-md text-gray-900 ">Address</span>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-800">Office Address</label>
          <InputField
            label=""
            name="officeAddress"
            defaultValue={data?.OfficeAddress}
            register={register}
            error={errors.officeAddress}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-800">Home Address</label>
          <InputField
            label=""
            name="homeAddress"
            defaultValue={data?.HomeAddress}
            register={register}
            error={errors.homeAddress}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-800">City</label>
          <InputField
            label=""
            name="city"
            defaultValue={data?.City}
            register={register}
            error={errors.city}
          />
        </div>
      </div>
       <span className="text-md text-gray-900 ">Contact Details</span>
      <div className="flex justify-between gap-4">
     <InputField
        label="Contact Number 1"
        name="ContactNumber1" // Match Zod schema
        defaultValue={data?.Agent_Contact_Number?.[0]?.ContactNumber || ""}
        register={register}
        error={errors.ContactNumber1}
      />

      <InputField
        label="Contact Number 2 (optional)"
        name="ContactNumber2"
        defaultValue={data?.Agent_Contact_Number?.[1]?.ContactNumber || ""}
        register={register}
        error={errors.ContactNumber2}
      />
</div>
    
      {state.error && <span className="text-red-500 font-semibold">{state.message || "Something went wrong!"}</span>}
      <div className="flex justify-center items-center">
      <button className="bg-DashboardBlue text-white p-2 rounded-md mt-4 w-1/3">
        {type === "create" ? "Create" : "Update"}
      </button>
    </div>

    </form>
  );
};

export default AgentForm;
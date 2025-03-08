"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm} from "react-hook-form";
import InputField from "../InputField"; 
import { agentSchema, AgentSchema } from "@/lib/formValidationSchemas";
import { createAgent, updateAgent } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

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
  }, [router, setOpen, state, type]);
  

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Agent" : "Update Agent"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">Authentication Information</span>

      <div className="flex justify-between flex-wrap gap-4"> 
        <InputField
          label="Username"
          name="userName"
          defaultValue={data?.User.UserName}
          register={register}
          error={errors?.userName}
        />

        <InputField
          label="Email"
          name="email"
          type="email"
          defaultValue={data?.User.Email}
          register={register}
          error={errors?.email}
        />

        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.User.Password}
          register={register}
          error={errors?.password}
        />
      </div>

      <span className="text-xs text-gray-400 font-medium">Personal Information</span>

      <div className="flex justify-between flex-wrap gap-4">
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

        <InputField
          label="Office Address"
          name="officeAddress"
          defaultValue={data?.OfficeAddress}
          register={register}
          error={errors.officeAddress}
        />

        <InputField
          label="Home Address"
          name="homeAddress"
          defaultValue={data?.HomeAddress}
          register={register}
          error={errors.homeAddress}
        />

        <InputField
          label="City"
          name="city"
          defaultValue={data?.City}
          register={register}
          error={errors.city}
        />
     <InputField
  label="Contact Number 1"
  name="ContactNumber1" // Match Zod schema
  defaultValue={data?.Agent_Contact_Number?.[0]?.ContactNumber || ""}
  register={register}
  error={errors.ContactNumber1}
/>

<InputField
  label="Contact Number 2"
  name="ContactNumber2" // Match Zod schema
  defaultValue={data?.Agent_Contact_Number?.[1]?.ContactNumber || ""}
  register={register}
  error={errors.ContactNumber2}
/>

      </div>
        {state.error && <span className="text-red-500 font-semibold">Something went wrong!</span>}
      <button className="bg-blue-400 text-white p-2 rounded-md mt-4">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AgentForm;

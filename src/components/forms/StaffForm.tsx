"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm} from "react-hook-form";
import InputField from "../InputField"; 
import {StaffSchema, staffSchema } from "@/lib/formValidationSchemas";
import {createStaff, updateStaff } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const StaffForm = ({ 
  type,
   data,
    setOpen, 

}: { type: "create" | "update" | "delete"; data?: any; setOpen: Dispatch<SetStateAction<boolean>> }) => {

  console.log("StaffForm received data:", data); 
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffSchema>({
    resolver: zodResolver(staffSchema),

  });

  // user action state

  const [state, formAction] = useFormState(
    type === "create" ? createStaff : updateStaff, 
    { success: false, error: false }
  );
    const [passwordVisible, setPasswordVisible] = useState(false); 

  const onSubmit = handleSubmit((formData) => {
    if (type === "update" && !data?.StaffID) {
      console.error("StaffID is missing in update mode!");
      toast.error("Error: Staff ID is missing.");
      return;
    }
  
    const payload = { ...formData, id: data?.StaffID }; // Ensure ID is included
    console.log("Submitting payload:", payload);
    formAction(payload);
  });

const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Staff has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [router, setOpen, state, type]);
  

  return (
    <form className="flex flex-col gap-8 overflow-y-auto" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Staff" : "Update Staff"}
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
            type={passwordVisible ? "text" : "password"}
            defaultValue={data?.User.Password}
            register={register}
            error={errors?.password}
          />
          <button
            type="button"
            className="absolute right-5 top-40 transform -translate-y-1/2"
            onClick={() => setPasswordVisible((prev) => !prev)}
          >
            {passwordVisible ? (
              <FaEyeSlash size={20} />
            ) : (
              <FaEye size={20} />
            )}
          </button>
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
          label="Section"
          name="section"
          defaultValue={data?.Section}
          register={register}
          error={errors.section}  />

       <InputField
          label="Superviser ID"
          name="superviserID"
          defaultValue={data?.SuperviserID}
          register={register}
          error={errors.superviserID}
        />   
      </div>
        {state.error && <span className="text-red-500 font-semibold">Something went wrong!</span>}
      <button className="bg-blue-400 text-white p-2 rounded-md mt-4">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default StaffForm;

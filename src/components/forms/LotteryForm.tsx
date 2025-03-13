"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { lotterySchema, LotterySchema } from "@/lib/formValidationSchemas";
import { createLottery, updateLottery } from "@/lib/actions";
import { useState } from "react";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const LotteryForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  console.log("LotteryForm received data:", data);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LotterySchema>({
    resolver: zodResolver(lotterySchema),
    defaultValues: {
      StaffID: data?.StaffID || "",
      LotteryName: data?.LotteryName || "",
      ImageUrl: data?.ImageUrl || "",
      DrawDate: data?.DrawDate ? new Date(data.DrawDate) : undefined,
      UnitPrice: data?.UnitPrice || 0,
      UnitCommission: data?.UnitCommission || 0,
      Availability: data?.Availability || "Available",
    },
  });

  // Handle form state with create or update action
  const [state, setState] = useState({ success: false, error: false, message: "" });

  const formAction = async (payload: any) => {
    try {
      if (type === "create") {
        await createLottery(payload);
      } else {
        await updateLottery(payload);
      }
      setState({ success: true, error: false, message: "" });
    } catch (error: any) {
      setState({ success: false, error: true, message: error.message });
    }
  };

  const onSubmit = handleSubmit((formData) => {
    if (type === "update" && !data?.LotteryID) {
      console.error("LotteryID is missing in update mode!");
      toast.error("Error: Lottery ID is missing.");
      return;
    }

    const payload = { ...formData, LotteryID: data?.LotteryID }; // Include LotteryID for update
    console.log("Submitting payload:", payload);
    formAction(payload);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Lottery has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }

    if (state.error) {
      toast.error(state.message || "Something went wrong!");
    }
  }, [router, setOpen, state, type]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Lottery" : "Update Lottery"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">Lottery Information</span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Lottery Name"
          name="LotteryName"
          register={register}
          error={errors.LotteryName}
        />

        <InputField
          label="Staff ID"
          name="StaffID"
          register={register}
          error={errors.StaffID}
        />

        <InputField
          label="Image URL"
          name="ImageUrl"
          register={register}
          error={errors.ImageUrl}
        />

        <InputField
          label="Draw Date"
          name="DrawDate"
          type="date"
          register={register}
          error={errors.DrawDate}
        />

        <InputField
          label="Unit Price"
          name="UnitPrice"
          type="number"
          register={register}
          error={errors.UnitPrice}
        />

        <InputField
          label="Unit Commission"
          name="UnitCommission"
          type="number"
          register={register}
          error={errors.UnitCommission}
        />

        <InputField
          label="Availability"
          name="Availability"
          register={register}
          error={errors.Availability}
        />
      </div>

      {state.error && (
        <span className="text-red-500 font-semibold">
          {state.message || "Something went wrong!"}
        </span>
      )}

      <button className="bg-blue-400 text-white p-2 rounded-md mt-4">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default LotteryForm;

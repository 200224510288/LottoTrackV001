"use client";

import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { lotterySchema, LotterySchema } from "@/lib/formValidationSchemas";
import { createLottery, updateLottery } from "@/lib/actions";
import { useState, useEffect } from "react";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SelectField from "../SelectField";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

const LotteryForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { user } = useUser();

  console.log("Username:", user?.username);
  console.log("Role:", user?.publicMetadata.role);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LotterySchema>({
    resolver: zodResolver(lotterySchema),
    defaultValues: {
      StaffID: user?.id || data?.StaffID || "", // Pre-fill StaffID with username
      LotteryName: data?.LotteryName || "",
      ImageUrl: data?.ImageUrl || "",
      DrawDate: data?.DrawDate ? new Date(data.DrawDate) : new Date(),
      UnitPrice: data?.UnitPrice || 34,
      UnitCommission: data?.UnitCommission || 6,
      Availability: data?.Availability || "Available",
    },
  });

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

    const payload = { ...formData, LotteryID: data?.LotteryID };
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
    <form className="flex flex-col gap-8 overflow-y-auto max-h-[calc(100vh-40px)] p-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Lottery" : "Update Lottery"}
      </h1>

      <span className="text-md text-gray-900">Lottery Information</span>

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
          inputProps={{ disabled: true }}
        />

        <InputField
          label="Image URL"
          name="ImageUrl"
          register={register}
          error={errors.ImageUrl}
          inputProps={{disabled: true, placeholder: "Image URL will be set after upload"}}
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
        
        <SelectField
          label="Lottery Type"
          name="LotteryType"
          register={register}
          error={errors.LotteryType}
          options={[
            { value: "NLB", label: "NLB" },
            { value: "DLB", label: "DLB" },
            { value: "Instanse", label: "Instanse" },
          ]}
        />

        <SelectField
          label="Availability"
          name="Availability"
          register={register}
          error={errors.Availability}
          options={[
            { value: "Available", label: "Available" },
            { value: "Unavailable", label: "Unavailable" },
          ]}
        />
       <CldUploadWidget
          uploadPreset="LottoTrack" // Cloudinary upload preset
          onSuccess={(result) => {
            if (result?.info && typeof result.info !== 'string') { 
              const imageUrl = result.info.secure_url;
              setValue("ImageUrl", imageUrl); // Update the ImageUrl field in the form
            } else {
              console.error("Cloudinary upload failed: result.info is undefined or not an object");
            }
          }
        
        }
        >
          {({ open }) => {
            return (
              <div
                className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
                onClick={() => open()}
              >
                <Image src="/upload.png" alt="" width={28} height={28} />
                <span>Upload a photo</span>
              </div>
            );
          }}
        </CldUploadWidget>
      </div>

      {state.error && (
        <span className="text-red-500 font-semibold">
          {state.message || "Something went wrong!"}
        </span>
      )}

      <button className="bg-DashboardBlue text-white p-2 rounded-md mt-4">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default LotteryForm;
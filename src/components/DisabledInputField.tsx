import { currentUser } from "@clerk/nextjs/server";
import { forwardRef } from "react";


const user = await currentUser();


type DisabledInputFieldProps = {
  label: string;
  name: string;
  value: string | number;
};

const DisabledInputField = forwardRef<HTMLInputElement, DisabledInputFieldProps>(
  ({ label, name, value }, ref) => (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        ref={ref}
        type="text"
        name={name}
        id={name}
        value={value}
        readOnly
        className="mt-1 p-2 border border-gray-300 rounded-md cursor-not-allowed"
      />
    </div>
  )
);
DisabledInputField.displayName = "DisabledInputField";
export default DisabledInputField;

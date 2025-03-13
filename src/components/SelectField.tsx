import { FieldError } from "react-hook-form";

type SelectFieldProps = {
  label: string;
  register: any;
  name: string;
  error?: FieldError;
  options: { value: string; label: string }[]; // Dropdown options
  defaultValue?: string;
};

const SelectField = ({
  label,
  register,
  name,
  error,
  options,
  defaultValue = "",
}: SelectFieldProps) => {
  return (
    <div className="flex flex-col gap-2 w-full md:w-1/4">
      <label className="text-xs text-gray-500">{label}</label>
      <select
        {...register(name)}
        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
        defaultValue={defaultValue}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error?.message && (
        <p className="text-xs text-red-400">{error?.message.toString()}</p>
      )}
    </div>
  );
};

export default SelectField;

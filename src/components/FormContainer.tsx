import FormModal from "./FormModal";

export type FormContainerProps = {
    table:
      | "agent"
      | "staff";
    type: "create" | "update" | "delete";
    data?: any;
    id?: number | string;
  };



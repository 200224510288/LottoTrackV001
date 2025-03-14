export type FormContainerProps = {
  table: "agent" | "staff" | "lottery";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};
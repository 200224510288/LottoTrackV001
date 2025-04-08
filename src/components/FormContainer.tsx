export type FormContainerProps = {
  table: "agent" | "staff" | "lottery" | "order";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};
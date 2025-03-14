// src/components/forms/LotteryFormServer.tsx
import { currentUser } from "@clerk/nextjs/server";
import LotteryForm from "./LotteryForm";

const LotteryFormServer = async ({ type, data, setOpen }: any) => {
    // Fetch the current user on the server side
    const user = await currentUser(); // `currentUser()` is server-side only
  
    // Pass the fetched user data to the Client Component
    return <LotteryForm user={user} type={type} data={data} setOpen={setOpen} />;
  };
  
  export default LotteryFormServer;
  
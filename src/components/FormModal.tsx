"use client"
import { createAgent, deleteAgent, deleteLottery, deleteOrder, deleteStaff, updateAgent } from '@/lib/actions';
import dynamic from 'next/dynamic';
import Image from 'next/image';  // Import Image from next/image
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { toast } from 'react-toastify';
import { any } from 'zod';
import { FormContainerProps } from './FormContainer';



const deleteActionMap = {
  agent: (prevState: any, formData: FormData) => deleteAgent(prevState, formData),
  staff: (prevState: any, formData: FormData) => deleteStaff(prevState, formData),
  lottery: (prevState: any, formData: FormData) => deleteLottery(prevState, formData),
  order: (prevState: any, formData: FormData) => {
    const orderID = formData.get('id') as string;
    return deleteOrder(orderID);
  },
};

const AgentForm = dynamic(()=>import('./forms/AgentForm'),{
    loading: ()=><h1>Loading...</h1>
})

const StaffForm = dynamic(()=>import('./forms/StaffForm'),{
  loading: ()=><h1>Loading...</h1>
})

const LotteryForm = dynamic(()=>import('./forms/LotteryForm'),{
  loading: ()=><h1>Loading...</h1>
})


const forms:{
    [key:string]:(setOpen:Dispatch<SetStateAction<boolean>>, type:"create" | "update",data?:any)=> JSX.Element;

} = {
    agent: (setOpen, type, data) => <AgentForm type={type} data={data} setOpen={setOpen} />,
    staff: (setOpen, type, data) => <StaffForm type={type} data={data} setOpen={setOpen} />,
    lottery: (setOpen, type, data) => <LotteryForm type={type} data={data} setOpen={setOpen} />,
};


const FormModal = ({
  table,
  type,
  data,
  id,
}: FormContainerProps) => {
  const size = type === "create" ? "w-8 h-8 " : "w-7 h-7";
  const bgColor =
    type === "create" ? "bg-DashboardBlue" : type === "update" ? "bg-DashboardBlue" : "bg-DashboardBlue";

  const [open, setOpen] = useState(false);

  const Form = () => {
    const [state, formAction] = useFormState(deleteActionMap[table], {
      success: false,
      error: false,
    });

    const router = useRouter();

    useEffect(() => {
      if (state.success) {
        toast(`${table} has been deleted!`);
        setOpen(false);
        router.refresh();
      }
    }, [router, state]);

    return type === "delete" && id ? (
      <form action={formAction} className="p-4 flex flex-col gap-4">
        <input type="hidden" name="id" value={id} />
        <span className="text-center font-medium">
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center"
          data-cy={`delete-button`}>
          Delete
        </button>
      </form>
    ) : type === "create" || type === "update" ? (
      forms[table](setOpen, type, data)
    ) : (
      "Form not Found!"
    );
  };
  
    return (
      <>
        <button
          data-cy={`open-${type}-modal`}
          className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
          onClick={() => setOpen(true)}
>
      <Image src={`/${type}.png`} alt="" width={20} height={20} />
        </button>
        {open && (
          <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
              <Form />
              
              <div
                className="absolute top-4 right-4 cursor-pointer"
                onClick={() => setOpen(false)}
                
              >
              
                <Image src="/close.png" alt="" width={14} height={14} />
              </div>
            </div>
          </div>
        )}
      </>
    );
  };
  
  export default FormModal;
  
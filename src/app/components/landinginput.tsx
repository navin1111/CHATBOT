"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip } from 'lucide-react';
import { SendHorizontal } from 'lucide-react';

const LandingInput = () => {
  return (
    <>
      <Input type="Email" placeholder="What can i help you with?" />
      <div  >
        <input
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          className="file-input"
        />
        <Button className=" rounded-lg bg-[#F0EEE5]" 
          onClick={() =>
            document.querySelector<HTMLInputElement>(".file-input")?.click()

          }
          
          variant="link"
          
        >
          
          <Paperclip />
        </Button>
        </div>
      <Button className="w-[15%] rounded-xl hover:text-white text-white hover:bg-[#BA5B38] bg-[#BA5B38] flex" variant="outline" >
        Start Chat
        <span><SendHorizontal /></span>
      </Button>
      

     
     
    </>
  );
};

export default LandingInput;

"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip } from 'lucide-react';
import { SendHorizontal } from 'lucide-react';

const LandingInput = () => {
  return (
    <>
      <Input type="Email" placeholder="Start your first message" />
      <div  >
        <input
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          className="file-input"
        />
        <Button 
          onClick={() =>
            document.querySelector<HTMLInputElement>(".file-input")?.click()

          }
          
          variant="outline"
          
        >
          
          <Paperclip />
        </Button>
        </div>
      <Button className="w-[20%] bg-[#a65a03] flex" variant="outline" >
        Start Chat
        <span><SendHorizontal /></span>
      </Button>
      

     
     
    </>
  );
};

export default LandingInput;

"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip } from 'lucide-react';
import { SendHorizontal } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

const LandingInput = () => {
 
  return (
    <>
      <Input type="Email" placeholder="What can i help you with?"  className="bg-[#F8F8F7] cursor-pointer" />
      <div  >
        <input
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          className="file-input"
        />
        <Button className=" w-[10%] h-[10%] pr-6 items-center rounded-lg bg-[#F0EEE5]" 
          onClick={() =>
            document.querySelector<HTMLInputElement>(".file-input")?.click()

          }
          
          variant="link"
          
        >
          
          <span className="ml-2 flex items-center justify-center" ><Paperclip className="w-4 h-4"/></span>
        </Button>
        </div>
      <Button className="w-[15%] rounded-xl hover:text-white text-white hover:bg-[#BA5B38] bg-[#BA5B38] flex" variant="outline" >
        Start Chat
        <span className="ml-2 flex items-center justify-center"><SendHorizontal className="w-4 h-4" /></span>
      </Button>
      

     
     
    </>
  );
};

export default LandingInput;
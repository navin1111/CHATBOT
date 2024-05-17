"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip } from 'lucide-react';
import { SendHorizontal } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Textarea } from "@/components/ui/textarea"

const LandingInput = () => { 
  const [searchText, setSearchText] = useState('');
  return ( 
    <div className=" w-full h-10 flex items-center p-2 g-2 bg-[#F8F8F7] rounded-md  ">
      <Textarea
        placeholder="What can I help you with?"
        className="bg-[#F8F8F7] cursor-pointer"
        autoFocus
        onChange={(e) => setSearchText(e.target.value)}
      />
      <div>
        <input
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          className="file-input"
        />
        <Button
          className="w-[10%] h-[10%] items-center rounded-lg bg-[#F0EEE5]"
          onClick={() =>
            document.querySelector<HTMLInputElement>(".file-input")?.click()
          }
          variant="link"
        >
          <span className="flex items-center justify-center">
            <Paperclip className="w-4 h-4" />
          </span>
        </Button>
      </div>
      <Button
        className={`${
          searchText ? 'w-[10%]' : 'w-[15%]'
        } rounded-xl text-white flex items-center justify-center hover:bg-[#BA5B38] bg-[#BA5B38]`}
        variant="outline"
      >
        {!searchText && <span className="flex hover:text-white text-white items-center">Start Chat <SendHorizontal className="w4 h-4 p2 text-white" /> </span>}
        <SendHorizontal className="w-4 h-4 text-white" />
      </Button></div>
  );
};

export default LandingInput;

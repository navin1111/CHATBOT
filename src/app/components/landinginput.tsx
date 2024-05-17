"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip } from 'lucide-react';
import { SendHorizontal } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';


const LandingInput = () => {
  const [searchText, setSearchText] = useState('');

  return (
    <>
      <Input
        type="email"
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
          className="w-[10%] h-[10%] pr-6 items-center rounded-lg bg-[#F0EEE5]"
          onClick={() =>
            document.querySelector<HTMLInputElement>(".file-input")?.click()
          }
          variant="link"
        >
          <span className="ml-2 flex items-center justify-center">
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
        {!searchText && <span className=" flex">Start Chat <SendHorizontal className="w-5 h-5 pt-1 pb-1 text-white" /> </span>}
        <SendHorizontal className="w-4 h-4 text-white" />
      </Button>
    </>
  );
};

export default LandingInput;
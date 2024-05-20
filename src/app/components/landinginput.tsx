import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, SendHorizontal } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import axios from 'axios';

interface LandingInputProps {
  sendMessage: (content: string) => void;
}

const LandingInput: React.FC<LandingInputProps> = ({ sendMessage }) => {
  const [searchText, setSearchText] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileName = file.name;

    const url = `${process.env.NEXT_PUBLIC_CLOUDFLARE_API_URL}${fileName}`;
    const headers = {
      "Content-Type": "application/pdf",
    };

    try {
      const response = await axios.put(url, file, { headers });
      if (response.status === 202) {
        console.log("File upload accepted for processing. Check again later for completion status.");
      } else if (response.status === 200) {
        console.log("File upload successful!");
        // Handle successful upload response
        // For example, you can display a success message to the user
      } else {
        console.log(`Unexpected response status: ${response.status}`);
        // Handle unexpected response status
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      // Handle error
    }
  };

  const handleSend = () => {
    if (searchText.trim() !== '') {
      sendMessage(searchText);
      setSearchText('');
    }
  };

  return (
    <div className="w-full h-15 rounded-xl g-4 p-2 react-textarea flex items-center justify-center border border-slate-300 bg-[#F8F8F7] px-2 py-2">
      <Textarea
        placeholder="What can I help you with?"
        className="bg-[#F8F8F7] cursor-pointer flex-grow mr-6"
        autoFocus
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <div>
        <input
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          className="file-input"
          onChange={handleFileUpload}
        />
        <Button
          className="w-[10%] h-[10%] items-center rounded-lg bg-[#F0EEE5]"
          onClick={() => document.querySelector<HTMLInputElement>(".file-input")?.click()}
          variant="link"
        >
          <span className="flex items-center justify-center">
            <Paperclip className="w-4 h-4" />
          </span>
        </Button>
      </div>
      <Button
        className={`${searchText ? 'w-[10%]' : 'w-[15%]'} rounded-xl text-white flex items-center justify-center hover:bg-[#BA5B38] bg-[#BA5B38] ml-2`}
        variant="outline"
        onClick={handleSend}
      >
        {!searchText && <span className="flex hover:text-white text-white items-center">Start Chat <SendHorizontal className="w-4 h-4 text-white" /></span>}
        {searchText && <SendHorizontal className="w-4 h-4 text-white" />}
      </Button>
    </div>
  );
};

export default LandingInput;

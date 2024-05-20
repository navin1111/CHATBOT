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
    const askjunior_url=`${process.env.NEXT_PUBLIC_TEXT_EXTRACTION_URL}`;
    const headers = {
      "Content-Type": "application/pdf",
    };

    try {
      const response = await axios.put(url, file, { headers });
      console.log("File upload successful!");
      const pdfurl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_CDN_URL}${fileName}`;
      console.log({ pdfurl });
    
      try {
        const text_response = await axios.post(askjunior_url, { pdf_url: pdfurl });
        console.log("Text extraction successful:", text_response.data.text);
      } catch (error) {
        console.error("Error extracting text from pdf:", error);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
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

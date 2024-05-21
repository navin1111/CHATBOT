import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, SendHorizontal, FileText, Loader, X } from 'lucide-react'; // Import X icon for close button
import { Textarea } from "@/components/ui/textarea";
import axios from 'axios';

interface LandingInputProps {
  sendMessage: (content: string) => void;
}

const truncateFileName = (fileName: string, maxLength: number) => {
  if (fileName.length <= maxLength) return fileName;
  return `${fileName.slice(0, maxLength)}...`;
};

const LandingInput: React.FC<LandingInputProps> = ({ sendMessage }) => {
  const [searchText, setSearchText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false); // State for loading

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileName = file.name;

    const url = `${process.env.NEXT_PUBLIC_CLOUDFLARE_API_URL}${fileName}`;
    const askjunior_url = `${process.env.NEXT_PUBLIC_TEXT_EXTRACTION_URL}`;
    const headers = {
      "Content-Type": "application/pdf",
    };

    setIsUploading(true); // Set loading to true

    try {
      const response = await axios.put(url, file, { headers });
      console.log("File upload successful!");
      const pdfurl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_CDN_URL}${fileName}`;
      console.log({ pdfurl });

      const text_response = await axios.post(askjunior_url, { pdf_url: pdfurl });
      console.log("Text extraction successful:", text_response.data.text);
      setUploadedFileName(fileName);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsUploading(false); // Set loading to false after upload is done
    }
  };

  const handleSend = () => {
    if (searchText.trim() !== '') {
      sendMessage(searchText);
      setSearchText('');
    }
  };

  const handleCloseUploadBox = () => {
    setUploadedFileName(null); // Reset the uploaded file name
  };

  return (
    <div className="w-full h-15 rounded-xl g-4 p-2 react-textarea flex items-center justify-center border border-slate-300 bg-[#F8F8F7] px-2 py-2 relative">
      {uploadedFileName && (
        <div className="absolute bottom-[45px] right-[800px] flex items-center justify-start">
          <div className="border border-blue-500 p-4 rounded-lg bg-white relative">
            <button onClick={handleCloseUploadBox} className="absolute top-2 left-2 text-blue-500">
              <X className="w-4 h-4" />
            </button>
            <span className="flex items-center justify-center mb-2 text-blue-500">
              <FileText className="w-6 h-6" />
            </span>
            <span className="text-sm text-blue-500 ml-2">{truncateFileName(uploadedFileName, 20)}</span>
          </div>
        </div>
      )}

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
            {isUploading ? (
              <Loader className="w-4 h-4 animate-spin" /> // Loading icon during upload
            ) : (
              <Paperclip className="w-4 h-4" /> // Paperclip icon after upload
            )}
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

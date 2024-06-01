"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, SendHorizontal, FileText, Loader, X } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Message, continueConversation } from "../actions";
import { readStreamableValue } from "ai/rsc";

interface LandingInputProps {}

const truncateFileName = (fileName: string, maxLength: number) => {
  if (fileName.length <= maxLength) return fileName;
  return `${fileName.slice(0, maxLength)}...`;
};

const LandingInput: React.FC<LandingInputProps> = ({}) => {
  const [searchText, setSearchText] = useState('');
  const [uploadedFileName, setUploadedFileNameState] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [lastUserMessage, setLastUserMessage] = useState<string>("");
  const [extractedText, setExtractedTextState] = useState<string>("");
  const [moveFileNameBoxAbove, setMoveFileNameBoxAboveState] = useState<boolean>(false);
  const [showUploadedFileNameBox, setShowUploadedFileNameBoxState] = useState<boolean>(true); // Initial state set to true
  const [recordId, setRecordId] = useState<string | null>(null);

  const sendMessageFunction = async (content: string, uniqueId: string) => {
    if (content === lastUserMessage) {
      return;
    }

    setLastUserMessage(content);

    const { messages, newMessage } = await continueConversation(
      [...conversation],
      content,
      extractedText
    );

    let fullMessage = "";
    const reader = readStreamableValue(newMessage);

    for await (const delta of reader) {
      fullMessage += delta;
    }

    setConversation((prevConversation) => {
      const updatedConversation: Message[] = [
        ...prevConversation,
        { role: "user", content },
        { role: "assistant", content: fullMessage },
      ];

      return updatedConversation;
    });

    setMoveFileNameBoxAboveState(true);
    setShowUploadedFileNameBoxState(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const uniqueId = uuidv4();
    const url = `${process.env.NEXT_PUBLIC_CLOUDFLARE_API_URL}${uniqueId}`;
    const askjunior_url = `${process.env.NEXT_PUBLIC_TEXT_EXTRACTION_URL}`;
    const headers = {
      "Content-Type": "application/pdf",
    };

    setIsUploading(true);

    try {
      const response = await axios.put(url, file, { headers });
      const pdfurl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_CDN_URL}${uniqueId}`;

      const text_response = await axios.post(askjunior_url, { pdf_url: pdfurl });
      setUploadedFileNameState(uniqueId);

      const record = await axios.post("/api/custom", {
        url_pdf: pdfurl,
        id: uniqueId,
      });

      setRecordId(record.data.recid);
      setExtractedTextState(text_response.data.text);

      setShowUploadedFileNameBoxState(true);

      sendMessageFunction("", uniqueId); // Call sendMessageFunction with uniqueId
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async () => {
    if (searchText.trim() !== '') {
      sendMessageFunction(searchText, "");
      setSearchText('');
      setShowUploadedFileNameBoxState(true);

      const conversationJSON = JSON.stringify(conversation);
      try {
        const response = await axios.post("/api/record", {
          conv: conversationJSON,
          recid: recordId,
        });
      } catch (error) {
        console.error("Error updating chat history:", error);
      }
    }
  };

  const handleCloseUploadBox = () => {
    setUploadedFileNameState(null);
    setShowUploadedFileNameBoxState(true);
  };

  return (
    <div className="w-[70%] h-[80%] flex flex-col overflow-hidden mt-5">



      <div className="flex-grow overflow-y-auto">
        {uploadedFileName && moveFileNameBoxAbove && (
          <div className="w-full flex flex-col items-start justify-start mb-4">
            <div className="border border-blue-500 p-4 rounded-lg bg-white relative">
              <button onClick={handleCloseUploadBox} className="absolute top-2 left-2 text-blue-500">
                <X className="w-4 h-4" />
              </button>
              <span className="flex items-center justify-center mb-2 text-blue-500">
                <FileText className="w-6 h-6" />
              </span>
              <span className="text-sm text-blue-500 ml-2">{uploadedFileName}</span>
            </div>
          </div>
        )}
        {conversation.map((message, index) => (
          <div key={index} className={`mb-2 ${message.role === "user" ? "justify-start" : "justify-end"}`}>
            {message.role === "user" ? (
              <div className="inline-block bg-[#f6e8d8] p-2 rounded-xl max-w-[70%]">
                <div className="flex items-center">
                  <div className="bg-[#3d3929] w-8 h-8 rounded-full flex items-center justify-center mr-2">
                    <span className="text-sm text-white hover:text-white font-semibold">U</span>
                  </div>
                  <div>{message.content}</div>
                </div>
              </div>
            ) : (
              <div className="bg-[#F5F4EF] p-2 rounded-xl max-w-[70%]">
                <div>{message.content}</div>
              </div>
            )}
          </div>
        ))}
      </div>

     

      
<div className="w-full rounded-xl flex items-start justify-start border border-slate-300 bg-[#F8F8F7] px-2 py-2 relative mb-4">


{uploadedFileName && !moveFileNameBoxAbove && (
        <div className="absolute  bottom-[45px] margin-top: 100px; justify-start flex items-start">
          <div className="border border-blue-500 p-4 rounded-lg bg-white relative items-start justify-start">
            <button onClick={handleCloseUploadBox} className="absolute top-2 left-2 text-blue-500">
              <X className="w-4 h-4" />
            </button>
            <span className="flex items-center justify-center mb-2 text-blue-500">
              <FileText className="w-6 h-6" />
            </span>
            <span className="text-sm text-blue-500 ml-2">
              {truncateFileName(uploadedFileName, 20)}
            </span>
          </div>
        </div>
      )}



        <Textarea
          placeholder="What can I help you with?"
          className="bg-[#F8F8F7] cursor-pointer  flex-grow mr-6"
          autoFocus
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            if (e.target.value.trim() !== '') {
              // Show the uploaded file name box when there is text input
              // Move the uploaded file name box above the conversation
            }
          }}
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
            className="w-[10%] h-[10%] mt-1 items-center rounded-lg bg-[#F0EEE5]"
            onClick={() => document.querySelector<HTMLInputElement>(".file-input")?.click()}
            variant="link"
          >
            <span className="flex items-center justify-center">
              {isUploading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
            </span>
          </Button>
        </div>
        <Button
          className={`${searchText ? 'w-[10%]' : 'w-[10%]'} rounded-xl text-white flex items-center justify-center hover:bg-[#BA5B38] bg-[#BA5B38] ml-2`}
          variant="outline"
          onClick={handleSend}
        >
          {!searchText && <span className="flex hover:text-white text-white items-center">Start Chat <SendHorizontal className="w-4 h-4 text-white" /></span>}
          {searchText && <SendHorizontal className="w-4 h-4 text-white" />}
        </Button>
      </div>
  
    </div>
  );
};

export default LandingInput;
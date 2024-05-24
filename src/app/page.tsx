"use client";

import React, { ReactNode, useState } from "react";
import LandingInput from "./components/landinginput";
import { Message, continueConversation } from "./actions";
import { readStreamableValue } from "ai/rsc";
import { FileText, X } from "lucide-react";
import { ClerkProvider, SignInButton, SignedIn, UserButton } from '@clerk/nextjs';
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

export default function Home() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [lastUserMessage, setLastUserMessage] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showUploadedFileNameBox, setShowUploadedFileNameBox] = useState<boolean>(false);
  const [moveFileNameBoxAbove, setMoveFileNameBoxAbove] = useState<boolean>(false);
  const { isSignedIn, user, isLoaded } = useUser();

  interface YourComponentProps {
    children: ReactNode;
  }

  const sendMessage = async (content: string) => {
    if (content === lastUserMessage) {
      return;
    }

    setLastUserMessage(content);

    // Execute the server function
    const { messages, newMessage } = await continueConversation(
      [...conversation],
      content,
      extractedText // Pass extracted text from PDF
    );

    let fullMessage = "";
    const reader = readStreamableValue(newMessage); // Get the reader for the StreamableValue

    for await (const delta of reader) { // Use reader to get the stream updates
      fullMessage += delta;
    }

    setConversation((prevConversation) => [
      ...prevConversation,
      { role: "user", content },
      { role: "assistant", content: fullMessage },

      
    ]);

    console.log("Updated Conversation:", conversation);

    const conversationJSON = JSON.stringify(conversation);
    axios.post("/api/custom", {
      conv: conversationJSON,

     
    });

   
    // Move the file name box above the conversation once the user sends a message
    setMoveFileNameBoxAbove(true);
    setShowUploadedFileNameBox(true); // Ensure the uploaded file name box is shown
  };

  function truncateFileName(fileName: string, maxLength: number): React.ReactNode {
    if (fileName.length <= maxLength) {
      return fileName;
    }
    const truncatedName = fileName.slice(0, maxLength) + "...";
    return truncatedName;
  }

  function handleCloseUploadBox(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    // Implement the logic for closing the upload box here
    setShowUploadedFileNameBox(false);
    setUploadedFileName(null);
  }

  const handleUpdateUser = () => {
    // Example logic to update user name (you might want to replace it with actual logic)
    updateUser({ firstName: "UpdatedName" });
  }

  return (
    <div className="w-full flex flex-col h-screen items-center bg-[#f0e9e1] react-textarea">
      <div className="w-full h-20 pb-2 flex flex-col justify-center items-center relative">
        <span className="font-bold font-serif text-2xl react-textarea absolute left-4">Chatbot</span>
        <div className="absolute right-4">
          {isSignedIn ? <UserButton /> : <div className="flex rounded-xl hover:text-white text-white items-center justify-center hover:bg-[#BA5B38] bg-[#BA5B38] w-20 h-10"><  SignInButton /></div>}
        </div>
      </div>
      <div className="w-full flex flex-col justify-center items-center">
        {isLoaded && isSignedIn ? (
          <>
            <span className="text-5xl font-serif react-textarea">
              Hello all, This is {user.fullName}!
            </span>
            
          </>
        ) : (
          <span className="text-5xl font-serif react-textarea">
            Welcome! Please sign in.
          </span>
        )}
      </div>

      {uploadedFileName && moveFileNameBoxAbove && (
        <div className="w-[70%] flex flex-col items-start justify-start">
          <div className="border border-blue-500 p-4 rounded-lg bg-white relative mb-2">
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

      <div className="w-[70%] h-[60%] flex flex-col overflow-y-auto mt-5">
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

      <div className="w-[70%] h-[10%] flex flex-col justify-start items-start mt-auto mb-5">
        <LandingInput 
          sendMessage={sendMessage} 
          setExtractedText={setExtractedText} 
          setUploadedFileName={setUploadedFileName}
          setShowUploadedFileNameBox={setShowUploadedFileNameBox}
          setMoveFileNameBoxAbove={setMoveFileNameBoxAbove}
        />

        {!moveFileNameBoxAbove && uploadedFileName && (
          <div className="absolute bottom-[80px] justify-start flex items-start">
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
      </div>
    </div>
  );
}

function updateUser(arg0: { firstName: string; }) {
  throw new Error("Function not implemented.");
}
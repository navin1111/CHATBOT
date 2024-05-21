"use client";

import React, { useState } from "react";
import LandingInput from "./components/landinginput";
import { Message, continueConversation } from "./actions";
import { readStreamableValue } from "ai/rsc";
import { FileText } from "lucide-react";

export default function Home() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [lastUserMessage, setLastUserMessage] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showUploadedFileNameBox, setShowUploadedFileNameBox] = useState<boolean>(false);
  const [moveFileNameBoxAbove, setMoveFileNameBoxAbove] = useState<boolean>(false);

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

    // Move the file name box above the conversation once the user sends a message
    setMoveFileNameBoxAbove(true);
  };

  return (
    <div className="w-full flex flex-col h-screen items-center bg-[#f0e9e1] react-textarea">
      <div className="w-full h-20 pb-2 flex flex-col justify-center items-center">
        <span className="font-bold font-serif text-2xl react-textarea">Chatbot</span>
      </div>
      <div className="w-full flex flex-col justify-center items-center">
        <span className="text-5xl font-serif react-textarea">Hello all, This is Navin</span>
      </div>

      {uploadedFileName && moveFileNameBoxAbove && (
        <div className="w-[70%] flex flex-col items-start justify-start">
          <div className="border border-blue-500 p-4 rounded-lg bg-white relative mb-2">
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

      {!moveFileNameBoxAbove && uploadedFileName && (
        <div className="w-[70%] flex flex-col mt-30   bottom-[55px] items-start justify-start mb-2">
          <div className="border border-blue-500  p-4 rounded-lg bg-white relative">
            <span className="flex items-center justify-center mb-1 text-blue-500">
              <FileText className="w-6 h-6" />
            </span>
            <span className="text-sm text-blue-500 ml-2">{uploadedFileName}</span>
          </div>
        </div>
      )}

      <div className="w-[70%] h-[10%] flex flex-col justify-center items-center mt-auto mb-5">
        <LandingInput 
          sendMessage={sendMessage} 
          setExtractedText={setExtractedText} 
          setUploadedFileName={setUploadedFileName}
          setShowUploadedFileNameBox={setShowUploadedFileNameBox}
          setMoveFileNameBoxAbove={setMoveFileNameBoxAbove}
        />
      </div>
    </div>
  );
}

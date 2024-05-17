"use client";
import React, { useState } from "react";
import LandingInput from './components/landinginput';
import { Message, continueConversation } from './actions';
import { readStreamableValue } from 'ai/rsc';

export default function Home() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');

  const sendMessage = async (content: string) => {
    const { messages, newMessage } = await continueConversation([
      ...conversation,
      { role: 'user', content },
    ]);

    let textContent = '';

    for await (const delta of readStreamableValue(newMessage)) {
      textContent = `${textContent}${delta}`;
      setConversation([
        ...messages,
        { role: 'assistant', content: textContent },
      ]);
    }
  };

  return (
    <div className="w-full flex flex-col h-screen items-center bg-[#f0e9e1] react-textarea">
      <div className="w-full h-20 pb-2 flex flex-col justify-center items-center">
        <span className="font-bold font-serif text-2xl react-textarea">Chatbot</span>
      </div>
      <div className="w-full flex flex-col justify-center items-center">
          <span className="text-5xl font-serif react-textarea">Hello all, This is Navin</span>
        </div>

        <div className="h-[90%]"></div>
        <br />

      <div className="w-[70%] h-[15%] flex flex-col justify-center items-center">
        
        <div className="w-[70%] h-[80%] ">
          <LandingInput sendMessage={sendMessage} />
        </div>
      </div>

      

       
    </div>
  );
}

"use client";
import React, { useState } from "react";
import LandingInput from './components/landinginput';
import { Message, continueConversation } from './actions';
import { readStreamableValue } from 'ai/rsc';

export default function Home() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');

  const sendMessage = async (content: string) => {
    if (content === lastUserMessage) {
      return;
    }

    setLastUserMessage(content);

    const { messages, newMessage } = await continueConversation([
      ...conversation,
      { role: 'user', content },
    ]);

    let fullMessage = '';
    for await (const delta of readStreamableValue(newMessage)) {
      fullMessage += delta;
    }

    setConversation((prevConversation) => [
      ...prevConversation,
      { role: 'user', content },
      { role: 'assistant', content: fullMessage },
    ]);
  };

  return (
    <div className="w-full flex flex-col h-screen items-center bg-[#f0e9e1] react-textarea">
      <div className="w-full h-20 pb-2 flex flex-col justify-center items-center">
        <span className="font-bold font-serif text-2xl react-textarea">Chatbot</span>
      </div>
      <div className="w-full flex flex-col justify-center items-center">
        <span className="text-5xl font-serif react-textarea">Hello all, This is Navin</span>
      </div>

      <div className="w-[70%] h-[60%] flex flex-col overflow-y-auto mt-5">
        {conversation.map((message, index) => (
          <div key={index} className={`p-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`${message.role === 'user' ? 'bg-blue-300' : 'bg-gray-300'} p-2 rounded-lg inline-block`}>
              {message.content}
            </span>
          </div>
        ))}
      </div>

      <div className="w-[70%] h-[15%] flex flex-col justify-center items-center mt-auto mb-5">
        <LandingInput sendMessage={sendMessage} />
      </div>
    </div>
  );
}

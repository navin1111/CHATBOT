"use client";

import LandingInput from "./components/landinginput";
import {  SignInButton,  UserButton } from '@clerk/nextjs';
import { useUser } from "@clerk/clerk-react";

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  return (
    <div className="w-full flex flex-col h-screen items-center bg-[#f0e9e1] react-textarea">
      <div className="w-full h-20 pb-2 flex flex-col justify-center items-center relative">
        <span className="font-bold font-serif text-2xl react-textarea absolute left-4">Chatbot</span>
        <div className="absolute right-4">
          {isSignedIn ? <UserButton /> : <div className="flex rounded-xl hover:text-white text-white items-center justify-center hover:bg-[#BA5B38] bg-[#BA5B38] w-20 h-10"><SignInButton /></div>}
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
      </div> <LandingInput/></div>
  );
}




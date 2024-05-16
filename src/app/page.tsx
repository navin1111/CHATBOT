import React from "react";
import LandingInput from "./components/landinginput";


export default function Home() {
  return (
    <div className="w-full flex flex-col h-screen items-center bg-[#f0e9e1]
     ">
      <div className="w-full h-20 pt-5 flex flex-col justify-center items-center">
        <span className="font-bold font-serif text-xl">Chatbot</span>
        
      </div>

      <div className="w-[70%] h-[50%] flex flex-col pt-50 justify-center items-center h-[50%]">
        <div className="w-full flex flex-col justify-center items-center">
          <span className="text-5xl font-serif">Hello all,This is navin</span>
        </div>
        <br />
        <div className="w-[70%] h-[15%] rounded-xl flex items-center justify-center border border-black  bg-sandal-800 gap-2   p-1flex  rounded-md  bg-background px-1 py-1  ">
         <LandingInput/>
        </div>
      </div>
    </div>
  );
}



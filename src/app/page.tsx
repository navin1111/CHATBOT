import React from "react";
import LandingInput from "./components/landinginput";


export default function Home() {
  return (
    <div className="w-full flex flex-col h-screen items-center bg-[#f0e9e1] react-textarea
     ">
      <div className="w-full h-20 pb-2 flex flex-col justify-center items-center">
        <span className="font-bold font-serif text-2xl react-textarea">Chatbot</span>
        
      </div>

      <div className="w-[70%] h-[30%] flex flex-col pt-50 justify-center items-center ">
        <div className="w-full flex flex-col justify-center items-center">
          <span className="text-5xl font-serif react-textarea">Hello all,This is navin</span>
        </div>
        <br />
        <div className="w-[70%] h-[25%] rounded-xl react-textarea flex items-center justify-center border border-slate-300 g-4 p-1flex  rounded-md  bg-[#F8F8F7] px-2 py-2  ">
         <LandingInput/>
        </div>
      </div>
    </div>
  );
}



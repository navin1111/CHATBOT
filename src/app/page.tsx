import React from "react";
import Welcome from "./components/landinginput";
import LandingInput from "./components/landinginput";


export function Home() {
  return (
    <div className="w-full flex flex-col h-screen items-center bg-[#f0e9e1] ">
      <div className="w-full h-10 pt-8 flex flex-col justify-center items-center">
        <span className="font-serif font-bold ">Ask Junior</span>
        
      </div>

      <div className="w-[70%] flex flex-col justify-center items-center h-[50%]">
        <div className="w-full flex flex-col justify-center items-center">
          <span className="font-bold text-5xl font-serif">Hello all,This is navin</span>
        </div>
        <br />
        <div className="w-full w-[69%] h-[15%]  flex items-center justify-center border border-black p-4 bg-sandal-800 gap-4 p-1flex  rounded-md  bg-background px-1 py-1  ">
         <LandingInput/>
        </div>
      </div>
    </div>
  );
}

export default Home;

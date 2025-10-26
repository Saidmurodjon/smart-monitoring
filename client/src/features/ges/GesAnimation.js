
import React from "react";
import Lottie from "lottie-react";
import hydroAnim from "../../data/hydro.json";
export default function GesAnimation() {
  return (
   <div className="flex flex-col items-center mb-4">
  <div className="w-[200px] h-[130px] flex items-center justify-center">
    <Lottie
      animationData={hydroAnim}
      loop={true}
      autoplay={true}
      className="w-full h-full"
    />
  </div>

  <div className="text-lg font-semibold italic mt-3 text-center text-gray-900">
    {/* {selectedName || "Noma'lum GES"} */}
  </div>
</div>

  );
}

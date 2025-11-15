
import React from "react";
import Lottie from "lottie-react";
import hydroAnim from "../../data/transformer.json";
export default function TransformerAnimation() {
  return (
   <div className="flex flex-col items-center">
  <div className="w-2/3 flex items-center justify-center">
    <Lottie
      animationData={hydroAnim}
      loop={true}
      autoplay={true}
      className="w-full h-full"
    />
  </div>


</div>

  );
}

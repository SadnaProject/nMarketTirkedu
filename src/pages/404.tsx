import Lottie from "lottie-react";
import notFoundAnimation from "../components/animations/notFoundAnimation.json";

export default function AboutPage() {
  return (
    <div className="flex h-3/4 content-center justify-center">
      <Lottie animationData={notFoundAnimation} />
    </div>
  );
}

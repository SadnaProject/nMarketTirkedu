import Slider from "rc-slider";
import "rc-slider/assets/index.css";

export default function RateSlider() {
  return (
    <div className="w-44">
      <Slider
        range
        allowCross
        defaultValue={[1, 5]}
        min={1}
        max={5}
        marks={{ 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }}
        dots
      />
    </div>
  );
}

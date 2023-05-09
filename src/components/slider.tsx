import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { z } from "zod";

type Props = {
  onChange?: (value: number[]) => void;
};

export default function RateSlider({ onChange }: Props) {
  function handleChange(res: number | number[]) {
    const values = z.number().array().parse(res);
    onChange?.(values);
  }

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
        onChange={handleChange}
      />
    </div>
  );
}

import Slider from "@/components/slider/Slider.tsx";
import { getThumbnailImageURL } from "@/services/netflix-image-api.ts";
import { range } from "es-toolkit";

export default function MainPage() {
  return (
    <main className="flex w-dvw flex-col">
      <Slider
        headerText="헤더텍스트"
        sources={range(10).map((i) => getThumbnailImageURL(i))}
      />
    </main>
  );
}

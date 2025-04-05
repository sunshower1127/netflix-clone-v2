import { useEffect, useState } from "react";

export default function useBreakPoint(
  breakpoints: number[],
  callback: () => void,
) {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const mediaQueryLists = breakpoints.map((bp) =>
      window.matchMedia(`(max-width: ${bp}px)`),
    );

    const handleMediaChange = () => {
      setWidth(window.innerWidth);
      if (mediaQueryLists.some((mql) => mql.matches)) {
        callback();
      }
    };

    mediaQueryLists.forEach((mql) =>
      mql.addEventListener("change", handleMediaChange),
    );
    // window.addEventListener("resize", handleMediaChange); // 폴백

    // 초기 실행
    handleMediaChange();

    return () => {
      mediaQueryLists.forEach((mql) =>
        mql.removeEventListener("change", handleMediaChange),
      );
      // window.removeEventListener("resize", handleMediaChange);
    };
  }, [breakpoints, callback]);

  return width;
}

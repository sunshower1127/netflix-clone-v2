import useRefCallback from "@/lib/sw-toolkit/hooks/useRefCallback.ts";
import { getCssVar } from "@/lib/sw-toolkit/utils/style.ts";
import { AnimatePresence, motion, MotionStyle } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import { Icon } from "@iconify/react/dist/iconify.js";
import { range } from "es-toolkit";
import { isEmpty } from "es-toolkit/compat";
import { createPortal } from "react-dom";
import classes from "./slider.module.css";

export default function Slider({
  sources,
  className,
  headerText,
}: React.ComponentProps<"div"> & { sources: string[]; headerText: string }) {
  const itemLength = sources.length;
  const [index, setIndex] = useState(0);
  const [itemCapacity, setItemCapacity] = useState(2);

  const handleBreakpoint = useRefCallback(({ defer, element }) => {
    const breakPoints = [640, 768, 1024, 1280];
    const mediaQueries = breakPoints.map((bp) =>
      window.matchMedia(`(min-width: ${bp}px)`),
    );
    const handleMediaChange = () => {
      setItemCapacity(getCssVar(element, "--item-capacity") || 2);
    };
    mediaQueries.forEach((mql) =>
      mql.addEventListener("change", handleMediaChange),
    );
    defer(() => {
      mediaQueries.forEach((mql) =>
        mql.removeEventListener("change", handleMediaChange),
      );
    });
    handleMediaChange();
  }, []); // PASSED

  // const handlePageScroll = (opt: "left" | "right") => {
  //   if (!ulRef.current) return;
  //   const scrollContainer = ulRef.current;

  //   let newIndex: number;

  //   if (opt === "left") {
  //     newIndex = Math.max(0, index - itemCapacity);
  //   } else {
  //     newIndex = Math.min(itemLength - itemCapacity, index + itemCapacity);
  //   }

  //   scrollContainer.children[newIndex + 1].scrollIntoView({
  //     behavior: "smooth",
  //     inline: "start",
  //   });

  //   // Ref로 바꿔도 작동 하는데, State가 더 시맨틱해서 씀.
  //   setIndex(newIndex);
  // };

  return (
    <article
      className={twMerge(
        "flex flex-col pt-6",
        classes["responsive"],
        className,
      )}
      ref={handleBreakpoint}
    >
      <header className="flex w-full flex-row justify-between px-[calc(var(--button-width)+4px)]">
        <h6 className="text-xs font-light">{headerText}</h6>
        <PageIndicator
          maxPage={Math.ceil(itemLength / itemCapacity)}
          curPage={Math.ceil(index / itemCapacity)}
        />
      </header>
      <nav className="group/nav relative py-1">
        <button
          className="group/btn absolute top-0 left-0 h-full w-(--button-width) rounded-r-xs bg-black/50 hover:bg-black/70"
          // style={{ display: index === 0 ? "none" : "inline-block" }}
          // onClick={() => handlePageScroll("left")}
        >
          <Icon
            icon="material-symbols-light:chevron-left"
            className="invisible size-4 h-7 w-(--button-width) scale-y-150 transition-transform group-hover/btn:scale-x-150 group-hover/btn:scale-y-200 group-hover/nav:visible"
          />
        </button>

        {/* <div className="hover-zone absolute left-(--button-width) inline-flex h-full w-[calc(100dvw-2*var(--button-width))]" /> */}

        <ul className="flex flex-row gap-1">
          <div className="w-(--button-width)" />
          {range(itemCapacity).map((i) => (
            <Item key={i} source={sources[index + i]} />
          ))}
          <div className="w-(--button-width)" />
        </ul>
        <button
          className="group/btn absolute top-0 right-0 h-full w-(--button-width) rounded-l-xs bg-black/50 hover:bg-black/70"
          // onClick={() => handlePageScroll("right")}
        >
          <Icon
            icon="material-symbols-light:chevron-right"
            className="invisible size-4 h-7 w-(--button-width) scale-y-150 transition-transform group-hover/btn:scale-x-150 group-hover/btn:scale-y-200 group-hover/nav:visible"
          />
        </button>
      </nav>
    </article>
  );
}

function Item({ source }: { source: string }) {
  const [isHover, setHover] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rectRef = useRef<HTMLImageElement>(null);
  console.log("source", source);

  const handleMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setHover(true);
      timeoutRef.current = null;
    }, 500);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setHover(false);
    }
  }, []);

  const getButtonWidth = useCallback(() => {
    const buttonWidth = getCssVar(rectRef.current!, "--button-width")!;
    return buttonWidth;
  }, []);

  const getRect = useCallback(
    () => rectRef.current!.getBoundingClientRect(),
    [],
  );

  return (
    <li className="w-(--item-width)">
      <div className="w-full bg-red-400" />
      <img
        ref={rectRef}
        loading="lazy"
        className={twMerge("aspect-video w-full cursor-pointer rounded-xs")}
        src={source}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {createPortal(
        <AnimatePresence>
          {isHover && (
            <Card
              url={source}
              getButtonWidth={getButtonWidth}
              getRect={getRect}
              onMouseLeave={() => setHover(false)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </li>
  );
}

function Card({
  url,
  getRect,
  getButtonWidth,
  ...props
}: { url: string; getButtonWidth: () => number; getRect: () => DOMRect } & Omit<
  React.ComponentProps<"div">,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
>) {
  const [style, setStyle] = useState<MotionStyle>({});

  useEffect(() => {
    const rect = getRect();
    const top = rect.top + window.scrollY;

    const buttonWidth = getButtonWidth();

    let transformOrigin = "center";
    if (rect.left < buttonWidth + 10) {
      transformOrigin = "left";
    } else if (rect.right > window.innerWidth - buttonWidth - 10) {
      transformOrigin = "right";
    }
    const left = rect.left;
    const width = rect.width;

    setStyle({
      top,
      left,
      width,
      transformOrigin,
    });
  }, [getButtonWidth, getRect]);

  if (isEmpty(style)) return null;

  return (
    <motion.div
      className="absolute z-30 flex flex-col items-center rounded-xs bg-zinc-900 shadow-lg shadow-black"
      style={style}
      initial={{ scale: 1 }}
      animate={{ scale: 1.5 }}
      exit={{ scale: 1 }}
      transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
      {...props}
    >
      <img className="aspect-video w-full rounded-xs" src={url} />
      <div className="flex w-full flex-col items-center gap-2 p-3 text-[0.7rem] font-light">
        <div className="flex w-full flex-row justify-between">
          <div className="flex flex-row gap-1">
            <Icon
              icon="material-symbols-light:play-circle-rounded"
              className="size-3"
            />
            <Icon
              icon="material-symbols-light:check-circle-outline"
              className="size-2"
            />
            <Icon icon="pepicons-pencil:thumbs-up-circle" className="size-2" />
          </div>
          <Icon
            icon="material-symbols-light:expand-circle-down-outline"
            className="size-2"
          />
        </div>
        <p className="w-full">에피소드 25개</p>
        <p className="w-full">진심어린 로맨틱 첫사랑</p>
      </div>
    </motion.div>
  );
}

function PageIndicator({
  maxPage,
  curPage,
}: {
  maxPage: number;
  curPage: number;
}) {
  return (
    <ul className="mt-1 inline-flex gap-[1px]">
      {Array.from({ length: maxPage }).map((_, index) => (
        <li
          className={twMerge(
            "inline-flex h-0.5 w-3 bg-zinc-600",
            index === curPage && "bg-zinc-400",
          )}
          key={index}
        />
      ))}
    </ul>
  );
}

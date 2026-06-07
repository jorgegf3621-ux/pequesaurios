import { useEffect, useRef } from "react";

const FRAME_COUNT = 203;
const SEQUENCE_PATH = "/sequence/frame_";

function preloadImages(): HTMLImageElement[] {
  return Array.from({ length: FRAME_COUNT }, (_, i) => {
    const img = new Image();
    img.src = `${SEQUENCE_PATH}${i}.jpg`;
    return img;
  });
}

const ScrollSequence = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const currentProgressRef = useRef(0);

  useEffect(() => {
    imagesRef.current = preloadImages();

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(frameRef.current, ctx, canvas);
    };

    const drawFrame = (index: number, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const img = imagesRef.current[index];
      if (!img?.naturalWidth) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Cover-fit: fill canvas preserving aspect ratio
      const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.drawImage(img, x, y, w, h);
    };

    let targetProgress = 0;

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const totalScroll = container.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      targetProgress = Math.max(0, Math.min(1, scrolled / totalScroll));
    };

    const tick = () => {
      // lerp for buttery smoothness without lag
      currentProgressRef.current += (targetProgress - currentProgressRef.current) * 0.1;

      const newFrame = Math.min(
        FRAME_COUNT - 1,
        Math.floor(currentProgressRef.current * (FRAME_COUNT - 1))
      );

      if (newFrame !== frameRef.current || currentProgressRef.current < 0.001) {
        frameRef.current = newFrame;
        drawFrame(newFrame, ctx, canvas);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    // Draw first frame once loaded
    const firstImg = imagesRef.current[0];
    if (firstImg.complete) {
      drawFrame(0, ctx, canvas);
    } else {
      firstImg.onload = () => drawFrame(0, ctx, canvas);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ height: "500vh" }} className="relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-background">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
};

export default ScrollSequence;

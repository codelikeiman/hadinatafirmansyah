import { useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { Card3DContext, useCard3DHover } from "./card3d-context";

/**
 * Aceternity — 3D Card Effect: kartu miring mengikuti kursor; tiap CardItem
 * "melayang" pada kedalaman translateZ berbeda saat kartu di-hover.
 */
export function CardContainer({ children, className, containerClassName, intensity = 22 }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  const onMove = e => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) / intensity;
    const y = (e.clientY - r.top - r.height / 2) / intensity;
    el.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
  };
  const onLeave = () => {
    setHovered(false);
    if (ref.current) ref.current.style.transform = "rotateY(0deg) rotateX(0deg)";
  };

  return (
    <Card3DContext.Provider value={hovered}>
      <div className={cn("flex items-center justify-center", containerClassName)} style={{ perspective: "1000px" }}>
        <div
          ref={ref}
          onPointerEnter={() => setHovered(true)}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          className={cn("relative flex items-center justify-center transition-transform duration-200 ease-linear [transform-style:preserve-3d]", className)}
        >
          {children}
        </div>
      </div>
    </Card3DContext.Provider>
  );
}

export function CardBody({ children, className }) {
  return <div className={cn("[transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]", className)}>{children}</div>;
}

export function CardItem({ as: Tag = "div", children, className, translateX = 0, translateY = 0, translateZ = 0, rotateX = 0, rotateY = 0, rotateZ = 0, ...rest }) {
  const hovered = useCard3DHover();
  const transform = hovered
    ? `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`
    : "translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)";
  return (
    <Tag className={cn("w-fit transition duration-200 ease-linear", className)} style={{ transform }} {...rest}>
      {children}
    </Tag>
  );
}

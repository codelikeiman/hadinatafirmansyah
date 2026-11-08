import { useEffect, useRef, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}=+*^?#ｱｲｳ01";

/** Teks yang "di-decode" dari karakter acak saat mount & saat di-hover. */
export default function Scramble({ text, speed = 30, as: Tag = "span", ...rest }) {
  const [out, setOut] = useState(text);
  const timer = useRef(0);

  const run = () => {
    clearInterval(timer.current);
    let i = 0;
    timer.current = setInterval(() => {
      setOut(text.split("").map((ch, k) => (k < i || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join(""));
      if (++i > text.length) {
        clearInterval(timer.current);
        setOut(text);
      }
    }, speed);
  };

  useEffect(() => {
    run();
    return () => clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- jalankan ulang hanya saat teks berganti
  }, [text]);

  return <Tag onMouseEnter={run} {...rest}>{out}</Tag>;
}

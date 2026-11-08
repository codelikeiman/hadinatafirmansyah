import { prefetchRoute } from "./routes";
import { useNavigate } from "./router-context";

/** <a> yang sadar router: prefetch saat hover/focus, transisi VT saat klik. */
export default function Link({ to, children, onClick, prefetch = true, ...rest }) {
  const navigate = useNavigate();
  const warm = prefetch ? () => prefetchRoute(to) : undefined;
  return (
    <a
      href={"#" + to}
      onMouseEnter={warm}
      onFocus={warm}
      onClick={e => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

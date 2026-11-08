import { createContext, useContext } from "react";

export const Card3DContext = createContext(false);
export const useCard3DHover = () => useContext(Card3DContext);

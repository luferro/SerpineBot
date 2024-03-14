import type { ReactNode } from "react";
import { StyledMain } from "./Main.styled";

type Props = { children: ReactNode };

export const Main = ({ children }: Props) => <StyledMain>{children}</StyledMain>;

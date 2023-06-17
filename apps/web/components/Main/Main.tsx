import { ReactNode } from 'react';

import { StyledMain } from './Main.styled';

export const Main = ({ children }: { children: ReactNode }) => {
	return <StyledMain>{children}</StyledMain>;
};

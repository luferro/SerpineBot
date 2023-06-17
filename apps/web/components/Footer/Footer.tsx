import { Image } from '@mantine/core';

import { StyledFooter } from './Footer.styled';

export const Footer = () => {
	return (
		<StyledFooter>
			<a href="https://github.com/luferro" target="_blank" rel="noopener noreferrer">
				<Image src={'/svg/github.svg'} alt="Github icon" width={48} height={48} />
			</a>
			<a href="https://www.linkedin.com/in/luis-ferro/" target="_blank" rel="noopener noreferrer">
				<Image src={'/svg/linkedin.svg'} alt="LinkedIn icon" width={48} height={48} />
			</a>
		</StyledFooter>
	);
};

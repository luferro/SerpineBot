import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<MantineProvider withGlobalStyles withNormalizeCSS>
			<Component {...pageProps} />
		</MantineProvider>
	);
};

export default App;

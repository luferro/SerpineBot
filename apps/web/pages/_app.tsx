import { MantineProvider } from '@mantine/core';
import { marked } from 'marked';
import type { AppProps } from 'next/app';

marked.setOptions({ mangle: false, headerIds: false });

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<MantineProvider
			withGlobalStyles
			withNormalizeCSS
			theme={{
				globalStyles: () => ({
					'html,body': {
						color: '#fff',
						background: '#36393f',
						padding: 0,
						margin: 0,
					},
					'*': {
						wordBreak: 'keep-all',
						boxSizing: 'border-box',
					},
					'a': {
						textDecoration: 'none',
					},
					'blockquote,p': {
						margin: 0,
					},
				}),
			}}
		>
			<Component {...pageProps} />
		</MantineProvider>
	);
};

export default App;

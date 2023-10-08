import { createTheme, GlobalStyles, ThemeProvider } from '@mui/material';
import type { AppProps } from 'next/app';

const theme = createTheme({
	typography: {
		fontFamily: `-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji`,
	},
	palette: {
		common: { black: '#18191c' },
		background: { default: '#36393f', paper: '#202225' },
		primary: { main: '#5865f2' },
		secondary: { main: '#292b2f' },
		text: { primary: '#fff', secondary: '#868e96' },
		info: { main: '#ff3131' },
	},
});

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<ThemeProvider theme={theme}>
			<GlobalStyles
				styles={{
					'*': { wordBreak: 'keep-all', boxSizing: 'border-box' },
					'html, body': {
						fontFamily: theme.typography.fontFamily,
						color: theme.palette.text.primary,
						background: theme.palette.background.default,
						padding: 0,
						margin: 0,
					},
					'blockquote, p': { margin: 0 },
					'a': { textDecoration: 'none' },
				}}
			/>
			<Component {...pageProps} />
		</ThemeProvider>
	);
};

export default App;

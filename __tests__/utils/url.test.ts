import * as UrlUtil from '../../src/utils/url';

describe('Url utility', () => {
	it('should verify that an url is valid', () => {
		expect(UrlUtil.isValid('https://github.com/')).toBe(true);
	});

	it('should verify that an url is invalid', () => {
		expect(UrlUtil.isValid('://github.com/')).toBe(false);
	});

	it('should return the redirect location when an url is present in a query parameter', async () => {
		const redirectedUrlWithQueryParams = await UrlUtil.getRedirectLocation(
			'https://click.justwatch.com/a?cx=eyJzY2hlbWEiOiJpZ2x1OmNvbS5zbm93cGxvd2FuYWx5dGljcy5zbm93cGxvdy9jb250ZXh0cy9qc29uc2NoZW1hLzEtMC0wIiwiZGF0YSI6W3sic2NoZW1hIjoiaWdsdTpjb20uanVzdHdhdGNoL2NsaWNrb3V0X2NvbnRleHQvanNvbnNjaGVtYS8xLTItMCIsImRhdGEiOnsicHJvdmlkZXIiOiJEaXNuZXkgUGx1cyIsIm1vbmV0aXphdGlvblR5cGUiOiJmbGF0cmF0ZSIsInByZXNlbnRhdGlvblR5cGUiOiI0ayIsImN1cnJlbmN5IjoiRVVSIiwicHJpY2UiOjAsIm9yaWdpbmFsUHJpY2UiOjAsImF1ZGlvTGFuZ3VhZ2UiOiIiLCJzdWJ0aXRsZUxhbmd1YWdlIjoiIiwiY2luZW1hSWQiOjAsInNob3d0aW1lIjoiIiwiaXNGYXZvcml0ZUNpbmVtYSI6ZmFsc2UsInBhcnRuZXJJZCI6NiwicHJvdmlkZXJJZCI6MzM3LCJjbGlja291dFR5cGUiOiJqdy1jb250ZW50LXBhcnRuZXItZXhwb3J0LWFwaSJ9fSx7InNjaGVtYSI6ImlnbHU6Y29tLmp1c3R3YXRjaC90aXRsZV9jb250ZXh0L2pzb25zY2hlbWEvMS0wLTAiLCJkYXRhIjp7InRpdGxlSWQiOjIxOTAwMywib2JqZWN0VHlwZSI6InNob3ciLCJqd0VudGl0eUlkIjoidHMyMTkwMDMiLCJzZWFzb25OdW1iZXIiOjAsImVwaXNvZGVOdW1iZXIiOjB9fV19&r=https%3A%2F%2Fdisneyplus.bn5x.net%2Fc%2F1206980%2F705874%2F9358%3Fu%3Dhttps%253A%252F%252Fwww.disneyplus.com%252Fseries%252Fmoon-knight%252F4S3oOF1knocS%26subId3%3Djustappsvod&uct_country=pt',
		);

		expect(redirectedUrlWithQueryParams).toBe('https://www.disneyplus.com/series/moon-knight/4S3oOF1knocS');
	});

	it('should return the original location when no url is present in a query parameter', async () => {
		const redirectedUrlWithoutQueryParams = await UrlUtil.getRedirectLocation('https://github.com/');

		expect(redirectedUrlWithoutQueryParams).toBe('https://github.com/');
	});
});

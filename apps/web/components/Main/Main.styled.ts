import styled from '@emotion/styled';

export const StyledMain = styled.main`
	margin: 20px auto 0;
	width: 80%;
	& > div:last-child {
		margin-top: 50px;
	}
	@media (max-width: 600px) {
		width: 95%;
	}
`;

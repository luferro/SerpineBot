import styled from '@emotion/styled';

export const StyledOptionsPanel = styled.div`
	width: 100%;
	display: flex;
	& > div {
		width: 0;
		flex-grow: 1;
	}
	@media (max-width: 600px) {
		flex-direction: column;
		& > div {
			width: inherit;
		}
		& > div:last-child {
			margin-top: 20px;
		}
	}
`;

export const StyledCommand = styled.div`
	margin-top: 8px;
	display: flex;
	gap: 10px;
	align-items: center;
	@media (max-width: 600px) {
		overflow: auto;
		white-space: nowrap;
	}
`;

export const StyledOption = styled.div`
	& :first-child {
		background: #18191c;
		padding: 3px 8px;
		border-radius: 4px;
		border: 1px solid transparent;
	}
`;

export const StyledOptionsList = styled.div`
	margin-top: 32px;
	& div {
		display: flex;
		gap: 10px;
		align-items: center;
		margin-top: 5px;
	}
`;

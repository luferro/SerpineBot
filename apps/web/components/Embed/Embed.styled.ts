import styled from '@emotion/styled';

export const StyledEmbed = styled.div`
	box-shadow:
		0 1px 1px hsl(0deg 0% 0% / 0.075),
		0 2px 2px hsl(0deg 0% 0% / 0.075),
		0 4px 4px hsl(0deg 0% 0% / 0.075),
		0 8px 8px hsl(0deg 0% 0% / 0.075),
		0 16px 16px hsl(0deg 0% 0% / 0.075);
	max-width: 516px;
	background: #2f3136;
	padding: 0.5rem 1rem 1rem 0.75rem;
	border-radius: 4px;
	& a {
		font-size: 1rem;
		font-weight: 600;
		text-decoration: none;
		color: #00aff4;
	}
`;

export const StyledContent = styled.div`
	width: 100%;
	display: flex;
	& > div {
		margin-right: 8px;
	}
`;

export const StyledAuthor = styled.div`
	display: flex;
	font-size: 0.875rem;
	font-weight: 600;
	& img {
		width: 24px;
		height: 24px;
		object-fit: contain;
		border-radius: 50%;
		margin-right: 8px;
		margin-bottom: 8px;
	}
`;

export const StyledTitle = styled.div`
	& a {
		margin-top: 8px;
	}
`;

export const StyledDescription = styled.div`
	margin-top: 8px;
`;

export const StyledFields = styled.div`
	display: flex;
	flex-wrap: wrap;
	flex-direction: column;
	&:has(.inline-field) {
		flex-direction: row;
	}
	& .inline-field {
		flex-basis: 30%;
	}
	& .field,
	.inline-field {
		text-wrap: nowrap;
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		font-size: 0.875rem;
		line-height: 1.125rem;
		font-weight: 400;
		width: 100%;
	}
	& div :first-child {
		margin-bottom: 2px;
	}
	@media (max-width: 600px) {
		& .field,
		.inline-field {
			flex-basis: 100%;
		}
	}
`;

export const StyledThumbnail = styled.div`
	margin-top: 8px;
	& img {
		max-width: 80px;
		max-height: 80px;
	}
`;

export const StyledImage = styled.div`
	margin-top: 16px;
	& img {
		max-width: 200px;
		max-height: 300px;
		width: 100%;
		display: block;
		aspect-ratio: 200 / 300;
	}
`;

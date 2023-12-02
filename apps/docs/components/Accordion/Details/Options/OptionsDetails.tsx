import { Box, Typography } from '@mui/material';

import { Option } from '../../../../types/bot';
import { Embed } from '../../../Embed/Embed';
import { StyledOption } from './OptionsDetails.styled';

type Props = {
	metadata: { name: string; description?: string };
	options: Option[];
};

export const OptionsDetails = ({ metadata, options }: Props) => {
	const hasRequiredOptions = options.some((option) => option.required);
	return (
		<>
			<Box display="flex" flexDirection="column" gap={5}>
				<Box>
					<Box display="flex" alignItems="center" gap={2} whiteSpace="nowrap" overflow="auto">
						<Typography fontWeight={700}>/{metadata.name.replace(/\./g, ' ')}</Typography>
						{options?.map((option, index) => <StyledOption key={index}>{option.name}</StyledOption>)}
					</Box>
					<Typography fontSize={14} fontStyle="italic">
						{metadata.description}
					</Typography>
				</Box>
				{!!options.length && (
					<Box>
						<Typography fontWeight={700}>Command options</Typography>
						{options.map((option, index) => (
							<Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }} key={index}>
								<StyledOption>{option.name}</StyledOption>
								<Typography whiteSpace="nowrap" overflow="auto">
									{option.description}
								</Typography>
								{option.required && <Typography color="#ff3131">*</Typography>}
							</Box>
						))}
						{hasRequiredOptions && (
							<Typography color={(theme) => theme.palette.info.main} sx={{ mt: 1 }}>
								* Required.
							</Typography>
						)}
					</Box>
				)}
			</Box>
			<Box>
				<Typography fontWeight={700} marginBottom={1}>
					Embed sample
				</Typography>
				<Embed sample={metadata.name} />
			</Box>
		</>
	);
};

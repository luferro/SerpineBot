import { Text } from '@mantine/core';
import { marked } from 'marked';
import parse from 'html-react-parser';
import styles from '../styles/Home.module.css';

interface Props {
	title: string;
	description: string;
}

const Details = ({ title, description }: Props) => {
	return (
		<div className={styles.details}>
			<Text size="xl">{parse(marked.parse(title))}</Text>
			<Text size="md" color="dimmed">
				{parse(marked.parse(description))}
			</Text>
		</div>
	);
};

export default Details;

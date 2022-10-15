import { marked } from 'marked';
import parse from 'html-react-parser';
import styles from '../styles/Home.module.css';
import { useEffect, useState } from 'react';

interface Props {
	author: {
		icon?: string;
		name: string;
	} | null;
	title: string;
	url: string | null;
	description: string | null;
	fields: {
		key: string;
		value: string;
		inline: boolean;
	}[];
	thumbnail: string | null;
	image: string | null;
}

const Embed = ({ author, title, url, description, fields, thumbnail, image }: Props) => {
	const [color, setColor] = useState('#fff');

	useEffect(() => setColor(`#${Math.floor(Math.random() * 16777215).toString(16)}`), []);

	return (
		<div className={styles.embed} style={{ borderLeft: `4px solid ${color}` }}>
			<div className={styles['embed-content']}>
				<div className={styles['embed-content-inner']}>
					<div className={styles['embed-author']}>
						{author && author.icon ? (
							<>
								<picture>
									<source srcSet={author.icon} type="image/webp" />
									<img src={author.icon} alt="Embed author icon" loading="lazy" />
								</picture>
								<span>{author.name}</span>
							</>
						) : (
							''
						)}
					</div>
					<div className={styles['embed-title']}>
						{url ? (
							<a href={url} rel="noreferrer noopener" target="_blank">
								{parse(marked.parse(title))}
							</a>
						) : (
							parse(marked.parse(title))
						)}
					</div>
					{description ? (
						<div className={styles['embed-description']}>{parse(marked.parse(description))}</div>
					) : (
						''
					)}
					<div className={styles['embed-fields']}>
						{fields?.map(({ key, value, inline }) => (
							<div className={inline ? styles['embed-field-inline'] : styles['embed-field']} key={key}>
								<div className={styles['embed-field-key']}>{parse(marked.parse(key))}</div>
								<div className={styles['embed-field-value']}>{parse(marked.parse(value))}</div>
							</div>
						)) ?? ''}
					</div>
				</div>

				{thumbnail ? (
					<div className={styles['embed-thumbnail']}>
						<picture>
							<source srcSet={thumbnail} type="image/webp" />
							<img src={thumbnail} alt="Embed thumbnail" loading="lazy" />
						</picture>
					</div>
				) : (
					''
				)}
			</div>
			{image ? (
				<div className={styles['embed-image']}>
					<picture>
						<source srcSet={image} type="image/webp" />
						<img src={image} alt="Embed image" loading="lazy" />
					</picture>
				</div>
			) : (
				''
			)}
		</div>
	);
};

export default Embed;

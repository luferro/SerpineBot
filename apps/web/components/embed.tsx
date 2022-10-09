import { marked } from 'marked';
import parse from 'html-react-parser';
import styles from '../styles/Home.module.css';

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
	return (
		<div
			className={styles.embed}
			style={{ borderLeft: `4px solid #${Math.floor(Math.random() * 16777215).toString(16)}` }}
		>
			<div className={styles['embed-content']}>
				<div className={styles['embed-content-inner']}>
					<div className={styles['embed-author']}>
						{author ? (
							<>
								<img src={author.icon} alt="Author icon" />
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
						<img alt="Thumbnail" src={thumbnail} />{' '}
					</div>
				) : (
					''
				)}
			</div>
			{image ? (
				<div className={styles['embed-image']}>
					<img alt="Image" src={image ?? ''} />
				</div>
			) : (
				''
			)}
		</div>
	);
};

export default Embed;

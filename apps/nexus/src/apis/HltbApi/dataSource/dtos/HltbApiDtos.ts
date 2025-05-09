export type Payload<T> = {
	props: {
		pageProps: {
			game: {
				data: { game: T };
			};
		};
	};
};

export type Result = {
	data: { game_id: string; game_name: string; release_world: number }[];
};

export type Playtime = {
	game_name: string;
	game_image: string;
	comp_main: number;
	comp_plus: number;
	comp_100: number;
};

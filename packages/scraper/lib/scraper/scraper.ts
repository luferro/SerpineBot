import { RSS } from "./rss/rss";
import { SearchEngine } from "./search-engine/searchEngine";
import { InteractiveScraper } from "./web-pages/interactive";
import { StaticScraper } from "./web-pages/static";
import { Youtube } from "./youtube/youtube";

export class Scraper {
	rss: RSS;
	youtube: Youtube;
	engine: SearchEngine;
	static: StaticScraper;
	interactive: InteractiveScraper;

	constructor() {
		const staticScraper = new StaticScraper();
		const interactiveScraper = new InteractiveScraper();

		this.youtube = new Youtube();
		this.static = staticScraper;
		this.interactive = interactiveScraper;
		this.rss = new RSS({ staticScraper });
		this.engine = new SearchEngine({ staticScraper, interactiveScraper });
	}
}

import { RSS } from "./rss/rss.js";
import { SearchEngine } from "./search-engine/searchEngine.js";
import { InteractiveScraper } from "./web-pages/interactive.js";
import { StaticScraper } from "./web-pages/static.js";
import { Youtube } from "./youtube/youtube.js";

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
		this.rss = new RSS(staticScraper);
		this.engine = new SearchEngine(staticScraper, interactiveScraper);
	}
}

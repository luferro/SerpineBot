import { getReviewsDetails } from './api/reviews/reviews.scraper';

// APIs
export * as GamingApi from './api/gaming';

(async () => {
	console.log(await getReviewsDetails('https://opencritic.com/game/14514/pikmin-4'));
})();

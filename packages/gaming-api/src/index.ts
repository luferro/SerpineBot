import { auth, getLatestDeals } from './api/itad/itad.api';

// APIs
export * as GamingApi from './api/gaming';

(async () => {
	auth.setApiKey('824b2149a1385e7998d19a619f76bf9eefd5d6e3');
	auth.validate();
	const deals = await getLatestDeals();
	console.log(deals.length);
	console.log(deals.at(0));
})();

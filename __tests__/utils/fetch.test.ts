import { fetch } from '../../src/utils/fetch';

describe('Fetch service', () => {
	it('should make a GET request', async () => {
		const data = await fetch({ url: 'https://jsonplaceholder.typicode.com/posts/1' });

		expect(data).toHaveProperty('id');
	});

	it('should make a POST request', async () => {
		const body = JSON.stringify({
			title: 'foo',
			body: 'bar',
			userId: 1,
		});
		const data = await fetch({ method: 'POST', url: 'https://jsonplaceholder.typicode.com/posts', body });

		expect(data).toHaveProperty('id');
	});

	it('should make a PUT request', async () => {
		const body = JSON.stringify({
			id: 1,
			title: 'foo',
			body: 'bar',
			userId: 1,
		});
		const data = await fetch({ method: 'PUT', url: 'https://jsonplaceholder.typicode.com/posts/1', body });

		expect(data).toHaveProperty('id');
	});

	it('should make a PATCH request', async () => {
		const body = JSON.stringify({
			title: 'foo',
		});
		const data = await fetch({ method: 'PATCH', url: 'https://jsonplaceholder.typicode.com/posts/1', body });

		expect(data).toHaveProperty('id');
	});

	it('should make a DELETE request', async () => {
		const data = await fetch({ method: 'DELETE', url: 'https://jsonplaceholder.typicode.com/posts/1' });

		expect(data).toStrictEqual({});
	});
});

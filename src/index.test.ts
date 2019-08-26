import { queryString } from '.';

describe('queryString', () => {
  it('can create a query string', () => {
    const parameters = {
      first: 'thing',
      numerical: 20,
      complex: 'thing with spaces'
    };

    const query = queryString(parameters);

    expect(query).toEqual('?first=thing&numerical=20&complex=thing%20with%20spaces');
  });
});

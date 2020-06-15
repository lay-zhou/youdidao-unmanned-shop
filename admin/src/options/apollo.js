import { setContext } from 'apollo-link-context';

const authLink = setContext(async (_, { headers }) => {
  const accessToken = localStorage.getItem('accessToken');

  const authorizationHeader = accessToken ? { authorization: `Bearer ${accessToken}` } : {};

  return {
    headers: {
      ...headers,
      ...authorizationHeader,
    },
  };
});

export const cacheOptions = {};

export const extraLinks = [authLink];

import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import { useScreens } from 'react-native-screens'; // eslint-disable-line import/no-unresolved

import { apolloClient } from '@leaa/app/src/libs/apollo-client.lib';
import { AppBottomTabbar } from '@leaa/app/src/components/AppBottomTabbar';

useScreens(); // @see https://reactnavigation.org/docs/en/react-native-screens.html

export default () => (
  <ApolloProvider client={apolloClient}>
    <AppBottomTabbar />
  </ApolloProvider>
);
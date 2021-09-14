import TitleBar from 'components/TitleBar';
import React from 'react';
import GraphiQL from 'graphiql';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { css } from 'emotion';
import { RDPC_GATEWAY } from 'config/globals';
import 'graphiql/graphiql.css';

const NAVBAR_HEIGHT = '62px';
const TITLEBAR_HEIGHT = '68px';

export default ({ token }: { token: string }) => {
  const graphQLFetcher = createGraphiQLFetcher({
    url: RDPC_GATEWAY,
    headers: { Authorization: `Bearer ${token}` },
  });

  return (
    <div
      className={css`
        height: calc(100% - ${NAVBAR_HEIGHT} - ${TITLEBAR_HEIGHT});
      `}
    >
      <div style={{ padding: '20px 20px 0 20px', marginBottom: '-10px' }}>
        <TitleBar page={'GQL Playground'} />
      </div>
      <GraphiQL fetcher={graphQLFetcher} />
    </div>
  );
};

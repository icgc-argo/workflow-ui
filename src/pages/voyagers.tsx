import React from "react";
import { Voyager } from "graphql-voyager";
import ApolloClient from "apollo-client";
import gql from "graphql-tag";
import { css } from "emotion";

export default ({ client }: { client: ApolloClient<any> }) => {
  return (
    <div
      className={css`
        height: calc(100% - 58px);
      `}
    >
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/graphql-voyager/dist/voyager.css"
      />
      <Voyager
        workerURI={process.env.PUBLIC_URL + "/voyager.worker.js"}
        introspection={query =>
          client.query({
            query: gql`
              ${query}
            `
          })
        }
      />
    </div>
  );
};

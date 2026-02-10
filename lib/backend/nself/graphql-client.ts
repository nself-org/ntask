import { GraphQLClient } from 'graphql-request';
import { config } from '@/lib/config';

let graphqlInstance: GraphQLClient | null = null;
let currentToken: string | null = null;

export function getGraphQLClient(token?: string): GraphQLClient {
  if (!graphqlInstance || token !== currentToken) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      currentToken = token;
    }
    // Note: admin secret should only be used server-side (API routes).
    // Client-side requests use the user's JWT token from auth.

    graphqlInstance = new GraphQLClient(config.nself.graphqlUrl, { headers });
  }
  return graphqlInstance;
}

export function updateGraphQLToken(token: string | null): void {
  currentToken = token;
  graphqlInstance = null;
}

import { createTRPCReact } from '@trpc/react-query';

/**
 * A set of typesafe hooks for consuming the API.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trpc = createTRPCReact<any>() as any;

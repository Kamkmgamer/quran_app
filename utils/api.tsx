import { createTRPCReact } from '@trpc/react-query';

/**
 * A set of typesafe hooks for consuming the API.
 *
 * Using 'any' to bypass strict router validation issues in v11 beta
 * and to avoid type sharing complexity for now.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trpc = createTRPCReact<any>() as any;

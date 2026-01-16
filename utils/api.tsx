import { createTRPCReact } from '@trpc/react-query';
import type { AnyRouter } from '@trpc/server';

/**
 * A set of typesafe hooks for consuming the API.
 */
export const trpc = createTRPCReact<AnyRouter>() as any;

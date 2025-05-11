declare module "commercex" {
  import { FastifyInstance, FastifyServerOptions } from "fastify";
  import { LoggerOptions } from "pino";

  export interface PluginConfig {
    name: string;
    path: string;
    options?: Record<string, any>;
  }

  export interface CommerceXOptions extends FastifyServerOptions {
    logger?: LoggerOptions;
  }

  export interface CommerceXConfig {
    server: {
      port: number;
    };
    plugins: PluginConfig[];
  }

  /**
   * Initializes the CommerceX server with the specified options.
   *
   * @param options - Configuration options for the CommerceX server.
   * @returns A FastifyInstance representing the CommerceX server.
   */
  export default function commercex(options?: CommerceXOptions): Promise<FastifyInstance>;
}

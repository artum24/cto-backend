declare module 'prisma/config' {
  export function defineConfig(config: {
    schema: string;
    datasource?: { url: string };
  }): unknown;
  export function env(name: string): string;
}

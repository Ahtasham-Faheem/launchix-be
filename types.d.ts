

declare module 'handlebars-helpers' {
  import { HandlebarsInstance } from 'handlebars';

  interface HelpersOptions {
    handlebars: HandlebarsInstance;
  }

  const helpers: (options: HelpersOptions) => void;
  export = helpers;
}

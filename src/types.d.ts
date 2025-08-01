import { Profile } from './business-profile/schemas/Profile.schema';
import { User } from './users/schemas/user.schema';

declare module 'express' {
  interface Request {
    user?: User;
    profile?: Profile;
  }
}

export interface JwtPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

declare module 'handlebars-helpers' {
  import { HandlebarsInstance } from 'handlebars';

  interface HelpersOptions {
    handlebars: HandlebarsInstance;
  }

  const helpers: (options: HelpersOptions) => void;
  export = helpers;
}

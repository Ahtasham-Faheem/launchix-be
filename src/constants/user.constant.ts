export enum UserRole {
  ADMIN = 'admin',
  SALES = 'sales',
  SUPPORT = 'support',
  USER = 'user',
}


export const allowedAdminPannelRoles: UserRole[] = [
  UserRole.ADMIN,
  UserRole.SALES,
  UserRole.SUPPORT,
];
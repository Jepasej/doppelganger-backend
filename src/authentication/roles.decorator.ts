import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Binds the required target role to the endpoint metadata
export function Roles(role: string) {
  return SetMetadata(ROLES_KEY, [role]);
}

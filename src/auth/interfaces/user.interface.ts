import { Role } from '../enums/role.enum';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
}

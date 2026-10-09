import { Role } from '../enums/role.enum';
import { User } from '../interfaces/user.interface';

export const USERS_MOCK: User[] = [
  {
    id: '1',
    username: 'admin',
    name: 'Administrador Principal',
    role: Role.ADMIN,
  },
  {
    id: '2',
    username: 'admin1',
    name: 'Administrador Secundario',
    role: Role.ADMIN,
  },
  {
    id: '3',
    username: 'supervisor',
    name: 'Supervisor General',
    role: Role.SUPERVISOR,
  },
  {
    id: '4',
    username: 'supervisor1',
    name: 'Supervisor de Turno',
    role: Role.SUPERVISOR,
  },
  {
    id: '5',
    username: 'asesor',
    name: 'Asesor Comercial Base',
    role: Role.ASESOR,
  },
  {
    id: '6',
    username: 'asesor1',
    name: 'Asesor Comercial 1',
    role: Role.ASESOR,
  },
  {
    id: '7',
    username: 'asesor2',
    name: 'Asesor Comercial 2',
    role: Role.ASESOR,
  },
  {
    id: '8',
    username: 'asesor_carlos',
    name: 'Asesor Carlos Mendoza',
    role: Role.ASESOR,
  },
];

import { Injectable } from '@nestjs/common';
import { USERS_MOCK } from '../constants/users.mock';
import { User } from '../interfaces/user.interface';

@Injectable()
export class UsersService {
  private readonly users: User[] = USERS_MOCK;

  findByUsername(username: string): User | undefined {
    if (!username) return undefined;
    return this.users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase(),
    );
  }

  findAll(): User[] {
    return this.users;
  }
}

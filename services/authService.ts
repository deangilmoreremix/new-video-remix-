import { User } from '../types';

const DB_KEY = 'lumina_users_db';
const SESSION_KEY = 'lumina_session';

// Mock Database interface
interface DB {
  users: (User & { password: string })[];
}

class AuthService {
  private getDB(): DB {
    const dbStr = localStorage.getItem(DB_KEY);
    return dbStr ? JSON.parse(dbStr) : { users: [] };
  }

  private saveDB(db: DB) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(SESSION_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  login(email: string, password: string): User {
    const db = this.getDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Strip password for session
    const sessionUser: User = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  }

  signup(email: string, password: string, name: string): User {
    const db = this.getDB();
    if (db.users.some(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      password,
      name
    };

    db.users.push(newUser);
    this.saveDB(db);

    return this.login(email, password);
  }

  logout() {
    localStorage.removeItem(SESSION_KEY);
  }
}

export const authService = new AuthService();
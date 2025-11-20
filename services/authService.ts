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
      email: user.email,
      purchasedTools: user.purchasedTools
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
      name,
      purchasedTools: []
    };

    db.users.push(newUser);
    this.saveDB(db);

    return this.login(email, password);
  }

  logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  purchaseTool(userId: string, toolId: string): User {
    const db = this.getDB();
    const userIndex = db.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) throw new Error('User not found');

    if (!db.users[userIndex].purchasedTools.includes(toolId)) {
      db.users[userIndex].purchasedTools.push(toolId);
      this.saveDB(db);
    }

    // Update session
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.purchasedTools = db.users[userIndex].purchasedTools;
      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      return currentUser;
    }
    
    // Return updated user structure from DB (without password)
    const { password, ...safeUser } = db.users[userIndex];
    return safeUser as User;
  }
}

export const authService = new AuthService();
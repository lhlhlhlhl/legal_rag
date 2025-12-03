import bcrypt from 'bcryptjs';
import { User } from './auth';

// 模拟用户数据库（实际项目中应该使用 Supabase 或其他数据库）
interface UserWithPassword extends User {
  password: string;
  createdAt: Date;
}

// 内存存储（仅用于演示，生产环境应使用真实数据库）
const users: Map<string, UserWithPassword> = new Map();

/**
 * 创建新用户
 */
export async function createUser(email: string, password: string, name: string): Promise<User | null> {
  // 检查用户是否已存在
  if (findUserByEmail(email)) {
    return null;
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10);

  // 生成用户ID
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const user: UserWithPassword = {
    id: userId,
    email,
    name,
    password: hashedPassword,
    createdAt: new Date(),
  };

  users.set(email, user);

  // 返回不包含密码的用户信息
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

/**
 * 通过邮箱查找用户
 */
export function findUserByEmail(email: string): UserWithPassword | null {
  return users.get(email) || null;
}

/**
 * 通过ID查找用户
 */
export function findUserById(userId: string): User | null {
  for (const user of users.values()) {
    if (user.id === userId) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    }
  }
  return null;
}

/**
 * 验证用户密码
 */
export async function verifyPassword(email: string, password: string): Promise<User | null> {
  const user = findUserByEmail(email);
  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

/**
 * 获取所有用户（不包含密码）
 */
export function getAllUsers(): User[] {
  return Array.from(users.values()).map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
  }));
}

// 创建一个测试用户（可选）
createUser('test@legalgpt.com', 'password123', '测试用户').then(user => {
  if (user) {
    console.log('✅ 测试用户已创建:', user.email);
  }
});

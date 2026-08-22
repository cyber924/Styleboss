import type { UserProfile } from '../types';

export const ADMIN_EMAILS = [
  'cyber924@naver.com',
  'cyber924@gmail.com'
];

export function isAdminUser(user: UserProfile | null): boolean {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'manager') return true;
  if (!user.email) return false;
  
  const normalizedEmail = user.email.trim().toLowerCase();
  return (
    ADMIN_EMAILS.includes(normalizedEmail) ||
    normalizedEmail.startsWith('admin@') ||
    normalizedEmail === 'admin' ||
    normalizedEmail.startsWith('manager@')
  );
}

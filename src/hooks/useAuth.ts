import { useAppSelector } from '../hook';

export function useAuth() {
  const { token, user, loading, error } = useAppSelector((s) => s.auth);

  const isAuthenticated = !!token && !!user;
  const role = user?.role ?? 'user';

  const isAdmin = role === 'admin';
  const isEmployee = role === 'employee';
  const isStaff = isAdmin || isEmployee;

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    role,
    isAdmin,
    isEmployee,
    isStaff,
  };
}

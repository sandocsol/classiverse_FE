import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';

/**
 * AuthContext를 사용하는 커스텀 훅
 * @returns {object} { user, loading, error, login, logout, updateUser, reloadUser }
 * @throws {Error} AuthProvider 외부에서 사용 시 에러 발생
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다.');
  }

  return context;
}
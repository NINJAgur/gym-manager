import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import type { Role } from '../lib/types';
import { Splash } from '../components/Splash';
import { ProfileError } from '../components/ProfileError';

/** Routing guard: no session → sign-in; wrong role → that role's dashboard. */
export function RequireRole({ role }: { role: Role }) {
  const { session, profile, loading, profileError } = useAuth();

  if (loading) return <Splash />;
  if (!session) return <Navigate to="/" replace />;
  if (profileError) return <ProfileError />;
  if (!profile) return <Splash />;
  if (profile.role !== role) return <Navigate to={homeFor(profile.role)} replace />;

  return <Outlet />;
}

export function homeFor(role: Role): string {
  return role === 'trainer' ? '/trainer' : '/trainee';
}

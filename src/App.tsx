import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import type { Role } from './lib/types';
import { Splash } from './components/Splash';
import { ProfileError } from './components/ProfileError';
import { Landing } from './screens/Landing';
import { SignIn } from './screens/SignIn';
import { AccountGate } from './screens/AccountGate';
import { TraineeHome } from './screens/TraineeHome';
import { ExerciseDetail } from './screens/ExerciseDetail';
import { TrainerTrainees } from './screens/TrainerTrainees';
import { UserManagement } from './screens/UserManagement';
import { ExerciseLibrary } from './screens/ExerciseLibrary';
import { ExerciseForm } from './screens/ExerciseForm';
import { ProgramBuilder } from './screens/ProgramBuilder';

export const homeFor = (role: Role) => (role === 'trainer' ? '/trainer' : '/trainee');

export function App() {
  return (
    <Routes>
      {/* Public. Google's OAuth branding review rejects a homepage that is
          only a login screen, so `/` explains the app and `/signin` is the
          sign-in screen. */}
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<Gate>{null}</Gate>} />
      <Route path="/app" element={<Gate>{null}</Gate>} />

      <Route
        path="/trainee"
        element={
          <Gate role="trainee">
            <TraineeHome />
          </Gate>
        }
      />
      {/* No role gate: a trainer opens their own rows from /trainer/me, and
          RLS already limits the data to programs that belong to the viewer. */}
      <Route
        path="/exercise/:itemId"
        element={
          <Gate anyRole>
            <ExerciseDetail />
          </Gate>
        }
      />

      <Route
        path="/trainer"
        element={
          <Gate role="trainer">
            <TrainerTrainees />
          </Gate>
        }
      />
      <Route
        path="/trainer/me"
        element={
          <Gate role="trainer">
            <TraineeHome />
          </Gate>
        }
      />
      <Route
        path="/trainer/users"
        element={
          <Gate role="trainer">
            <UserManagement />
          </Gate>
        }
      />
      <Route
        path="/trainer/exercises"
        element={
          <Gate role="trainer">
            <ExerciseLibrary />
          </Gate>
        }
      />
      <Route
        path="/trainer/exercises/:exerciseId"
        element={
          <Gate role="trainer">
            <ExerciseForm />
          </Gate>
        }
      />
      <Route
        path="/trainer/program/new"
        element={
          <Gate role="trainer">
            <ProgramBuilder />
          </Gate>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/** Session, then approval, then role. A trainee who has not been approved
   never reaches the app — the account status gate sits in front of the role
   check, so pending and deactivated people see why rather than an empty app. */
function Gate({
  role,
  anyRole,
  children,
}: {
  role?: Role;
  /** Signed in is enough — the screen serves both roles. */
  anyRole?: boolean;
  children: React.ReactNode;
}) {
  const { session, profile, loading, profileError } = useAuth();

  if (loading) return <Splash />;
  if (!session) return <SignIn />;
  if (profileError) return <ProfileError />;
  if (!profile) return <Splash />;

  // Trainers are never gated; they are the ones doing the approving.
  if (profile.role !== 'trainer' && profile.status !== 'active') {
    return <AccountGate state={profile.status === 'deactivated' ? 'deactivated' : 'pending'} />;
  }

  if (anyRole) return <>{children}</>;
  // No role and no anyRole means this is a bare entry point (/app, /signin):
  // send the person to whichever home their role implies.
  if (!role) return <Navigate to={homeFor(profile.role)} replace />;
  if (profile.role !== role) return <Navigate to={homeFor(profile.role)} replace />;
  return <>{children}</>;
}

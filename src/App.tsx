import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import { RequireRole, homeFor } from './auth/RequireRole';
import { Splash } from './components/Splash';
import { ProfileError } from './components/ProfileError';
import { Landing } from './screens/Landing';
import { SignIn } from './screens/SignIn';
import { TraineeDashboard } from './screens/TraineeDashboard';
import { ExerciseDetail } from './screens/ExerciseDetail';
import { TrainerDashboard } from './screens/TrainerDashboard';
import { ExerciseCatalogue } from './screens/ExerciseCatalogue';
import { ExerciseEditor } from './screens/ExerciseEditor';

export function App() {
  return (
    <Routes>
      {/* Public. Google's OAuth branding review rejects a homepage that is
          only a login screen, so `/` explains the app and `/signin` keeps the
          design's own sign-in screen. */}
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<SignInGate />} />
      <Route path="/app" element={<RoleRedirect />} />

      <Route element={<RequireRole role="trainee" />}>
        <Route path="/trainee" element={<TraineeDashboard />} />
        <Route path="/trainee/exercise/:exerciseId" element={<ExerciseDetail />} />
      </Route>

      <Route element={<RequireRole role="trainer" />}>
        <Route path="/trainer" element={<TrainerDashboard />} />
        <Route path="/trainer/exercises" element={<ExerciseCatalogue />} />
        <Route path="/trainer/exercises/:exerciseId" element={<ExerciseEditor />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/** Where OAuth returns to, and where the landing page's CTA sends a signed-in
   user: resolve the profile, then hand off to the right dashboard. */
function RoleRedirect() {
  const { session, profile, loading, profileError } = useAuth();

  if (loading) return <Splash />;
  if (!session) return <Navigate to="/signin" replace />;
  if (profileError) return <ProfileError />;
  if (!profile) return <Splash />;
  return <Navigate to={homeFor(profile.role)} replace />;
}

/** Already signed in? Skip the sign-in screen. */
function SignInGate() {
  const { session, profile, loading, profileError } = useAuth();

  if (loading) return <Splash />;
  if (profileError) return <ProfileError />;
  if (session && profile) return <Navigate to={homeFor(profile.role)} replace />;
  return <SignIn />;
}

import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import { RequireRole, homeFor } from './auth/RequireRole';
import { Splash } from './components/Splash';
import { ProfileError } from './components/ProfileError';
import { SignIn } from './screens/SignIn';
import { TraineeDashboard } from './screens/TraineeDashboard';
import { ExerciseDetail } from './screens/ExerciseDetail';
import { TrainerDashboard } from './screens/TrainerDashboard';
import { ExerciseCatalogue } from './screens/ExerciseCatalogue';
import { ExerciseEditor } from './screens/ExerciseEditor';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

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

/** Signed out shows the sign-in overlay; signed in redirects by profile role. */
function Landing() {
  const { session, profile, loading, profileError } = useAuth();

  if (loading) return <Splash />;
  if (!session) return <SignIn />;
  if (profileError) return <ProfileError />;
  if (!profile) return <Splash />;
  return <Navigate to={homeFor(profile.role)} replace />;
}

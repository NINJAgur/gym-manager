# Gym Performance Tracker

React + Vite + Supabase. A trainer assigns exercises to trainees and sets the
weight and reps for each; trainees see what they've been given, the technique
video, and how their numbers have moved. English and Hebrew, full RTL.

Built from the "Gym Tracker v2" Claude Design canvas (light mode, five screens).
The canvas files themselves are not in the repo — see **Design fidelity** below
for how their output survives.

## Setup

1. **Supabase project** — in the SQL editor, run in order:

   | File | What it does |
   |---|---|
   | `supabase/schema.sql` | tables, RLS, views, auth triggers |
   | `supabase/seed.sql` | 23-exercise starter catalogue |
   | `supabase/migration-002-trainer-owned.sql` | trainer owns the numbers; `video_url`, `machine_number` |
   | `supabase/migration-003-video-storage.sql` | public bucket for uploaded videos |

   Requires Postgres 15+ (`security_invoker` views).

2. **Google OAuth** — Authentication → Sign In / Providers → Google. Paste the
   client ID and secret from a Google Cloud OAuth client, and register
   `https://<project-ref>.supabase.co/auth/v1/callback` as an authorised
   redirect URI on the Google side. Add `http://localhost:5173` under
   Authentication → URL Configuration → Redirect URLs.

3. **Env** — `cp .env.example .env`, then fill in the project URL and the
   publishable (anon) key from Project Settings → API Keys.

4. `npm install && npm run dev`

5. **Make yourself a trainer** — sign in once, then:

   ```sql
   update public.profiles set role = 'trainer' where email = 'you@example.com';
   ```

   Everyone else stays `trainee`. The role guard routes each to its dashboard.

`supabase/dev-seed-trainees.sql` fabricates four trainees with assignments and
back-dated history so the trainer screens have something to show. They are
written straight into `auth.users` and cannot sign in — delete them before this
is real.

## Layout

```
supabase/                  schema, seed, migrations

src/lib/css.ts             parses the design's inline CSS strings
src/lib/video.ts           YouTube / Vimeo / direct-file URL → embeddable source
src/lib/viewport.ts        mirrors visualViewport into --app-height
src/auth/                  session + profile, role routing guard
src/i18n/                  EN / עברית strings and direction
src/hooks/useTrainee.ts    assigned exercises, record history
src/hooks/useTrainer.ts    trainees, prescriptions, catalogue CRUD, uploads
src/screens/               SignIn, TraineeDashboard, ExerciseDetail,
                           TrainerDashboard, ExerciseCatalogue, ExerciseEditor
src/components/            Screen, CategoryAccordion, TraineeCard, RecordChart,
                           AssignSheet, VideoEmbed, Sheet, AppMenu
```

## How the data model works

`performance_logs` is not a training log — it is the record of what the trainer
has prescribed. Every save appends a row, so the history list and the sparkline
in the trainer's card are the progression of prescriptions over time. Trainees
have select-only access to it; the `latest_logs` view resolves the current
number per (trainee, exercise).

## Design fidelity

The canvas expressed every style as an inline CSS string. Those strings are kept
verbatim in the components and parsed by `s()` in `src/lib/css.ts`, so the
rendered declarations match the artboard rather than a hand transcription that
drifts. The Modernist design-system tokens live in `src/styles/tokens.css`; the
canvas `<helmet>` block, including its `--color-accent: #e0231a` override, is
`src/styles/global.css`.

Deliberate translations from artboard to app:

- The 390x812 frame becomes the viewport (`src/components/Screen.tsx`), capped at
  the design width and centred so wide screens don't stretch the layout.
- The artboards have no navigation between screens, so the trainee detail gets a
  back button in the video's corner, and the trainer header gets a library icon
  and an account avatar.
- The steppers have no save button in the design — they *are* the edit surface —
  so a change is written 900ms after the last tap.
- Measurements are isolated LTR islands (`.num`), so "80 kg × 6" reads correctly
  inside Hebrew. Exercise names and descriptions use `dir="auto"`.

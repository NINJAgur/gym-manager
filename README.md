# Gym Performance Manager

React + Vite + Supabase. A trainer builds workout programs for their trainees
and sets the sets, reps and weight for each exercise; trainees see their program
as a table, adjust the weight as they train, and watch it move on a chart.
Hebrew only, full RTL.

## Setup

1. **Supabase project** — in the SQL editor, run in order:

   | File | What it does |
   |---|---|
   | `supabase/schema.sql` | tables, RLS, views, auth triggers |
   | `supabase/seed.sql` | 23-exercise starter catalogue |
   | `supabase/migration-002-trainer-owned.sql` | trainer owns the numbers; `video_url`, `machine_number` |
   | `supabase/migration-003-video-storage.sql` | public bucket for uploaded videos |
   | `supabase/migration-004-hebrew-catalogue.sql` | translates the seeded catalogue |
   | `supabase/migration-005-programs.sql` | programs and items; account approval |
   | `supabase/migration-006-guide-illustration.sql` | `exercises.guide_slug` |
   | `supabase/migration-007-program-day.sql` | optional weekday on a program |
   | `supabase/migration-008-drop-program-days.sql` | retires the old day tables |
   | `supabase/migration-009-guard-without-day.sql` | repairs the edit guard after 008 |
   | `supabase/migration-010-trainee-log-update.sql` | lets a trainee revise today's log |

   Requires Postgres 15+ (`security_invoker` views).

2. **Sign-in** — two ways in, both under Authentication:

   - **Google** — Sign In / Providers → Google. Paste the client ID and secret
     from a Google Cloud OAuth client, and register
     `https://<project-ref>.supabase.co/auth/v1/callback` as an authorised
     redirect URI on the Google side.
   - **Email** — Sign In / Providers → Email. Sends a one-time link. Editing the
     email template (to send a code instead, or to write it in Hebrew) needs
     custom SMTP; without it Supabase's default template is used.

   Add `http://localhost:5173/app` and the deployed origin under URL
   Configuration → Redirect URLs. Both methods land there.

3. **Env** — `cp .env.example .env`, then fill in the project URL and the
   publishable (anon) key from Project Settings → API Keys.

4. `npm install && npm run dev`

5. **Make yourself a trainer** — sign in once, then run
   `supabase/dev-set-trainer.sql` with your address.

   Everyone else stays `trainee` and starts `pending`: new accounts wait on an
   approval screen until the trainer activates them in ניהול משתמשים.

The other `supabase/dev-*.sql` scripts are throwaway helpers — seeding fake
trainees, removing a user, putting a demo clip on one exercise. None belong in a
real database.

## Layout

```
supabase/                  schema, seed, migrations, dev scripts

src/lib/css.ts             parses the design's inline CSS strings
src/lib/guide.ts           illustration catalogue, name matching in either script
src/lib/video.ts           YouTube / Vimeo / direct-file URL → embeddable source
src/lib/viewport.ts        mirrors visualViewport into --app-height
src/auth/                  session + profile, role routing guard
src/i18n/he.ts             every string in the app
src/hooks/usePrograms.ts   a trainee's programs, history, weight writes
src/hooks/useTrainer.ts    trainees, programs, catalogue CRUD, uploads
src/screens/               Landing, SignIn, AccountGate, TraineeHome,
                           ExerciseDetail, TrainerTrainees, ProgramBuilder,
                           ExerciseLibrary, ExerciseForm, UserManagement
src/components/            Screen, Sheet, Press, Stepper, VideoEmbed,
                           GuideIllustration, WeightChart, BottomNav
```

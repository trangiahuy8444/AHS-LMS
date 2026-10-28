# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

AHS-LMS: the online practice and exam platform for Tin học 8, 9, 10 at Asian School. Students take review practice and timed official exams at `/test/`; the teacher proctors live, grades essays, analyses results and prints gradebooks at `/admin/`. It is a static Vite + React 18 + Tailwind v3 site on GitHub Pages backed by Firebase project `ahs-lms` (Firestore + Auth). The local folder is `on-tap-kiem-tra-web/`; the GitHub repo is `trangiahuy8444/AHS-LMS` and it is **public**. `README.md` describes features, the source tree and Firebase Console setup.

UI text, messages and docs are in Vietnamese. Keep it that way.

## Living state files and agents

Read these at the start of every session:
- `docs/BOI_CANH.md`: goal, users, legal basis, the teacher's settled decisions, constraints, glossary.
- `docs/LO_TRINH.md`: the single to-do list, with what is done and what waits on the teacher.
- `docs/NHAT_KY.md`: session log, newest first. Add an entry at the end of any session that changed code, rules or decisions.

The repo is public: these files must never hold passwords, webhook URLs or tokens, student names, LMS codes or exam content.

Subagents in `.claude/agents/`:
- `bao-mat-de-thi`: read-only audit that official exams, answers, secrets and student data cannot leak (build output, `firestore.rules`, client code).
- `kiem-thu`: runs `npm run check` and the scoring checks, reports results; does not fix code.

## Commands

Node ≥ 22.12. Keep `node_modules` out of Google Drive: develop in the worktree `~/Developer/AHS-LMS-vite` (same `.git`) and run npm there.

```sh
npm install
npm run dev        # http://localhost:5173/AHS-LMS/test/ and /AHS-LMS/admin/
npm run check      # eslint + node --test tests/*.cjs + vitest (tests/*.test.jsx) + build + leak check of dist/
npm test           # tests only
npm run preview    # built site at http://localhost:4173/AHS-LMS/
node scripts/tach_ma_de_chinh_thuc.cjs          # dry run; --apply moves official exams from data/ to private/
```

Push to `main` deploys: `.github/workflows/deploy.yml` runs lint, tests, build and `scripts/kiem_tra_ban_build.cjs`, then publishes `dist/` to Pages (Pages source must be "GitHub Actions").

## Architecture

- Three entry pages (`index.html`, `test/index.html`, `admin/index.html`) wired in `vite.config.mjs` with base `/AHS-LMS/`.
- `src/core/` holds shared logic in UMD form so `node --test` can `require()` it: `firebase-config.js` (Auth, Firestore, `startExam`/`submitExam`), `storage-service.js`, `exam-package.js` (strip answers, scoring, exam-structure checks), `anti-cheat.js`, `exam-timer.js`. Put testable logic here.
- `src/student/` and `src/admin/`: state lives in a controller hook (`useStudentController`, `useAdminController`) exposed by context (`useStudent()`, `useAdmin()`); screens/tabs/cards read context instead of prop drilling; side effects live in `actions/`. Every name a component destructures from the context must be returned by the controller (a hook's or action's `return { ... }` merged into `s`); `tests/context_contract.test.cjs` enforces this because ESLint cannot see it.
- `data/questions_grade{8,9,10}.js` are public review sets (answers included for self-check). Official exams with answers are never in `data/`: the teacher uploads them to Firestore `exam_bank`; local copies sit in `private/` (gitignored).

## Security model (Firebase Spark, no Cloud Functions)

`firestore.rules` is the server. Students sign in anonymously; rules check the room password (`exam_secrets/room` vs `exam_keys/{uid}`), that the class has an open session, the assigned exam code and remaining attempts per LMS code (`exam_attempts`). Students read only answer-stripped `exam_public` for their own attempt and submit answers without scores; the admin page grades. Teacher identity is the Google email allowlist in `isTeacher()`, which must match `TEACHER_EMAILS` in `src/core/firebase-config.js`. Rule changes take effect only after the teacher pastes `firestore.rules` into Firebase Console.

Never propose Blaze, Cloud Functions or paid services. Never put secrets in `exam_config` (publicly readable) or in source.

## Domain rules

- Grade 10 Đúng/Sai: score = question points × coefficient by correct statements `{0:0, 1:0.1, 2:0.25, 3:0.5, 4:1}` (`TF_COEFFICIENTS` in `src/core/exam-package.js`), matching `ngan-hang-de-web`.
- 3 anti-cheat violations lock the attempt until the teacher unlocks it. The system does **not** deduct points (`VIOLATION_PENALTY_POINTS = 0` in `src/core/storage-service.js`, decision 29/10/2026); the violation count is stored on the submission and the teacher records any sanction by hand. One official attempt per LMS code by default; the teacher can grant more.
- Result screenshots are named `[MãLMS]_[HọTên]_[Lớp]_KetQua.png` for submission on the school LMS.

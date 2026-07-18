# Case Study: HireTrack ATS

## 1. The Problem
Modern recruitment teams are often slowed down by fragmented workflows. Recruiters use different systems for posting jobs, reviewing resumes, scheduling panel interviews, gathering scorecard evaluations, and checking candidate funnel metrics. This leads to information silos, slow time-to-hire speeds, and high software costs. Recruiting teams need a single, unified, secure workspace that manages the entire lifecycle of applicants and provides clear, immediate analytics.

## 2. The Approach
To solve this, I designed **HireTrack**—a fast, responsive, production-ready SaaS Applicant Tracking System (ATS). I established a decoupled, type-safe architecture:

*   **Next.js 15 App Router & Server Actions**: Leveraged React Server Components (RSC) to perform server-side database pre-fetching, and Server Actions for secure mutative updates (CRUD) without traditional REST overhead.
*   **Role-Based Access Control (RBAC)**: Configured NextAuth v5 middleware and database role levels (`ADMIN`, `RECRUITER`, `INTERVIEWER`) to restrict page access and data operations (e.g. only Admins can delete resources or update team roles).
*   **Optimistic UI Kanban**: Built an interactive pipeline board using native HTML5 drag-and-drop mechanics. When a candidate is moved to a new stage, the client board updates *optimistically* before server confirmation, creating an instantaneous user feel.
*   **Structured Scorecards**: Designed evaluation matrices where interviewers submit star ratings and score key criteria (Technical, Communication, Fit) which automatically aggregate into candidate timelines.
*   **Analytics Engine**: Utilized Recharts to map visual data funnels and sourcing channels to help hiring managers identify bottleneck stages.

## 3. The Result
HireTrack is fully implemented, verified, and ready for production:
*   **100% Type-Safety**: Clean compilations under strict TypeScript settings (`npx tsc --noEmit` returns zero warnings/errors).
*   **Next.js Optimization**: Standard production builds (`npm run build`) complete successfully with optimized static prerendering.
*   **Complete Mock Seed**: Includes a database seed script (`npm run seed`) populating demo organizations, multiple role accounts, applications, scheduled interviews, and activity audit trails.

## 4. Lessons Learned
*   **Edge Runtime Compatibility**: NextAuth v5 middleware executes on Next.js Edge runtime. To prevent build-time crashes, node-native libraries (like `bcryptjs` or database pools) must be isolated. Splitting the config into an edge-safe `auth.config.ts` and a node-only `config.ts` solved this problem.
*   **Prisma v7 Singletons**: Prisma v7 handles connection adapters differently in serverless environments. Initializing the client singleton with node-postgres (`pg`) adapter ensures optimal connection pooling.
*   **Zod Object Refinements**: Applying `.partial()` directly to Zod schemas containing `.refine()` calls fails because refinements wrap the schema in a `ZodEffects` instance. The solution is defining a flat `z.object()` first, calling `.partial()` on it, and then applying refinements separately to both schemas.

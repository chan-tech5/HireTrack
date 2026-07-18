const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");
const bcrypt = require("bcryptjs");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:CU@gre13325@localhost:5432/hiretrack?schema=public",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning database...");
  await prisma.activityLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.applicationNote.deleteMany({});
  await prisma.stageHistory.deleteMany({});
  await prisma.scorecard.deleteMany({});
  await prisma.interview.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.candidate.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  console.log("Seeding organization...");
  const org = await prisma.organization.create({
    data: {
      name: "Vercel",
      slug: "vercel",
      industry: "Technology",
      size: "201-500",
      website: "https://vercel.com",
    },
  });

  console.log("Seeding users...");
  const hashedPassword = await bcrypt.hash("Password123", 12);

  const jane = await prisma.user.create({
    data: {
      name: "Jane Doe",
      email: "jane@vercel.com",
      hashedPassword,
      role: "ADMIN",
      organizationId: org.id,
      isActive: true,
    },
  });

  const john = await prisma.user.create({
    data: {
      name: "John Recruiter",
      email: "john@vercel.com",
      hashedPassword,
      role: "RECRUITER",
      organizationId: org.id,
      isActive: true,
    },
  });

  const alice = await prisma.user.create({
    data: {
      name: "Alice Tech",
      email: "alice@vercel.com",
      hashedPassword,
      role: "INTERVIEWER",
      organizationId: org.id,
      isActive: true,
    },
  });

  console.log("Seeding jobs...");
  const jobFrontend = await prisma.job.create({
    data: {
      title: "Senior Frontend Engineer",
      slug: "senior-frontend-engineer",
      department: "Engineering",
      description: "We are looking for a Senior Frontend Engineer to build the future of our deployment platform. You will work with Next.js, React, and Tailwind CSS to construct beautiful, fast web experiences.",
      requirements: "5+ years of experience with modern JS frameworks. Expert knowledge of React, Next.js, and browser performance optimization.",
      responsibilities: "Build high-performance web components, collaborate with product designers, and optimize core web vitals.",
      location: "San Francisco, CA",
      workMode: "HYBRID",
      type: "FULL_TIME",
      status: "OPEN",
      openings: 2,
      salaryMin: 140000,
      salaryMax: 180000,
      currency: "USD",
      experienceMin: 5,
      organizationId: org.id,
      createdById: jane.id,
    },
  });

  const jobDesigner = await prisma.job.create({
    data: {
      title: "Senior Product Designer",
      slug: "senior-product-designer",
      department: "Design",
      description: "Join our design system team and help establish modern components and visual design structures used by millions.",
      requirements: "4+ years of product design experience with a stellar Figma portfolio.",
      responsibilities: "Create UI layouts, conduct user research, and maintain design systems.",
      location: "Remote",
      workMode: "REMOTE",
      type: "FULL_TIME",
      status: "OPEN",
      openings: 1,
      salaryMin: 120000,
      salaryMax: 160000,
      currency: "USD",
      experienceMin: 4,
      organizationId: org.id,
      createdById: jane.id,
    },
  });

  const jobBackend = await prisma.job.create({
    data: {
      title: "Staff Backend Developer",
      slug: "staff-backend-developer",
      department: "Engineering",
      description: "Scale our real-time streaming infrastructure and design resilient database models.",
      requirements: "8+ years scaling production backend servers using Go or Rust.",
      location: "New York, NY",
      workMode: "ONSITE",
      type: "FULL_TIME",
      status: "DRAFT",
      openings: 1,
      organizationId: org.id,
      createdById: jane.id,
    },
  });

  console.log("Seeding candidates...");
  const alex = await prisma.candidate.create({
    data: {
      firstName: "Alex",
      lastName: "Rivera",
      email: "alex.rivera@gmail.com",
      phone: "+1 (555) 123-4567",
      currentTitle: "Frontend Engineer",
      currentCompany: "Netlify",
      currentLocation: "Los Angeles, CA",
      experienceYears: 4,
      skills: ["React", "TypeScript", "Tailwind CSS"],
      source: "LinkedIn",
    },
  });

  const sarah = await prisma.candidate.create({
    data: {
      firstName: "Sarah",
      lastName: "Chen",
      email: "sarah.chen@yahoo.com",
      phone: "+1 (555) 987-6543",
      currentTitle: "Senior Software Engineer",
      currentCompany: "Gatsby",
      currentLocation: "Seattle, WA",
      experienceYears: 6,
      skills: ["React", "GraphQL", "Next.js", "Node.js"],
      source: "Referral",
    },
  });

  const marcus = await prisma.candidate.create({
    data: {
      firstName: "Marcus",
      lastName: "Miller",
      email: "marcus.miller@design.co",
      phone: "+1 (555) 456-7890",
      currentTitle: "Product Designer",
      currentCompany: "Sketch",
      currentLocation: "London, UK",
      experienceYears: 3,
      skills: ["Figma", "UI/UX Design", "Wireframing"],
      source: "Indeed",
    },
  });

  console.log("Seeding applications...");
  const appAlex = await prisma.application.create({
    data: {
      candidateId: alex.id,
      jobId: jobFrontend.id,
      stage: "SCREENING",
    },
  });

  const appSarah = await prisma.application.create({
    data: {
      candidateId: sarah.id,
      jobId: jobFrontend.id,
      stage: "INTERVIEW",
    },
  });

  const appMarcus = await prisma.application.create({
    data: {
      candidateId: marcus.id,
      jobId: jobDesigner.id,
      stage: "APPLIED",
    },
  });

  console.log("Seeding stage histories...");
  await prisma.stageHistory.createMany({
    data: [
      { applicationId: appAlex.id, toStage: "APPLIED", reason: "Manual creation" },
      { applicationId: appAlex.id, fromStage: "APPLIED", toStage: "SCREENING", reason: "Completed phone screen" },
      { applicationId: appSarah.id, toStage: "APPLIED", reason: "Referral application" },
      { applicationId: appSarah.id, fromStage: "APPLIED", toStage: "SCREENING", reason: "Resume screen passed" },
      { applicationId: appSarah.id, fromStage: "SCREENING", toStage: "INTERVIEW", reason: "Cleared recruiter screening call" },
      { applicationId: appMarcus.id, toStage: "APPLIED", reason: "Indeed application upload" },
    ],
  });

  console.log("Seeding application notes...");
  await prisma.applicationNote.createMany({
    data: [
      { applicationId: appAlex.id, content: "Strong candidate from Netlify. Showed great interest in Next.js v15 enhancements." },
      { applicationId: appSarah.id, content: "Referred by engineering director. Excellent Next.js experience. High priority callback." },
    ],
  });

  console.log("Seeding interviews...");
  const interviewSarah = await prisma.interview.create({
    data: {
      applicationId: appSarah.id,
      title: "Technical Coding Round",
      type: "TECHNICAL",
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      durationMinutes: 60,
      meetingLink: "https://meet.google.com/abc-defg-hij",
      notes: "Focus on React Server Components, hydration states, and caching strategies.",
      status: "SCHEDULED",
      interviewers: {
        connect: [{ id: alice.id }],
      },
    },
  });

  console.log("Seeding activity logs...");
  await prisma.activityLog.createMany({
    data: [
      { userId: jane.id, action: "created_job", entityType: "job", entityId: jobFrontend.id },
      { userId: jane.id, action: "created_job", entityType: "job", entityId: jobDesigner.id },
      { userId: john.id, action: "added_candidate", entityType: "candidate", entityId: alex.id },
      { userId: john.id, action: "added_candidate", entityType: "candidate", entityId: sarah.id },
      { userId: john.id, action: "moved_stage", entityType: "application", entityId: appSarah.id, metadata: { fromStage: "SCREENING", toStage: "INTERVIEW" } },
      { userId: john.id, action: "scheduled_interview", entityType: "interview", entityId: interviewSarah.id },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

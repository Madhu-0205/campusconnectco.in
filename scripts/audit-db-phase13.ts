import prisma from '../src/lib/prisma';

async function auditDataQuality() {
  console.log('--- PHASE 13 REAL DATABASE DATA QUALITY AUDIT ---');

  // 1. Users
  const totalUsers = await prisma.user.count();
  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: { id: true }
  });
  
  // Active users (e.g. not suspended/banned, have updatedAt in past 30 days or simply non-deleted)
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: {
      id: true,
      name: true,
      email: true,
      skills: true,
      college: true,
      collegeId: true,
      bio: true,
      userSkills: { select: { skillId: true } },
      applications: { select: { id: true } }
    }
  });

  const studentsWithSkills = students.filter(s => (s.skills && s.skills.trim().length > 0) || s.userSkills.length > 0).length;
  const studentsWithCollege = students.filter(s => Boolean((s.college && s.college.trim()) || s.collegeId)).length;
  const studentsWithIncompleteProfiles = students.filter(s => !s.name || !s.bio || (!s.skills && s.userSkills.length === 0) || (!s.college && !s.collegeId)).length;

  // 2. Gigs
  const totalGigs = await prisma.gig.count();
  const gigsByStatus = await prisma.gig.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  const softDeletedGigs = await prisma.gig.count({ where: { deletedAt: { not: null } } });
  
  const now = new Date();
  const allGigs = await prisma.gig.findMany({
    include: { poster: { select: { id: true, name: true, isVerified: true } } }
  });

  const activeGigs = allGigs.filter(g => (g.status === 'OPEN' || g.status === 'active') && !g.deletedAt);
  const closedGigs = allGigs.filter(g => g.status === 'CLOSED' || g.status === 'completed' || g.status === 'CANCELLED');
  const expiredGigs = allGigs.filter(g => g.deadline && new Date(g.deadline) < now && (g.status === 'OPEN' || g.status === 'active'));
  const gigsWithoutDescription = allGigs.filter(g => !g.description || g.description.trim().length < 20);
  const gigsWithoutCompensation = allGigs.filter(g => g.budget == null || g.budget <= 0);
  const gigsWithoutLocation = allGigs.filter(g => !g.city && !g.work_mode);
  const gigsWithoutSkills = allGigs.filter(g => (!g.tags || g.tags.trim().length === 0) && (!g.required_skills || (Array.isArray(g.required_skills) && g.required_skills.length === 0)));
  const gigsWithoutVerifiedOwner = allGigs.filter(g => !g.poster || !g.poster.isVerified);

  // 3. Internships
  const totalInternships = await prisma.internship.count();
  const internshipsByStatus = await prisma.internship.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  const softDeletedInternships = await prisma.internship.count({ where: { deletedAt: { not: null } } });

  const allInternships = await prisma.internship.findMany({
    include: { poster: { select: { id: true, name: true, isVerified: true } } }
  });

  const activeInternships = allInternships.filter(i => i.status === 'OPEN' && !i.deletedAt);
  const closedInternships = allInternships.filter(i => i.status === 'CLOSED');
  const expiredInternships = allInternships.filter(i => i.deadline && new Date(i.deadline) < now && i.status === 'OPEN');
  const internshipsWithoutDescription = allInternships.filter(i => !i.description || i.description.trim().length < 20);
  const internshipsWithoutCompensation = allInternships.filter(i => i.stipend == null || i.stipend < 0);
  const internshipsWithoutLocation = allInternships.filter(i => !i.location && !i.city);
  const internshipsWithoutSkills = allInternships.filter(i => (!i.skills || i.skills.trim().length === 0) && (!i.tags || i.tags.trim().length === 0));
  const internshipsWithoutVerifiedOwner = allInternships.filter(i => !i.poster || !i.poster.isVerified);

  // 4. Applications
  const totalApplications = await prisma.application.count();
  const applicationsByStatus = await prisma.application.groupBy({
    by: ['status'],
    _count: { id: true }
  });

  // Check orphaned applications (e.g. gig or applicant deleted/missing)
  const allApplications = await prisma.application.findMany({
    select: { id: true, gigId: true, applicantId: true }
  });
  const userIds = new Set((await prisma.user.findMany({ select: { id: true } })).map(u => u.id));
  const gigIds = new Set(allGigs.map(g => g.id));
  const orphanedApplications = allApplications.filter(a => !userIds.has(a.applicantId) || !gigIds.has(a.gigId));

  // Output JSON report
  console.log(JSON.stringify({
    users: {
      total: totalUsers,
      byRole: usersByRole,
      studentsCount: students.length,
      studentsWithSkills,
      studentsWithCollege,
      studentsWithIncompleteProfiles
    },
    gigs: {
      total: totalGigs,
      byStatus: gigsByStatus,
      softDeleted: softDeletedGigs,
      active: activeGigs.length,
      closed: closedGigs.length,
      expiredActive: expiredGigs.length,
      withoutDescription: gigsWithoutDescription.length,
      withoutCompensation: gigsWithoutCompensation.length,
      withoutLocation: gigsWithoutLocation.length,
      withoutSkills: gigsWithoutSkills.length,
      withoutVerifiedOwner: gigsWithoutVerifiedOwner.length
    },
    internships: {
      total: totalInternships,
      byStatus: internshipsByStatus,
      softDeleted: softDeletedInternships,
      active: activeInternships.length,
      closed: closedInternships.length,
      expiredActive: expiredInternships.length,
      withoutDescription: internshipsWithoutDescription.length,
      withoutCompensation: internshipsWithoutCompensation.length,
      withoutLocation: internshipsWithoutLocation.length,
      withoutSkills: internshipsWithoutSkills.length,
      withoutVerifiedOwner: internshipsWithoutVerifiedOwner.length
    },
    applications: {
      total: totalApplications,
      byStatus: applicationsByStatus,
      orphaned: orphanedApplications.length
    }
  }, null, 2));

  await prisma.$disconnect();
}

auditDataQuality().catch(e => {
  console.error(e);
  process.exit(1);
});

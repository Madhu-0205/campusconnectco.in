const fs = require('fs');
let lines = fs.readFileSync('prisma/schema.prisma', 'utf8').split('\n');

// ConnectionRequest indices
lines = lines.filter(l => !l.includes('@@index([senderId])') || l.includes('map:'));
lines = lines.filter(l => !l.includes('@@index([receiverId])') || l.includes('map:'));

// Application indices (remove the duplicate ones without map, oh wait, they ALL had map)
// Let's just remove the ones starting with 'idx_applications_'
lines = lines.filter(l => !l.includes('idx_applications_applicantid') && !l.includes('idx_applications_gigid'));

for (let i = 0; i < lines.length; i++) {
    // Gig status
    if (lines[i].includes('status           String    @default("OPEN")') && lines[i-5].includes('Gig')) {
        lines[i] = lines[i].replace('String', 'GigStatus').replace('"OPEN"', 'OPEN');
    }
    // Application status
    if (lines[i].includes('status      String   @default("PENDING")') && lines[i-3].includes('applicantId')) {
        lines[i] = lines[i].replace('String', 'ApplicationStatus').replace('"PENDING"', 'PENDING');
    }
    // Internship status
    if (lines[i].includes('status          String            @default("OPEN")') && lines[i-5].includes('country')) {
        lines[i] = lines[i].replace('String', 'InternshipStatus').replace('"OPEN"', 'OPEN');
    }
    
    // Gig indexes
    if (lines[i].includes('@@index([posted_by], map: "idx_gigs_posted_by")')) {
        lines[i] = lines[i] + '\n  @@index([status])\n  @@index([collegeId])';
    }
    
    // Application indexes and unique
    if (lines[i].includes('@@index([gigId], map: "Application_gigId_idx")')) {
        lines[i] = lines[i] + '\n  @@index([status])\n  @@unique([applicantId, gigId])';
    }
    
    // User index
    if (lines[i].includes('@@index([email])') && lines[i-60].includes('model User')) {
        lines[i] = lines[i] + '\n  @@index([collegeId])';
    }
}

const enums = `
enum GigStatus {
  OPEN
  ACTIVE
  COMPLETED
  CANCELLED
  REJECTED
  PENDING_APPROVAL
}

enum ApplicationStatus {
  PENDING
  ACCEPTED
  REJECTED
  WITHDRAWN
  HIRED
}

enum InternshipStatus {
  OPEN
  CLOSED
  FILLED
  DELETED
  PENDING_APPROVAL
}
`;

fs.writeFileSync('prisma/schema.prisma', lines.join('\n') + enums);

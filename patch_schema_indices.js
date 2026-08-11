const fs = require('fs');
let lines = fs.readFileSync('prisma/schema.prisma', 'utf8').split('\n');

lines = lines.filter(l => !l.includes('@@index([senderId])') || l.includes('map:'));
lines = lines.filter(l => !l.includes('@@index([receiverId])') || l.includes('map:'));
lines = lines.filter(l => !l.includes('idx_applications_applicantid') && !l.includes('idx_applications_gigid'));

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('@@index([posted_by], map: "idx_gigs_posted_by")')) {
        lines[i] = lines[i] + '\n  @@index([status])\n  @@index([collegeId])';
    }
    if (lines[i].includes('@@index([gigId], map: "Application_gigId_idx")')) {
        lines[i] = lines[i] + '\n  @@index([status])\n  @@unique([applicantId, gigId])';
    }
    if (lines[i].includes('@@index([email])') && lines[i-60].includes('model User')) {
        lines[i] = lines[i] + '\n  @@index([collegeId])';
    }
}

fs.writeFileSync('prisma/schema.prisma', lines.join('\n'));

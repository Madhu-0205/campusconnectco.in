const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Add enums
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

if (!schema.includes('enum GigStatus')) {
    schema += enums;
}

// Modify Gig
schema = schema.replace('status           String    @default("OPEN")', 'status           GigStatus @default(OPEN)');
schema = schema.replace('status      String    @default("PENDING")', 'status      ApplicationStatus @default(PENDING)');
// Wait, Internship uses 'status       String        @default("OPEN")'
schema = schema.replace('status       String        @default("OPEN")', 'status       InternshipStatus @default(OPEN)');
// Wait, maybe Gig is just status      String    @default("OPEN")
schema = schema.replace(/status\s+String\s+@default\("OPEN"\)/g, (match, offset) => {
    // We will do this via safer regex or just write a specific replace script
    return match;
});

fs.writeFileSync('prisma/schema.prisma', schema);

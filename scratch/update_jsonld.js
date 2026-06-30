const fs = require('fs');
const path = require('path');

const filePath = '/Users/madhu/Desktop/campusconnectco.in-main/src/components/seo/JsonLd.tsx';
let code = fs.readFileSync(filePath, 'utf-8');

// 1. Modify function definitions
code = code.replace(
  /export function OrganizationSchema\(\)/g,
  'export function OrganizationSchema({ nonce }: { nonce?: string })'
);

code = code.replace(
  /export function JobPostingSchema\(\{\s*([\s\S]*?)\}\:\s*\{\s*([\s\S]*?)\}\)/g,
  (match, props, types) => {
    return `export function JobPostingSchema({\n  ${props.trim()},\n  nonce\n}: {\n  ${types.trim()}\n  nonce?: string\n})`;
  }
);

code = code.replace(
  /export function WebsiteSchema\(\)/g,
  'export function WebsiteSchema({ nonce }: { nonce?: string })'
);

code = code.replace(
  /export function StudentPersonSchema\(\{\s*data\s*\}\:\s*\{\s*data\s*\:\s*StudentPersonData\s*\}\)/g,
  'export function StudentPersonSchema({ data, nonce }: { data: StudentPersonData; nonce?: string })'
);

code = code.replace(
  /export function FAQSchema\(\{\s*faqs\s*\}\:\s*\{\s*faqs\s*\:\s*FAQItem\[\]\s*\}\)/g,
  'export function FAQSchema({ faqs, nonce }: { faqs: FAQItem[]; nonce?: string })'
);

code = code.replace(
  /export function BreadcrumbSchema\(\{\s*items\s*\}\:\s*\{\s*items\s*\:\s*BreadcrumbItem\[\]\s*\}\)/g,
  'export function BreadcrumbSchema({ items, nonce }: { items: BreadcrumbItem[]; nonce?: string })'
);

code = code.replace(
  /export function WebSiteSchema\(\)/g,
  'export function WebSiteSchema({ nonce }: { nonce?: string })'
);

code = code.replace(
  /export function AggregateRatingSchema\(\{\s*([\s\S]*?)\}\:\s*\{\s*([\s\S]*?)\}\)/g,
  (match, props, types) => {
    return `export function AggregateRatingSchema({\n  ${props.trim()},\n  nonce\n}: {\n  ${types.trim()}\n  nonce?: string\n})`;
  }
);

// 2. Add nonce={nonce} to script tags inside returns
// We find '<script' and replace with '<script nonce={nonce}'
code = code.replace(/<script/g, '<script nonce={nonce}');

fs.writeFileSync(filePath, code, 'utf-8');
console.log("JsonLd.tsx successfully updated with nonces.");

import { Metadata } from 'next';

import ResumeDashboardClient from './ResumeDashboardClient';

export const metadata: Metadata = {
 title: 'Resume Intelligence | CampusConnect',
 description: 'AI-powered resume analysis, scoring, and career roadmaps.',
};

export default function ResumeIntelligencePage() {
 return <ResumeDashboardClient />;
}

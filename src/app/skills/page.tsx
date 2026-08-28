import type { Metadata } from"next";

import SkillsExplorer from"./SkillsExplorer";

export const metadata: Metadata = {
 title:"UI/UX Skills Explorer",
 description:
"Browse curated UI/UX design and front-end engineering skills — searchable, filterable, and category-tagged.",
};

export default function SkillsPage() {
 return <SkillsExplorer />;
}

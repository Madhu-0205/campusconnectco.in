import type { Metadata } from"next";

import SkillSelectorDemo from"./SkillSelectorDemo";

export const metadata: Metadata = {
 title:"Skill Selector",
 description:"Multi-select autocomplete skill selector with animated badges, keyboard navigation, and full accessibility support.",
};

export default function SkillSelectorPage() {
 return <SkillSelectorDemo />;
}

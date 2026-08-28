"use client"

import { FolderGit2, Star, ExternalLink, Github } from"lucide-react"
import React, { useState } from"react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from"@/components/ui/Dialog"
import { HoverMagnetic } from"@/components/ui/motion/HoverMagnetic"

interface Project {
 id: string
 title: string
 description?: string
 link?: string
 image?: string
}

interface ProjectShowcaseProps {
 projects: Project[]
}

export const ProjectShowcase = ({ projects }: ProjectShowcaseProps) => {
 const [selectedProject, setSelectedProject] = useState<Project | null>(null)

 if (!projects || projects.length === 0) return null

 return (
 <div className="bg-surface rounded-4xl p-8 shadow-sm">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
 <FolderGit2 size={20} />
 </div>
 <h2 className="text-xl font-black text-foreground">Featured Projects</h2>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {projects.map((project) => (
 <HoverMagnetic key={project.id} strength={0.05}>
 <div 
 onClick={() => setSelectedProject(project)}
 className="bg-background rounded-3xl p-6 cursor-pointer group"
 >
 <div className="flex items-start justify-between mb-4">
 <div className="p-3 bg-surface-2 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
 <FolderGit2 size={24} />
 </div>
 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
 <Star size={16} className="text-muted-foreground" />
 </div>
 </div>
 <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">{project.title}</h3>
 <p className="text-sm font-medium text-muted-foreground line-clamp-2">
 {project.description ||"No description provided."}
 </p>
 </div>
 </HoverMagnetic>
 ))}
 </div>

 <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
 <DialogContent className="max-w-2xl bg-surface border-border">
 <DialogHeader>
 <DialogTitle className="text-2xl font-black">{selectedProject?.title}</DialogTitle>
 <DialogDescription className="text-base text-muted-foreground mt-4">
 {selectedProject?.description ||"No detailed description available."}
 </DialogDescription>
 </DialogHeader>
 {selectedProject?.link && (
 <div className="mt-8 flex gap-4">
 <a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 transition-colors">
 {selectedProject.link.includes('github') ? <Github size={18} /> : <ExternalLink size={18} />}
 View Project
 </a>
 </div>
 )}
 </DialogContent>
 </Dialog>
 </div>
 )
}

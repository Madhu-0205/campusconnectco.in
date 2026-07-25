"use client"

import { UploadCloud, FileText, AlertCircle, CheckCircle2, Trash2 } from "lucide-react"
import { useState, useRef } from "react"
import { toast } from "sonner"

export function ResumeUploader({ onUploadComplete, currentFileUrl }: { onUploadComplete: (url: string) => void, currentFileUrl?: string }) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)
    const abortControllerRef = useRef<AbortController | null>(null)

    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

    const handleFileSelect = (selectedFile: File) => {
        setError("")
        if (selectedFile.size > MAX_SIZE) {
            setError("File size exceeds 5MB limit.")
            return
        }
        if (!ALLOWED_TYPES.includes(selectedFile.type)) {
            setError("Unsupported file format. Please upload a PDF or DOCX.")
            return
        }
        setFile(selectedFile)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) handleFileSelect(droppedFile)
    }

    const uploadFile = async () => {
        if (!file) return
        setUploading(true)
        setProgress(10)
        setError("")

        abortControllerRef.current = new AbortController()

        try {
            const formData = new FormData()
            formData.append('file', file)

            // Simulate progress (since fetch doesn't natively support upload progress easily without XHR)
            const progressInterval = setInterval(() => {
                setProgress(p => Math.min(p + 15, 90))
            }, 500)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                signal: abortControllerRef.current.signal
            })
            
            clearInterval(progressInterval)

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to upload')
            }

            const data = await res.json()
            setProgress(100)
            toast.success("Resume uploaded securely.")
            
            setTimeout(() => {
                onUploadComplete(data.url)
                setUploading(false)
                setFile(null)
                setProgress(0)
            }, 500)
            
        } catch (err: any) {
            if (err.name === 'AbortError') {
                setError("Upload cancelled")
                toast.error("Upload cancelled")
            } else {
                setError(err.message || "Upload failed")
                toast.error(err.message || "Upload failed")
            }
            setUploading(false)
            setProgress(0)
        }
    }

    const cancelUpload = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
    }

    if (currentFileUrl && !file && !uploading) {
        return (
            <div className="p-6 border border-(--border) rounded-2xl bg-(--surface-2) flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">Resume Active</h4>
                        <p className="text-xs text-slate-400">You have a parsed resume active on your profile.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <a href={currentFileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                        View File
                    </a>
                    <button onClick={() => setFile(null)} className="text-xs font-bold px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors" type="button" onClickCapture={() => document.getElementById("hidden-file-input")?.click()}>
                        Replace
                    </button>
                    <input id="hidden-file-input" type="file" className="hidden" accept=".pdf,.docx" onChange={(e) => {
                        if (e.target.files?.[0]) handleFileSelect(e.target.files[0])
                    }} />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {!file ? (
                <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 hover:border-violet-500/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-(--surface) hover:bg-white/2"
                >
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                        <UploadCloud className="w-7 h-7 text-slate-300" />
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">Upload your resume</h3>
                    <p className="text-xs text-slate-500 max-w-50">Drag & drop or click to browse. Max 5MB, PDF or DOCX.</p>
                    
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept=".pdf,.docx" 
                        className="hidden" 
                        onChange={(e) => {
                            if (e.target.files?.[0]) handleFileSelect(e.target.files[0])
                        }} 
                    />
                </div>
            ) : (
                <div className="p-5 border border-(--border) rounded-2xl bg-(--surface-2)">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white truncate max-w-50">{file.name}</h4>
                                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        {!uploading && (
                            <button onClick={() => setFile(null)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    
                    {error && (
                        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-3 rounded-lg mb-4 font-medium">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {uploading ? (
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <span>Uploading...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                                <div className="h-full bg-violet-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                            <button onClick={cancelUpload} className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors pt-2">
                                Cancel Upload
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button 
                                onClick={uploadFile} 
                                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
                            >
                                {error ? "Retry Upload" : "Confirm & Upload"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

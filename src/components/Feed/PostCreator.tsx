"use client";

import { Image, Video, FileText, Send, Smile, X } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/components/ToastProvider";

export default function PostCreator() {
    const { addToast } = useToast();

    const [content, setContent] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);

    const MAX = 280;

    const handlePost = () => {
        if (!content.trim() && files.length === 0) {
            addToast("Write something or attach a file", "error");
            return;
        }

        addToast("Post published successfully", "success");

        setContent("");
        setFiles([]);
    };

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    };

    return (
        <div className="glass-card rounded-xl p-4 mb-6">

            <div className="flex gap-4">

                <div className="h-10 w-10 rounded-full bg-slate-700 shrink-0" />

                <div className="flex-1">

                    {/* Input */}
                    <textarea
                        rows={2}
                        value={content}
                        onChange={(e) => setContent(e.target.value.slice(0, MAX))}
                        placeholder="Share your project update, idea, or ask for collaboration..."
                        className="w-full bg-transparent border-none text-white focus:ring-0 placeholder-gray-400 text-sm resize-none"
                    />

                    {/* Preview */}
                    {files.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-3">
                            {files.map((file, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-gray-200"
                                >
                                    <FileText size={14} />
                                    <span className="truncate max-w-[120px]">{file.name}</span>
                                    <button
                                        onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                                        className="hover:text-red-500 transition"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t border-slate-700/50 pt-3 mt-3">

                        <div className="flex gap-4">

                            <button
                                onClick={() => fileRef.current?.click()}
                                className="flex items-center gap-2 text-gray-400 hover:text-electric transition text-sm"
                            >
                                <Image size={18} />
                                <span className="hidden sm:inline">Photo</span>
                            </button>

                            <button
                                onClick={() => fileRef.current?.click()}
                                className="flex items-center gap-2 text-gray-400 hover:text-electric transition text-sm"
                            >
                                <Video size={18} />
                                <span className="hidden sm:inline">Video</span>
                            </button>

                            <button
                                onClick={() => fileRef.current?.click()}
                                className="flex items-center gap-2 text-gray-400 hover:text-electric transition text-sm"
                            >
                                <FileText size={18} />
                                <span className="hidden sm:inline">Document</span>
                            </button>

                            <button className="flex items-center gap-2 text-gray-400 hover:text-electric transition text-sm">
                                <Smile size={18} />
                                <span className="hidden sm:inline">Emoji</span>
                            </button>

                            <input
                                ref={fileRef}
                                type="file"
                                multiple
                                hidden
                                onChange={handleFiles}
                            />
                        </div>

                        <div className="flex items-center gap-4">

                            <span className={`text-xs ${content.length >= MAX ? "text-red-500" : "text-gray-400"}`}>
                                {content.length}/{MAX}
                            </span>

                            <button
                                onClick={handlePost}
                                disabled={!content.trim() && files.length === 0}
                                className="bg-electric hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition"
                            >
                                <Send size={16} />
                                Post
                            </button>

                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}

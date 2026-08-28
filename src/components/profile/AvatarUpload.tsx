"use client"

import { User, Camera, Loader2, Check } from"lucide-react"
import Image from"next/image"
import { useState, useRef } from"react"
import { toast } from"sonner"

import { useProfileField } from"@/hooks/useProfileField"
import { createClient } from"@/lib/supabase/client"

 

interface AvatarUploadProps {
 initialImage: string | null
 userId: string
}

export function AvatarUpload({ initialImage, userId }: AvatarUploadProps) {
 const [image, setImage] = useState(initialImage)
 const [uploading, setUploading] = useState(false)
 const fileInputRef = useRef<HTMLInputElement>(null)
 const supabase = createClient()
 
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 const { save, saving, saved } = useProfileField({ field: 'image' })

 const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
 try {
 setUploading(true)
 const file = event.target.files?.[0]
 if (!file) return

 // Strict client-side validation
 if (file.size > 2 * 1024 * 1024) {
 toast.error("Image size must be less than 2MB")
 setUploading(false)
 return
 }

 const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
 if (!allowedTypes.includes(file.type)) {
 toast.error("Invalid file type. Please upload a JPEG, PNG, WEBP, or GIF image.")
 setUploading(false)
 return
 }

 const fileExt = file.name.split('.').pop()
 const fileName = `${userId}-${Math.random()}.${fileExt}`
 const filePath = `${fileName}`

 // Upload to Supabase Storage (avatars bucket)
 const { error: uploadError } = await supabase.storage
 .from('avatars')
 .upload(filePath, file)

 if (uploadError) throw uploadError

 // Get Public URL
 const { data: { publicUrl } } = supabase.storage
 .from('avatars')
 .getPublicUrl(filePath)

 // Save URL to DB
 await save(publicUrl)
 setImage(publicUrl)
 
 } catch (error: unknown) {
 console.error('Error uploading image:', (error as Error).message)
 } finally {
 setUploading(false)
 }
 }

 return (
 <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
 <div className="w-24 h-24 rounded-full bg-surface-2 border border-border overflow-hidden flex items-center justify-center relative shadow-card transition-all group-hover:scale-105 group-hover:border-primary/50">
 {image ? (
 <Image src={image} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" unoptimized />
 ) : (
 <User size={40} className="text-muted-foreground" />
 )}
 
 {/* Overlay */}
 <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${uploading ? 'opacity-100' : ''}`}>
 {uploading ? (
 <Loader2 size={24} className="text-foreground animate-spin" />
 ) : (
 <>
 <Camera size={20} className="text-foreground mb-1" />
 <span className="font-black text-foreground uppercase">Replace</span>
 </>
 )}
 </div>
 </div>

 {/* Hidden Input */}
 <input
 type="file"
 ref={fileInputRef}
 onChange={handleUpload}
 accept="image/*"
 className="hidden"
 />

 {/* Status badge */}
 {saved && !uploading && (
 <div className="absolute -bottom-1 -right-1 bg-success text-success-foreground p-1 rounded-full shadow-lg border-border animate-bounce">
 <Check size={12} strokeWidth={4} />
 </div>
 )}
 </div>
 )
}

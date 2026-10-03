export async function uploadToCloudinary(base64: string, lane: number): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string
  const preset = import.meta.env.VITE_CLOUDINARY_PRESET as string

  if (!cloudName || !preset) throw new Error('Missing Cloudinary env')

  const fd = new FormData()
  fd.append('file', base64)
  fd.append('upload_preset', preset)
  fd.append('folder', 'smartcross/violations')
  fd.append('public_id', `lane${lane}_${Date.now()}`)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd })
  if (!res.ok) throw new Error('Cloudinary upload failed')

  const json = await res.json()
  return json.secure_url as string
}

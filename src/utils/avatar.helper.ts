const AVATAR_SIZE = 256
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_FILE_BYTES = 5 * 1024 * 1024

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler a imagem.'))
    }
    image.src = url
  })
}

export async function readAvatarFile(file: File): Promise<string> {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new Error('Envie uma imagem PNG, JPG ou WebP.')
  if (file.size > MAX_FILE_BYTES) throw new Error('A imagem precisa ter no máximo 5 MB.')

  const image = await loadImage(file)
  const side = Math.min(image.naturalWidth, image.naturalHeight)
  const canvas = document.createElement('canvas')
  canvas.width = AVATAR_SIZE
  canvas.height = AVATAR_SIZE
  canvas
    .getContext('2d')
    ?.drawImage(
      image,
      (image.naturalWidth - side) / 2,
      (image.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      AVATAR_SIZE,
      AVATAR_SIZE,
    )
  return canvas.toDataURL('image/jpeg', 0.85)
}

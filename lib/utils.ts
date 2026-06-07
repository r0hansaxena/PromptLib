import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generatePromptId = (): string => {
  return `prompt-${Date.now()}-${Math.random().toString(36).substring(7)}`
}

// Define the standard aspect ratios
const STANDARD_ASPECT_RATIOS = [
  { label: "1:1", ratio: 1 / 1 },
  { label: "2:3", ratio: 2 / 3 },
  { label: "3:4", ratio: 3 / 4 },
  { label: "4:5", ratio: 4 / 5 },
  { label: "9:16", ratio: 9 / 16 },
  { label: "16:9", ratio: 16 / 9 },
]

// Helper function
export const getAspectRatioFromURL = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = url
    img.onload = () => {
      const { width, height } = img
      if (!width || !height) return resolve("Unknown")

        const actualRatio = width / height
        
        // Find the closest standard ratio
        let closest = STANDARD_ASPECT_RATIOS[0]
      let minDiff = Math.abs(actualRatio - closest.ratio)

      for (const aspect of STANDARD_ASPECT_RATIOS) {
        const diff = Math.abs(actualRatio - aspect.ratio)
        if (diff < minDiff) {
          closest = aspect
          minDiff = diff
        }
      }

      resolve(closest.label)
    }

    img.onerror = () => reject(new Error("Failed to load image"))
  })
}


export const calculateCardHeight = (width: number, ratio: string): number => {
  const [ratioW, ratioH] = ratio.split(":").map(Number)
  return (width * ratioH) / ratioW
}

export const truncateText = (text: string, maxChars: number): string => {
  if (text.length <= maxChars) return text
  return text.substring(0, maxChars) + "..."
}

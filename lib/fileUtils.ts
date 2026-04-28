import { promises as fs } from 'fs'
import path from 'path'

/**
 * Check if a file exists at the given path
 * @param filePath - Relative or absolute file path
 * @returns Promise<boolean> - true if file exists, false otherwise
 */
export async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    // Handle relative paths starting with /uploads/
    if (filePath.startsWith('/uploads/')) {
      const absolutePath = path.join(process.cwd(), 'public', filePath)
      await fs.access(absolutePath)
      return true
    }
    
    // Handle external URLs - assume they exist (would need HTTP request to verify)
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return true
    }
    
    // Handle absolute paths
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Validate PDF file and return status
 * @param pdfPath - Path to PDF file
 * @returns Object with exists flag and validated path
 */
export async function validatePdfFile(pdfPath: string | null): Promise<{
  exists: boolean
  path: string | null
  isValid: boolean
}> {
  if (!pdfPath) {
    return { exists: false, path: null, isValid: false }
  }

  const exists = await checkFileExists(pdfPath)
  
  return {
    exists,
    path: pdfPath,
    isValid: exists && pdfPath.toLowerCase().endsWith('.pdf')
  }
}

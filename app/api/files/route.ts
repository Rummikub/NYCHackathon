import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let dirPath = searchParams.get('path') || '';
    
    // Convert relative path to absolute path
    // You might want to set a base directory for security
    const baseDir = process.cwd();
    const absolutePath = path.join(baseDir, dirPath);

    // Ensure the path doesn't go above the base directory for security
    if (!absolutePath.startsWith(baseDir)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const files = await fs.readdir(absolutePath, { withFileTypes: true });
    
    const fileList = files.map(file => ({
      name: file.name,
      type: file.isDirectory() ? 'directory' : 'file',
      path: path.join(dirPath, file.name)
    }));

    return NextResponse.json({ files: fileList });
  } catch (error) {
    console.error('Error reading directory:', error);
    return NextResponse.json({ error: 'Failed to read directory' }, { status: 500 });
  }
}

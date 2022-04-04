import fs from 'fs';
import { fetch } from '../services/fetch';

export const isAvailable = async (file: string) => {
    if(file.includes('removed')) return false;
    
    try {
        await fetch(file);
        return true;
    } catch (error) {
        return false;
    }
}

export const getFiles = (path: string, subdirectory?: string, files: string[] = []) => {
    const data = fs.readdirSync(path, { withFileTypes: true });
    for(const item of data) {
        if(item.isDirectory()) {
            files = getFiles(`${path}/${item.name}`, item.name, files);
            continue;
        }

        files.push(`${subdirectory ? `${subdirectory}/${item.name}` : item.name}`);
    }

    return files;
}
import fs from 'fs';
import { promisify } from 'util';
import { join } from 'path';

export const checkIfFileOrDirectoryExists = (path: string): boolean => {
    return fs.existsSync(path);
};

export const getFile = async (path: string, encoding?: BufferEncoding): Promise<string | Buffer> => {
    const readFile = promisify(fs.readFile);
    return encoding ? readFile(path, encoding) : readFile(path, 'utf8');
};

export const createFile = async (path: string, fileName: string, data: string): Promise<string> => {
    if (!checkIfFileOrDirectoryExists(path)) {
        fs.mkdirSync(path);
    }

    fs.writeFileSync(`${path}/${fileName}`, data, 'utf8');

    return join(`${path}/${fileName}`);
};

export const deleteFile = async (path: string, fileName: string): Promise<void> => {
    const unlink = promisify(fs.unlink);

    return await unlink(`${path}/${fileName}`);
};

declare namespace Express {
    namespace Multer {
        interface File {
            buffer: Buffer;
            fieldname: string;
            originalname: string;
            encoding: string;
            mimetype: string;
            size: number;
            destination: string;
            filename: string;
            path: string;
            stream: NodeJS.ReadableStream;
        }
    }
}
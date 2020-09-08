import {IncomingMessage, OutgoingHttpHeaders, ServerResponse} from "http";
import * as fs from "fs";
import * as path from "path";

const DEFAULT_CHARSET = 'utf-8';

export type HttpResultArray =
    [number, {[key:string]:string|undefined}, (Buffer|string)?] |
    [number, (Buffer|string)?] |
    number;

export class StaticFileCollection {

    static async fetchLastModified(path: string) {
       const stat = await fs.promises.stat(path);
       return new Date(stat.mtimeMs);
    }

    static async getFileResponse(path: string) {
        return fs.promises.readFile(path);
    }

    public staticDirname: string;

    constructor(dir: string) {
        this.staticDirname = dir;
    }

    async handleHttpRequest(req: IncomingMessage, res: ServerResponse) {
        let result : HttpResultArray;
        switch (req.method) {
            case 'HEAD': result = await this.onhead(req); break;
            case 'GET':  result = await this.onget(req);  break;
            case 'POST':    
            case 'PUT':     
            case 'DELETE': result = [405]; break;
            default: result = [501]; break;
        }

        const [status, headers, content] = typeof result === 'number'
            ? [result]
            : result;

        if (headers instanceof Buffer || typeof headers !== 'object') {
            res.writeHead(status);
            res.end(headers);
        } else {
            res.writeHead(status, headers);
            res.end(content);
        }
    }


    toStaticPath(url: string) {
        const i = url.lastIndexOf('?');
        const pathname = i === -1 ? url : url.slice(0, i);
        return this.staticDirname + (/\/$/.test(pathname) ? pathname + 'index.html' : pathname);
    }

    async onhead(req: IncomingMessage): Promise<HttpResultArray> {
        const path = this.toStaticPath(<string>req.url);
        return fs.promises
            .access(path, fs.constants.F_OK | fs.constants.R_OK)
            .then(async () => {
                return <HttpResultArray>[200, {
                    'Content-Type': `${get_mimetype(path)}; charset="${DEFAULT_CHARSET}"`,
                    'Last-Modified': (await StaticFileCollection.fetchLastModified(path)).toUTCString()
                }]
            })
            .catch(() => [404]);
    }

    async onget(req: IncomingMessage): Promise<HttpResultArray> {
        const path = this.toStaticPath(<string>req.url);
        const result = await this.onhead(req);
        if(typeof result === 'number' || result[0] !== 200) return result;
        const content = await fs.promises.readFile(path);
        return <HttpResultArray> result.concat(content);
    }

}


/**
 * 拡張子から予測されるmimetypeを返す
 * @param p
 */
function get_mimetype(p: string): string {
    switch (path.extname(p)) {
        case '.json': return 'application/json';
        case '.html': return 'text/html';
        case '.css': return 'text/css';
        case '.csv': return 'text/csv';
        case '.txt': return 'text/plain';
        case '.js': return 'application/javascript';
        case '.es': return 'application/ecmascript';
    }
    return 'text/plain'; // unknown
}
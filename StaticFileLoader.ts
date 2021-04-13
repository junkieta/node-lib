import * as fs from "fs";
import * as path from "path";
import { OutgoingHttpHeaders } from 'node:http';

export type HttpResponseValue = 
    { code: number, headers?: OutgoingHttpHeaders, body?: string | Buffer };

export type StaticFileLoaderOptions = {
    charset?: string;
    dirindex?: string[];
};

export class StaticFileLoader {

    defaultCharset = 'utf-8';
    staticDirName : string;
    directoryIndex: string[] = ['html','js','json'];

    constructor(dir: string, options?: StaticFileLoaderOptions) {
        this.staticDirName = dir;
        if(!options) return;
        if(options.charset)
            this.defaultCharset = options.charset;
        if(options.dirindex)
            this.directoryIndex = options.dirindex;
    }

    async accesibleCheck(pathname: string) : Promise<boolean> {
        return fs.promises
            .access(pathname, fs.constants.F_OK | fs.constants.R_OK)
            .then(() => true)
            .catch(() => false);
    }

    async fetch(relative_path: string, if_modified_since?: Date) : Promise<HttpResponseValue> {
        const pathname = this.staticDirName + relative_path;
        if (/\/$/.test(pathname)) {
            const ext = this.directoryIndex
                .find(async (ext) => await this.accesibleCheck(pathname + 'index.' + ext));
            return ext ? this.fetch(relative_path + 'index.' + ext, if_modified_since) : { code: 403 };
        }
        
        if(!await this.accesibleCheck(pathname))
            return { code: 404 };

        // toUTCString で msは抜け落ちるため0に上書きしておく
        const last_modified = (await fs.promises.stat(pathname)).mtime;
        last_modified.setMilliseconds(0);

        if(if_modified_since && if_modified_since >= last_modified)
            return { code: 304, headers: { 'Last-Modified': last_modified.toUTCString() } };

        return {
            code: 200,
            headers: {
                'Content-Type': `${get_mimetype_by_extension(pathname)}; charset="${this.defaultCharset}"`,
                'Last-Modified': last_modified.toUTCString()
            },
            body: await fs.promises.readFile(pathname)
        };
    }

}


/**
 * 拡張子から予測されるmimetypeを返す
 * @param p
 */
function get_mimetype_by_extension(p: string): string {
    const ext = path.extname(p);
    switch (ext) {
        case '.html': 
        case '.css': 
        case '.csv': return 'text/' + ext.slice(1);
        case '.txt': return 'text/plain';

        case '.json': return 'application/json';
        case '.js': return 'application/javascript';
        case '.es': return 'application/ecmascript';

        case '.jpg': return 'image/jpeg';
        case '.jpeg':
        case '.gif':
        case '.png': return 'image/' + ext.slice(1);

    }
    return 'text/plain'; // unknown
}

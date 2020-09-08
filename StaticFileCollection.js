"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticFileCollection = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DEFAULT_CHARSET = 'utf-8';
class StaticFileCollection {
    constructor(dir) {
        this.staticDirname = dir;
    }
    static async fetchLastModified(path) {
        const stat = await fs.promises.stat(path);
        return new Date(stat.mtimeMs);
    }
    static async getFileResponse(path) {
        return fs.promises.readFile(path);
    }
    async handleHttpRequest(req, res) {
        let result;
        switch (req.method) {
            case 'HEAD':
                result = await this.onhead(req);
                break;
            case 'GET':
                result = await this.onget(req);
                break;
            case 'POST':
            case 'PUT':
            case 'DELETE':
                result = [405];
                break;
            default:
                result = [501];
                break;
        }
        const [status, headers, content] = typeof result === 'number'
            ? [result]
            : result;
        if (headers instanceof Buffer || typeof headers !== 'object') {
            res.writeHead(status);
            res.end(headers);
        }
        else {
            res.writeHead(status, headers);
            res.end(content);
        }
    }
    toStaticPath(url) {
        const i = url.lastIndexOf('?');
        const pathname = i === -1 ? url : url.slice(0, i);
        return this.staticDirname + (/\/$/.test(pathname) ? pathname + 'index.html' : pathname);
    }
    async onhead(req) {
        const path = this.toStaticPath(req.url);
        return fs.promises
            .access(path, fs.constants.F_OK | fs.constants.R_OK)
            .then(async () => {
            return [200, {
                    'Content-Type': `${get_mimetype(path)}; charset="${DEFAULT_CHARSET}"`,
                    'Last-Modified': (await StaticFileCollection.fetchLastModified(path)).toUTCString()
                }];
        })
            .catch(() => [404]);
    }
    async onget(req) {
        const path = this.toStaticPath(req.url);
        const result = await this.onhead(req);
        if (typeof result === 'number' || result[0] !== 200)
            return result;
        const content = await fs.promises.readFile(path);
        return result.concat(content);
    }
}
exports.StaticFileCollection = StaticFileCollection;
/**
 * 拡張子から予測されるmimetypeを返す
 * @param p
 */
function get_mimetype(p) {
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
//# sourceMappingURL=StaticFileCollection.js.map
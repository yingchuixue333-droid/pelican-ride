import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const args=process.argv.slice(2),port=Number(args[args.indexOf('--port')+1])||5173;
const root=process.cwd(),types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json'};
http.createServer((req,res)=>{let file;try{const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(relative.split('/').some(s=>s.startsWith('.')))throw Error();file=path.resolve(root,'.'+relative);if(!file.startsWith(root+path.sep)&&file!==root)throw Error();if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');fs.createReadStream(file).on('error',()=>res.end()).pipe(res);}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'0.0.0.0',()=>console.log(`Local: http://localhost:${port}`));

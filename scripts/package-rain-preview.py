"""Generate only the isolated Pages preview. Does not change formal files."""
from pathlib import Path
import shutil
r=Path(__file__).resolve().parents[1];out=r/'orchard-preview';out.mkdir(exist_ok=True)
s=(r/'index.html').read_text().replace('风里农场 · 轻松种收','风里农场 · 雨后果园试玩')
for f in ['fling.html','station.html','play.html','FARM-V30-RELEASE.md']:s=s.replace('href="'+f+'"','href="../'+f+'"')
(out/'index.html').write_text(s)
(out/'farm').mkdir(exist_ok=True)
for p in (r/'farm').iterdir():
 if p.suffix in ['.js','.css']:
  s=p.read_text()
  if p.name=='assets.js':s=s.replace("new URL('./assets/'","new URL('../../farm/assets/'")
  (out/'farm'/p.name).write_text(s)
shutil.copytree(r/'farm/rain-assets',out/'farm/rain-assets',dirs_exist_ok=True)
shutil.copytree(r/'qa/rain-evidence',out/'evidence',dirs_exist_ok=True)
shutil.copy(r/'FARM-RAIN-PREVIEW.md',out/'REPORT.md')
(out/'compare.html').write_text('''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>雨后果园 · 实玩与对比</title><style>body{margin:0;background:#e5eddf;color:#29473c;font:16px/1.7 system-ui}main{max-width:860px;margin:auto;padding:24px}a{color:#315e45}video{display:block;width:100%;max-width:360px;border-radius:18px}.pair{display:flex;gap:16px;flex-wrap:wrap}figure{margin:0;flex:1;min-width:240px}img{width:100%;max-width:390px}h1{font-size:27px}.play{display:inline-block;padding:12px 24px;border:1px solid #607e52;border-radius:40px}</style><main><h1>雨后果园</h1><p><a class="play" href="./?v=rain2">直接进果园</a></p><p>独立示范档，打开就有熟果。正式首页和正式存档保持原样。</p><h2>18秒连续实玩</h2><video controls playsinline preload="metadata" poster="evidence/after-390.jpg" src="evidence/walkthrough.mp4"></video><p>全新桌面Chromium资料，360×800，30fps，无剪辑或加速。点果、落篮、去菜地、返回、近看。</p><h2>同尺寸首屏</h2><div class="pair"><figure><figcaption>上次默认首屏 · 幼苗</figcaption><img src="evidence/before-390.jpg" alt="上一版390×844默认首屏"></figure><figure><figcaption>本次默认示范 · 可摘苹果</figcaption><img src="evidence/after-390.jpg" alt="雨后果园390×844默认首屏"></figure></div><p>同视口390×844；两版默认树龄不同，并非同龄树对比。</p><h2>本次幼苗</h2><img src="evidence/seedling-390.jpg" alt="本版幼苗实景"><p>npm test、npm run test:farm通过。360／390／412宽度无横向溢出，直接摘果及菜地往返可用。未使用安卓真机，未实测安卓自带浏览器、GPU与弱网。<a href="REPORT.md">完整改动与验收记录</a></p></main></html>''')
print('Packaged isolated orchard-preview only')

import { useState, useRef, useCallback, useEffect } from 'react';
import { inferenceApi, hazardApi } from '../services/api';

const T = { teal:'#072E24', tealMid:'#156B52', yellow:'#C8D400', cream:'#F4F0E6', creamDark:'#EAE5D6', textDark:'#0D1E1B' };

const CLASS_INFO = {
  D00: { label:'Longitudinal Crack', color:'#d97706', severity:'Low' },
  D10: { label:'Transverse Crack',   color:'#ea580c', severity:'Medium' },
  D20: { label:'Alligator Cracking', color:'#dc2626', severity:'High' },
  D40: { label:'Pothole',            color:'#991b1b', severity:'Critical' },
  D43: { label:'Surface Damage',     color:'#ea580c', severity:'Medium' },
  D44: { label:'Cross-walk Blur',    color:'#d97706', severity:'Low' },
  D50: { label:'Manhole Cover',      color:'#7c3aed', severity:'Low' },
};

function getClassInfo(cls) {
  if (CLASS_INFO[cls]) return CLASS_INFO[cls];
  const d = parseInt(cls.replace(/\D/g,'').slice(-1),10);
  const s = d>=5?'Critical':d>=3?'High':d>=1?'Medium':'Low';
  const c = {Low:'#d97706',Medium:'#ea580c',High:'#dc2626',Critical:'#991b1b'};
  return { label:cls.replace(/([A-Z])(\d)/,'$1 $2'), color:c[s], severity:s };
}

const DEMO = {
  detections:[{class:'D40',confidence:0.91,bbox:[120,200,280,320]},{class:'D10',confidence:0.74,bbox:[340,150,180,90]}],
  inference_ms:43, model:'YOLOv8-Nano (demo mode)',
};

async function reverseGeocode(lat,lng) {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,{headers:{'Accept-Language':'en','User-Agent':'AegisRoad/1.0'}});
    const d = await r.json();
    return d.address?.road||d.address?.suburb||d.address?.city_district||d.address?.city||`${lat.toFixed(4)},${lng.toFixed(4)}`;
  } catch { return `${lat.toFixed(4)},${lng.toFixed(4)}`; }
}

const card = { background:'#FFFFFF', border:'1px solid rgba(13,30,27,0.1)', borderRadius:'16px', padding:'24px' };

export default function EdgeAI() {
  const [file,setFile]=useState(null);
  const [preview,setPreview]=useState(null);
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [reported,setReported]=useState(false);
  const [dragOver,setDragOver]=useState(false);
  const [autoPinned,setAutoPinned]=useState(false);
  const [gpsPos,setGpsPos]=useState(null);
  const [gpsStatus,setGpsStatus]=useState('idle');
  const [roadName,setRoadName]=useState(null);
  const [gpsError,setGpsError]=useState(null);
  const [gpsAccuracy,setGpsAccuracy]=useState(null);
  const watchRef=useRef(); const fileRef=useRef();

  useEffect(() => {
    const isSecure=window.location.protocol==='https:'||['localhost','127.0.0.1'].includes(window.location.hostname);
    if (!isSecure){setGpsStatus('error');setGpsError('GPS requires HTTPS.');return;}
    if (!navigator.geolocation){setGpsStatus('error');setGpsError('GPS not available on this device');return;}
    setGpsStatus('fetching');
    watchRef.current=navigator.geolocation.watchPosition(
      async pos=>{const{latitude:lat,longitude:lng,accuracy}=pos.coords;setGpsPos({lat,lng});setGpsAccuracy(Math.round(accuracy));setGpsStatus('ok');setGpsError(null);const n=await reverseGeocode(lat,lng);setRoadName(n);},
      err=>{setGpsStatus('error');setGpsError(err.code===1?'Location permission denied.':err.code===2?'Position unavailable.':'GPS timed out.');},
      {enableHighAccuracy:true,timeout:10000,maximumAge:5000}
    );
    return ()=>{if(watchRef.current)navigator.geolocation.clearWatch(watchRef.current);};
  },[]);

  useEffect(()=>{if(result&&gpsStatus==='ok'&&gpsPos&&!autoPinned&&result.detections?.length>0)autoPinHazard();},[result,gpsStatus,gpsPos]);

  const handleFile=useCallback(f=>{if(!f||!f.type.startsWith('image/'))return;setFile(f);setPreview(URL.createObjectURL(f));setResult(null);setError(null);setReported(false);setAutoPinned(false);},[]);

  function handleDrop(e){e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}

  async function runInference(){if(!file)return;setLoading(true);setError(null);try{const d=await inferenceApi.predict(file);setResult(d);}catch{setResult(DEMO);setError('⚠️ Inference server not connected — showing demo result');}setLoading(false);}

  async function autoPinHazard(){if(!result?.detections?.length||!gpsPos)return;const top=result.detections[0];const info=getClassInfo(top.class);const rn=roadName||`${gpsPos.lat.toFixed(4)},${gpsPos.lng.toFixed(4)}`;try{await hazardApi.create({road_name:rn,location:rn,lat:gpsPos.lat,lng:gpsPos.lng,coordinates:{lat:gpsPos.lat,lng:gpsPos.lng},cls:top.class,title:`${info.label} detected via Dashcam`,severity:info.severity.toLowerCase(),contractor:null,source:'edge_ai_auto',confidence:top.confidence});}catch{}setAutoPinned(true);}

  async function reportHazard(){if(!result?.detections?.length)return;if(!gpsPos){setError('❌ GPS location not available — cannot pin hazard on map.');return;}const top=result.detections[0];const info=getClassInfo(top.class);const rn=roadName||`${gpsPos.lat.toFixed(4)},${gpsPos.lng.toFixed(4)}`;try{await hazardApi.create({road_name:rn,location:rn,lat:gpsPos.lat,lng:gpsPos.lng,coordinates:{lat:gpsPos.lat,lng:gpsPos.lng},cls:top.class,title:`${info.label} detected via Dashcam`,severity:info.severity.toLowerCase(),contractor:null,source:'edge_ai',confidence:top.confidence});}catch{}setReported(true);}

  const gpsCol = gpsStatus==='ok'?T.tealMid:gpsStatus==='fetching'?'#7c3aed':gpsStatus==='error'?'#dc2626':'rgba(13,30,27,0.4)';
  const accCol = !gpsAccuracy?'rgba(13,30,27,0.4)':gpsAccuracy<20?T.tealMid:gpsAccuracy<50?'#d97706':'#dc2626';

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <div className="section-eyebrow mb-1">YOLOv8-Nano</div>
        <h1 className="text-[clamp(28px,4vw,44px)] font-black uppercase leading-tight" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>
          Edge AI — Hazard Detector
        </h1>
        <p className="text-sm mt-1" style={{ color:'rgba(13,30,27,0.5)' }}>Upload a dashcam frame · YOLOv8-Nano inference · auto-pin to live map</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ── LEFT: Upload + GPS ──────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* GPS Block */}
          <div className="rounded-2xl p-4" style={{ background:'#FFFFFF', border:`2px solid ${gpsCol}22` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">{gpsStatus==='ok'?'📍':gpsStatus==='fetching'?'🔄':gpsStatus==='error'?'❌':'📡'}</span>
                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color:'rgba(13,30,27,0.5)', fontFamily:'monospace' }}>Live GPS Location</span>
              </div>
              <div className="flex items-center gap-2">
                {gpsStatus==='fetching'&&<div className="w-3 h-3 rounded-full border-2" style={{ borderColor:`${T.tealMid}44`, borderTopColor:T.tealMid, animation:'spin 0.8s linear infinite' }}/>}
                {gpsStatus==='ok'&&<div className="w-2 h-2 rounded-full animate-pulse" style={{ background:T.tealMid }}/>}
                <span className="text-[9px] font-black uppercase" style={{ color:gpsCol, fontFamily:'monospace' }}>{gpsStatus==='ok'?'LIVE':gpsStatus==='fetching'?'ACQUIRING':gpsStatus==='error'?'ERROR':'IDLE'}</span>
              </div>
            </div>
            {gpsPos ? (
              <div className="grid grid-cols-2 gap-2">
                {[['Latitude',gpsPos.lat.toFixed(6)],['Longitude',gpsPos.lng.toFixed(6)]].map(([l,v])=>(
                  <div key={l} className="p-2.5 rounded-xl" style={{ background:T.creamDark }}>
                    <div className="text-[8px] font-black uppercase tracking-wider mb-0.5" style={{ color:'rgba(13,30,27,0.4)', fontFamily:'monospace' }}>{l}</div>
                    <div className="text-sm font-black font-mono" style={{ color:T.teal }}>{v}</div>
                  </div>
                ))}
                <div className="col-span-2 flex justify-between items-center p-2.5 rounded-xl" style={{ background:T.creamDark }}>
                  <span className="text-[11px] truncate" style={{ color:'rgba(13,30,27,0.55)' }}>{roadName?`📌 ${roadName}`:'⏳ Resolving road name...'}</span>
                  {gpsAccuracy&&<span className="text-xs font-black ml-2 shrink-0" style={{ color:accCol }}>±{gpsAccuracy}m</span>}
                </div>
              </div>
            ) : gpsStatus==='error' ? (
              <div>
                <p className="text-sm mb-2" style={{ color:'#dc2626' }}>{gpsError}</p>
                <button onClick={()=>{setGpsStatus('fetching');setGpsError(null);}} className="text-xs font-black uppercase px-3 py-1.5 rounded-lg cursor-pointer" style={{ background:T.teal, color:T.yellow, fontFamily:"'Barlow Condensed',sans-serif" }}>Retry GPS</button>
              </div>
            ) : (
              <p className="text-sm" style={{ color:'rgba(13,30,27,0.5)' }}>{gpsStatus==='fetching'?'⏳ Acquiring GPS signal...':'GPS not started'}</p>
            )}
          </div>

          {/* Drop zone */}
          <div
            className="rounded-2xl p-8 text-center cursor-pointer transition-all"
            style={{ border:`2px dashed ${dragOver?T.teal:'rgba(13,30,27,0.2)'}`, background:dragOver?'rgba(7,46,36,0.06)':'#FFFFFF', minHeight:'200px', display:'flex', alignItems:'center', justifyContent:'center' }}
            onClick={()=>fileRef.current.click()}
            onDrop={handleDrop}
            onDragOver={e=>{e.preventDefault();setDragOver(true);}}
            onDragLeave={()=>setDragOver(false)}
          >
            {preview ? (
              <img src={preview} className="max-h-56 mx-auto rounded-xl object-contain" alt="dashcam frame" />
            ) : (
              <div className="space-y-2">
                <span className="text-4xl block">📷</span>
                <p className="text-sm font-bold" style={{ color:T.teal }}>Drop dashcam image here</p>
                <p className="text-xs" style={{ color:'rgba(13,30,27,0.4)' }}>or click to browse · JPG / PNG</p>
                {gpsStatus==='ok'&&<p className="text-xs font-bold" style={{ color:T.tealMid }}>📍 GPS ready — hazard will auto-pin on detection</p>}
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>handleFile(e.target.files[0])} />

          {file && <p className="text-xs font-mono p-2.5 rounded-xl" style={{ background:T.creamDark, color:T.teal }}>📎 {file.name} · {(file.size/1024).toFixed(1)} KB</p>}
          {error && <p className="text-sm p-3 rounded-xl border" style={{ color:'#d97706', background:'#fef3c7', borderColor:'#fde68a' }}>{error}</p>}
          {autoPinned && (
            <div className="p-3 rounded-xl border flex items-center gap-2 text-sm font-bold" style={{ color:T.tealMid, background:'rgba(21,107,82,0.08)', borderColor:'rgba(21,107,82,0.2)' }}>
              ✅ Auto-pinned at {gpsPos?.lat.toFixed(5)}, {gpsPos?.lng.toFixed(5)}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button onClick={runInference} disabled={!file||loading} className="w-full py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider cursor-pointer disabled:opacity-40 transition-all hover:scale-[1.01] flex items-center justify-center gap-2" style={{ background:T.teal, color:T.yellow, fontFamily:"'Barlow Condensed',sans-serif" }}>
              {loading ? (
                <><div className="w-4 h-4 rounded-full border-2" style={{ borderColor:`${T.yellow}44`, borderTopColor:T.yellow, animation:'spin 0.8s linear infinite' }}/>Analysing...</>
              ) : '🔍 Detect Hazards'}
            </button>
            {result && !reported && (
              <button onClick={reportHazard} disabled={gpsStatus!=='ok'} className="w-full py-3 rounded-2xl text-sm font-black uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-all" style={{ background:gpsStatus==='ok'?'#dc2626':'rgba(13,30,27,0.1)', color:'#fff', fontFamily:"'Barlow Condensed',sans-serif" }}>
                {gpsStatus==='ok'?'🚨 Report to Authorities':'⏳ Waiting for GPS fix...'}
              </button>
            )}
            {reported && (
              <div className="w-full py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(21,107,82,0.1)', color:T.tealMid, border:`1px solid rgba(21,107,82,0.2)` }}>
                ✅ Hazard logged at {gpsPos?.lat.toFixed(4)}, {gpsPos?.lng.toFixed(4)} · SLA timer started
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Results ────────────────────────────────── */}
        <div style={card}>
          <h3 className="text-lg font-black uppercase mb-5 pb-3 border-b" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal, borderColor:'rgba(13,30,27,0.08)' }}>Detection Results</h3>

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
              <span className="text-4xl opacity-30">🛣️</span>
              <p className="text-sm" style={{ color:'rgba(13,30,27,0.4)' }}>Upload an image and click "Detect Hazards"</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-8 h-8 rounded-full border-4" style={{ borderColor:`${T.tealMid}33`, borderTopColor:T.tealMid, animation:'spin 0.8s linear infinite' }}/>
              <p className="text-sm font-bold" style={{ color:T.teal }}>Running YOLOv8-Nano…</p>
              <p className="text-xs" style={{ color:'rgba(13,30,27,0.4)' }}>Sending frame to HF Space</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-5">
              <div className="flex gap-2 flex-wrap">
                {[`⚡ ${result.inference_ms}ms`,`${result.detections?.length??0} detection(s)`,`🤖 ${result.model}`].map(t=>(
                  <span key={t} className="text-[10px] font-bold px-2.5 py-1 rounded-lg" style={{ background:T.creamDark, color:T.teal, fontFamily:'monospace' }}>{t}</span>
                ))}
              </div>

              {result.detections?.length===0 && (
                <div className="p-4 rounded-xl font-bold" style={{ background:'rgba(21,107,82,0.08)', color:T.tealMid, border:`1px solid rgba(21,107,82,0.2)` }}>✅ No damage detected in this frame</div>
              )}

              <div className="space-y-3">
                {result.detections?.map((d,i)=>{
                  const info=getClassInfo(d.class);
                  const pct=Math.round(d.confidence*100);
                  return (
                    <div key={i} className="p-4 rounded-xl relative overflow-hidden border" style={{ background:T.creamDark, borderColor:'rgba(13,30,27,0.08)', borderLeft:`4px solid ${info.color}` }}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm" style={{ color:info.color }}>{d.class}</span>
                          <span className="font-bold text-sm" style={{ color:T.teal }}>{info.label}</span>
                        </div>
                        <span className="font-mono font-black text-sm" style={{ color:info.color }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background:'rgba(13,30,27,0.1)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, background:info.color }}/>
                      </div>
                      <p className="text-[10px] font-mono" style={{ color:'rgba(13,30,27,0.45)' }}>Severity: <strong style={{ color:info.color }}>{info.severity}</strong> · BBox: [{d.bbox?.map(Math.round).join(',')}]</p>
                    </div>
                  );
                })}
              </div>

              {gpsStatus==='ok'&&gpsPos&&(
                <div className="p-3 rounded-xl space-y-1.5" style={{ background:T.creamDark, border:'1px solid rgba(13,30,27,0.08)' }}>
                  <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color:'rgba(13,30,27,0.4)', fontFamily:'monospace' }}>{autoPinned?'✅ Auto-pinned at':'📍 Will be pinned at'}</div>
                  {[[`Coordinates`,`${gpsPos.lat.toFixed(6)}, ${gpsPos.lng.toFixed(6)}`],roadName&&['Road',roadName],gpsAccuracy&&['GPS Accuracy',`±${gpsAccuracy}m`]].filter(Boolean).map(([l,v])=>(
                    <div key={l} className="flex justify-between text-xs">
                      <span style={{ color:'rgba(13,30,27,0.45)' }}>{l}</span>
                      <span className="font-mono font-bold" style={{ color:T.teal }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Model info */}
          <div className="mt-6 pt-5 border-t" style={{ borderColor:'rgba(13,30,27,0.08)' }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color:'rgba(13,30,27,0.4)', fontFamily:'monospace' }}>Model Pipeline</p>
            <div className="space-y-2">
              {[['Architecture','YOLOv8-Nano'],['Training data','GRDDC + IDD (Kaggle)'],['Classes','D00 · D10 · D20 · D40'],['Inference server','HF Spaces (Docker)'],['Target mAP@50','≥ 0.50'],['Location source',gpsStatus==='ok'?'✅ Live GPS':'⚠️ GPS pending']].map(([k,v])=>(
                <div key={k} className="flex justify-between text-xs pb-1.5 border-b" style={{ borderColor:'rgba(13,30,27,0.06)' }}>
                  <span style={{ color:'rgba(13,30,27,0.45)' }}>{k}</span>
                  <span className="font-mono font-bold" style={{ color:T.teal }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}

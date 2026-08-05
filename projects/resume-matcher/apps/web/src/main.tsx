import React from 'react';
import ReactDOM from 'react-dom/client';
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { jsPDF } from 'jspdf';
import './styles.css';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
const API = import.meta.env.VITE_API_URL || 'http://localhost:8787';

type Resume = {name:string; contact:string; summary:string; skills:string[]; experience:{heading:string; bullets:string[]}[]; education:string[]; certifications?:string[]};

async function extractPdf(file: File) {
  const pdf = await pdfjs.getDocument({data: await file.arrayBuffer()}).promise;
  const pages:string[]=[];
  for(let i=1;i<=pdf.numPages;i++){
    const content=await (await pdf.getPage(i)).getTextContent();
    pages.push(content.items.map((x:any)=>x.str).join(' '));
  }
  return pages.join('\n');
}

function downloadPdf(r:Resume){
  const doc=new jsPDF({unit:'pt',format:'letter'}); let y=38; const left=36, width=540;
  const line=(text:string,size=9,bold=false,gap=11)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);const lines=doc.splitTextToSize(text,width);doc.text(lines,left,y);y+=lines.length*gap;};
  const section=(title:string)=>{y+=4;line(title.toUpperCase(),10,true,12);doc.setLineWidth(.5);doc.line(left,y-8,576,y-8);};
  doc.setTextColor(20,20,20); line(r.name,16,true,17); line(r.contact,8,false,10); section('Professional Summary');line(r.summary,9,false,11);section('Core Skills');line(r.skills.join(' • '),8.5,false,10);
  section('Professional Experience');
  for(const role of r.experience){line(role.heading,9,true,11);for(const b of role.bullets)line('• '+b,8.5,false,10);}
  section('Education');for(const e of r.education)line(e,8.5,false,10);
  if(r.certifications?.length){section('Certifications');line(r.certifications.join(' • '),8.5,false,10);}
  if(y>756){alert('The generated resume exceeds one page. Ask Claude to shorten it and tailor again.');return;}
  doc.save('PM_Resume.pdf');
}

function App(){
  const [resume,setResume]=React.useState(()=>localStorage.getItem('masterResume')||'');
  const [jobUrl,setJobUrl]=React.useState(''); const [jobText,setJobText]=React.useState('');
  const [result,setResult]=React.useState<Resume|null>(null); const [status,setStatus]=React.useState('');
  const save=(text:string)=>{setResume(text);localStorage.setItem('masterResume',text)};
  const upload=async(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;setStatus('Reading your PDF…');try{save(await extractPdf(f));setStatus('Master resume saved in this browser.')}catch{setStatus('Could not read that PDF. Try a searchable-text PDF.')}};
  const tailor=async()=>{if(!resume.trim()||(!jobUrl.trim()&&!jobText.trim()))return setStatus('Add your master resume and a job URL or description.');setStatus('Tailoring with Claude…');setResult(null);try{const res=await fetch(`${API}/api/tailor`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({masterResume:resume,jobUrl,jobDescription:jobText})});const data=await res.json();if(!res.ok)throw new Error(data.error||'Request failed');setResult(data.resume);setStatus(`Tailored for ${data.jobTitle||'the role'}${data.company?' at '+data.company:''}.`)}catch(e:any){setStatus(e.message)}};
  return <main><header><span className="eyebrow">PERSONAL RESUME WORKSPACE</span><h1>Make every application<br/><em>feel intentional.</em></h1><p>Your master resume stays in this browser. Claude tailors only supported facts to the role.</p></header>
    <section className="panel"><div className="step"><b>01</b><div><h2>Master resume</h2><p>Upload once. A searchable PDF works best.</p><label className="upload">Choose PDF<input type="file" accept="application/pdf" onChange={upload}/></label>{resume&&<span className="saved">✓ Saved locally</span>}</div></div>
    <div className="step"><b>02</b><div><h2>Target role</h2><input placeholder="Paste job-posting URL" value={jobUrl} onChange={e=>setJobUrl(e.target.value)}/><div className="or">OR</div><textarea placeholder="Paste the job description if the page is blocked" value={jobText} onChange={e=>setJobText(e.target.value)}/></div></div>
    <button className="primary" onClick={tailor}>Tailor my resume <span>→</span></button><p className="status">{status}</p></section>
    {result&&<section className="result"><div><span className="eyebrow">READY TO REVIEW</span><h2>{result.name}</h2><p>{result.summary}</p></div><button onClick={()=>downloadPdf(result)}>Download one-page PDF</button></section>}
    <footer>Private by design · Truthful XYZ tailoring · ATS-friendly output</footer></main>
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

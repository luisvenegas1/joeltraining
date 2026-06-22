import { useState, useEffect, useRef } from "react";
import {
  CHART_COLORS,
  EQUIPMENT_TYPES,
  MEASUREMENT_FIELDS,
  MUSCLE_GROUPS_FILTER,
  PAYMENT_PERIODS,
  PLAN_FORMATS,
  PLAN_MODALITIES,
  PLAN_TYPES,
  SURFACE_TYPES,
} from "./johel-training.constants";
import { addMonths, calcAge, daysLeft, fmtDate, genId, getPlanStatus, getPlanStatusFromEndDate, initials, planColor, useLS, hashPassword } from "./johel-training.utils";
import { Modal, PasswordInput, Toast, VideoModal, ExercisePicker, StretchPicker, Logo } from "./johel-training.ui";

export function Dashboard({users}){
  const enabled=users.filter(u=>!u.disabled);
  const disabled=users.filter(u=>u.disabled);
  const total=enabled.length;
  const active=enabled.filter(u=>getPlanStatus(u.plan)==="Activo").length;
  const expiring=enabled.filter(u=>{const d=daysLeft(u.plan?.endDate);return d!==null&&d>=0&&d<=30}).length;
  const expired=enabled.filter(u=>getPlanStatus(u.plan)==="Vencido").length;
  return(<div>
    <div className="ph">
      <div><div className="pt">Dashboard</div><div className="ps">Panel de control</div></div>
    </div>
    <div className="stats">
      <div className="stat"><div className="sl">Clientes</div><div className="sv">{total}</div></div>
      <div className="stat"><div className="sl">Activos</div><div className="sv" style={{color:"#2E7D32"}}>{active}</div></div>
      <div className="stat"><div className="sl">Vencidos</div><div className="sv" style={{color:"#E53935"}}>{expired}</div></div>
      <div className="stat"><div className="sl">Vencen pronto</div><div className="sv" style={{color:expiring>0?"#F57C00":"#6B7A99"}}>{expiring}</div></div>
    </div>

    <div className="card" style={{marginBottom:16}}>
      <div style={{padding:"12px 16px 8px",fontWeight:700,fontSize:12,color:"#0B1F4B",textTransform:"uppercase",letterSpacing:1,borderBottom:"1px solid #DDE4F0"}}>
        👥 Clientes habilitados ({enabled.length})
      </div>
      <div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Cliente</th><th>Plan</th><th>Modalidad</th><th>Vence</th><th>Estado</th></tr></thead>
        <tbody>{enabled.map(u=>{
          const st=getPlanStatus(u.plan);
          const d=daysLeft(u.plan?.endDate);
          return(<tr key={u.id}>
            <td><strong>{u.name}</strong><br/><span style={{color:"#6B7A99",fontSize:10}}>@{u.username}</span></td>
            <td><span className={`badge ${planColor(u.plan?.type)}`}>{u.plan?.type||"—"}</span></td>
            <td><span className="badge bd-gray">{u.plan?.modality||"—"}</span></td>
            <td style={{fontSize:11}}>{fmtDate(u.plan?.endDate)}{d!==null&&d>=0&&d<=30&&<span style={{color:"#F57C00",fontWeight:700}}> ({d}d)</span>}</td>
            <td><span className={`badge ${st==="Activo"?"bd-green":st==="Vencido"?"bd-red":"bd-gray"}`}>{st}</span></td>
          </tr>);
        })}{enabled.length===0&&<tr><td colSpan={5}><div className="empty"><div className="ico">👥</div><p>Sin clientes habilitados</p></div></td></tr>}</tbody>
      </table></div>
    </div>

    {disabled.length>0&&<div className="card" style={{padding:0}}>
      <div style={{padding:"12px 16px 8px",fontWeight:700,fontSize:12,color:"#9E9E9E",textTransform:"uppercase",letterSpacing:1,borderBottom:"1px solid #DDE4F0"}}>
        🚫 Clientes deshabilitados ({disabled.length})
      </div>
      <div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Cliente</th><th>Plan</th><th>Modalidad</th><th>Vence</th><th></th></tr></thead>
        <tbody>{disabled.map(u=>{
          return(<tr key={u.id} style={{opacity:0.6}}>
            <td><strong>{u.name}</strong><br/><span style={{color:"#6B7A99",fontSize:10}}>@{u.username}</span></td>
            <td><span className={`badge ${planColor(u.plan?.type)}`}>{u.plan?.type||"—"}</span></td>
            <td><span className="badge bd-gray">{u.plan?.modality||"—"}</span></td>
            <td style={{fontSize:11}}>{fmtDate(u.plan?.endDate)}</td>
            <td><span className="badge bd-red">🚫 Deshabilitado</span></td>
          </tr>);
        })}</tbody>
      </table></div>
    </div>}
  </div>);
}

// ── ADMINS PAGE ──
export function AdminsPage(){
  const[admins,setAdmins]=useLS("jh_admins_v3",[]);
  const[showAdd,setShowAdd]=useState(false);
  const[form,setForm]=useState({name:"",username:"",password:""});
  const[err,setErr]=useState("");

  function add(){
    if(!form.name||!form.username||!form.password){setErr("Todos los campos son requeridos");return}
    if(form.username==="johel"||admins.some(a=>a.username===form.username)){setErr("Ese usuario ya existe");return}
    setAdmins([...admins,{id:genId(),...form,role:"trainer"}]);setForm({name:"",username:"",password:""});setErr("");setShowAdd(false);
  }
  function del(id){if(!confirm("¿Eliminar administrador?"))return;setAdmins(admins.filter(a=>a.id!==id))}

  return(<div>
    <div className="ph"><div><div className="pt">Administradores</div><div className="ps">Perfiles con acceso de entrenador</div></div><button className="btn btn-p" onClick={()=>setShowAdd(true)}>+ Nuevo admin</button></div>
    <div className="card" style={{padding:0}}>
      <div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th></th></tr></thead>
        <tbody>
          <tr><td><strong>Johel Herrera</strong></td><td>@johel</td><td><span className="badge bd-blue">Principal</span></td><td></td></tr>
          {admins.map(a=>(<tr key={a.id}>
            <td><strong>{a.name}</strong></td><td>@{a.username}</td>
            <td><span className="badge bd-gray">Administrador</span></td>
            <td><button className="ibtn d" onClick={()=>del(a.id)}>🗑</button></td>
          </tr>))}
          {admins.length===0&&<tr><td colSpan={4} style={{textAlign:"center",color:"#6B7A99",padding:20,fontSize:12}}>Sin administradores adicionales</td></tr>}
        </tbody>
      </table></div>
    </div>
    {showAdd&&<Modal title="Nuevo administrador" onClose={()=>setShowAdd(false)}>
      {err&&<div className="err">{err}</div>}
      <div className="fg"><label>Nombre completo</label><input className="inp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ej: Ana Pérez"/></div>
      <div className="fr2">
        <div className="fg"><label>Usuario</label><input className="inp" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="ana.perez"/></div>
        <div className="fg"><label>Contraseña</label><PasswordInput value={form.password} onChange={e=>setForm({...form,password:e.target.value})} autoComplete="new-password"/></div>
      </div>
      <div style={{display:"flex",gap:8}}><button className="btn btn-p" onClick={add}>Crear</button><button className="btn btn-g" onClick={()=>setShowAdd(false)}>Cancelar</button></div>
    </Modal>}
  </div>);
}

// ── PAYMENT MODULE ──
export function PaymentModule({client,setClient}){
  const[showPay,setShowPay]=useState(false);
  const[editingPay,setEditingPay]=useState(null);
  const[period,setPeriod]=useState(1);
  const[payDate,setPayDate]=useState(new Date().toISOString().split("T")[0]);
  const[amount,setAmount]=useState(client.plan?.price||"");
  const[notes,setNotes]=useState("");
  const[toast,setToast]=useState(null);
  const ERR="Hubo un problema al guardar. Intentá de nuevo en unos minutos.";
  const payments=client.payments||[];

  function openNew(){
    setEditingPay(null);
    setPeriod(1);
    setPayDate(new Date().toISOString().split("T")[0]);
    setAmount(client.plan?.price||"");
    setNotes("");
    setShowPay(true);
  }

  function openEdit(p){
    setEditingPay(p);
    setPeriod(p.months||1);
    setPayDate(p.date||new Date().toISOString().split("T")[0]);
    setAmount(p.amount||"");
    setNotes(p.notes||"");
    setShowPay(true);
  }

  async function savePayment(){
    try{
      if(editingPay){
        // Editar pago existente — recalcular endDate
        const base=payDate;
        const newEnd=addMonths(base,period);
        const updated={...editingPay,date:payDate,months:period,amount,notes,endDate:newEnd};
        const newPayments=payments.map(p=>p.id===editingPay.id?updated:p);
        // Recalcular endDate del plan desde el pago más reciente
        const sorted=[...newPayments].sort((a,b)=>new Date(b.date)-new Date(a.date));
        const newPlan={...client.plan,endDate:sorted[0]?.endDate||client.plan?.endDate};
        await setClient({...client,plan:newPlan,payments:newPayments});
        setToast({msg:"Pago actualizado",type:"ok"});
      } else {
        const currentEnd=client.plan?.endDate;
        const base=(currentEnd&&getPlanStatusFromEndDate(currentEnd)==="Activo")?currentEnd:payDate;
        const newEnd=addMonths(base,period);
        const pay={id:genId(),date:payDate,months:period,amount,notes,endDate:newEnd};
        const newPlan={...client.plan,endDate:newEnd,startDate:client.plan?.startDate||payDate};
        await setClient({...client,plan:newPlan,payments:[pay,...payments]});
        setToast({msg:"Pago registrado correctamente",type:"ok"});
      }
      setShowPay(false);setNotes("");setEditingPay(null);
    }catch(e){console.error(e);setToast({msg:ERR,type:"err"});}
  }

  async function delPayment(id){
    if(!confirm("¿Eliminar este pago?"))return;
    try{
      const newPayments=payments.filter(p=>p.id!==id);
      const sorted=[...newPayments].sort((a,b)=>new Date(b.date)-new Date(a.date));
      const newPlan={...client.plan,endDate:sorted[0]?.endDate||""};
      await setClient({...client,plan:newPlan,payments:newPayments});
      setToast({msg:"Pago eliminado",type:"ok"});
    }catch(e){console.error(e);setToast({msg:ERR,type:"err"});}
  }

  const st=getPlanStatus(client.plan);
  const dl=daysLeft(client.plan?.endDate);
  const previewEnd=editingPay
    ?fmtDate(addMonths(payDate,period))
    :fmtDate(addMonths(client.plan?.endDate&&getPlanStatusFromEndDate(client.plan?.endDate)==="Activo"?client.plan.endDate:payDate,period));

  return(<div>
    {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    <div className="sa">
      <div>
        <span className={`badge ${st==="Activo"?"bd-green":st==="Vencido"?"bd-red":st==="Pausado"?"bd-yellow":"bd-gray"}`} style={{fontSize:12,padding:"4px 12px"}}>{st}</span>
        {dl!==null&&!client.plan?.paused&&<span style={{fontSize:11,color:"#6B7A99",marginLeft:8}}>{dl<0?`Venció hace ${Math.abs(dl)} días`:`${dl} días restantes`}</span>}
        {client.plan?.paused&&<span style={{fontSize:11,color:"#F57C00",marginLeft:8}}>Plan pausado</span>}
      </div>
      <button className="btn btn-ok btn-sm" onClick={openNew}>💰 Registrar pago</button>
    </div>

    {payments.length>0&&<div>
      <div style={{fontSize:10,fontWeight:700,color:"#6B7A99",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Historial de pagos</div>
      {payments.map(p=>{
        const lbl=PAYMENT_PERIODS.find(x=>x.months===p.months)?.label||`${p.months} meses`;
        return(<div key={p.id} className="pay-hist" style={{display:"flex",alignItems:"center",gap:8}}>
          <span>💰</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:12}}>{fmtDate(p.date)} · {lbl}</div>
            <div style={{fontSize:10,color:"#6B7A99"}}>Válido hasta: {fmtDate(p.endDate)}{p.amount&&` · ₡${p.amount}`}{p.notes&&` · ${p.notes}`}</div>
          </div>
          <button className="ibtn" onClick={()=>openEdit(p)} title="Editar">✏️</button>
          <button className="ibtn d" onClick={()=>delPayment(p.id)} title="Eliminar">🗑</button>
        </div>);
      })}
    </div>}
    {payments.length===0&&<div style={{textAlign:"center",padding:16,color:"#6B7A99",fontSize:12}}>Sin pagos registrados — el plan está sin activar</div>}

    {showPay&&<Modal title={editingPay?"Editar pago":"Registrar pago"} onClose={()=>{setShowPay(false);setEditingPay(null);}}>
      <div className="fg"><label>Fecha de pago</label><input className="inp" type="date" value={payDate} onChange={e=>setPayDate(e.target.value)}/></div>
      <div className="fg"><label>Período pagado</label>
        {PAYMENT_PERIODS.map(p=>(<div key={p.months} className={`pay-row${period===p.months?" selected":""}`} onClick={()=>setPeriod(p.months)}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${period===p.months?"#1A5DC8":"#DDE4F0"}`,background:period===p.months?"#1A5DC8":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{period===p.months&&<div style={{width:8,height:8,borderRadius:"50%",background:"#fff"}}/>}</div>
            <span style={{fontSize:13,fontWeight:600}}>{p.label}</span>
          </div>
        </div>))}
      </div>
      <div className="fr2">
        <div className="fg"><label>Monto (₡/$)</label><input className="inp" type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0"/></div>
        <div className="fg"><label>Notas</label><input className="inp" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Opcional"/></div>
      </div>
      <div style={{background:"#EFF6FF",borderRadius:8,padding:10,fontSize:12,marginBottom:12,color:"#1A5DC8"}}>
        {editingPay?"📅":"✅"} {editingPay?"Nuevo vencimiento estimado:":"Nuevo vencimiento:"} <strong>{previewEnd}</strong>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button className="btn btn-ok" onClick={savePayment}>{editingPay?"Guardar cambios":"Confirmar pago"}</button>
        <button className="btn btn-g" onClick={()=>{setShowPay(false);setEditingPay(null);}}>Cancelar</button>
      </div>
    </Modal>}
  </div>);
}

// ── PLAN EDITOR ──
export function PlanEditor({client,onSave}){
  const[form,setForm]=useState(()=>({type:"Base",modality:"En Estudio",format:"Individual",startDate:"",endDate:"",price:"",notes:"",paused:false,pausedAt:null,...(client.plan||{})}));
  const[toast,setToast]=useState(null);

  async function handleSave(){
    try{
      await onSave(form);
      setToast({msg:"Plan guardado correctamente",type:"ok"});
    }catch{
      setToast({msg:"Hubo un problema al guardar. Intentá de nuevo en unos minutos.",type:"err"});
    }
  }

  function handlePause(){
    if(!form.paused){
      // Pause: record the pause date
      setForm(f=>({...f,paused:true,pausedAt:new Date().toISOString().split("T")[0]}));
    } else {
      // Unpause: extend end date by the number of days paused
      const pausedAt=form.pausedAt?new Date(form.pausedAt+"T12:00:00"):new Date();
      const today=new Date();
      const daysPaused=Math.max(0,Math.ceil((today-pausedAt)/(1000*60*60*24)));
      let newEnd=form.endDate;
      if(newEnd&&daysPaused>0){
        const d=new Date(newEnd+"T12:00:00");
        d.setDate(d.getDate()+daysPaused);
        newEnd=d.toISOString().split("T")[0];
      }
      setForm(f=>({...f,paused:false,pausedAt:null,endDate:newEnd}));
    }
  }

  const st=getPlanStatus(form);
  const dl=daysLeft(form.endDate);
  const daysPausedSoFar=form.paused&&form.pausedAt?Math.ceil((new Date()-new Date(form.pausedAt+"T12:00:00"))/(1000*60*60*24)):0;

  return(<div className="card">
    {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
      <div style={{fontWeight:700,fontSize:13}}>Configuración del plan</div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <span className={`badge ${st==="Activo"?"bd-green":st==="Pausado"?"bd-yellow":st==="Vencido"?"bd-red":"bd-gray"}`}>{st}</span>
        {dl!==null&&!form.paused&&<span style={{fontSize:11,color:dl<0?"#E53935":dl<=30?"#F57C00":"#6B7A99"}}>{dl<0?`Venció hace ${Math.abs(dl)}d`:`${dl} días restantes`}</span>}
        {form.paused&&<span style={{fontSize:11,color:"#F57C00"}}>Pausado hace {daysPausedSoFar}d</span>}
      </div>
    </div>

    <div className="fr3">
      <div className="fg"><label>Tipo</label><select className="sel" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{PLAN_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
      <div className="fg"><label>Modalidad</label><select className="sel" value={form.modality} onChange={e=>setForm({...form,modality:e.target.value})}>{PLAN_MODALITIES.map(m=><option key={m} value={m}>{m}</option>)}</select></div>
      <div className="fg"><label>Formato</label><select className="sel" value={form.format} onChange={e=>setForm({...form,format:e.target.value})}>{PLAN_FORMATS.map(f=><option key={f} value={f}>{f}</option>)}</select></div>
    </div>
    <div className="fr3">
      <div className="fg"><label>Fecha inicio</label><input className="inp" type="date" value={form.startDate||""} onChange={e=>setForm({...form,startDate:e.target.value})}/></div>
      <div className="fg">
        <label>Fecha vencimiento <span style={{color:"#1A5DC8",fontSize:9,fontWeight:700}}>EDITABLE</span></label>
        <input className="inp" type="date" value={form.endDate||""} onChange={e=>setForm({...form,endDate:e.target.value})}/>
      </div>
      <div className="fg"><label>Precio (₡/$)</label><input className="inp" value={form.price||""} onChange={e=>setForm({...form,price:e.target.value})} placeholder="0"/></div>
    </div>
    <div className="fg"><label>Notas</label><input className="inp" value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Descuento, acuerdo especial..."/></div>

    <div style={{borderTop:"1px solid #DDE4F0",paddingTop:12,marginTop:4,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
      <button className="btn btn-p" onClick={handleSave}>💾 Guardar</button>
      <button
        className={`btn ${form.paused?"btn-ok":"btn-w"}`}
        onClick={handlePause}
        title={form.paused?"Quitar pausa y extender fecha según días pausados":"Poner plan en pausa"}
      >
        {form.paused?"▶ Reactivar plan":"⏸ Pausar plan"}
      </button>
      {form.paused&&<span style={{fontSize:11,color:"#6B7A99",fontStyle:"italic"}}>Al reactivar se añaden {daysPausedSoFar}d a la fecha de vencimiento</span>}
    </div>
  </div>);
}

// ── MEASUREMENTS ──
export function MeasurementsTab({client,measurements,setMeasurements}){
  const blankForm={date:new Date().toISOString().split("T")[0],...Object.fromEntries(MEASUREMENT_FIELDS.map(f=>[f.key,""]))};
  const[showAdd,setShowAdd]=useState(false);
  const[editingM,setEditingM]=useState(null);
  const[mForm,setMForm]=useState(blankForm);
  const[toast,setToast]=useState(null);
  const ERR="Hubo un problema al guardar. Intentá de nuevo en unos minutos.";
  const clientMs=measurements.filter(m=>m.clientId===client.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const latest=clientMs[0];

  function openAdd(){setMForm(blankForm);setEditingM(null);setShowAdd(true)}
  function openEdit(m){setMForm({date:m.date,...Object.fromEntries(MEASUREMENT_FIELDS.map(f=>[f.key,m[f.key]||""]))});setEditingM(m.id);setShowAdd(true)}
  async function save(){
    try{
      if(editingM){await setMeasurements(measurements.map(m=>m.id===editingM?{...m,...mForm}:m));}
      else{await setMeasurements([...measurements,{id:genId(),clientId:client.id,...mForm}]);}
      setShowAdd(false);setMForm(blankForm);setEditingM(null);
      setToast({msg:editingM?"Medición actualizada":"Medición registrada",type:"ok"});
    }catch(e){console.error(e);setToast({msg:ERR,type:"err"});}
  }
  async function del(id){
    if(!confirm("¿Eliminar medición?"))return;
    try{await setMeasurements(measurements.filter(m=>m.id!==id));setToast({msg:"Medición eliminada",type:"ok"});}
    catch(e){console.error(e);setToast({msg:ERR,type:"err"});}
  }

  return(<div>
    {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    <div className="sa">
      <div style={{fontWeight:700,fontSize:13}}>Última medición{latest?` — ${fmtDate(latest.date)}`:""}</div>
      <button className="btn btn-p btn-sm" onClick={openAdd}>+ Registrar</button>
    </div>
    {latest?(<div className="m-grid">{MEASUREMENT_FIELDS.map(f=>{const v=latest[f.key];return v?(<div key={f.key} className="m-card"><div className="m-lbl">{f.label}</div><div className="m-val">{v}<span className="m-unit"> {f.unit}</span></div></div>):null;})}</div>):<div className="empty"><div className="ico">📊</div><p>Sin mediciones</p></div>}
    {clientMs.length>1&&<div style={{marginTop:14}}>
      <div style={{fontSize:10,fontWeight:700,color:"#6B7A99",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Todas las mediciones</div>
      {clientMs.map(m=>(
        <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid #DDE4F0"}}>
          <div style={{fontWeight:700,fontSize:12,minWidth:80,color:"#0B1F4B"}}>{fmtDate(m.date)}</div>
          <div style={{flex:1,display:"flex",flexWrap:"wrap",gap:4}}>{MEASUREMENT_FIELDS.map(f=>m[f.key]&&<span key={f.key} className="hist-val">{f.label.split(" ")[0]}: {m[f.key]}{f.unit}</span>)}</div>
          <button className="ibtn" onClick={()=>openEdit(m)} title="Editar">✏️</button>
          <button className="ibtn d" onClick={()=>del(m.id)} title="Eliminar">🗑</button>
        </div>
      ))}
    </div>}
    {showAdd&&<Modal title={editingM?"Editar medición":"Registrar medición"} onClose={()=>setShowAdd(false)}>
      <div className="fg"><label>Fecha</label><input className="inp" type="date" value={mForm.date} onChange={e=>setMForm({...mForm,date:e.target.value})}/></div>
      <div className="fr2">{MEASUREMENT_FIELDS.map(f=>(<div key={f.key} className="fg"><label>{f.label}{f.unit?` (${f.unit})`:""}</label><input className="inp" type="number" step="0.1" value={mForm[f.key]} onChange={e=>setMForm({...mForm,[f.key]:e.target.value})} placeholder="—"/></div>))}</div>
      <div style={{display:"flex",gap:8}}><button className="btn btn-p" onClick={save}>{editingM?"Guardar cambios":"Guardar"}</button><button className="btn btn-g" onClick={()=>setShowAdd(false)}>Cancelar</button></div>
    </Modal>}
  </div>);
}

// ── HISTORY WITH CHART SELECTOR ──
export function MultiChart({clientMs}){
  const[chartField,setChartField]=useState("weight");
  const data=clientMs.filter(m=>m[chartField]&&Number(m[chartField])>0).slice(-10);
  const max=data.length?Math.max(...data.map(m=>Number(m[chartField]))):1;
  const min=data.length?Math.min(...data.map(m=>Number(m[chartField]))):0;
  const range=max-min||1;
  const fld=MEASUREMENT_FIELDS.find(f=>f.key===chartField);
  return(<div className="card" style={{marginBottom:12}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,flexWrap:"wrap"}}>
      <div style={{fontSize:11,fontWeight:700,color:"#6B7A99",textTransform:"uppercase",letterSpacing:1}}>Gráfico:</div>
      <select className="sel" style={{width:"auto",minWidth:150,flex:1}} value={chartField} onChange={e=>setChartField(e.target.value)}>
        {MEASUREMENT_FIELDS.map(f=><option key={f.key} value={f.key}>{f.label}{f.unit?` (${f.unit})`:""}</option>)}
      </select>
    </div>
    {data.length>1?(<div className="chart-wrap">
      <div className="chart-inner">
        {data.map((m,i)=>{
          const h=Math.max(6,((Number(m[chartField])-min)/range)*80+12);
          const color=CHART_COLORS[MEASUREMENT_FIELDS.findIndex(f=>f.key===chartField)%CHART_COLORS.length];
          return(<div key={i} className="chart-col">
            <div className="chart-val">{m[chartField]}</div>
            <div className="chart-bar-f" style={{height:h,background:color}}/>
            <div className="chart-lbl">{m.date?.slice(5)}</div>
          </div>);
        })}
      </div>
    </div>):<div style={{textAlign:"center",padding:12,color:"#6B7A99",fontSize:12}}>Necesitas al menos 2 mediciones de {fld?.label} para ver la gráfica</div>}
  </div>);
}

export function HistoryTab({client,measurements,setMeasurements}){
  const clientMs=measurements.filter(m=>m.clientId===client.id).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const clientMsDesc=[...clientMs].reverse();
  const[toast,setToast]=useState(null);
  const ERR="Hubo un problema al guardar. Intentá de nuevo en unos minutos.";
  async function del(id){
    if(!confirm("¿Eliminar?"))return;
    try{await setMeasurements(measurements.filter(m=>m.id!==id));setToast({msg:"Registro eliminado",type:"ok"});}
    catch(e){console.error(e);setToast({msg:ERR,type:"err"});}
  }
  return(<div>
    {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    {clientMs.length>1&&<MultiChart clientMs={clientMs}/>}
    <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Historial ({clientMs.length})</div>
    {clientMsDesc.map(m=>(<div key={m.id} className="hist-row">
      <div className="hist-date">{fmtDate(m.date)}</div>
      <div className="hist-vals">{MEASUREMENT_FIELDS.map(f=>m[f.key]&&<span key={f.key} className="hist-val">{f.label.split(" ")[0]}: {m[f.key]}{f.unit}</span>)}</div>
      <button className="ibtn d" onClick={()=>del(m.id)}>🗑</button>
    </div>))}
    {clientMs.length===0&&<div className="empty"><div className="ico">📈</div><p>Sin historial</p></div>}
  </div>);
}

// ── CLIENT DETAIL ──
export function ClientDetail({client,setClient,measurements,setMeasurements,routines,onBack,onDelete,deleteConfirm,setDeleteConfirm,doDelete}){
  const[tab,setTab]=useState("info");
  const[showEditInfo,setShowEditInfo]=useState(false);
  const[cForm,setCForm]=useState({...client});
  const[toast,setToast]=useState(null);
  const ERR="Hubo un problema al guardar. Intentá de nuevo en unos minutos.";

  const[disableConfirm,setDisableConfirm]=useState(false);

  async function saveInfo(){
    try{
      let updated={...cForm};
      // Si cambió la contraseña y no parece un hash bcrypt, encriptarla
      if(updated.password&&!updated.password.startsWith("$2")){
        updated.password=await hashPassword(updated.password);
      }
      await setClient({...updated});setShowEditInfo(false);setToast({msg:"Datos actualizados",type:"ok"});
    }catch(e){console.error(e);setToast({msg:ERR,type:"err"});}
  }
  async function savePlan(plan){
    await setClient({...client,plan});
  }
  async function doToggleDisabled(){
    const next=!client.disabled;
    try{
      await setClient({...client,disabled:next});
      setDisableConfirm(false);
      setToast({msg:next?"Usuario deshabilitado":"Usuario habilitado",type:"ok"});
    }catch(e){console.error(e);setToast({msg:ERR,type:"err"});}
  }

  const routine=routines.find(r=>r.userId===client.id);
  const dl=daysLeft(client.plan?.endDate);
  const age=client.dob?calcAge(client.dob):null;

  return(<div>
    {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
      <button className="back-btn" style={{margin:0}} onClick={onBack}>← Volver</button>
      <div style={{marginLeft:"auto",display:"flex",gap:6}}>
        <button className={`btn btn-sm ${client.disabled?"btn-ok":"btn-w"}`} onClick={()=>setDisableConfirm(true)}>
          {client.disabled?"✅ Habilitar":"🚫 Deshabilitar"}
        </button>
        <button className="btn btn-d btn-sm" onClick={onDelete}>🗑 Eliminar</button>
      </div>
    </div>
    <div className="ph">
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:44,height:44,borderRadius:"50%",background:client.disabled?"#9E9E9E":"#3A8EF6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#fff",flexShrink:0}}>{initials(client.name)}</div>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div className="pt" style={{fontSize:20}}>{client.name}</div>
            {client.disabled&&<span className="badge bd-red" style={{fontSize:10}}>🚫 Deshabilitado</span>}
          </div>
          <div className="ps">@{client.username}{age!==null&&` · ${age} años`}</div>
        </div>
      </div>
      {dl!==null&&dl>=0&&dl<=30&&<div className="warn-box" style={{margin:0,alignSelf:"center"}}>⚠ Plan vence en {dl}d</div>}
    </div>
    {disableConfirm&&<Modal title={client.disabled?"Habilitar usuario":"Deshabilitar usuario"} onClose={()=>setDisableConfirm(false)}>
      <div style={{textAlign:"center",padding:"8px 0 16px"}}>
        <div style={{fontSize:44,marginBottom:12}}>{client.disabled?"✅":"🚫"}</div>
        {client.disabled
          ?<><div style={{fontSize:15,fontWeight:700,color:"#0B1F4B",marginBottom:8}}>¿Habilitar a {client.name}?</div>
            <div style={{fontSize:13,color:"#6B7A99"}}>El usuario podrá volver a iniciar sesión en la app.</div></>
          :<><div style={{fontSize:15,fontWeight:700,color:"#0B1F4B",marginBottom:8}}>¿Deshabilitar a {client.name}?</div>
            <div style={{fontSize:13,color:"#E53935",marginBottom:4}}>El usuario <strong>no podrá iniciar sesión</strong> hasta que lo habilites nuevamente.</div>
            <div style={{fontSize:12,color:"#6B7A99"}}>Sus datos y rutinas se conservan.</div></>
        }
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        <button className={`btn ${client.disabled?"btn-ok":"btn-w"}`} onClick={doToggleDisabled}>
          {client.disabled?"Sí, habilitar":"Sí, deshabilitar"}
        </button>
        <button className="btn btn-g" onClick={()=>setDisableConfirm(false)}>Cancelar</button>
      </div>
    </Modal>}
    {deleteConfirm&&<Modal title="⚠️ Eliminar cliente" onClose={()=>setDeleteConfirm(null)}>
      <div style={{textAlign:"center",padding:"8px 0 16px"}}>
        <div style={{fontSize:40,marginBottom:12}}>🗑️</div>
        <div style={{fontSize:15,fontWeight:700,color:"#0B1F4B",marginBottom:8}}>¿Eliminar a {deleteConfirm.name}?</div>
        <div style={{fontSize:13,color:"#E53935",marginBottom:4}}>Esta acción <strong>no se puede deshacer</strong>.</div>
        <div style={{fontSize:12,color:"#6B7A99"}}>Se eliminarán todos sus datos, rutinas asignadas y mediciones.</div>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        <button className="btn btn-d" onClick={doDelete}>Sí, eliminar</button>
        <button className="btn btn-g" onClick={()=>setDeleteConfirm(null)}>Cancelar</button>
      </div>
    </Modal>}
    <div className="tabs">
      {[["info","👤 Info"],["plan","💳 Plan"],["payments","💰 Pagos"],["measurements","📊 Medición"],["history","📈 Historial"]].map(([id,lbl])=>(<div key={id} className={`tab${tab===id?" active":""}`} onClick={()=>setTab(id)}>{lbl}</div>))}
    </div>

    {tab==="info"&&(<div className="card">
      <div className="sa"><div style={{fontWeight:700,fontSize:13}}>Datos personales</div><button className="btn btn-s btn-sm" onClick={()=>{setCForm({...client});setShowEditInfo(true)}}>✏️ Editar</button></div>
      <div className="fr2">{[["Nombre",client.name],["Usuario","@"+client.username],["Cédula",client.cedula],["Teléfono",client.phone],["Correo",client.email],["Fecha nac.",fmtDate(client.dob)],["Edad",age!==null?(age+" años"):"—"],["Estatura",client.height?(client.height+" cm"):"—"]].map(([k,v])=>(<div key={k} style={{padding:"8px 0",borderBottom:"1px solid #DDE4F0"}}><div style={{fontSize:10,color:"#6B7A99",textTransform:"uppercase",letterSpacing:1}}>{k}</div><div style={{fontSize:13,fontWeight:600,marginTop:2}}>{v||"—"}</div></div>))}</div>
      {client.notes&&<div style={{marginTop:10,padding:10,background:"#F8F9FF",borderRadius:7,fontSize:12,color:"#6B7A99"}}>{client.notes}</div>}
      <div style={{marginTop:10,fontSize:12,color:"#6B7A99"}}>Rutina: <strong style={{color:"#0B1F4B"}}>{routine?routine.title:"Sin rutina"}</strong></div>
    </div>)}

    {tab==="plan"&&<PlanEditor client={client} onSave={savePlan}/>}
    {tab==="payments"&&<div className="card"><PaymentModule client={client} setClient={setClient}/></div>}
    {tab==="measurements"&&<MeasurementsTab client={client} measurements={measurements} setMeasurements={setMeasurements}/>}
    {tab==="history"&&<HistoryTab client={client} measurements={measurements} setMeasurements={setMeasurements}/>}

    {showEditInfo&&<Modal title="Editar datos" onClose={()=>setShowEditInfo(false)}>
      <div className="fr2">
        <div className="fg"><label>Nombre</label><input className="inp" value={cForm.name||""} onChange={e=>setCForm({...cForm,name:e.target.value})}/></div>
        <div className="fg"><label>Usuario</label><input className="inp" value={cForm.username||""} onChange={e=>setCForm({...cForm,username:e.target.value})}/></div>
        <div className="fg"><label>Contraseña</label><PasswordInput value={cForm.password||""} onChange={e=>setCForm({...cForm,password:e.target.value})} autoComplete="new-password"/></div>
        <div className="fg"><label>Cédula</label><input className="inp" value={cForm.cedula||""} onChange={e=>setCForm({...cForm,cedula:e.target.value})}/></div>
        <div className="fg"><label>Teléfono</label><input className="inp" value={cForm.phone||""} onChange={e=>setCForm({...cForm,phone:e.target.value})}/></div>
        <div className="fg"><label>Correo</label><input className="inp" type="email" value={cForm.email||""} onChange={e=>setCForm({...cForm,email:e.target.value})}/></div>
        <div className="fg"><label>Fecha de nacimiento</label><input className="inp" type="date" value={cForm.dob||""} onChange={e=>setCForm({...cForm,dob:e.target.value})}/></div>
        <div className="fg"><label>Estatura (cm)</label><input className="inp" type="number" value={cForm.height||""} onChange={e=>setCForm({...cForm,height:e.target.value})}/></div>
      </div>
      <div className="fg"><label>Notas internas</label><textarea className="ta" value={cForm.notes||""} onChange={e=>setCForm({...cForm,notes:e.target.value})}/></div>
      <div style={{display:"flex",gap:8}}><button className="btn btn-p" onClick={saveInfo}>Guardar</button><button className="btn btn-g" onClick={()=>setShowEditInfo(false)}>Cancelar</button></div>
    </Modal>}
  </div>);
}

// ── CLIENTS LIST ──
export function ClientsPage({users,setUsers,routines,measurements,setMeasurements,selectedClientId}){
  const[detail,setDetail]=useState(()=>selectedClientId?users.find(u=>u.id===selectedClientId)||null:null);
  const[showAdd,setShowAdd]=useState(false);
  const[form,setForm]=useState({name:"",username:"",password:"",phone:"",email:"",cedula:"",dob:"",height:"",notes:"",plan:{type:"Base",modality:"En Estudio",format:"Individual",startDate:"",endDate:"",price:""}});
  const[err,setErr]=useState("");
  const[deleteConfirm,setDeleteConfirm]=useState(null);
  const[toast,setToast]=useState(null);
  const[search,setSearch]=useState("");
  const ERR="Hubo un problema al guardar. Intentá de nuevo en unos minutos.";

  async function addClient(){
    if(!form.name||!form.username||!form.password){setErr("Nombre, usuario y contraseña son requeridos");return}
    if(users.some(u=>u.username===form.username)){setErr("Ese usuario ya existe");return}
    try{
      const hashed=await hashPassword(form.password);
      await setUsers([...users,{id:genId(),...form,password:hashed,role:"user",payments:[]}]);
      setForm({name:"",username:"",password:"",phone:"",email:"",cedula:"",dob:"",height:"",notes:"",plan:{type:"Base",modality:"En Estudio",format:"Individual",startDate:"",endDate:"",price:""}});
      setErr("");setShowAdd(false);
      setToast({msg:"Cliente creado correctamente",type:"ok"});
    }catch(e){console.error(e);setErr(ERR);}
  }

  function updateClient(u){setUsers(users.map(x=>x.id===u.id?u:x));setDetail(u)}
  function confirmDelete(client){setDeleteConfirm(client)}
  async function doDelete(){
    if(!deleteConfirm)return;
    try{
      await setUsers(users.filter(u=>u.id!==deleteConfirm.id));
      setDeleteConfirm(null);setDetail(null);
      setToast({msg:"Cliente eliminado",type:"ok"});
    }catch(e){console.error(e);setToast({msg:ERR,type:"err"});setDeleteConfirm(null);}
  }

  const activeDetail=selectedClientId?users.find(u=>u.id===selectedClientId)||null:detail;

  if(activeDetail){
    const live=users.find(u=>u.id===activeDetail.id)||activeDetail;
    return<ClientDetail
      client={live}
      setClient={c=>updateClient({...live,...c})}
      measurements={measurements}
      setMeasurements={setMeasurements}
      routines={routines}
      onBack={()=>setDetail(null)}
      onDelete={()=>confirmDelete(live)}
      deleteConfirm={deleteConfirm}
      setDeleteConfirm={setDeleteConfirm}
      doDelete={doDelete}
    />;
  }
  return(<div>
    {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    <div className="ph"><div><div className="pt">Clientes</div><div className="ps">{users.length} clientes</div></div><button className="btn btn-p" onClick={()=>setShowAdd(true)}>+ Nuevo</button></div>
    <input className="inp" placeholder="🔍 Buscar por nombre o usuario..." value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:10}}/>
    <div className="card" style={{padding:0}}>
      <div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Cliente</th><th>Plan</th><th>Modalidad</th><th>Vence</th><th>Estado</th></tr></thead>
        <tbody>{users.filter(u=>u.name.toLowerCase().includes(search.toLowerCase())||u.username.toLowerCase().includes(search.toLowerCase())).map(u=>{
          const st=getPlanStatus(u.plan);
          const dl=daysLeft(u.plan?.endDate);
          return(<tr key={u.id} style={{cursor:"pointer"}} onClick={()=>setDetail(u)}>
            <td><div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:28,height:28,borderRadius:"50%",background:u.disabled?"#9E9E9E":"#3A8EF6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",flexShrink:0}}>{initials(u.name)}</div><div><strong>{u.name}</strong><br/><span style={{color:"#6B7A99",fontSize:10}}>@{u.username}</span></div></div></td>
            <td><span className={`badge ${planColor(u.plan?.type)}`}>{u.plan?.type||"—"}</span></td>
            <td><span className="badge bd-gray">{u.plan?.modality||"—"}</span></td>
            <td style={{fontSize:11}}>{fmtDate(u.plan?.endDate)}{dl!==null&&dl>=0&&dl<=15&&<span style={{color:"#F57C00",fontWeight:700}}> ⚠</span>}</td>
            <td>{u.disabled?<span className="badge bd-red">🚫 Deshabilitado</span>:<span className={`badge ${st==="Activo"?"bd-green":st==="Vencido"?"bd-red":"bd-gray"}`}>{st}</span>}</td>
          </tr>);
        })}{users.filter(u=>u.name.toLowerCase().includes(search.toLowerCase())||u.username.toLowerCase().includes(search.toLowerCase())).length===0&&<tr><td colSpan={5}><div className="empty"><div className="ico">🔍</div><p>{search?"Sin resultados para \""+search+"\"":"Sin clientes"}</p></div></td></tr>}</tbody>
      </table></div>
    </div>
    {showAdd&&<Modal title="Nuevo cliente" onClose={()=>setShowAdd(false)}>
      {err&&<div className="err">{err}</div>}
      <div style={{fontSize:11,fontWeight:700,color:"#6B7A99",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Datos personales</div>
      <div className="fr2">
        <div className="fg"><label>Nombre *</label><input className="inp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="María García"/></div>
        <div className="fg"><label>Usuario *</label><input className="inp" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="maria.garcia"/></div>
        <div className="fg"><label>Contraseña *</label><PasswordInput value={form.password} onChange={e=>setForm({...form,password:e.target.value})} autoComplete="new-password"/></div>
        <div className="fg"><label>Cédula</label><input className="inp" value={form.cedula} onChange={e=>setForm({...form,cedula:e.target.value})}/></div>
        <div className="fg"><label>Teléfono</label><input className="inp" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
        <div className="fg"><label>Correo</label><input className="inp" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
        <div className="fg"><label>Fecha de nacimiento</label><input className="inp" type="date" value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})}/></div>
        <div className="fg"><label>Estatura (cm)</label><input className="inp" type="number" value={form.height} onChange={e=>setForm({...form,height:e.target.value})}/></div>
      </div>
      <div className="fg"><label>Notas internas</label><textarea className="ta" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2}/></div>
      <div style={{borderTop:"1px solid #DDE4F0",paddingTop:12,marginTop:4}}>
        <div style={{fontSize:11,fontWeight:700,color:"#6B7A99",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Plan</div>
        <div className="fr3">
          <div className="fg"><label>Tipo</label><select className="sel" value={form.plan.type} onChange={e=>setForm({...form,plan:{...form.plan,type:e.target.value}})}>{PLAN_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div className="fg"><label>Modalidad</label><select className="sel" value={form.plan.modality} onChange={e=>setForm({...form,plan:{...form.plan,modality:e.target.value}})}>{PLAN_MODALITIES.map(m=><option key={m}>{m}</option>)}</select></div>
          <div className="fg"><label>Formato</label><select className="sel" value={form.plan.format} onChange={e=>setForm({...form,plan:{...form.plan,format:e.target.value}})}>{PLAN_FORMATS.map(f=><option key={f}>{f}</option>)}</select></div>
        </div>
        <div className="fr2">
          <div className="fg"><label>Fecha inicio</label><input className="inp" type="date" value={form.plan.startDate} onChange={e=>setForm({...form,plan:{...form.plan,startDate:e.target.value}})}/></div>
          <div className="fg"><label>Fecha vencimiento</label><input className="inp" type="date" value={form.plan.endDate} onChange={e=>setForm({...form,plan:{...form.plan,endDate:e.target.value}})}/></div>
          <div className="fg"><label>Precio (₡/$)</label><input className="inp" type="number" value={form.plan.price} onChange={e=>setForm({...form,plan:{...form.plan,price:e.target.value}})}/></div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:4}}><button className="btn btn-p" onClick={addClient}>Crear cliente</button><button className="btn btn-g" onClick={()=>setShowAdd(false)}>Cancelar</button></div>
    </Modal>}

    {deleteConfirm&&<Modal title="⚠️ Eliminar cliente" onClose={()=>setDeleteConfirm(null)}>
      <div style={{textAlign:"center",padding:"8px 0 16px"}}>
        <div style={{fontSize:40,marginBottom:12}}>🗑️</div>
        <div style={{fontSize:15,fontWeight:700,color:"#0B1F4B",marginBottom:8}}>¿Eliminar a {deleteConfirm.name}?</div>
        <div style={{fontSize:13,color:"#E53935",marginBottom:4}}>Esta acción <strong>no se puede deshacer</strong>.</div>
        <div style={{fontSize:12,color:"#6B7A99"}}>Se eliminarán todos sus datos, rutinas asignadas y mediciones.</div>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        <button className="btn btn-d" onClick={doDelete}>Sí, eliminar</button>
        <button className="btn btn-g" onClick={()=>setDeleteConfirm(null)}>Cancelar</button>
      </div>
    </Modal>}
  </div>);
}

// ── EXERCISES ──
export function ExercisesPage({exercises,setExercises}){
  const[tab,setTab]=useState("normal");const[filter,setFilter]=useState("Todos");const[search,setSearch]=useState("");const[showAdd,setShowAdd]=useState(false);const[editing,setEditing]=useState(null);const[videoEx,setVideoEx]=useState(null);const[form,setForm]=useState({name:"",videoUrl:"",muscleGroup:"Piernas",type:"normal",equipment:"Ninguno"});
  const[toast,setToast]=useState(null);
  const ERR="Hubo un problema al guardar. Intentá de nuevo en unos minutos.";
  const list=exercises.filter(e=>e.type===tab&&(filter==="Todos"||e.muscleGroup===filter)&&e.name.toLowerCase().includes(search.toLowerCase()));
  function openAdd(){setForm({name:"",videoUrl:"",muscleGroup:"Piernas",type:tab,equipment:"Ninguno"});setEditing(null);setShowAdd(true)}
  function openEdit(ex){setForm({name:ex.name,videoUrl:ex.videoUrl||"",muscleGroup:ex.muscleGroup,type:ex.type,equipment:ex.equipment||"Ninguno"});setEditing(ex);setShowAdd(true)}
  async function save(){
    if(!form.name.trim())return;
    try{
      if(editing)await setExercises(exercises.map(e=>e.id===editing.id?{...e,...form}:e));
      else await setExercises([...exercises,{id:genId(),...form}]);
      setShowAdd(false);
      setToast({msg:editing?"Ejercicio actualizado":"Ejercicio creado",type:"ok"});
    }catch(e){console.error(e);setToast({msg:ERR,type:"err"});}
  }
  async function del(id){
    if(!confirm("¿Eliminar ejercicio?"))return;
    try{
      await setExercises(exercises.filter(e=>e.id!==id));
      setToast({msg:"Ejercicio eliminado",type:"ok"});
    }catch(e){console.error(e);setToast({msg:ERR,type:"err"});}
  }
  const groups=["Todos",...new Set(exercises.filter(e=>e.type===tab).map(e=>e.muscleGroup))].filter((v,i,a)=>a.indexOf(v)===i);
  return(<div>
    {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    <div className="ph"><div><div className="pt">Ejercicios</div><div className="ps">{exercises.length} ejercicios</div></div><button className="btn btn-p" onClick={openAdd}>+ Agregar</button></div>
    <div className="tabs">{["normal","stretching"].map(t=>(<div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>{setTab(t);setFilter("Todos")}}>{t==="normal"?"🏋️ Ejercicios":"🧘 Estiramientos"}</div>))}</div>
    <input className="inp" placeholder="🔍 Buscar..." value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:8}}/>
    <div className="chips">{groups.map(g=><button key={g} className={`chip${filter===g?" on":""}`} onClick={()=>setFilter(g)}>{g}</button>)}</div>
    <div className="card" style={{padding:0}}>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Ejercicio</th><th>Músculo</th><th>Equipo</th><th>Video</th><th></th></tr></thead>
      <tbody>{list.map(ex=>(<tr key={ex.id}>
        <td><strong>{ex.name}</strong></td><td><span className="badge bd-blue">{ex.muscleGroup}</span></td><td><span className="badge bd-gray">{ex.equipment||"Ninguno"}</span></td>
        <td>{ex.videoUrl?<button className="vbtn" onClick={()=>setVideoEx(ex)}>▶</button>:<span style={{color:"#6B7A99",fontSize:10}}>—</span>}</td>
        <td style={{whiteSpace:"nowrap"}}><button className="ibtn" onClick={()=>openEdit(ex)}>✏️</button><button className="ibtn d" onClick={()=>del(ex.id)}>🗑</button></td>
      </tr>))}{list.length===0&&<tr><td colSpan={5}><div className="empty"><div className="ico">🏋️</div><p>Sin ejercicios</p></div></td></tr>}</tbody></table></div>
    </div>
    {showAdd&&<Modal title={editing?"Editar ejercicio":"Nuevo ejercicio"} onClose={()=>setShowAdd(false)}>
      <div className="fg"><label>Nombre</label><input className="inp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nombre del ejercicio"/></div>
      <div className="fr2">
        <div className="fg"><label>Grupo muscular</label>
              <select className="sel" value={MUSCLE_GROUPS_FILTER.slice(1).includes(form.muscleGroup)?form.muscleGroup:"__custom__"} onChange={e=>{if(e.target.value!=="__custom__")setForm({...form,muscleGroup:e.target.value})}}>
                {MUSCLE_GROUPS_FILTER.slice(1).map(g=><option key={g} value={g}>{g}</option>)}
                {!MUSCLE_GROUPS_FILTER.slice(1).includes(form.muscleGroup)&&form.muscleGroup&&<option value="__custom__">{form.muscleGroup}</option>}
              </select>
              <input className="inp" style={{marginTop:4,fontSize:12}} value={form.muscleGroup} onChange={e=>setForm({...form,muscleGroup:e.target.value})} placeholder="O escribe uno nuevo..."/>
            </div>
        <div className="fg"><label>Tipo</label><select className="sel" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="normal">Normal</option><option value="stretching">Estiramiento</option></select></div>
      </div>
      <div className="fg"><label>Equipo</label><select className="sel" value={form.equipment} onChange={e=>setForm({...form,equipment:e.target.value})}>{EQUIPMENT_TYPES.map(eq=><option key={eq} value={eq}>{eq}</option>)}</select></div>
      <div className="fg"><label>URL Video (YouTube)</label><input className="inp" value={form.videoUrl} onChange={e=>setForm({...form,videoUrl:e.target.value})} placeholder="https://www.youtube.com/..."/></div>
      <div style={{display:"flex",gap:8}}><button className="btn btn-p" onClick={save}>{editing?"Guardar":"Crear"}</button><button className="btn btn-g" onClick={()=>setShowAdd(false)}>Cancelar</button></div>
    </Modal>}
    {videoEx&&<VideoModal name={videoEx.name} url={videoEx.videoUrl} onClose={()=>setVideoEx(null)}/>}
  </div>);
}

// ── ROUTINE EDITOR ──
export function RoutineEditor({routine,exercises,users,onSave,onBack}){
  const blank={id:genId(),userId:"",title:"Nueva Rutina",daysPerWeek:0,note:"",days:[],warmupStretchIds:[],cooldownStretchIds:[]};
  const[rt,setRt]=useState(()=>routine?JSON.parse(JSON.stringify(routine)):blank);
  const[selDay,setSelDay]=useState(0);const[exPicker,setExPicker]=useState(null);const[strPicker,setStrPicker]=useState(null);

  function updateDays(count){
    if(!count){setRt(r=>({...r,daysPerWeek:0,days:[]}));return}
    const days=[...rt.days];
    while(days.length<count)days.push({id:genId(),label:`Entrenamiento ${days.length+1}`,groups:[]});
    const nd=days.slice(0,count);
    setRt(r=>({...r,daysPerWeek:count,days:nd}));
    if(selDay>=count)setSelDay(Math.max(0,count-1));
  }
  function addGroup(di){const labels=["A","B","C","D","E","F","G"];setRt(r=>{const days=r.days.map((d,i)=>{if(i!==di)return d;const lbl=labels[d.groups.length]||`G${d.groups.length+1}`;return{...d,groups:[...d.groups,{id:genId(),label:lbl,restSeconds:60,exercises:[]}]};});return{...r,days}});}
  function removeGroup(di,gi){setRt(r=>{const days=r.days.map((d,i)=>i!==di?d:{...d,groups:d.groups.filter((_,j)=>j!==gi)});return{...r,days}})}
  function updGroup(di,gi,k,v){setRt(r=>{const days=r.days.map((d,i)=>i!==di?d:{...d,groups:d.groups.map((g,j)=>j!==gi?g:{...g,[k]:v})});return{...r,days}})}
  function addEx(di,gi,ex){setRt(r=>{const days=r.days.map((d,i)=>i!==di?d:{...d,groups:d.groups.map((g,j)=>j!==gi?g:{...g,exercises:[...g.exercises,{exId:ex.id,series:3,reps:"12",notes:"",weightAmount:"",weightUnit:"lbs",equipment:ex.equipment||"Ninguno",surface:"Ninguno"}]})});return{...r,days}});setExPicker(null);}
  function removeEx(di,gi,ei){setRt(r=>{const days=r.days.map((d,i)=>i!==di?d:{...d,groups:d.groups.map((g,j)=>j!==gi?g:{...g,exercises:g.exercises.filter((_,k)=>k!==ei)})});return{...r,days}})}
  function updEx(di,gi,ei,k,v){setRt(r=>{const days=r.days.map((d,i)=>i!==di?d:{...d,groups:d.groups.map((g,j)=>j!==gi?g:{...g,exercises:g.exercises.map((e,k2)=>k2!==ei?e:{...e,[k]:v})})});return{...r,days}})}
  function toggleStretch(kind,id){const key=kind==="warmup"?"warmupStretchIds":"cooldownStretchIds";setRt(r=>{const arr=r[key]||[];return{...r,[key]:arr.includes(id)?arr.filter(x=>x!==id):[...arr,id]}});}

  const day=rt.days[selDay];
  const warmupIds=rt.warmupStretchIds||[];
  const cooldownIds=rt.cooldownStretchIds||[];

  return(<div>
    <button className="back-btn" onClick={onBack}>← Volver a Rutinas</button>
    <div className="ph"><div><div className="pt">{routine?"Editar Rutina":"Nueva Rutina"}</div></div><button className="btn btn-ok" onClick={()=>onSave(rt)}>💾 Guardar</button></div>
    <div className="card" style={{marginBottom:12}}>
      <div className="fr2">
        <div className="fg"><label>Título</label><input className="inp" value={rt.title} onChange={e=>setRt(r=>({...r,title:e.target.value}))}/></div>
        <div className="fg"><label>Cliente</label><select className="sel" value={rt.userId} onChange={e=>setRt(r=>({...r,userId:e.target.value}))}><option value="">— Seleccionar —</option>{users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
      </div>
      <div className="fr2">
        <div className="fg"><label>Días por semana</label>
          <select className="sel" value={rt.daysPerWeek} onChange={e=>updateDays(Number(e.target.value))}>
            <option value={0}>— Seleccionar días —</option>
            {[1,2,3,4,5,6,7].map(n=><option key={n} value={n}>{n} {n===1?"día":"días"}</option>)}
          </select>
        </div>
        <div className="fg"><label>Nota general</label><input className="inp" value={rt.note||""} onChange={e=>setRt(r=>({...r,note:e.target.value}))} placeholder="Instrucciones para el cliente..."/></div>
      </div>
      <div className="fr2">
        <div className="fg"><label>🧘 Calentamiento ({warmupIds.length})</label><button className="btn btn-s btn-sm" onClick={()=>setStrPicker("warmup")}>Configurar</button>{warmupIds.length>0&&<div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:4}}>{warmupIds.map(id=>{const ex=exercises.find(e=>e.id===id);return ex&&<span key={id} className="badge bd-green">{ex.name}</span>})}</div>}</div>
        <div className="fg"><label>🧘 Enfriamiento ({cooldownIds.length})</label><button className="btn btn-s btn-sm" onClick={()=>setStrPicker("cooldown")}>Configurar</button>{cooldownIds.length>0&&<div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:4}}>{cooldownIds.map(id=>{const ex=exercises.find(e=>e.id===id);return ex&&<span key={id} className="badge bd-teal">{ex.name}</span>})}</div>}</div>
      </div>
    </div>

    {rt.days.length>0&&<>
      <div className="tabs">{rt.days.map((d,i)=>(<div key={d.id} className={`tab${selDay===i?" active":""}`} onClick={()=>setSelDay(i)}>Día {i+1}</div>))}</div>
      {day&&<div className="card">
        <div className="fg"><label>Nombre del día</label><input className="inp" value={day.label} onChange={e=>setRt(r=>{const days=r.days.map((d,i)=>i===selDay?{...d,label:e.target.value}:d);return{...r,days}})}/></div>
        {day.groups.map((g,gi)=>(<div key={g.id} className="grp-card">
          <div className="grp-h">
            <div className="grp-lbl">{g.label}</div>
            <input className="inp" style={{width:50,minHeight:34,fontSize:12}} value={g.label} onChange={e=>updGroup(selDay,gi,"label",e.target.value)}/>
            <span style={{fontSize:11,color:"#6B7A99"}}>Desc:</span>
            <select className="sel" style={{width:80,minHeight:34,fontSize:12}} value={g.restSeconds} onChange={e=>updGroup(selDay,gi,"restSeconds",Number(e.target.value))}>{[15,20,30,45,60,90,120].map(s=><option key={s} value={s}>{s}s</option>)}</select>
            <button className="ibtn d" style={{marginLeft:"auto"}} onClick={()=>removeGroup(selDay,gi)}>🗑</button>
          </div>
          <div className="grp-b">
            {g.exercises.map((ex,ei)=>{const info=exercises.find(e=>e.id===ex.exId);return(<div key={ei} style={{borderBottom:"1px solid #DDE4F0",paddingBottom:10,marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><strong style={{fontSize:13,flex:1}}>{info?.name||"?"}</strong><span className="badge bd-blue" style={{fontSize:9}}>{info?.muscleGroup}</span><button className="ibtn d" onClick={()=>removeEx(selDay,gi,ei)}>✕</button></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                <div><label style={{fontSize:9}}>Series</label><input className="inp" type="number" min={1} value={ex.series} onChange={e=>updEx(selDay,gi,ei,"series",Number(e.target.value))}/></div>
                <div><label style={{fontSize:9}}>Reps / Duración</label><input className="inp" value={ex.reps} onChange={e=>updEx(selDay,gi,ei,"reps",e.target.value)}/></div>
                <div><label style={{fontSize:9}}>Peso</label><div style={{display:"flex",gap:3}}><input className="inp" style={{flex:1}} type="number" value={ex.weightAmount} onChange={e=>updEx(selDay,gi,ei,"weightAmount",e.target.value)} placeholder="0"/><select className="sel" style={{width:65}} value={ex.weightUnit} onChange={e=>updEx(selDay,gi,ei,"weightUnit",e.target.value)}><option value="lbs">lbs</option><option value="kg">kg</option></select></div></div>
                <div><label style={{fontSize:9}}>Equipo</label><select className="sel" value={ex.equipment} onChange={e=>updEx(selDay,gi,ei,"equipment",e.target.value)}>{EQUIPMENT_TYPES.map(eq=><option key={eq} value={eq}>{eq}</option>)}</select></div>
                <div><label style={{fontSize:9}}>Superficie</label><select className="sel" value={ex.surface||"Ninguno"} onChange={e=>updEx(selDay,gi,ei,"surface",e.target.value)}>{SURFACE_TYPES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                <div><label style={{fontSize:9}}>Notas</label><input className="inp" value={ex.notes} onChange={e=>updEx(selDay,gi,ei,"notes",e.target.value)} placeholder="Obs..."/></div>
              </div>
            </div>);})}
            <button className="btn btn-s btn-sm" onClick={()=>setExPicker({dayIdx:selDay,gIdx:gi})}>+ Agregar ejercicio</button>
          </div>
        </div>))}
        <button className="btn btn-g btn-sm" style={{marginTop:4}} onClick={()=>addGroup(selDay)}>+ Grupo</button>
      </div>}
    </>}
    {rt.days.length===0&&<div className="card"><div className="empty"><div className="ico">📅</div><p>Selecciona los días por semana arriba</p></div></div>}
    <div style={{display:"flex",gap:8,marginTop:14,paddingTop:14,borderTop:"1px solid #DDE4F0"}}>
      <button className="btn btn-ok" onClick={()=>onSave(rt)}>💾 Guardar rutina</button>
      <button className="btn btn-g" onClick={onBack}>Cancelar</button>
    </div>
    {exPicker&&<ExercisePicker exercises={exercises} onPick={ex=>addEx(exPicker.dayIdx,exPicker.gIdx,ex)} onClose={()=>setExPicker(null)}/>}
    {strPicker&&<StretchPicker exercises={exercises} selected={strPicker==="warmup"?warmupIds:cooldownIds} onToggle={id=>toggleStretch(strPicker,id)} onClose={()=>setStrPicker(null)}/>}
  </div>);
}

// ── ROUTINES LIST ──
export function RoutinesPage({routines,setRoutines,users,setUsers,exercises}){
  const[editing,setEditing]=useState(null);
  const[filterUser,setFilterUser]=useState("__all__");
  const[toast,setToast]=useState(null);
  const ERR="Hubo un problema al guardar. Intentá de nuevo en unos minutos.";

  async function saveRoutine(rt){
    const exists=routines.find(r=>r.id===rt.id);
    const now=new Date().toISOString();
    try{
      if(exists)await setRoutines(routines.map(r=>r.id===rt.id?{...rt,updatedAt:now}:r));
      else await setRoutines([...routines,{...rt,createdAt:now,updatedAt:now}]);
      setEditing(null);
      setToast({msg:exists?"Rutina actualizada":"Rutina creada",type:"ok"});
    }catch(e){console.error(e);setToast({msg:ERR,type:"err"});}
  }
  async function del(id){
    if(!confirm("¿Eliminar rutina?"))return;
    try{await setRoutines(routines.filter(r=>r.id!==id));setToast({msg:"Rutina eliminada",type:"ok"});}
    catch(e){console.error(e);setToast({msg:ERR,type:"err"});}
  }
  async function duplicate(rt){
    const now=new Date().toISOString();
    const newRt={...JSON.parse(JSON.stringify(rt)),id:genId(),title:rt.title+" (copia)",createdAt:now,updatedAt:now,userId:""};
    try{await setRoutines([...routines,newRt]);setToast({msg:"Rutina duplicada",type:"ok"});}
    catch(e){console.error(e);setToast({msg:ERR,type:"err"});}
  }
  async function setActive(rt){
    if(!rt.userId)return;
    try{await setUsers(users.map(u=>u.id===rt.userId?{...u,activeRoutineId:rt.id}:u));setToast({msg:"Rutina activa actualizada",type:"ok"});}
    catch(e){console.error(e);setToast({msg:ERR,type:"err"});}
  }

  // Clients that have at least one routine
  const usersWithRoutines=users.filter(u=>routines.some(r=>r.userId===u.id));

  // Filter + sort: active first, then by createdAt desc
  const filtered=routines
    .filter(r=>filterUser==="__all__"||r.userId===filterUser)
    .sort((a,b)=>{
      const userA=users.find(u=>u.id===a.userId);
      const userB=users.find(u=>u.id===b.userId);
      const aActive=userA&&userA.activeRoutineId===a.id?1:0;
      const bActive=userB&&userB.activeRoutineId===b.id?1:0;
      if(aActive!==bActive)return bActive-aActive;
      return new Date(b.createdAt||b.updatedAt||0)-new Date(a.createdAt||a.updatedAt||0);
    });

  if(editing!==null)return<RoutineEditor routine={editing==="__new__"?null:editing} exercises={exercises} users={users} onSave={saveRoutine} onBack={()=>setEditing(null)}/>;
  return(<div>
    {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    <div className="ph"><div><div className="pt">Rutinas</div><div className="ps">{filtered.length} rutina{filtered.length!==1?"s":""}</div></div><button className="btn btn-p" onClick={()=>setEditing("__new__")}>+ Nueva</button></div>
    <div style={{marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
      <select value={filterUser} onChange={e=>setFilterUser(e.target.value)} style={{fontFamily:"'Barlow',sans-serif",fontSize:13,padding:"8px 12px",borderRadius:8,border:"1px solid #DDE4F0",background:"#fff",color:"#0B1F4B",flex:1,maxWidth:280}}>
        <option value="__all__">Todos los clientes</option>
        {usersWithRoutines.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
      {filterUser!=="__all__"&&<button onClick={()=>setFilterUser("__all__")} style={{fontSize:12,color:"#6B7A99",background:"none",border:"none",cursor:"pointer",padding:"4px 8px"}}>✕ Limpiar</button>}
    </div>
    {filtered.map(rt=>{const user=users.find(u=>u.id===rt.userId);const totalEx=rt.days?.reduce((s,d)=>s+d.groups.reduce((ss,g)=>ss+g.exercises.length,0),0)||0;
    const isActive=user&&user.activeRoutineId===rt.id;
    return(<div key={rt.id} className="card" style={{marginBottom:10,border:isActive?"2px solid #2E7D32":""}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,flexWrap:"wrap"}}>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:900,color:"#0B1F4B"}}>{rt.title}</span>
            <span className="badge bd-blue">{rt.daysPerWeek}d/sem</span>
            {user&&<span className="badge bd-green">{user.name}</span>}
            {isActive&&<span className="badge" style={{background:"#E8F5E9",color:"#2E7D32",border:"1px solid #A5D6A7"}}>⭐ Activa</span>}
          </div>
          <div style={{fontSize:11,color:"#6B7A99",display:"flex",gap:12,flexWrap:"wrap"}}>
            <span>📅 {rt.days?.length||0} días</span><span>🏋️ {totalEx} ejercicios</span>
            {(rt.createdAt||rt.updatedAt)&&<span>📆 {fmtDate(rt.createdAt||rt.updatedAt)}</span>}
          </div>
        </div>
        <div style={{display:"flex",gap:5,flexShrink:0,flexWrap:"wrap"}}>
          {rt.userId&&!isActive&&<button className="btn btn-sm" style={{background:"#E8F5E9",color:"#2E7D32",border:"1px solid #A5D6A7"}} onClick={()=>setActive(rt)}>⭐ Activar</button>}
          <button className="btn btn-g btn-sm" onClick={()=>duplicate(rt)}>📋 Duplicar</button>
          <button className="btn btn-s btn-sm" onClick={()=>setEditing(rt)}>✏️ Editar</button>
          <button className="btn btn-d btn-sm" onClick={()=>del(rt.id)}>🗑</button>
        </div>
      </div>
    </div>);})}
    {filtered.length===0&&<div className="card"><div className="empty"><div className="ico">📋</div><p>{filterUser==="__all__"?"Sin rutinas":"Este cliente no tiene rutinas"}</p></div></div>}
  </div>);
}

// ── WORKOUT TIMER (per group) ──
export function GroupTimer({restSeconds}){
  const[secs,setSecs]=useState(0);const[running,setRunning]=useState(false);
  const[restLeft,setRestLeft]=useState(0);const[restActive,setRestActive]=useState(false);
  const[fullscreen,setFullscreen]=useState(false);
  const intRef=useRef(null);const restRef=useRef(null);

  useEffect(()=>{
    if(running){intRef.current=setInterval(()=>setSecs(s=>s+1),1000)}
    else clearInterval(intRef.current);
    return()=>clearInterval(intRef.current);
  },[running]);

  useEffect(()=>{
    if(restActive&&restLeft>0){restRef.current=setInterval(()=>setRestLeft(s=>{if(s<=1){clearInterval(restRef.current);setRestActive(false);setFullscreen(false);return 0}return s-1}),1000)}
    else clearInterval(restRef.current);
    return()=>clearInterval(restRef.current);
  },[restActive,restLeft]);

  function startRest(s){setRestLeft(s);setRestActive(true);setFullscreen(true)}
  function toggleTimer(){setRunning(r=>!r);if(!running)setFullscreen(true)}
  function reset(){setSecs(0);setRunning(false);setFullscreen(false)}
  function stopRest(){setRestActive(false);setRestLeft(0);setFullscreen(false)}
  function fmt(s){const m=Math.floor(s/60);const sec=s%60;return`${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`}

  const pct=restActive&&restLeft>0?((restSeconds-restLeft)/restSeconds)*100:0;

  return(<div className="timer-wrap">
    <div className="timer-box">
      <div>
        <div className="timer-lbl">Cronómetro</div>
        <div className="timer-disp">{fmt(secs)}</div>
      </div>
      <div style={{display:"flex",gap:5}}>
        <button className="btn btn-sm" style={{background:running?"#E53935":"#2E7D32",color:"#fff",minHeight:36}} onClick={toggleTimer}>{running?"⏸":"▶"}</button>
        <button className="btn btn-sm" style={{background:"#4A5568",color:"#fff",minHeight:36}} onClick={reset}>↺</button>
      </div>
      <div style={{marginLeft:"auto",textAlign:"right"}}>
        <div className="timer-lbl">Descanso</div>
        <div style={{display:"flex",gap:4,justifyContent:"flex-end",marginTop:3}}>
          {[restSeconds,30,60].filter((v,i,a)=>a.indexOf(v)===i).map(s=>(
            <button key={s} className="btn btn-xs" style={{background:"#1A5DC8",color:"#fff"}} onClick={()=>startRest(s)}>{s}s</button>
          ))}
        </div>
      </div>
    </div>
    {restActive&&restLeft>0&&(
      <div className="rest-active">
        <span style={{color:"#fff",fontSize:13,fontWeight:700}}>⏱ Descanso</span>
        <div className="rest-disp">{fmt(restLeft)}</div>
        <button className="btn btn-xs" style={{background:"rgba(255,255,255,0.2)",color:"#fff",marginLeft:"auto"}} onClick={stopRest}>✕</button>
      </div>
    )}

    {/* FULLSCREEN OVERLAY */}
    {fullscreen&&<div style={{position:"fixed",inset:0,zIndex:9000,background:"rgba(10,20,60,0.97)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:32}}>
      {restActive&&restLeft>0?(
        <>
          <div style={{fontSize:18,fontWeight:700,color:"rgba(255,255,255,0.6)",letterSpacing:4,textTransform:"uppercase"}}>⏱ Descanso</div>
          <div style={{position:"relative",width:220,height:220}}>
            <svg viewBox="0 0 220 220" style={{position:"absolute",inset:0,transform:"rotate(-90deg)"}}>
              <circle cx="110" cy="110" r="100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10"/>
              <circle cx="110" cy="110" r="100" fill="none" stroke="#4FC3F7" strokeWidth="10"
                strokeDasharray={`${2*Math.PI*100}`}
                strokeDashoffset={`${2*Math.PI*100*(1-pct/100)}`}
                strokeLinecap="round"
                style={{transition:"stroke-dashoffset 1s linear"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{fontSize:72,fontWeight:900,color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1}}>{fmt(restLeft)}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginTop:4}}>{restSeconds}s total</div>
            </div>
          </div>
          <div style={{display:"flex",gap:12}}>
            <button onClick={stopRest} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",borderRadius:12,padding:"12px 28px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow',sans-serif"}}>✕ Cancelar</button>
          </div>
        </>
      ):(
        <>
          <div style={{fontSize:18,fontWeight:700,color:"rgba(255,255,255,0.6)",letterSpacing:4,textTransform:"uppercase"}}>Cronómetro</div>
          <div style={{fontSize:96,fontWeight:900,color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1,letterSpacing:2}}>{fmt(secs)}</div>
          <div style={{display:"flex",gap:12}}>
            <button onClick={toggleTimer} style={{background:running?"#E53935":"#2E7D32",border:"none",color:"#fff",borderRadius:12,padding:"14px 36px",fontSize:18,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow',sans-serif",minWidth:130}}>
              {running?"⏸ Pausar":"▶ Iniciar"}
            </button>
            <button onClick={reset} style={{background:"#4A5568",border:"none",color:"#fff",borderRadius:12,padding:"14px 24px",fontSize:18,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow',sans-serif"}}>↺</button>
          </div>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            {[restSeconds,30,60].filter((v,i,a)=>a.indexOf(v)===i).map(s=>(
              <button key={s} onClick={()=>startRest(s)} style={{background:"#1A5DC8",border:"none",color:"#fff",borderRadius:10,padding:"10px 20px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow',sans-serif"}}>{s}s descanso</button>
            ))}
          </div>
          <button onClick={()=>setFullscreen(false)} style={{background:"none",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.5)",borderRadius:10,padding:"8px 20px",fontSize:13,cursor:"pointer",fontFamily:"'Barlow',sans-serif",marginTop:8}}>
            Minimizar
          </button>
        </>
      )}
    </div>}
  </div>);
}

// ── ROUTINE DISPLAY (reusable) ──
export function RoutineDisplay({routine,exercises}){
  const[openDays,setOpenDays]=useState({});
  const[videoEx,setVideoEx]=useState(null);
  function toggleDay(id){setOpenDays(s=>({...s,[id]:!s[id]}))}
  const warmupIds=routine.warmupStretchIds||[];
  const cooldownIds=routine.cooldownStretchIds||[];
  return(<div>
    {routine.note&&<div className="note-box"><span>📝</span><span>{routine.note}</span></div>}
    {warmupIds.length>0&&(<div className="card" style={{marginBottom:12,background:"#E8F5E9",border:"1px solid #C8E6C9"}}>
      <div style={{fontWeight:700,fontSize:12,color:"#2E7D32",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>🧘 Calentamiento (20 seg c/u)</div>
      {warmupIds.map((id,i)=>{const ex=exercises.find(e=>e.id===id);return ex&&(<div key={id} style={{fontSize:13,padding:"6px 0",borderBottom:"1px solid #C8E6C9",display:"flex",alignItems:"center",gap:6}}><span style={{color:"#2E7D32",fontWeight:700}}>{i+1}.</span><span style={{flex:1}}>{ex.name}</span>{ex.videoUrl&&<button className="vbtn" onClick={()=>setVideoEx(ex)}>▶</button>}</div>);})}
    </div>)}
    {routine.days.map((day)=>(<div key={day.id} className="day-card">
      <div className="day-h" onClick={()=>toggleDay(day.id)}>
        <div><div className="day-ht">{day.label}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.55)",marginTop:2}}>{day.groups.length} grupos · {day.groups.reduce((s,g)=>s+g.exercises.length,0)} ejercicios</div></div>
        <span style={{color:"rgba(255,255,255,0.5)",fontSize:20}}>{openDays[day.id]?"▲":"▼"}</span>
      </div>
      {openDays[day.id]&&(<div className="day-b">
        {day.groups.map((g)=>(<div key={g.id} className="grp-card">
          <div className="grp-h">
            <div className="grp-lbl">{g.label}</div>
            <span style={{fontSize:13,fontWeight:700}}>Grupo {g.label}</span>
            <span style={{marginLeft:"auto",fontSize:11,color:"#6B7A99"}}>⏱ {g.restSeconds}s</span>
          </div>
          <div className="grp-b">
            <GroupTimer restSeconds={g.restSeconds}/>
            {g.exercises.map((ex,ei)=>{
              const info=exercises.find(e=>e.id===ex.exId);
              const hasWeight=ex.weightAmount&&Number(ex.weightAmount)>0;
              const hasSurface=ex.surface&&ex.surface!=="Ninguno";
              const hasEquip=ex.equipment&&ex.equipment!=="Ninguno";
              return(<div key={ei} className="ex-row">
                <div className="ex-num">{ei+1}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="ex-nm">{info?.name||"Ejercicio"}</div>
                  <div className="ex-tags">
                    <span className="ex-tag"><span className="tag-lbl">Series</span>{ex.series}</span>
                    <span className="ex-tag"><span className="tag-lbl">Reps</span>{ex.reps}</span>
                    {hasWeight&&<span className="ex-tag"><span className="tag-lbl">Peso</span>{ex.weightAmount} {ex.weightUnit}</span>}
                    {hasEquip&&<span className="ex-tag"><span className="tag-lbl">Equipo</span>{ex.equipment}</span>}
                    {hasSurface&&<span className="ex-tag" style={{background:"#FFF3E0",borderColor:"#FFE0B2",color:"#F57C00"}}><span className="tag-lbl" style={{color:"#FB8C00"}}>Superficie</span>{ex.surface}</span>}
                  </div>
                  {ex.notes&&<div className="ex-dt">📌 {ex.notes}</div>}
                </div>
                {info?.videoUrl&&<button className="vbtn" onClick={()=>setVideoEx(info)}>▶</button>}
              </div>);
            })}
          </div>
        </div>))}
      </div>)}
    </div>))}
    {cooldownIds.length>0&&(<div className="card" style={{marginTop:12,background:"#E3F0FF",border:"1px solid #BBDEFB"}}>
      <div style={{fontWeight:700,fontSize:12,color:"#1A5DC8",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>🧘 Enfriamiento (20 seg c/u)</div>
      {cooldownIds.map((id,i)=>{const ex=exercises.find(e=>e.id===id);return ex&&(<div key={id} style={{fontSize:13,padding:"6px 0",borderBottom:"1px solid #BBDEFB",display:"flex",alignItems:"center",gap:6}}><span style={{color:"#1A5DC8",fontWeight:700}}>{i+1}.</span><span style={{flex:1}}>{ex.name}</span>{ex.videoUrl&&<button className="vbtn" onClick={()=>setVideoEx(ex)}>▶</button>}</div>);})}
    </div>)}
    {videoEx&&<VideoModal name={videoEx.name} url={videoEx.videoUrl} onClose={()=>setVideoEx(null)}/>}
  </div>);
}

// ── USER ROUTINE PAGE ──
export function MyRoutinePage({user,routines,exercises}){
  const[showPrev,setShowPrev]=useState(false);
  const[openPrev,setOpenPrev]=useState({});

  // Sort: active first, then by createdAt desc
  const userRoutines=routines
    .filter(r=>r.userId===user.id)
    .sort((a,b)=>{
      const aActive=a.id===user.activeRoutineId?1:0;
      const bActive=b.id===user.activeRoutineId?1:0;
      if(aActive!==bActive)return bActive-aActive;
      return new Date(b.createdAt||b.updatedAt||0)-new Date(a.createdAt||a.updatedAt||0);
    });

  const activeRoutine=userRoutines[0]||null;
  const prevRoutines=userRoutines.slice(1);

  if(!activeRoutine)return(<div><div className="ph"><div className="pt">Mi Rutina</div></div><div className="card"><div className="empty"><div className="ico">📋</div><p>Tu entrenador aún no te ha asignado una rutina.<br/>¡Pronto llegará tu plan!</p></div></div></div>);

  return(<div>
    <div className="ph">
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <Logo size={36}/>
        <div>
          <div className="pt" style={{fontSize:19}}>{activeRoutine.title}</div>
          <div className="ps">{activeRoutine.daysPerWeek} días/semana{activeRoutine.createdAt&&` · ${fmtDate(activeRoutine.createdAt)}`}</div>
        </div>
      </div>
    </div>

    <RoutineDisplay routine={activeRoutine} exercises={exercises}/>

    {prevRoutines.length>0&&(<div style={{marginTop:16}}>
      <button onClick={()=>setShowPrev(s=>!s)} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",color:"#1A5DC8",fontSize:13,fontWeight:700,padding:"10px 0",fontFamily:"'Barlow',sans-serif"}}>
        <span>{showPrev?"▲":"▼"}</span>
        <span>{showPrev?"Ocultar":"Ver"} rutinas anteriores ({prevRoutines.length})</span>
      </button>
      {showPrev&&(<div style={{marginTop:4}}>
        {prevRoutines.map(rt=>(<div key={rt.id} style={{marginBottom:8}}>
          <button onClick={()=>setOpenPrev(s=>({...s,[rt.id]:!s[rt.id]}))} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#F4F6FB",border:"1px solid #DDE4F0",borderRadius:10,padding:"12px 16px",cursor:"pointer",fontFamily:"'Barlow',sans-serif"}}>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:14,fontWeight:700,color:"#0B1F4B"}}>{rt.title}</div>
              <div style={{fontSize:11,color:"#6B7A99",marginTop:2}}>{rt.daysPerWeek} días/semana{(rt.createdAt||rt.updatedAt)&&` · ${fmtDate(rt.createdAt||rt.updatedAt)}`}</div>
            </div>
            <span style={{color:"#6B7A99",fontSize:18}}>{openPrev[rt.id]?"▲":"▼"}</span>
          </button>
          {openPrev[rt.id]&&(<div style={{border:"1px solid #DDE4F0",borderTop:"none",borderRadius:"0 0 10px 10px",padding:"12px 8px",background:"#fff"}}>
            <RoutineDisplay routine={rt} exercises={exercises}/>
          </div>)}
        </div>))}
      </div>)}
    </div>)}
  </div>);
}

// ── USER PROFILE ──
export function MyProfilePage({user,setUsers,users,measurements}){
  const[tab,setTab]=useState("info");
  const[editing,setEditing]=useState(false);
  const[form,setForm]=useState({...user});
  const[toast,setToast]=useState(null);
  const ERR="Hubo un problema al guardar. Intentá de nuevo en unos minutos.";
  const photoKey="jh_photo_"+user.id;
  const[photo,setPhoto]=useState(()=>localStorage.getItem(photoKey)||"");

  const age=user.dob?calcAge(user.dob):null;
  const dl=daysLeft(user.plan?.endDate);
  const ini=initials(user.name);
  const clientMsAsc=measurements.filter(m=>m.clientId===user.id).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const clientMsDesc=[...clientMsAsc].reverse();
  const latest=clientMsDesc[0];

  async function saveProfile(){
    try{
      await setUsers(users.map(u=>u.id===user.id?{...u,...form}:u));
      setEditing(false);
      setToast({msg:"Perfil actualizado",type:"ok"});
    }catch(e){console.error(e);setToast({msg:ERR,type:"err"});}
  }

  function handlePhoto(e){
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{const data=ev.target.result;localStorage.setItem(photoKey,data);setPhoto(data);}
    reader.readAsDataURL(file);
  }

  return(<div>
    {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    <div className="ph"><div className="pt">Mi Perfil</div></div>
    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
      <label className="avatar-wrap" style={{cursor:"pointer"}}>
        <input type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto}/>
        <div className="avatar-big" style={{width:70,height:70,fontSize:26}}>{photo?<img src={photo} alt="foto"/>:ini}</div>
        <div className="avatar-edit">📷</div>
      </label>
      <div>
        <div style={{fontSize:20,fontWeight:800,color:"#0B1F4B"}}>{user.name}</div>
        <div style={{color:"#6B7A99",fontSize:12}}>@{user.username}{age!==null&&` · ${age} años`}</div>
      </div>
    </div>

    <div className="tabs">
      {[["info","👤 Info"],["measurements","📊 Mediciones"],["history","📈 Historial"]].map(([id,lbl])=>(<div key={id} className={`tab${tab===id?" active":""}`} onClick={()=>setTab(id)}>{lbl}</div>))}
    </div>

    {tab==="info"&&(<div>
      <div className="card" style={{marginBottom:12}}>
        <div className="sa"><div style={{fontWeight:700,fontSize:13}}>Mis datos</div><button className="btn btn-s btn-sm" onClick={()=>{setForm({...user});setEditing(true)}}>✏️ Editar</button></div>
        {[["Correo",user.email],["Teléfono",user.phone],["Cédula",user.cedula],["Fecha nac.",fmtDate(user.dob)],["Edad",age!==null?(age+" años"):"—"],["Estatura",user.height?(user.height+" cm"):"—"]].map(([k,v])=>(<div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #DDE4F0",fontSize:13}}><span style={{color:"#6B7A99"}}>{k}</span><span style={{fontWeight:600}}>{v||"—"}</span></div>))}
      </div>
      <div className="card">
        <div style={{fontSize:11,fontWeight:700,color:"#6B7A99",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Mi plan</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
          <span className={`badge ${planColor(user.plan?.type)}`}>{user.plan?.type||"—"}</span>
          <span className="badge bd-gray">{user.plan?.modality||"—"}</span>
          <span className="badge bd-gray">{user.plan?.format||"—"}</span>
          {dl!==null&&<span className={`badge ${dl<0?"bd-red":dl<=30?"bd-orange":"bd-green"}`}>{dl<0?"Vencido":`${dl} días restantes`}</span>}
        </div>
        <div style={{fontSize:12,color:"#6B7A99"}}>Entrenador: <strong style={{color:"#0B1F4B"}}>Johel Herrera</strong></div>
      </div>
      {editing&&<Modal title="Editar mis datos" onClose={()=>setEditing(false)}>
        <div className="fr2">
          <div className="fg"><label>Correo</label><input className="inp" type="email" value={form.email||""} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          <div className="fg"><label>Teléfono</label><input className="inp" value={form.phone||""} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
          <div className="fg"><label>Cédula</label><input className="inp" value={form.cedula||""} onChange={e=>setForm({...form,cedula:e.target.value})}/></div>
          <div className="fg"><label>Fecha de nacimiento</label><input className="inp" type="date" value={form.dob||""} onChange={e=>setForm({...form,dob:e.target.value})}/></div>
          <div className="fg"><label>Estatura (cm)</label><input className="inp" type="number" value={form.height||""} onChange={e=>setForm({...form,height:e.target.value})}/></div>
        </div>
        <div style={{display:"flex",gap:8}}><button className="btn btn-p" onClick={saveProfile}>Guardar</button><button className="btn btn-g" onClick={()=>setEditing(false)}>Cancelar</button></div>
      </Modal>}
    </div>)}

    {tab==="measurements"&&(<div>
      <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Última medición{latest?` — ${fmtDate(latest.date)}`:""}</div>
      {latest?(<div className="m-grid">{MEASUREMENT_FIELDS.map(f=>{const v=latest[f.key];return v?(<div key={f.key} className="m-card"><div className="m-lbl">{f.label}</div><div className="m-val">{v}<span className="m-unit"> {f.unit}</span></div></div>):null;})}</div>):<div className="empty"><div className="ico">📊</div><p>Sin mediciones registradas aún</p></div>}
    </div>)}

    {tab==="history"&&(<div>
      {clientMsAsc.length>1&&<MultiChart clientMs={clientMsAsc}/>}
      <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Historial ({clientMsAsc.length})</div>
      {clientMsDesc.map(m=>(<div key={m.id} className="hist-row"><div className="hist-date">{fmtDate(m.date)}</div><div className="hist-vals">{MEASUREMENT_FIELDS.map(f=>m[f.key]&&<span key={f.key} className="hist-val">{f.label.split(" ")[0]}: {m[f.key]}{f.unit}</span>)}</div></div>))}
      {clientMsAsc.length===0&&<div className="empty"><div className="ico">📈</div><p>Sin historial</p></div>}
    </div>)}
  </div>);
}

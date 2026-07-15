import { useState, useEffect } from "react";
import {
  getUsers, upsertUser, deleteUser,
  getExercises, upsertExercise, deleteExercise,
  getRoutines, upsertRoutine, deleteRoutine,
  getMeasurements, upsertMeasurement, deleteMeasurement,
  getWorkoutSessions, upsertWorkoutSession, deleteWorkoutSession,
  getCatalogs, setCatalogCategory,
} from "./db";
import { CatalogContext, buildCatalogValue } from "./johel-training.catalogs";
import { STYLES } from "./johel-training.styles";
import { LoginPage, Sidebar, AppFooter } from "./johel-training.ui";
import {
  AdminsPage,
  ClientsPage,
  Dashboard,
  ExercisesPage,
  MyProfilePage,
  MyRoutinePage,
  RoutinesPage,
} from "./johel-training.features";

// ── ROOT APP ──
export default function App(){
  const[currentUser,setCurrentUserState]=useState(()=>{
    try{const s=localStorage.getItem("jh_session");return s?JSON.parse(s):null;}catch{return null;}
  });
  const[page,setPage]=useState(()=>{
    try{const s=localStorage.getItem("jh_session");const u=s?JSON.parse(s):null;return u?(u.role==="trainer"?"dashboard":"my-routine"):"dashboard";}catch{return "dashboard";}
  });
  const[exercises,setExercisesState]=useState([]);
  const[users,setUsersState]=useState([]);
  const[routines,setRoutinesState]=useState([]);
  const[measurements,setMeasurementsState]=useState([]);
  const[workoutSessions,setWorkoutSessionsState]=useState([]);
  const[catalogOverrides,setCatalogOverrides]=useState({});
  const[loading,setLoading]=useState(true);
  const[dbError,setDbError]=useState(null);

  useEffect(()=>{
    async function load(){
      try{
        const[u,ex,rt,ms]=await Promise.all([getUsers(),getExercises(),getRoutines(),getMeasurements()]);
        if(u.length>0)setUsersState(u);
        if(ex.length>0)setExercisesState(ex);
        setRoutinesState(rt);
        setMeasurementsState(ms);
        // Sesiones de entrenamiento: falla suave si aún no corriste la migración SQL
        try{const ws=await getWorkoutSessions();setWorkoutSessionsState(ws);}
        catch(e){console.warn("Entrenamientos no disponibles (¿falta correr supabase-entrenamientos.sql?):",e);}
        // Catálogos editables: falla suave si aún no corriste la migración SQL
        try{const cats=await getCatalogs();setCatalogOverrides(cats);}
        catch(e){console.warn("Catálogos no disponibles (¿falta correr supabase-catalogos.sql?):",e);}
      }catch(e){
        console.error("Error cargando datos:",e);
        setDbError("No se pudo conectar a la base de datos. Revisá tu conexión.");
      }finally{setLoading(false);}
    }
    load();
  },[]);

  // Refrescar currentUser con datos actualizados de Supabase
  useEffect(()=>{
    if(currentUser&&currentUser.role!=="trainer"&&users.length>0){
      const fresh=users.find(u=>u.id===currentUser.id);
      if(fresh)localStorage.setItem("jh_session",JSON.stringify(fresh));
    }
  },[currentUser,users]);

  function login(u){
    localStorage.setItem("jh_session",JSON.stringify(u));
    setCurrentUserState(u);
    setPage(u.role==="trainer"?"dashboard":"my-routine");
  }
  function logout(){
    localStorage.removeItem("jh_session");
    setCurrentUserState(null);
    setPage("dashboard");
  }
  async function setUsers(newUsers){
    const prev=users;
    setUsersState(newUsers);
    const deleted=prev.filter(p=>!newUsers.find(n=>n.id===p.id));
    const changed=newUsers.filter(n=>{const old=prev.find(p=>p.id===n.id);return!old||JSON.stringify(old)!==JSON.stringify(n);});
    try{await Promise.all([...changed.map(u=>upsertUser(u)),...deleted.map(u=>deleteUser(u.id))]);}
    catch(e){console.error("Error guardando usuario:",e);throw e;}
  }

  async function setExercises(newExercises){
    const prev=exercises;
    setExercisesState(newExercises);
    const deleted=prev.filter(p=>!newExercises.find(n=>n.id===p.id));
    const changed=newExercises.filter(n=>{const old=prev.find(p=>p.id===n.id);return!old||JSON.stringify(old)!==JSON.stringify(n);});
    try{await Promise.all([...changed.map(ex=>upsertExercise(ex)),...deleted.map(ex=>deleteExercise(ex.id))]);}
    catch(e){console.error("Error guardando ejercicio:",e);throw e;}
  }

  async function setRoutines(newRoutines){
    const prev=routines;
    setRoutinesState(newRoutines);
    const deleted=prev.filter(p=>!newRoutines.find(n=>n.id===p.id));
    const changed=newRoutines.filter(n=>{const old=prev.find(p=>p.id===n.id);return!old||JSON.stringify(old)!==JSON.stringify(n);});
    try{await Promise.all([...changed.map(rt=>upsertRoutine(rt)),...deleted.map(rt=>deleteRoutine(rt.id))]);}
    catch(e){console.error("Error guardando rutina:",e);throw e;}
  }

  async function setMeasurements(newMs){
    const prev=measurements;
    setMeasurementsState(newMs);
    const deleted=prev.filter(p=>!newMs.find(n=>n.id===p.id));
    const changed=newMs.filter(n=>{const old=prev.find(p=>p.id===n.id);return!old||JSON.stringify(old)!==JSON.stringify(n);});
    try{await Promise.all([...changed.map(m=>upsertMeasurement(m)),...deleted.map(m=>deleteMeasurement(m.id))]);}
    catch(e){console.error("Error guardando medición:",e);throw e;}
  }

  async function setWorkoutSessions(newWs){
    const prev=workoutSessions;
    setWorkoutSessionsState(newWs);
    const deleted=prev.filter(p=>!newWs.find(n=>n.id===p.id));
    const changed=newWs.filter(n=>{const old=prev.find(p=>p.id===n.id);return!old||JSON.stringify(old)!==JSON.stringify(n);});
    try{await Promise.all([...changed.map(s=>upsertWorkoutSession(s)),...deleted.map(s=>deleteWorkoutSession(s.id))]);}
    catch(e){console.error("Error guardando entrenamiento:",e);throw e;}
  }

  async function saveCategory(dbCat,labels){
    setCatalogOverrides(prev=>({...prev,[dbCat]:labels}));
    try{await setCatalogCategory(dbCat,labels);}
    catch(e){console.error("Error guardando catálogo:",e);throw e;}
  }
  const catalogValue=buildCatalogValue(catalogOverrides,saveCategory);

  if(loading)return(<><style>{STYLES}</style><div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",flexDirection:"column",gap:16,background:"#F4F6FB"}}><div style={{width:48,height:48,border:"4px solid #DDE4F0",borderTop:"4px solid #1A5DC8",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/><div style={{fontFamily:"'Barlow',sans-serif",fontSize:14,color:"#6B7A99"}}>Cargando...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div></>);

  if(dbError)return(<><style>{STYLES}</style><div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",flexDirection:"column",gap:12,background:"#F4F6FB",padding:24,textAlign:"center"}}><div style={{fontSize:32}}>⚠️</div><div style={{fontFamily:"'Barlow',sans-serif",fontSize:16,color:"#E53935",fontWeight:700}}>{dbError}</div><button className="btn btn-p" onClick={()=>window.location.reload()}>Reintentar</button></div></>);

  if(!currentUser)return(<><style>{STYLES}</style><LoginPage onLogin={login} users={users}/></>);

  const isT=currentUser.role==="trainer";
  const liveUser=isT?currentUser:(users.find(u=>u.id===currentUser.id)||currentUser);
  let content;
  if(isT){
    if(page==="dashboard")content=<Dashboard users={users} routines={routines}/>;
    else if(page==="clients")content=<ClientsPage users={users} setUsers={setUsers} routines={routines} measurements={measurements} setMeasurements={setMeasurements} workoutSessions={workoutSessions} setWorkoutSessions={setWorkoutSessions} exercises={exercises} selectedClientId={null}/>;
    else if(page==="routines")content=<RoutinesPage routines={routines} setRoutines={setRoutines} users={users} setUsers={setUsers} exercises={exercises}/>;
    else if(page==="exercises")content=<ExercisesPage exercises={exercises} setExercises={setExercises}/>;
    else if(page==="admins")content=<AdminsPage/>;
  } else {
    if(page==="my-routine")content=<MyRoutinePage user={liveUser} routines={routines} exercises={exercises} workoutSessions={workoutSessions} setWorkoutSessions={setWorkoutSessions}/>;
    else if(page==="my-profile")content=<MyProfilePage user={liveUser} setUsers={setUsers} users={users} measurements={measurements} workoutSessions={workoutSessions} setWorkoutSessions={setWorkoutSessions} exercises={exercises}/>;
  }

  return(<CatalogContext.Provider value={catalogValue}>
    <style>{STYLES}</style>
    <div className="app">
      <Sidebar user={liveUser} page={page} setPage={setPage} onLogout={logout}/>
      <main className="main">
        {content}
        <AppFooter/>
      </main>
    </div>
  </CatalogContext.Provider>);
}

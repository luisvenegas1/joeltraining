import { useState, useCallback } from "react";

export function genId(){return"id_"+Math.random().toString(36).slice(2,10)}
export function useLS(key,init){
  const[val,setVal]=useState(()=>{try{const s=localStorage.getItem(key);return s?JSON.parse(s):init}catch{return init}});
  const set=useCallback(v=>{setVal(v);localStorage.setItem(key,JSON.stringify(v))},[key]);
  return[val,set];
}
export function getEmbed(url){
  if(!url)return null;
  const s=url.match(/youtube\.com\/shorts\/([^?&]+)/);if(s)return`https://www.youtube.com/embed/${s[1]}`;
  const w=url.match(/[?&]v=([^&]+)/);if(w)return`https://www.youtube.com/embed/${w[1]}`;
  return null;
}
export function calcAge(dob){
  if(!dob)return null;
  const b=new Date(dob),n=new Date();
  let age=n.getFullYear()-b.getFullYear();
  if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))age--;
  return age;
}
export function fmtDate(d){if(!d)return"—";try{const dt=d.includes("T")?new Date(d):new Date(d+"T12:00:00");return dt.toLocaleDateString("es-CR",{day:"2-digit",month:"short",year:"numeric"})}catch{return d}}
export function initials(name){return(name||"").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
export function planColor(type){return{Base:"bd-gray",Elite:"bd-purple",Activación:"bd-blue",Transformación:"bd-orange",Especial:"bd-teal"}[type]||"bd-gray"}
export function getPlanStatus(plan){
  if(!plan)return"Sin plan";
  if(plan.paused)return"Pausado";
  const endDate=plan.endDate;
  if(!endDate)return"Sin plan";
  const d=Math.ceil((new Date(endDate+"T23:59:59")-new Date())/(1000*60*60*24));
  if(d<0)return"Vencido";
  if(d===0)return"Vence hoy";
  return"Activo";
}
export function getPlanStatusFromEndDate(endDate){
  if(!endDate)return"Sin plan";
  const d=Math.ceil((new Date(endDate+"T23:59:59")-new Date())/(1000*60*60*24));
  if(d<0)return"Vencido";
  if(d===0)return"Vence hoy";
  return"Activo";
}
export function daysLeft(endDate){
  if(!endDate)return null;
  return Math.ceil((new Date(endDate+"T23:59:59")-new Date())/(1000*60*60*24));
}
export function addMonths(dateStr,months){
  const d=new Date(dateStr+"T12:00:00");
  d.setMonth(d.getMonth()+months);
  return d.toISOString().split("T")[0];
}

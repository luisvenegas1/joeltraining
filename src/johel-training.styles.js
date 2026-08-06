export const STYLES=`
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;900&family=Barlow+Condensed:wght@600;700;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;font-family:'Barlow',sans-serif;background:#F5F7FC;color:#0D1B3E;-webkit-tap-highlight-color:transparent;overscroll-behavior:none;-webkit-text-size-adjust:100%;text-size-adjust:100%;overflow-x:hidden;width:100%;max-width:100%}
html{background:#F5F7FC !important}
body{background:#F5F7FC !important}
#root{background:#F5F7FC;min-height:100vh;min-height:100dvh;overflow-x:hidden;max-width:100vw}
.app{display:flex;min-height:100vh;min-height:100dvh;background:#F5F7FC;overflow-x:hidden;max-width:100vw}
/* SIDEBAR */
.sidebar{width:210px;min-width:210px;background:var(--brand-secondary,#0B1F4B);display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;height:100dvh;overflow-y:auto;z-index:200;transition:transform 0.2s}
.main{flex:1;margin-left:210px;padding:20px;min-width:0;max-width:100%;background:#F5F7FC;min-height:100vh;min-height:100dvh}
.sb-logo{padding:16px 12px;border-bottom:1px solid rgba(255,255,255,0.1);display:flex;flex-direction:column;align-items:center;gap:4px}
.sb-brand{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:900;letter-spacing:1px;color:#fff;text-align:center;text-transform:uppercase}
.sb-sub{font-size:8px;color:rgba(255,255,255,0.35);letter-spacing:2px;text-transform:uppercase}
.nav-sec{padding:12px 12px 4px;font-size:9px;letter-spacing:2px;color:rgba(255,255,255,0.28);text-transform:uppercase}
.nav-item{display:flex;align-items:center;gap:8px;padding:10px 12px;margin:1px 6px;border-radius:8px;cursor:pointer;color:rgba(255,255,255,0.6);font-size:13px;font-weight:600;transition:all 0.15s;user-select:none;-webkit-user-select:none}
.nav-item:hover,.nav-item:active{background:rgba(255,255,255,0.1);color:#fff}
.nav-item.active{background:var(--brand-primary,#1A5DC8);color:#fff}
.nav-icon{font-size:16px;width:20px;text-align:center;flex-shrink:0}
.sb-footer{margin-top:auto;padding:12px;border-top:1px solid rgba(255,255,255,0.1)}
.u-chip{display:flex;align-items:center;gap:7px;padding:7px 9px;border-radius:8px;background:rgba(255,255,255,0.07)}
.u-av{width:30px;height:30px;border-radius:50%;background:#3A8EF6;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;color:#fff;flex-shrink:0;overflow:hidden}
.u-av img{width:100%;height:100%;object-fit:cover}
.u-nm{font-size:11px;font-weight:700;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.u-rl{font-size:9px;color:rgba(255,255,255,0.38)}
.lbtn{margin-left:auto;background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.35);font-size:16px;padding:4px;transition:color 0.15s;flex-shrink:0;min-width:28px;min-height:28px;display:flex;align-items:center;justify-content:center}
.lbtn:hover{color:#E53935}
/* LAYOUT */
.ph{margin-bottom:20px;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap}
.pt{font-family:'Barlow Condensed',sans-serif;font-size:24px;font-weight:900;letter-spacing:0.5px;color:#0B1F4B;text-transform:uppercase;line-height:1.1}
.ps{font-size:12px;color:#6B7A99;margin-top:2px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:16px}
.stat{background:#fff;border:1px solid #DDE4F0;border-radius:10px;padding:12px 14px}
.sl{font-size:10px;color:#6B7A99;text-transform:uppercase;letter-spacing:1px}
.sv{font-size:22px;font-weight:700;color:#0B1F4B;margin-top:2px}
.card{background:#fff;border:1px solid #DDE4F0;border-radius:12px;padding:14px}
.card+.card{margin-top:12px}
/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:10px 16px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;transition:all 0.15s;font-family:'Barlow',sans-serif;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;min-height:40px;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.btn-p{background:var(--brand-primary,#1A5DC8);color:#fff}.btn-p:active{background:var(--brand-secondary,#0B1F4B)}
.btn-s{background:transparent;color:#1A5DC8;border:1.5px solid #1A5DC8}.btn-s:active{background:#1A5DC8;color:#fff}
.btn-d{background:#E53935;color:#fff}.btn-d:active{background:#b71c1c}
.btn-ok{background:#2E7D32;color:#fff}.btn-ok:active{background:#1b5e20}
.btn-g{background:transparent;color:#6B7A99;border:1px solid #DDE4F0}.btn-g:active{background:#F5F7FC}
.btn-w{background:#F57C00;color:#fff}
.btn-sm{padding:7px 12px;font-size:11px;min-height:34px}
.btn-xs{padding:5px 9px;font-size:10px;min-height:28px}
.btn-full{width:100%;justify-content:center}
/* FORMS */
.inp,.sel,.ta{width:100%;padding:10px 12px;border:1.5px solid #DDE4F0;border-radius:8px;font-size:14px;font-family:'Barlow',sans-serif;color:#0D1B3E;background:#fff;transition:border 0.15s;outline:none;-webkit-appearance:none;appearance:none;min-height:44px}
.inp:focus,.sel:focus,.ta:focus{border-color:#3A8EF6}
.ta{resize:vertical;min-height:70px}
.sel{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B7A99' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}
label{font-size:11px;font-weight:700;color:#6B7A99;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px}
.fg{margin-bottom:12px}
.fr2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fr3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.pw-wrap{position:relative}.pw-wrap .inp{padding-right:44px}
.pw-eye{position:absolute;right:0;top:0;bottom:0;width:44px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;color:#6B7A99;font-size:18px;padding:0}
.pw-eye:active{color:#1A5DC8}
/* TABLE */
.tbl{width:100%;border-collapse:collapse}
.tbl th{padding:9px 12px;text-align:left;font-size:10px;color:#6B7A99;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #DDE4F0;white-space:nowrap}
.tbl td{padding:11px 12px;border-bottom:1px solid #DDE4F0;font-size:12px;vertical-align:middle;text-align:left}
.tbl tr:last-child td{border-bottom:none}
.tbl tr:hover td{background:#F8F9FF}
/* BADGES */
.badge{display:inline-block;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px}
.bd-blue{background:#E3F0FF;color:#1A5DC8}.bd-green{background:#E8F5E9;color:#2E7D32}
.bd-orange{background:#FFF3E0;color:#F57C00}.bd-gray{background:#ECEFF1;color:#607D8B}
.bd-red{background:#FFEBEE;color:#E53935}.bd-purple{background:#F3E5F5;color:#7B1FA2}
.bd-teal{background:#E0F2F1;color:#00695C}.bd-yellow{background:#FFFDE7;color:#F9A825}
/* TABS */
.tabs{display:flex;gap:0;border-bottom:2px solid #DDE4F0;margin-bottom:16px;overflow-x:auto;-webkit-overflow-scrolling:touch}
.tabs::-webkit-scrollbar{display:none}
.tab{padding:10px 14px;cursor:pointer;font-size:11px;font-weight:700;color:#6B7A99;border-bottom:3px solid transparent;margin-bottom:-2px;transition:all 0.15s;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;min-height:42px;display:flex;align-items:center}
.tab.active{color:#1A5DC8;border-bottom-color:#1A5DC8}.tab:hover{color:#0D1B3E}
/* MODALS */
.mb{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:1000;display:flex;align-items:flex-end;justify-content:center;padding:0}
.mo{background:#fff;border-radius:20px 20px 0 0;width:100%;max-width:600px;max-height:90vh;max-height:90dvh;overflow-y:auto;padding:20px 18px 32px;box-shadow:0 -4px 40px rgba(0,0,0,0.2)}
.mo-lg{border-radius:16px;margin:auto;max-height:92vh}
.mo-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.mo-t{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:900;text-transform:uppercase;color:#0B1F4B}
.mo-x{background:none;border:none;cursor:pointer;font-size:20px;color:#6B7A99;line-height:1;min-width:36px;min-height:36px;display:flex;align-items:center;justify-content:center}.mo-x:hover{color:#E53935}
/* ROUTINE VIEW */
.day-card{border:1.5px solid #DDE4F0;border-radius:12px;overflow:hidden;margin-bottom:12px}
.day-h{background:#0B1F4B;color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none;min-height:56px}
.day-ht{font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:900;letter-spacing:1px;text-transform:uppercase}
.day-b{padding:12px}
.grp-card{border:1px solid #DDE4F0;border-radius:10px;margin-bottom:10px;overflow:hidden}
.grp-h{background:#F5F7FC;padding:10px 12px;display:flex;align-items:center;gap:7px;border-bottom:1px solid #DDE4F0;flex-wrap:wrap}
.grp-lbl{background:#1A5DC8;color:#fff;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;flex-shrink:0;font-family:'Barlow Condensed',sans-serif}
.grp-b{padding:10px 12px}
.ex-row{display:flex;align-items:flex-start;gap:8px;padding:10px 0;border-bottom:1px solid #DDE4F0}
.ex-row:last-child{border-bottom:none}
.ex-num{width:24px;height:24px;background:#4FC3F7;color:#0B1F4B;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;margin-top:2px}
.ex-nm{font-size:14px;font-weight:700;margin-bottom:4px}
.ex-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:4px}
.ex-tag{background:#F0F4FF;border:1px solid #DBEAFE;border-radius:6px;padding:3px 8px;font-size:10px;color:#1A5DC8;font-weight:700;display:flex;align-items:center;gap:3px}
.ex-tag .tag-lbl{color:#6B7A99;font-weight:400;margin-right:2px}
.ex-dt{font-size:11px;color:#F57C00;margin-top:4px;font-style:italic}
.vbtn{padding:6px 12px;border-radius:6px;font-size:11px;font-weight:700;background:#FF0000;color:#fff;border:none;cursor:pointer;text-transform:uppercase;flex-shrink:0;min-height:34px;min-width:60px}
/* TIMER */
.timer-wrap{margin-bottom:10px}
.timer-box{background:#0B1F4B;border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.timer-disp{font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:900;color:#4FC3F7;letter-spacing:2px;min-width:62px}
.timer-lbl{font-size:10px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px}
.rest-active{background:#FF6D00;border-radius:10px;padding:8px 14px;margin-top:6px;display:flex;align-items:center;gap:10px}
.rest-disp{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:900;color:#fff;letter-spacing:2px}
.rest-btns{display:flex;gap:5px;margin-top:6px;justify-content:flex-end}
/* MISC */
.note-box{background:#FFF8E1;border:1.5px solid #FFD54F;border-radius:9px;padding:11px 13px;font-size:12px;color:#5D4037;margin-bottom:14px;display:flex;gap:7px;align-items:flex-start}
.warn-box{background:#FFF3E0;border:1.5px solid #FFB74D;border-radius:9px;padding:10px 12px;font-size:11px;color:#E65100;display:flex;gap:7px;align-items:flex-start;margin-bottom:12px}
.login-page{min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--brand-secondary,#0B1F4B);padding:16px;gap:0}
.login-box{background:#fff;border-radius:20px;padding:36px 28px;width:100%;max-width:360px;box-shadow:0 24px 64px rgba(0,0,0,0.3);margin:auto}
.login-logo{text-align:center;margin-bottom:22px;display:flex;flex-direction:column;align-items:center}
.login-brand{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:900;color:#0B1F4B;text-transform:uppercase;letter-spacing:2px}
.login-sub{font-size:9px;color:#6B7A99;letter-spacing:3px;text-transform:uppercase;margin-top:3px}
.err{background:#FFEBEE;color:#E53935;padding:9px 12px;border-radius:8px;font-size:12px;margin-bottom:12px;border:1px solid #FFCDD2}
.empty{text-align:center;padding:32px 16px;color:#6B7A99}
.empty .ico{font-size:36px;margin-bottom:8px}
.sa{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;gap:8px;flex-wrap:wrap}
.chips{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}
.chip{padding:6px 12px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid #DDE4F0;color:#6B7A99;background:transparent;transition:all 0.15s;font-family:'Barlow',sans-serif;min-height:34px;display:inline-flex;align-items:center}
.chip.on{background:#1A5DC8;color:#fff;border-color:#1A5DC8}
.ibtn{background:none;border:none;cursor:pointer;padding:6px;border-radius:6px;color:#6B7A99;font-size:16px;transition:all 0.15s;display:inline-flex;align-items:center;justify-content:center;min-width:34px;min-height:34px}
.ibtn:active{background:#F5F7FC}.ibtn.d:active{background:#FFEBEE;color:#E53935}
.divider{height:1px;background:#DDE4F0;margin:12px 0}
.back-btn{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:#1A5DC8;cursor:pointer;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;background:none;border:none;padding:6px 0;min-height:36px}
.m-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-top:10px}
.m-card{background:#F8F9FF;border:1px solid #DDE4F0;border-radius:8px;padding:10px 12px}
.m-lbl{font-size:9px;color:#6B7A99;text-transform:uppercase;letter-spacing:1px}
.m-val{font-size:20px;font-weight:700;color:#0B1F4B;margin-top:2px}
.m-unit{font-size:10px;color:#6B7A99;font-weight:400}
.hist-row{display:flex;align-items:flex-start;gap:8px;padding:10px 0;border-bottom:1px solid #DDE4F0}
.hist-date{font-weight:700;color:#0B1F4B;font-size:12px;min-width:80px}
.hist-vals{display:flex;gap:5px;flex-wrap:wrap;flex:1}
.hist-val{background:#F0F4FF;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:600;color:#1A5DC8}
.chart-wrap{background:#F8F9FF;border-radius:8px;padding:12px;margin-top:10px;overflow-x:auto}
.chart-inner{display:flex;align-items:flex-end;gap:5px;height:100px}
.chart-col{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;min-width:28px}
.chart-bar-f{background:#1A5DC8;border-radius:3px 3px 0 0;width:100%;min-height:2px;transition:height 0.4s}
.chart-val{font-size:8px;font-weight:700;color:#1A5DC8}
.chart-lbl{font-size:8px;color:#6B7A99;text-align:center}
.avatar-wrap{position:relative;width:70px;height:70px;cursor:pointer}
.avatar-big{width:70px;height:70px;border-radius:50%;background:#3A8EF6;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#fff;overflow:hidden;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.15)}
.avatar-big img{width:100%;height:100%;object-fit:cover}
.avatar-edit{position:absolute;bottom:0;right:0;background:#1A5DC8;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid #fff}
.mob-logout{display:none;align-items:center;justify-content:center;flex-direction:column;gap:2px;padding:6px 8px;cursor:pointer;color:rgba(255,255,255,0.55);font-size:9px;min-width:52px;border:none;background:none;font-family:'Barlow',sans-serif}
.mob-logout:active{background:rgba(229,57,53,0.2);color:#FF5252}
.mob-logout .nav-icon{font-size:20px;width:auto}
.footer-tm{text-align:center;padding:12px 16px 4px;font-size:10px;color:rgba(255,255,255,0.28);letter-spacing:0.5px;border-top:1px solid rgba(255,255,255,0.08);margin-top:auto}
.main-footer{text-align:center;padding:20px 16px 10px;font-size:10px;color:#6B7A99;letter-spacing:0.3px;border-top:1px solid #DDE4F0;margin-top:24px}
.login-page .main-footer{color:rgba(255,255,255,0.35);border-top:1px solid rgba(255,255,255,0.1);margin-top:0;padding:16px}
.tbl td.td-actions{white-space:nowrap;display:flex;align-items:center;gap:2px}
.pay-row.selected{border-color:#1A5DC8;background:#EFF6FF}
.pay-hist{border-bottom:1px solid #DDE4F0;padding:8px 0;display:flex;align-items:center;gap:8px;font-size:12px}
/* MOBILE */
@media(max-width:640px){
  .sidebar{width:100%;height:auto;position:fixed;bottom:0;top:auto;left:0;right:0;flex-direction:row;height:60px;border-top:1px solid rgba(255,255,255,0.1);padding:0;overflow:visible;z-index:300}
  .sb-logo,.nav-sec,.sb-footer{display:none}
  .mob-logout{display:flex}
  .sidebar nav{display:flex;flex:1;height:100%}
  .nav-item{flex-direction:column;gap:2px;padding:6px 4px;margin:0;border-radius:0;font-size:9px;flex:1;justify-content:center;color:rgba(255,255,255,0.55)}
  .nav-item.active{background:rgba(26,93,200,0.3);color:#4FC3F7}
  .nav-item span:not(.nav-icon){font-size:9px;letter-spacing:0}
  .nav-icon{font-size:20px;width:auto}
  .main{margin-left:0;margin-bottom:60px;padding:12px 14px;overflow-x:hidden}
  .fr2,.fr3{grid-template-columns:1fr}
  .mo{max-height:95vh;max-height:95dvh;border-radius:20px 20px 0 0;padding-bottom:40px}
  .mo-lg{border-radius:20px 20px 0 0;margin:auto 0 0 0}
  .stats{grid-template-columns:1fr 1fr}
  .tbl{font-size:11px}.tbl th,.tbl td{padding:8px 8px}
  .pt{font-size:20px}
  .day-h{padding:12px 14px}
  .grp-b{padding:8px 10px}
  .card{border-radius:12px;max-width:100%;box-sizing:border-box}
  .day-card{border-radius:12px;margin-bottom:10px}
  .tbl-wrap{overflow-x:auto;border-radius:12px}
}
@media(min-width:641px){
  .mb{align-items:center;padding:16px}
  .mo{border-radius:16px;max-height:90vh;padding:22px 20px}
  sidebar nav{display:block}
}
`;
// Green & Red Tomatoes · Operación — app conectada a Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, storageKey: 'grt-auth', autoRefreshToken: true } });

/* =================== utilidades =================== */
const $ = id => document.getElementById(id);
const h = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const money = v => (v < 0 ? '−' : '') + '$' + Math.abs(v || 0).toFixed(2);
const moneyS = v => v > 0 ? '+' + money(v) : money(v);
const sum = a => a.reduce((x, y) => x + (+y || 0), 0);
const pad2 = n => String(n).padStart(2, '0');
const isoLocal = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const hoy = () => isoLocal(new Date());
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return isoLocal(d); };
const lunesDe = iso => { const d = new Date(iso + 'T12:00:00'); const w = (d.getDay() + 6) % 7; return addDays(iso, -w); };
const diaSemana = iso => (new Date(iso + 'T12:00:00').getDay() + 6) % 7;
const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const DAYN = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fFecha = iso => { const d = new Date(iso + 'T12:00:00'); return `${DAYN[(d.getDay() + 6) % 7].slice(0, 3)} ${d.getDate()} ${MESES[d.getMonth()]}`; };
const fHora = ts => ts ? new Date(ts).toLocaleTimeString('es-SV', { hour: 'numeric', minute: '2-digit' }).replace(/\s?([ap])\.?\s?m\.?/i, ' $1m') : '';
const fCuando = ts => { if (!ts) return ''; const d = isoLocal(new Date(ts)); return d === hoy() ? fHora(ts) : d === addDays(hoy(), -1) ? 'ayer ' + fHora(ts) : fFecha(d) + ' ' + fHora(ts); };
const fechaLarga = () => { const d = new Date(); return `${DAYN[(d.getDay() + 6) % 7]} ${d.getDate()} de ${['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][d.getMonth()]}`; };
const initials = s => String(s).replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñü ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const uuid = () => crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
const store = {
  get(k, d) { try { const v = localStorage.getItem('grt-' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('grt-' + k, JSON.stringify(v)); } catch { } },
};
function toast(msg) { const t = $('toast'); t.innerHTML = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 4200); }
const errMsg = e => (e?.message || String(e)).replace(/^.*?ERROR:\s*/, '');
const esRed = e => !navigator.onLine || /fetch|network|Load failed|timeout/i.test(e?.message || String(e));

const TEAM = [
  { id: 'duena', email: 'duena@example.com', name: 'Dueña', tag: 'Ve todo', desc: 'Costos, faltantes, cierre semanal, plan de distribución y equipo.' },
  { id: 'ricardo', email: 'ricardo@example.com', name: 'Ricardo', tag: 'Operaciones', desc: 'Ingresos de proveedor, paquetes e inventario de bodega.' },
  { id: 'rebeca', email: 'rebeca@example.com', name: 'Rebeca', tag: 'Operaciones', desc: 'Despacha y entrega lo que va a cada sucursal.' },
  { id: 'chris', email: 'chris@example.com', name: 'Chris', tag: 'Operaciones', desc: 'Visita una sucursal cada día con el checklist.' },
];
const LOGO = `<img src="https://grtomatoes.com/assets/img/logo/logo-verde.png" alt="Green &amp; Red Tomatoes" onerror="this.outerHTML='<span class=wordmark>Green &amp; Red Tomatoes</span>'">`;
const NI = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ICON = {
  resumen: NI('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'),
  distribucion: NI('<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>'),
  envios: NI('<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/>'),
  supervision: NI('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="m9 13 2 2 4-4"/>'),
  ingreso: NI('<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>'),
  paquetes: NI('<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>'),
  semana: NI('<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 10h18M9 4v17M16 2v4M8 2v4"/>'),
  productos: NI('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
  equipo: NI('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 5.5 5"/>'),
  salir: NI('<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5M5 12h11"/>'),
  scan: NI('<path d="M3 7V4h3M21 7V4h-3M3 17v3h3M21 17v3h-3"/><path d="M7 8v8M10 8v8M13 8v8M17 8v8"/>'),
  cierre: NI('<path d="M9 11h6M9 15h4"/><rect x="5" y="3" width="14" height="18" rx="2"/>'),
  box: NI('<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>'),
};
const NAV = {
  duena: [['General', [['resumen', 'Resumen']]], ['Operación', [['distribucion', 'Distribución'], ['envios', 'Envíos'], ['supervision', 'Supervisión']]],
  ['Bodega', [['ingreso', 'Ingreso de proveedor'], ['paquetes', 'Armar paquetes']]], ['Administración', [['semana', 'Cierre semanal'], ['productos', 'Productos'], ['equipo', 'Equipo']]]],
  operaciones: [['Bodega', [['ingreso', 'Ingreso de proveedor'], ['paquetes', 'Armar paquetes']]], ['Operación', [['distribucion', 'Distribución'], ['envios', 'Envíos'], ['supervision', 'Supervisión']]]],
};
const VIEW_INICIAL = { inventario: 'ingreso', distribucion: 'distribucion', supervision: 'supervision' };
const ST = {
  en_camino: '<span class="pill warn">En camino</span>', entregado: '<span class="pill warn">Entregado, sin escanear</span>',
  recibido: '<span class="pill ok">Recibido completo</span>', con_diferencia: '<span class="pill bad">Recibido con faltante</span>',
};

/* =================== estado =================== */
const S = {
  mode: 'boot', perfil: null, view: '', modal: null, loading: false,
  suc: [], cats: [], prods: [], P: {}, provs: [], checklist: [], costos: {}, costLog: {}, plan: {},
  envios: [], paqBodega: [], stock: {}, bitacora: [], cierres: [], visitas: [], ingresos: [], perfiles: [], personal: [],
  netoPrev: null,
  sem: { lunes: null, suc: 'merliot', modo: 'resumen', rows: null, cargando: false },
  ing: { prov: null, qty: {}, cat: 'beb' }, pk: { pid: null, n: 1, last: [] }, env: { suc: 'soho', codes: [], scan: '' },
  planEdit: null, visit: null, newItem: '', np: { name: '', cat: 'beb', cost: '', pack: '' }, pf: 'todos',
  login: { user: '', err: '', busy: false },
  t: { view: 'home', envios: [], personal: [], prods: [], cerrado: null, scan: null, cd: null, online: navigator.onLine, queue: store.get('queue', []), syncing: false, msg: '' },
};
const isOwner = () => S.perfil?.rol === 'duena';
const sucNombre = id => S.suc.find(s => s.id === id)?.nombre || id;
const activos = () => S.prods.filter(p => p.activo);

/* =================== arranque y sesión =================== */
async function boot() {
  window.addEventListener('online', () => { S.t.online = true; flushQueue(); renderNet(); });
  window.addEventListener('offline', () => { S.t.online = false; renderNet(); });
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { S.mode = 'login'; return render(); }
  await entrar(session.user.id);
}
async function entrar(userId) {
  let perfil = null;
  try {
    const { data, error } = await sb.from('perfiles').select('nombre,rol,enfoque,sucursal_id').eq('user_id', userId).single();
    if (error) throw error; perfil = data; store.set('perfil', perfil);
  } catch (e) { perfil = store.get('perfil', null); if (!perfil) { S.mode = 'login'; S.login.err = 'No se pudo cargar el usuario: ' + errMsg(e); return render(); } }
  S.perfil = perfil;
  if (perfil.rol === 'sucursal') { S.mode = 'tablet'; render(); await cargarTablet(); flushQueue(); return; }
  S.mode = 'office'; S.view = perfil.rol === 'duena' ? 'resumen' : (VIEW_INICIAL[perfil.enfoque] || 'ingreso');
  render(); await cargarOficina(); suscribir();
}
async function salir() { pararCam(); await sb.removeAllChannels(); await sb.auth.signOut(); S.perfil = null; S.mode = 'login'; S.login = { user: '', err: '', busy: false }; render(); }

// Usuario: correo completo, o solo el nombre de usuario de la demo (ej. "rebeca", "tablet.merliot")
const aCorreo = u => { u = u.trim().toLowerCase(); return u.includes('@') ? u : u + '@example.com'; };
async function login() {
  const user = ($('luser')?.value || '').trim(), pass = $('lpass')?.value || '';
  S.login.user = user;
  if (!user || !pass) { S.login.err = 'Escriba su usuario y su contraseña.'; return render(); }
  S.login.busy = true; S.login.err = ''; render();
  const { data, error } = await sb.auth.signInWithPassword({ email: aCorreo(user), password: pass });
  S.login.busy = false;
  if (error) { S.login.err = /invalid/i.test(error.message) ? 'Usuario o contraseña incorrectos.' : errMsg(error); render(); $('lpass')?.focus(); return; }
  S.login.err = ''; await entrar(data.user.id);
}

/* =================== carga de datos (oficina) =================== */
async function q(promise) { const { data, error } = await promise; if (error) throw error; return data; }
async function cargarCatalogo() {
  const [suc, cats, prods, check] = await Promise.all([
    q(sb.from('sucursales').select('*').order('orden')), q(sb.from('categorias').select('*').order('orden')),
    q(sb.from('productos').select('*').order('id')), q(sb.from('checklist_items').select('*').eq('activo', true).order('orden')),
  ]);
  S.suc = suc; S.cats = cats; S.prods = prods; S.P = Object.fromEntries(prods.map(p => [p.id, p])); S.checklist = check;
}
async function cargarOficina() {
  try {
    await cargarCatalogo();
    const desde = addDays(hoy(), -14);
    const [provs, dias, items, envios, bodega, stock, bit, cierres, visitas, ingresos, perfiles] = await Promise.all([
      q(sb.from('proveedores').select('*').order('id')),
      q(sb.from('plan_dias').select('*')), q(sb.from('plan_items').select('*')),
      q(sb.from('envios').select('*, paquetes(codigo,producto_id,unidades,estado)').gte('fecha', desde).order('id', { ascending: false })),
      q(sb.from('paquetes').select('codigo,producto_id,unidades,indice,de_total,creado_en,creado_por').eq('estado', 'bodega').order('codigo')),
      q(sb.from('v_stock_bodega').select('*')),
      q(sb.from('bitacora').select('*').order('en', { ascending: false }).limit(40)),
      q(sb.from('cierres').select('*').gte('fecha', addDays(hoy(), -3)).order('fecha', { ascending: false })),
      q(sb.from('visitas').select('*, visita_respuestas(*), visita_conteos(*)').gte('fecha', addDays(hoy(), -35)).order('fecha', { ascending: false })),
      q(sb.from('ingresos').select('id,cerrado_en,cerrado_por,proveedores(nombre),ingreso_items(unidades)').order('id', { ascending: false }).limit(10)),
      q(sb.from('perfiles').select('nombre,rol,enfoque,sucursal_id')),
    ]);
    S.provs = provs; if (!S.ing.prov) S.ing.prov = provs[0]?.id;
    S.plan = Object.fromEntries(S.suc.map(s => [s.id, { days: dias.filter(d => d.sucursal_id === s.id).map(d => d.dia).sort(), items: Object.fromEntries(items.filter(i => i.sucursal_id === s.id).map(i => [i.producto_id, i.paquetes])) }]));
    S.envios = envios; S.paqBodega = bodega; S.stock = Object.fromEntries(stock.map(r => [r.producto_id, r]));
    S.bitacora = bit; S.cierres = cierres; S.visitas = visitas; S.ingresos = ingresos; S.perfiles = perfiles;
    if (!S.pk.pid) S.pk.pid = activos()[0]?.id;
    if (isOwner()) {
      const [costos, hist, personal] = await Promise.all([
        q(sb.from('producto_costos').select('*')),
        q(sb.from('costo_historial').select('*').order('cambiado_en', { ascending: false }).limit(200)),
        q(sb.from('personal_sucursal').select('id,sucursal_id,nombre,activo').order('id')),
      ]);
      S.costos = Object.fromEntries(costos.map(c => [c.producto_id, c.costo == null ? null : +c.costo]));
      S.costLog = {}; hist.forEach(x => { if (!S.costLog[x.producto_id]) S.costLog[x.producto_id] = x; });
      S.personal = personal;
      cargarNetoPrev();
    }
    render();
  } catch (e) { toast('No se pudieron cargar los datos: ' + h(errMsg(e))); console.error(e); }
}
let recargaT = null;
function suscribir() {
  sb.channel('operacion')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'envios' }, recargar)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cierres' }, recargar)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'visitas' }, recargar)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bitacora' }, recargar)
    .subscribe();
}
function recargar() {
  clearTimeout(recargaT);
  recargaT = setTimeout(async () => {
    const editando = document.activeElement && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName);
    if (editando || S.modal) { recargaT = setTimeout(recargar, 4000); return; }
    await cargarOficina();
  }, 700);
}

/* =================== cálculo semanal =================== */
function filaSemana(r) {
  const n = r.dias_cerrados || 0;
  const ent = r.ent.map(x => +x || 0), ven = r.ven.map(x => +x || 0);
  const entT = sum(ent.slice(0, n)), venT = sum(ven.slice(0, n));
  const esperado = r.ini + entT - venT;
  const contado = n ? (r.contado ?? 0) : null;
  return { ...r, ent, ven, n, entT, venT, entTodo: sum(ent), esperado, contado, dif: n ? contado - esperado : 0 };
}
async function cargarNetoPrev() {
  try {
    const rows = await q(sb.rpc('reporte_semana', { p_lunes: addDays(lunesDe(hoy()), -7) }));
    const neto = {}; rows.map(filaSemana).forEach(r => { const c = S.costos[r.producto_id] || 0; const o = neto[r.sucursal_id] ||= { f: 0, s: 0 }; if (r.dif < 0) o.f += r.dif * c; else o.s += r.dif * c; });
    S.netoPrev = neto; if (S.view === 'resumen') render();
  } catch (e) { console.error(e); }
}
async function cargarSemana() {
  if (!S.sem.lunes) S.sem.lunes = addDays(lunesDe(hoy()), -7);
  S.sem.cargando = true; S.sem.rows = null; render();
  try { S.sem.rows = (await q(sb.rpc('reporte_semana', { p_lunes: S.sem.lunes, p_sucursal: S.sem.suc }))).map(filaSemana); }
  catch (e) { toast('No se pudo cargar la semana: ' + h(errMsg(e))); S.sem.rows = []; }
  S.sem.cargando = false; render();
}

/* =================== piezas de interfaz =================== */
const thumb = p => `<span class="thumb c-${p.categoria_id}">${h(initials(p.nombre))}</span>`;
const prodCell = (p, sub) => `<div class="prod">${thumb(p)}<span><b style="font-weight:600">${h(p.nombre)}</b>${sub ? `<br><span class="muted" style="font-size:13px">${sub}</span>` : ''}</span></div>`;
const stepper = (key, val, cls = '') => `<span class="step ${cls}"><button data-act="dec" data-key="${key}" aria-label="Restar">−</button><input data-key="${key}" inputmode="numeric" value="${val ?? ''}" placeholder="0" aria-label="Cantidad"><button data-act="inc" data-key="${key}" aria-label="Sumar">+</button></span>`;
const getKey = k => k.split('.').reduce((o, x) => o?.[x], S);
function setKey(k, v) { const a = k.split('.'); const last = a.pop(); const o = a.reduce((o, x) => (o[x] ??= {}), S); o[last] = v; }
const head = (eyebrow, title, desc, right = '') => `<div class="head"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ''}</div>${right}</div>`;
const envioHoy = s => S.envios.find(e => e.sucursal_id === s && e.fecha === hoy() && e.origen === 'plan');
const tocaHoy = s => (S.plan[s]?.days || []).includes(diaSemana(hoy()));
const ultimaVisita = s => S.visitas.filter(v => v.sucursal_id === s).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
const diasDesde = iso => Math.round((new Date(hoy() + 'T12:00:00') - new Date(iso + 'T12:00:00')) / 86400000);
const visitOk = v => v.visita_respuestas.filter(r => r.ok).length;

/* =================== vistas de oficina =================== */
function vResumen() {
  const hoyS = S.suc.filter(s => tocaHoy(s.id));
  const entregados = hoyS.filter(s => { const e = envioHoy(s.id); return e && e.estado !== 'en_camino'; }).length;
  const cierresHoy = S.cierres.filter(c => c.fecha === hoy());
  const tot = S.netoPrev ? Object.values(S.netoPrev).reduce((a, o) => ({ f: a.f + o.f, s: a.s + o.s }), { f: 0, s: 0 }) : null;
  const rows = S.suc.map(s => {
    const c = cierresHoy.find(x => x.sucursal_id === s.id); const ult = S.cierres.find(x => x.sucursal_id === s.id);
    const e = envioHoy(s.id); const lv = ultimaVisita(s.id); const n = S.netoPrev?.[s.id]; const neto = n ? n.f + n.s : null;
    const env = tocaHoy(s.id) ? (e ? ST[e.estado] : '<span class="pill neutral">Por despachar</span>') : '<span class="muted">No toca hoy</span>';
    const vis = lv ? `${diasDesde(lv.fecha) === 0 ? 'Hoy' : diasDesde(lv.fecha) === 1 ? 'Ayer' : 'Hace ' + diasDesde(lv.fecha) + ' días'} <span class="muted small">· ${visitOk(lv)}/${lv.visita_respuestas.length}</span>` : '<span class="muted">—</span>';
    const verUlt = ult ? `<button class="linkbtn" data-act="verCierre" data-v="${ult.id}">${c ? 'Ver cierre' : 'Último: ' + fCuando(ult.cerrado_en)}${ult.foto_cinta ? ' · 📷' : ''}</button>` : '';
    return `<tr><td><b>${h(s.nombre)}</b></td><td>${c ? `<span class="pill ok">${h(c.firmado_por)} · ${fHora(c.cerrado_en)}</span><br>${verUlt}` : `<span class="pill neutral">Pendiente</span>${ult ? `<br>${verUlt}` : ''}`}</td><td>${env}</td><td>${vis}</td><td class="r ${neto < -5 ? 'neg' : neto > 0 ? 'pos' : ''}">${neto == null ? '<span class="muted">…</span>' : moneyS(neto)}</td></tr>`;
  }).join('');
  return head(fechaLarga(), 'Resumen de operación', 'Estado de las 7 sucursales, la distribución de hoy, las visitas de supervisión y las diferencias de inventario. Se actualiza solo.') + `
  <div class="kpis">
   <div class="kpi"><span class="muted">Distribución de hoy</span><b class="num">${entregados} / ${hoyS.length}</b><span class="muted">sucursales entregadas</span></div>
   <div class="kpi"><span class="muted">Paquetes en bodega</span><b class="num">${S.paqBodega.length}</b><span class="muted">con etiqueta</span></div>
   <div class="kpi"><span class="muted">Cierres de hoy</span><b class="num">${cierresHoy.length} / ${S.suc.length}</b><span class="muted">${S.suc.filter(s => !cierresHoy.some(c => c.sucursal_id === s.id)).map(s => s.nombre).join(', ') || 'Todas cerraron'}</span></div>
   <div class="kpi ${tot && tot.f + tot.s < 0 ? 'bad' : ''}"><span class="muted">Neto semana pasada</span><b class="num">${tot ? moneyS(tot.f + tot.s) : '…'}</b><span class="muted">${tot ? `faltante ${money(tot.f)} · sobrante ${moneyS(tot.s)}` : 'calculando'}</span></div>
  </div>
  <div class="grid-res">
   <section class="panel"><div class="panel-h"><h2>Sucursales</h2></div><div class="tbl-wrap"><table><thead><tr><th>Sucursal</th><th>Cierre de hoy</th><th>Envío de hoy</th><th>Última visita</th><th class="r">Neto semana pasada</th></tr></thead><tbody>${rows}</tbody></table></div></section>
   <section class="panel"><div class="panel-h"><h2>Actividad reciente</h2><span class="muted small">en vivo</span></div><div class="feed">${S.bitacora.slice(0, 12).map(l => `<div><time>${fCuando(l.en)}</time><span${l.alerta ? ' style="color:var(--terra)"' : ''}>${h(l.texto)}</span></div>`).join('') || '<span class="muted">Sin actividad.</span>'}</div></section>
  </div>`;
}

function vIngreso() {
  const list = activos().filter(p => p.categoria_id === S.ing.cat);
  const tot = sum(Object.values(S.ing.qty)), cnt = Object.values(S.ing.qty).filter(v => +v > 0).length;
  return head('Bodega central · Inventario', 'Ingreso de proveedor', 'Cuente lo que llegó y anótelo. Al cerrar, queda registrado quién lo contó y a qué hora, y el inventario de bodega se actualiza.') + `
  <section class="panel stack">
   <div class="row"><div class="field" style="min-width:260px"><label for="prov">Proveedor</label><select id="prov" data-key="ing.prov">${S.provs.map(p => `<option value="${p.id}"${+S.ing.prov === p.id ? ' selected' : ''}>${h(p.nombre)}</option>`).join('')}</select></div>
   <div class="chips" style="margin-left:auto">${S.cats.map(c => `<button class="chip" data-act="ingcat" data-v="${c.id}" aria-pressed="${S.ing.cat === c.id}">${h(c.nombre)}</button>`).join('')}</div></div>
   <div class="tbl-wrap"><table><thead><tr><th>Producto</th><th class="r">Sueltas en bodega</th><th class="r">Unidades que llegaron</th></tr></thead><tbody>
   ${list.map(p => `<tr><td>${prodCell(p, isOwner() ? (S.costos[p.id] == null ? '<span style="color:var(--mustard)">Sin costo registrado</span>' : 'Costo ' + money(S.costos[p.id])) : '')}</td><td class="r num">${S.stock[p.id]?.sueltas ?? 0}</td><td class="r">${stepper('ing.qty.' + p.id, S.ing.qty[p.id])}</td></tr>`).join('')}
   </tbody></table></div>
   <div class="row" style="justify-content:flex-end;border-top:1px solid var(--line);padding-top:14px"><span class="muted" id="ingtot">${cnt} productos · ${tot} unidades</span><button class="btn primary" data-act="closeIng" ${tot ? '' : 'disabled'} id="ingbtn">Cerrar ingreso</button></div>
  </section>
  <section class="panel"><div class="panel-h"><h2>Últimos ingresos</h2></div><div class="tbl-wrap"><table><thead><tr><th>Fecha</th><th>Proveedor</th><th class="r">Productos</th><th class="r">Unidades</th><th>Cerrado por</th></tr></thead><tbody>
  ${S.ingresos.map(i => `<tr><td>${fCuando(i.cerrado_en)}</td><td>${h(i.proveedores?.nombre)}</td><td class="r">${i.ingreso_items.length}</td><td class="r">${sum(i.ingreso_items.map(x => x.unidades)).toLocaleString('es')}</td><td>${h(i.cerrado_por)}</td></tr>`).join('')}</tbody></table></div></section>`;
}

function labelHTML(pk) {
  const p = S.P[pk.producto_id];
  return `<div class="label"><div class="lt"><span>GREEN &amp; RED TOMATOES</span><span>${pk.indice} de ${pk.de_total}</span></div><div class="ln">${h(p?.nombre)}</div><div class="lu">${pk.unidades} unidades · ${fFecha(isoLocal(new Date(pk.creado_en || Date.now())))}</div><svg data-code="${pk.codigo}"></svg><div class="lc">${pk.codigo}</div></div>`;
}
function vPaquetes() {
  const p = S.P[S.pk.pid]; if (!p) return head('Bodega central', 'Armar paquetes', 'No hay productos activos.');
  const need = S.pk.n * p.por_paquete, sueltas = S.stock[p.id]?.sueltas ?? 0;
  const groups = {}; S.paqBodega.forEach(x => (groups[x.producto_id] ||= []).push(x));
  return head('Bodega central · Inventario', 'Armar paquetes', 'Cada paquete lleva un solo producto y su etiqueta con código de barras. La sucursal escanea cada paquete al recibirlo.') + `
  <div class="grid2b">
   <section class="panel stack"><h2>Nuevo lote</h2>
    <div class="field"><label for="pkp">Producto</label><select id="pkp" data-key="pk.pid">${S.cats.map(c => `<optgroup label="${h(c.nombre)}">${activos().filter(x => x.categoria_id === c.id).map(x => `<option value="${x.id}"${x.id === +S.pk.pid ? ' selected' : ''}>${h(x.nombre)}</option>`).join('')}</optgroup>`).join('')}</select></div>
    <div class="row" style="gap:22px"><div class="field"><label>Unidades por paquete</label><div class="row"><b class="num" style="font-size:22px;color:var(--ink)">${p.por_paquete}</b><span class="muted" style="font-size:13px">fijo</span></div></div>
     <div class="field"><label>Cantidad de paquetes</label>${stepper('pk.n', S.pk.n)}</div></div>
    <div class="note">Se usarán <b class="num">${need}</b> unidades. Sueltas en bodega: <b class="num">${sueltas}</b>.</div>
    ${need > sueltas ? `<div class="err">No hay suficientes unidades sueltas. Registre primero el ingreso del proveedor.</div>` : ''}
    <button class="btn primary" data-act="genPk" ${need > sueltas || !(+S.pk.n > 0) ? 'disabled' : ''}>Armar ${S.pk.n} paquetes</button>
   </section>
   <section class="panel stack" style="min-width:0"><div class="panel-h" style="margin:0"><h2>${S.pk.last.length ? 'Etiquetas del último lote' : 'Vista de etiqueta'}</h2>${S.pk.last.length ? `<button class="btn primary" data-act="printLast">Imprimir etiquetas</button>` : ''}</div>
    <div class="labels">${(S.pk.last.length ? S.pk.last : [{ codigo: 'GRT000000', producto_id: p.id, unidades: p.por_paquete, indice: 1, de_total: S.pk.n }]).map(labelHTML).join('')}</div></section>
  </div>
  <section class="panel"><div class="panel-h"><h2>Paquetes listos en bodega</h2><span class="muted">${S.paqBodega.length} paquetes</span></div><div class="tbl-wrap"><table><thead><tr><th>Producto</th><th class="r">Paquetes</th><th class="r">Unidades</th><th>Códigos</th><th></th></tr></thead><tbody>
  ${Object.entries(groups).map(([pid, arr]) => `<tr><td>${prodCell(S.P[pid], arr[0].unidades + ' u por paquete')}</td><td class="r">${arr.length}</td><td class="r">${sum(arr.map(a => a.unidades))}</td><td class="mono muted">${arr[0].codigo} … ${arr[arr.length - 1].codigo}</td><td class="r"><button class="btn" data-act="printPid" data-v="${pid}">Reimprimir</button></td></tr>`).join('') || '<tr><td colspan="5" class="muted">No hay paquetes armados.</td></tr>'}
  </tbody></table></div></section>`;
}

const pedidoTxt = s => Object.entries(S.plan[s]?.items || {}).filter(([, n]) => +n > 0).map(([pid, n]) => `${h(S.P[pid]?.nombre)} <span class="muted">×${n}</span>`).join(' · ') || '<span class="muted">Sin productos</span>';
function faltantesPlan(s) { const out = []; for (const [pid, n] of Object.entries(S.plan[s]?.items || {})) { const hay = S.paqBodega.filter(p => p.producto_id === +pid).length; if (hay < n) out.push([pid, n - hay]); } return out; }
function vDistrib() {
  const own = isOwner(); const hoyS = S.suc.filter(s => tocaHoy(s.id));
  const rows = hoyS.map(s => {
    const e = envioHoy(s.id); let st, act = '';
    if (!e) { const f = faltantesPlan(s.id); st = f.length ? `<span class="pill bad">Faltan paquetes: ${f.map(([p, n]) => h(S.P[p]?.nombre) + ' (' + n + ')').join(', ')}</span>` : '<span class="pill neutral">Por despachar</span>'; act = f.length ? `<button class="btn" data-act="view" data-v="paquetes">Armar paquetes</button>` : `<button class="btn primary" data-act="dDesp" data-v="${s.id}">Despachar</button>`; }
    else if (e.estado === 'en_camino') { st = `${ST.en_camino}<br><span class="muted small">Salió ${fHora(e.salio_en)} · ${h(e.salio_por)}</span>`; act = `<button class="btn primary" data-act="dEntr" data-v="${e.id}">Marcar entregado</button>`; }
    else if (e.estado === 'entregado') st = `${ST.entregado}<br><span class="muted small">Dejado ${fHora(e.entregado_en)} · ${h(e.entregado_por)}</span>`;
    else st = `${ST[e.estado]}<br><span class="muted small">${h(e.recibido_por)} · ${fHora(e.recibido_en)}</span>`;
    return `<tr><td><b>${h(s.nombre)}</b>${e ? `<br><span class="mono muted">${e.codigo}</span>` : ''}</td><td class="small">${pedidoTxt(s.id)}</td><td>${st}</td><td class="r">${act}</td></tr>`;
  }).join('');
  const hoyIdx = diaSemana(hoy());
  const planRows = S.suc.map(s => {
    const pl = S.plan[s.id];
    const days = DAYS.map((d, i) => `<td class="r" style="padding-inline:3px">${own ? `<button class="day ${pl.days.includes(i) ? 'on' : ''}" data-act="pday" data-s="${s.id}" data-v="${i}" aria-pressed="${pl.days.includes(i)}" aria-label="${DAYN[i]}">${d}</button>` : `<span class="day ${pl.days.includes(i) ? 'on' : ''}" style="display:inline-grid">${d}</span>`}</td>`).join('');
    const edit = S.planEdit === s.id ? `<tr><td colspan="10"><div class="edit-box"><b style="color:var(--ink)">Pedido base de ${h(s.nombre)}</b><span class="muted small">Paquetes que se mandan cada día que le toca. Se guarda al tocar "Listo".</span>
     ${Object.keys(pl.items).map(pid => `<div class="row" style="justify-content:space-between">${prodCell(S.P[pid], S.P[pid].por_paquete + ' u por paquete')}${stepper('plan.' + s.id + '.items.' + pid, pl.items[pid])}</div>`).join('')}
     <div class="row"><select id="planadd" data-key="planAdd" style="flex:1;min-width:0"><option value="">+ Agregar producto…</option>${activos().filter(p => !(p.id in pl.items)).map(p => `<option value="${p.id}">${h(p.nombre)}</option>`).join('')}</select><button class="btn primary" data-act="planDone">Listo</button></div></div></td></tr>` : '';
    return `<tr><td><b>${h(s.nombre)}</b></td>${days}<td class="small">${pedidoTxt(s.id)}</td><td class="r">${own && S.planEdit !== s.id ? `<button class="btn" data-act="planEdit" data-v="${s.id}">Editar</button>` : ''}</td></tr>${edit}`;
  }).join('');
  return head(fechaLarga(), 'Distribución', 'La dueña define qué días le toca a cada sucursal y qué se le manda. Quien distribuye despacha y marca la entrega; la sucursal confirma escaneando.') + `
  <section class="panel"><div class="panel-h"><h2>Hoy · ${DAYN[hoyIdx]}</h2><span class="muted">${hoyS.length} sucursales</span></div><div class="tbl-wrap"><table><thead><tr><th>Sucursal</th><th>Qué lleva (paquetes)</th><th>Estado</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="4" class="muted">Hoy no le toca a ninguna sucursal.</td></tr>'}</tbody></table></div></section>
  <section class="panel"><div class="panel-h"><h2>Plan semanal</h2><span class="muted">${own ? 'Toque un día para activarlo o quitarlo' : 'Lo define la dueña'}</span></div><div class="tbl-wrap"><table><thead><tr><th>Sucursal</th>${DAYS.map((d, i) => `<th class="r ${i === hoyIdx ? 'today' : ''}" style="padding-inline:3px">${d}</th>`).join('')}<th>Pedido base</th><th></th></tr></thead><tbody>${planRows}</tbody></table></div></section>`;
}

function vEnvios() {
  const avail = {}; S.paqBodega.filter(x => !S.env.codes.includes(x.codigo)).forEach(x => (avail[x.producto_id] ||= []).push(x));
  const inDraft = {}; S.env.codes.forEach(c => { const pk = S.paqBodega.find(x => x.codigo === c); if (pk) inDraft[pk.producto_id] = (inDraft[pk.producto_id] || 0) + 1; });
  return head('Bodega central · Distribución', 'Envíos', 'Todo lo que sale de bodega en las últimas dos semanas. Para algo fuera del plan, arme aquí un envío extra.') + `
  <section class="panel"><div class="panel-h"><h2>Historial</h2></div><div class="tbl-wrap"><table><thead><tr><th>Envío</th><th>Sucursal</th><th>Salió</th><th>Lo dejó</th><th class="r">Paquetes</th><th>Estado</th><th>Recibió</th></tr></thead><tbody>
  ${S.envios.map(e => { const falt = e.paquetes.filter(p => p.estado === 'faltante' || p.estado === 'danado').length; return `<tr><td class="mono">${e.codigo}${e.origen === 'extra' ? ' <span class="pill neutral">extra</span>' : ''}</td><td><b>${h(sucNombre(e.sucursal_id))}</b></td><td>${fCuando(e.salio_en)}<br><span class="muted small">${h(e.salio_por)}</span></td><td>${e.entregado_en ? `${fHora(e.entregado_en)}<br><span class="muted small">${h(e.entregado_por)}</span>` : '<span class="muted">—</span>'}</td><td class="r">${e.paquetes.length}${falt ? ` <span class="neg">(${falt} no llegó)</span>` : ''}</td><td>${ST[e.estado]}</td><td>${e.recibido_por ? h(e.recibido_por) + '<br><span class="muted small">' + fHora(e.recibido_en) + '</span>' : '<span class="muted">—</span>'}</td></tr>`; }).join('')}
  </tbody></table></div></section>
  <div class="grid2b">
   <section class="panel stack"><h2>Envío extra</h2>
    <div class="field"><label>Sucursal destino</label><div class="chips">${S.suc.map(s => `<button class="chip" data-act="envsuc" data-v="${s.id}" aria-pressed="${S.env.suc === s.id}">${h(s.nombre)}</button>`).join('')}</div></div>
    <div class="field"><label for="envscan">Escanear etiqueta</label><div class="row"><input id="envscan" data-key="env.scan" class="mono" placeholder="GRT001234" style="flex:1;min-width:0" value="${h(S.env.scan)}"><button class="btn" data-act="envScan">Agregar</button></div></div>
    <div>${Object.keys(inDraft).length ? `<table><tbody>${Object.entries(inDraft).map(([pid, c]) => `<tr><td>${prodCell(S.P[pid])}</td><td class="r num"><b>${c}</b> paq</td><td class="r"><button class="x" data-act="envDel" data-v="${pid}" aria-label="Quitar uno">×</button></td></tr>`).join('')}</tbody></table>` : '<div class="note">Todavía no hay paquetes en este envío.</div>'}</div>
    <button class="btn primary" data-act="despachar" ${S.env.codes.length ? '' : 'disabled'}>Despachar a ${h(sucNombre(S.env.suc))} · ${S.env.codes.length} paquetes</button>
   </section>
   <section class="panel" style="min-width:0"><div class="panel-h"><h2>Disponibles en bodega</h2><span class="muted">Toque para agregar un paquete</span></div><div class="tbl-wrap"><table><tbody>
    ${Object.entries(avail).map(([pid, arr]) => `<tr><td>${prodCell(S.P[pid], arr[0].unidades + ' u por paquete')}</td><td class="r num">${arr.length} disponibles</td><td class="r"><button class="btn" data-act="envAdd" data-v="${pid}">+ 1</button></td></tr>`).join('') || '<tr><td class="muted">No hay paquetes disponibles. Ármelos en "Armar paquetes".</td></tr>'}
   </tbody></table></div></section>
  </div>`;
}

function vSuper() {
  const own = isOwner(); const lun = lunesDe(hoy()); const hoyV = S.visitas.find(v => v.fecha === hoy());
  const strip = DAYS.map((d, i) => { const f = addDays(lun, i); const v = S.visitas.find(x => x.fecha === f); const esHoy = f === hoy();
    return `<div class="wk ${esHoy ? 'today' : ''}"><span class="d">${DAYN[i].slice(0, 3)}${esHoy ? ' · hoy' : ''}</span><b>${v ? h(sucNombre(v.sucursal_id)) : (f < hoy() ? 'Sin visita' : esHoy ? 'Pendiente' : '—')}</b>${v ? `<span class="pill ${visitOk(v) < v.visita_respuestas.length ? 'warn' : 'ok'}">${visitOk(v)} de ${v.visita_respuestas.length} bien</span>` : ''}</div>`; }).join('');
  let today;
  if (S.visit) {
    const V = S.visit; const answered = S.checklist.every(c => V.res[c.id]); const counted = V.conteo.every(pid => V.counts[pid] !== undefined && V.counts[pid] !== '');
    today = `<div class="stack"><div class="panel-h" style="margin:0"><h2>Visita a ${h(sucNombre(V.suc))}</h2><button class="btn" data-act="vCancel">Cancelar</button></div>
     <div>${S.checklist.map(c => `<div class="ck"><span>${h(c.texto)}</span><div class="okbad"><button data-act="ck" data-i="${c.id}" data-v="ok" aria-pressed="${V.res[c.id] === 'ok'}">Bien</button><button data-act="ck" data-i="${c.id}" data-v="mal" aria-pressed="${V.res[c.id] === 'mal'}">Hay problema</button></div>${V.res[c.id] === 'mal' ? `<input data-key="visit.notes.${c.id}" value="${h(V.notes[c.id] || '')}" placeholder="¿Qué encontró? ¿Qué se hizo?">` : ''}</div>`).join('')}</div>
     <div class="stack" style="gap:6px"><h3>Conteo sorpresa</h3><span class="muted small">Cuente estos productos en la sucursal. La diferencia contra el sistema se ve al terminar.</span>
     ${V.conteo.map(pid => `<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:8px 0">${prodCell(S.P[pid])}${stepper('visit.counts.' + pid, V.counts[pid])}</div>`).join('')}</div>
     <button class="btn primary" data-act="vFinish" ${answered && counted ? '' : 'disabled'}>${answered && counted ? 'Terminar visita' : 'Responda todo el checklist y el conteo'}</button></div>`;
  } else if (hoyV) {
    today = `<div class="stack"><h2>Hoy: ${h(sucNombre(hoyV.sucursal_id))}</h2><p class="muted" style="margin:0">${h(hoyV.supervisor)} terminó la visita a las ${fHora(hoyV.hecha_en)}. ${visitOk(hoyV)} de ${hoyV.visita_respuestas.length} puntos bien.</p>
     ${hoyV.visita_respuestas.filter(r => !r.ok).map(r => `<div class="err">${h(r.item)}${r.nota ? ': ' + h(r.nota) : ''}</div>`).join('')}
     <div class="note">Conteo sorpresa: ${hoyV.visita_conteos.map(c => { const d = c.contado - c.sistema; return `${h(S.P[c.producto_id]?.nombre)} ${d === 0 ? 'cuadra' : `<b class="${d < 0 ? 'neg' : 'pos'}">${d > 0 ? '+' : ''}${d}</b>`}`; }).join(' · ')}</div></div>`;
  } else {
    const sorted = S.suc.slice().sort((a, b) => (ultimaVisita(a.id)?.fecha || '0').localeCompare(ultimaVisita(b.id)?.fecha || '0')); const sug = sorted[0]?.id;
    today = `<div class="stack"><h2>Visita de hoy</h2><p class="muted" style="margin:0">Se sugiere la sucursal que lleva más días sin visita.</p>
     <div class="tbl-wrap"><table><tbody>${sorted.map(s => { const lv = ultimaVisita(s.id); return `<tr><td><b>${h(s.nombre)}</b>${s.id === sug ? ' <span class="pill bad">Sugerida</span>' : ''}</td><td class="muted">${lv ? `Última: ${fFecha(lv.fecha)} · hace ${diasDesde(lv.fecha)} días` : 'Más de un mes'}</td><td class="r"><button class="btn ${s.id === sug ? 'primary' : ''}" data-act="vStart" data-v="${s.id}">Empezar</button></td></tr>`; }).join('')}</tbody></table></div></div>`;
  }
  const hist = S.visitas.slice(0, 20).map(v => { const probs = v.visita_respuestas.filter(r => !r.ok);
    return `<tr><td>${fFecha(v.fecha)}</td><td><b>${h(sucNombre(v.sucursal_id))}</b></td><td>${h(v.supervisor)}</td><td><span class="pill ${probs.length ? 'warn' : 'ok'}">${visitOk(v)} de ${v.visita_respuestas.length}</span></td><td class="small">${probs.map(r => h(r.nota || r.item)).join('<br>') || '<span class="muted">—</span>'}</td><td class="small">${v.visita_conteos.map(c => { const d = c.contado - c.sistema; return `${h(S.P[c.producto_id]?.nombre)} ${d === 0 ? '<span class="muted">cuadra</span>' : `<b class="${d < 0 ? 'neg' : 'pos'}">${d > 0 ? '+' : ''}${d}</b>`}`; }).join('<br>')}</td></tr>`; }).join('');
  return head('Supervisión', 'Visitas a sucursales', 'Cada día se visita una sucursal: se revisa el checklist y se hace un conteo sorpresa de algunos productos.') + `
  <div class="week-strip">${strip}</div>
  <div class="grid2"><section class="panel">${today}</section>
   <section class="panel stack"><div class="panel-h" style="margin:0"><h2>Checklist</h2><span class="muted">${own ? 'Se usa en todas las sucursales' : 'Lo define la dueña'}</span></div>
    <div>${S.checklist.map(c => `<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:9px 0;flex-wrap:nowrap"><span>${h(c.texto)}</span>${own && !S.visit ? `<button class="x" data-act="ckDel" data-v="${c.id}" aria-label="Quitar">×</button>` : ''}</div>`).join('')}</div>
    ${own && !S.visit ? `<div class="row"><input id="newitem" data-key="newItem" value="${h(S.newItem)}" placeholder="Nuevo punto a revisar" style="flex:1;min-width:0"><button class="btn" data-act="ckAdd">Agregar</button></div>` : ''}
   </section></div>
  <section class="panel"><div class="panel-h"><h2>Historial de visitas</h2></div><div class="tbl-wrap"><table><thead><tr><th>Fecha</th><th>Sucursal</th><th>Supervisor</th><th>Resultado</th><th>Problemas</th><th>Conteo sorpresa</th></tr></thead><tbody>${hist || '<tr><td colspan="6" class="muted">Sin visitas.</td></tr>'}</tbody></table></div></section>`;
}

function vSemana() {
  if (!S.sem.rows && !S.sem.cargando) { cargarSemana(); }
  const L = S.sem.lunes || addDays(lunesDe(hoy()), -7); const fin = addDays(L, 6);
  const rows = S.sem.rows || [];
  const tot = { cEnv: 0, cIni: 0, fv: 0, sv: 0, fu: 0, su: 0, ven: 0 };
  rows.forEach(r => { const c = S.costos[r.producto_id] || 0; tot.cEnv += r.entTodo * c; tot.cIni += r.ini * c; tot.ven += sum(r.ven); if (r.dif < 0) { tot.fv += r.dif * c; tot.fu += r.dif; } else { tot.sv += r.dif * c; tot.su += r.dif; } });
  const cuadro = S.sem.modo === 'cuadro'; const n = rows[0]?.n ?? 0;
  const actual = L === lunesDe(hoy());
  return head(`Semana del ${fFecha(L)} al ${fFecha(fin)}`, 'Cierre semanal', 'Se arma solo con los envíos recibidos y los cierres diarios. El sobrante de un producto cubre el faltante de otro; el neto es lo que realmente falta.',
    `<div class="week-nav"><button class="btn" data-act="semPrev" aria-label="Semana anterior">‹</button><button class="btn" data-act="semNext" aria-label="Semana siguiente" ${actual ? 'disabled' : ''}>›</button></div>`) + `
  <div class="chips">${S.suc.map(s => `<button class="chip" data-act="wsuc" data-v="${s.id}" aria-pressed="${S.sem.suc === s.id}">${h(s.nombre)}</button>`).join('')}</div>
  ${S.sem.cargando ? '<div class="note">Calculando la semana…</div>' : `
  ${n < 7 ? `<div class="banner"><span>${n === 0 ? 'Esta semana todavía no tiene cierres.' : `Semana en curso: hay ${n} de 7 cierres. El conteo se compara contra el último cierre.`}</span></div>` : ''}
  <div class="kpis">
   <div class="kpi"><span class="muted">Costo enviado</span><b class="num">${money(tot.cEnv)}</b><span class="muted">inventario inicial ${money(tot.cIni)}</span></div>
   <div class="kpi bad"><span class="muted">Faltante</span><b class="num">${money(tot.fv)}</b><span class="muted">${tot.fu} unidades</span></div>
   <div class="kpi"><span class="muted">Sobrante</span><b class="num" style="color:var(--olive)">${moneyS(tot.sv)}</b><span class="muted">+${tot.su} unidades</span></div>
   <div class="kpi ${tot.fv + tot.sv < 0 ? 'bad' : ''}"><span class="muted">Neto</span><b class="num">${moneyS(tot.fv + tot.sv)}</b><span class="muted">faltante menos sobrante</span></div>
  </div>
  <section class="panel"><div class="panel-h"><div class="seg2" role="group" aria-label="Vista"><button data-act="wmode" data-v="resumen" aria-pressed="${!cuadro}">Vista resumida</button><button data-act="wmode" data-v="cuadro" aria-pressed="${cuadro}">Cuadro completo</button></div><span class="muted small">${cuadro ? 'Mismo orden de columnas que el cuadro RETAIL' : 'Ventas por día según la cinta'}</span></div>
  ${cuadro ? semCuadro(rows) : semResumida(rows)}</section>
  <p class="hint" style="text-align:left">${cuadro ? 'Venta total = inicial + entradas − inventario final contado. Diferencia = venta cinta − venta total (negativo = falta producto).' : '"Debía quedar" = inicial + entró − vendido.'} Solo la dueña ve esta pantalla.</p>`}`;
}
function semResumida(rows) {
  const by = Object.fromEntries(rows.map(r => [r.producto_id, r]));
  return `<div class="tbl-wrap"><table style="font-size:14px"><thead><tr><th>Producto</th><th class="r">Inicial</th><th class="r">Entró</th>${DAYS.map(d => `<th class="r">${d}</th>`).join('')}<th class="r">Vendido</th><th class="r">Debía quedar</th><th class="r">Contaron</th><th class="r">Dif.</th><th class="r">Dif. $</th></tr></thead><tbody>
  ${S.cats.map(c => `<tr class="cat-row"><td colspan="16">${h(c.nombre)}</td></tr>` + S.prods.filter(p => p.categoria_id === c.id && by[p.id]).map(p => { const r = by[p.id]; const cost = S.costos[p.id]; const cls = r.dif < 0 ? 'neg' : r.dif > 0 ? 'pos' : '';
    return `<tr><td style="white-space:nowrap">${h(p.nombre)}${cost == null ? ' <span class="pill warn">sin costo</span>' : ''}</td><td class="r">${r.ini}</td><td class="r">${r.entTodo || '<span class="muted">0</span>'}</td>${r.ven.map((x, i) => `<td class="r muted">${i < r.n ? x : '·'}</td>`).join('')}<td class="r"><b>${r.venT}</b></td><td class="r">${r.n ? r.esperado : '—'}</td><td class="r">${r.n ? r.contado : '—'}</td><td class="r ${cls}">${r.dif ? (r.dif > 0 ? '+' : '') + r.dif : '<span class="muted">0</span>'}</td><td class="r ${cls}">${r.dif ? moneyS(r.dif * (cost || 0)) : '<span class="muted">—</span>'}</td></tr>`; }).join('')).join('')}
  </tbody></table></div>`;
}
function semCuadro(rows) {
  const by = Object.fromEntries(rows.map(r => [r.producto_id, r])); const z = v => v ? v : '<span class="muted">0</span>'; const mz = v => v ? money(v) : '<span class="muted">—</span>';
  const G = { ent: 0, vcalc: 0, cinta: 0, dif: 0, cEnv: 0, cIni: 0 };
  const body = S.cats.map(c => {
    const T = { ent: 0, vcalc: 0, cinta: 0, dif: 0, cEnv: 0, cIni: 0 };
    const trs = S.prods.filter(p => p.categoria_id === c.id && by[p.id]).map(p => {
      const r = by[p.id]; const cost = S.costos[p.id] || 0; const vcalc = r.n ? r.ini + r.entT - r.contado : 0; const cinta = r.venT; const dif = r.n ? cinta - vcalc : 0;
      const x = { ent: r.entTodo, vcalc, cinta, dif, cEnv: r.entTodo * cost, cIni: r.ini * cost }; for (const k in T) { T[k] += x[k]; G[k] += x[k]; }
      let prev = r.ini; const days = r.ent.map((e, d) => { const ini = prev, ve = r.ven[d], rest = ini + e - ve; prev = rest; return d < r.n ? `<td class="d0">${ini}</td><td>${z(e)}</td><td>${z(ve)}</td><td class="muted">${rest}</td>` : `<td class="d0 muted">·</td><td>${e ? e : '<span class="muted">·</span>'}</td><td class="muted">·</td><td class="muted">·</td>`; }).join('');
      const cls = dif < 0 ? 'neg' : dif > 0 ? 'pos' : '';
      return `<tr><td class="stick">${h(p.nombre)}</td><td class="d0">${r.ini}</td><td><span class="muted">0</span></td>${days}<td class="d0"><b>${r.n ? r.contado : '—'}</b></td><td>${x.ent}</td><td>${vcalc}</td><td>${cinta}</td><td class="${cls}">${dif ? (dif > 0 ? '+' : '') + dif : '<span class="muted">0</span>'}</td><td class="d0">${S.costos[p.id] == null ? '<span class="pill warn">sin costo</span>' : money(S.costos[p.id])}</td><td>${mz(x.cEnv)}</td><td>${mz(x.cIni)}</td><td><b>${mz(x.cEnv + x.cIni)}</b></td></tr>`;
    }).join('');
    return `<tr class="cat-row"><td class="stick">${h(c.nombre)}</td><td colspan="39"></td></tr>${trs}<tr class="sub"><td class="stick">Total ${h(c.nombre.toLowerCase())}</td><td colspan="30" class="d0"></td><td class="d0"></td><td>${T.ent}</td><td>${T.vcalc}</td><td>${T.cinta}</td><td class="${T.dif < 0 ? 'neg' : ''}">${T.dif}</td><td class="d0"></td><td>${money(T.cEnv)}</td><td>${money(T.cIni)}</td><td>${money(T.cEnv + T.cIni)}</td></tr>`;
  }).join('');
  return `<div class="tbl-wrap xl"><table><thead><tr><th rowspan="2" class="stick">Producto</th><th rowspan="2" class="d0">Inv. inicial</th><th rowspan="2">Faltante</th>${DAYN.map(d => `<th colspan="4" class="dayh d0">${d}</th>`).join('')}<th rowspan="2" class="d0">Inventario final</th><th rowspan="2">Entrada total</th><th rowspan="2">Venta total</th><th rowspan="2">Venta cinta</th><th rowspan="2">Diferencia</th><th rowspan="2" class="d0">Precio de costo</th><th rowspan="2">Total costo enviado</th><th rowspan="2">Total costo inv. inicial</th><th rowspan="2">Total costo semanal</th></tr>
  <tr>${DAYN.map(() => `<th class="d0">Inicia</th><th>Entra</th><th>Venta</th><th>Restante</th>`).join('')}</tr></thead>
  <tbody>${body}<tr class="sub grand"><td class="stick">Total semana</td><td colspan="30" class="d0"></td><td class="d0"></td><td>${G.ent}</td><td>${G.vcalc}</td><td>${G.cinta}</td><td class="${G.dif < 0 ? 'neg' : ''}">${G.dif}</td><td class="d0"></td><td>${money(G.cEnv)}</td><td>${money(G.cIni)}</td><td>${money(G.cEnv + G.cIni)}</td></tr></tbody></table></div>`;
}

function vProductos() {
  const f = S.pf; const sin = S.prods.filter(p => p.activo && S.costos[p.id] == null).length;
  const list = S.prods.filter(p => f === 'todos' || (f === 'sincosto' ? S.costos[p.id] == null : p.categoria_id === f));
  const catN = id => S.cats.find(c => c.id === id)?.nombre || id;
  const rows = list.map(p => { const lg = S.costLog[p.id]; return `<tr class="${p.activo ? '' : 'off'}"><td>${prodCell(p, h(catN(p.categoria_id)))}</td>
   <td class="r"><span class="money-in">$<input data-prod="${p.id}" data-field="cost" inputmode="decimal" value="${S.costos[p.id] == null ? '' : (+S.costos[p.id]).toFixed(2)}" placeholder="Sin costo" aria-label="Costo de ${h(p.nombre)}"></span>${lg && lg.costo_anterior !== null ? `<br><span class="muted small">${h(lg.cambiado_por)} · ${fCuando(lg.cambiado_en)} · antes ${money(+lg.costo_anterior)}</span>` : ''}</td>
   <td class="r"><input class="pack-in" data-prod="${p.id}" data-field="pack" inputmode="numeric" value="${p.por_paquete}" aria-label="Unidades por paquete"> <span class="muted small">u</span></td>
   <td class="r num">${S.stock[p.id]?.sueltas ?? 0}</td>
   <td class="r"><button class="toggle" data-act="pact" data-v="${p.id}" aria-pressed="${p.activo}"><i></i>${p.activo ? 'Activo' : 'Inactivo'}</button></td></tr>`; }).join('');
  return head('Catálogo', 'Productos', 'Productos, costos y tamaño de paquete. Reemplaza las columnas de producto y costo del Excel; cada cambio de costo queda registrado.') + `
  ${sin ? `<div class="banner"><span><b>${sin} productos sin costo.</b> No suman en dinero en el cierre semanal hasta que se les ponga precio.</span><button class="btn" data-act="pf" data-v="sincosto">Ver cuáles</button></div>` : ''}
  <div class="chips"><button class="chip" data-act="pf" data-v="todos" aria-pressed="${f === 'todos'}">Todos · ${S.prods.length}</button>${S.cats.map(c => `<button class="chip" data-act="pf" data-v="${c.id}" aria-pressed="${f === c.id}">${h(c.nombre)}</button>`).join('')}<button class="chip" data-act="pf" data-v="sincosto" aria-pressed="${f === 'sincosto'}">Sin costo · ${S.prods.filter(p => S.costos[p.id] == null).length}</button></div>
  <section class="panel"><div class="tbl-wrap"><table><thead><tr><th>Producto</th><th class="r">Costo</th><th class="r">Por paquete</th><th class="r">En bodega</th><th class="r">Estado</th></tr></thead><tbody>${rows || '<tr><td colspan="5" class="muted">No hay productos en este filtro.</td></tr>'}</tbody></table></div></section>
  <section class="panel stack"><h2>Agregar producto</h2>
   <div class="row" style="align-items:flex-end;gap:14px">
    <div class="field" style="flex:2;min-width:200px"><label for="npn">Nombre</label><input id="npn" data-key="np.name" value="${h(S.np.name)}" placeholder="Ej. Jugo de naranja"></div>
    <div class="field" style="flex:1;min-width:160px"><label for="npc">Categoría</label><select id="npc" data-key="np.cat">${S.cats.map(c => `<option value="${c.id}"${S.np.cat === c.id ? ' selected' : ''}>${h(c.nombre)}</option>`).join('')}</select></div>
    <div class="field" style="width:120px"><label for="npco">Costo ($)</label><input id="npco" data-key="np.cost" inputmode="decimal" value="${h(S.np.cost)}" placeholder="0.00"></div>
    <div class="field" style="width:120px"><label for="npp">Por paquete</label><input id="npp" data-key="np.pack" inputmode="numeric" value="${h(S.np.pack)}" placeholder="${S.cats.find(c => c.id === S.np.cat)?.paquete_default || 10}"></div>
    <button class="btn primary" data-act="padd">Agregar</button>
   </div></section>`;
}
function vEquipo() {
  const perfil = { duena: 'Dueña · ve todo', operaciones: 'Operaciones', sucursal: 'Tablet' };
  const ofi = S.perfiles.filter(p => p.rol !== 'sucursal').map(p => `<tr><td><b>${h(p.nombre)}</b></td><td>${perfil[p.rol]}${p.enfoque ? ' · ' + h(p.enfoque) : ''}</td><td class="small">${p.rol === 'duena' ? 'Todo: resumen, costos, cierre semanal, plan de distribución, checklist, productos y equipo.' : 'Ingresos, paquetes, distribución, envíos y supervisión. No ve costos ni dinero.'}</td></tr>`).join('');
  const suc = S.suc.map(s => `<tr><td><b>${S.personal.filter(p => p.sucursal_id === s.id && p.activo).map(p => h(p.nombre)).join(', ') || '—'}</b></td><td>Tablet ${h(s.nombre)}</td><td class="small">Recibir envíos y cierre del día, firmando con su PIN. No ve el inventario esperado.</td></tr>`).join('');
  return head('Accesos', 'Equipo', 'Ricardo, Rebeca y Chris comparten el perfil de Operaciones para poder cubrirse entre sí. Cada acción queda firmada con el nombre de quien la hizo.') + `
  <section class="panel"><div class="tbl-wrap"><table><thead><tr><th>Persona</th><th>Perfil</th><th>Qué puede hacer</th></tr></thead><tbody>${ofi}${suc}</tbody></table></div></section>
  <section class="panel stack"><h2>Demostración</h2><p class="muted" style="margin:0">Borra toda la operación y vuelve a simular 4 semanas desde cero. Útil antes de presentar la demo.</p><div><button class="btn danger" data-act="resetDemo">Reiniciar datos de demostración</button></div></section>`;
}

function office() {
  const views = { resumen: vResumen, ingreso: vIngreso, paquetes: vPaquetes, distribucion: vDistrib, envios: vEnvios, supervision: vSuper, semana: vSemana, productos: vProductos, equipo: vEquipo };
  const groups = NAV[S.perfil.rol];
  const counts = { distribucion: S.suc.filter(s => tocaHoy(s.id) && !envioHoy(s.id)).length, supervision: S.visitas.some(v => v.fecha === hoy()) ? 0 : 1 };
  const label = groups.flatMap(g => g[1]).find(x => x[0] === S.view)?.[1] || ''; const grp = groups.find(g => g[1].some(x => x[0] === S.view))?.[0] || '';
  const vacio = !S.suc.length;
  return `<div class="shell">
  <aside class="side"><span class="brand">${LOGO}</span>
   <nav aria-label="Secciones">${groups.map(([g, items]) => `<span class="grp">${g}</span>${items.map(([k, l]) => `<button data-act="view" data-v="${k}" aria-current="${S.view === k}">${ICON[k]}<span>${l}</span>${counts[k] ? `<span class="count">${counts[k]}</span>` : ''}</button>`).join('')}`).join('')}</nav>
   <div class="me-box"><span class="avatar">${h(initials(S.perfil.nombre) || 'U')}</span><span class="who2"><b>${h(S.perfil.nombre)}</b><span>${S.perfil.rol === 'duena' ? 'Dueña · ve todo' : 'Operaciones · ' + h(S.perfil.enfoque || '')}</span></span><button class="icon-btn" data-act="logout" title="Cambiar usuario" aria-label="Cambiar usuario">${ICON.salir}</button></div>
  </aside>
  <div class="content"><header class="bar"><span class="crumb">${grp} / <b>${label}</b></span><span class="right"><span>${fechaLarga()}</span><span class="proto">Demo</span></span></header>
  <main class="main">${vacio ? '<div class="note">Cargando datos…</div>' : views[S.view]()}</main></div></div>`;
}

/* =================== entrada =================== */
function vLogin() {
  const L = S.login;
  return `<div class="auth"><form class="auth-card" id="loginform" novalidate>
   <div class="auth-logo">${LOGO}</div>
   <div class="auth-head"><h1>Iniciar sesión</h1><p>Operación de sucursales y bodega</p></div>
   <div class="field"><label for="luser">Usuario</label><input id="luser" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" value="${h(L.user || '')}" placeholder="Ej. rebeca o tablet.merliot" ${L.busy ? 'disabled' : ''}></div>
   <div class="field"><label for="lpass">Contraseña</label><div class="pass-wrap"><input id="lpass" name="password" type="password" autocomplete="current-password" ${L.busy ? 'disabled' : ''}><button type="button" class="pass-eye" data-act="lshow" aria-label="Mostrar u ocultar contraseña">Ver</button></div></div>
   ${L.err ? `<div class="err" role="alert">${h(L.err)}</div>` : ''}
   <button type="submit" class="btn primary auth-btn" ${L.busy ? 'disabled' : ''}>${L.busy ? 'Entrando…' : 'Entrar'}</button>
   <p class="auth-note">Las tablets de sucursal entran con su propio usuario y se quedan con la sesión abierta. Si olvidó su contraseña, pídala a la dueña.</p>
  </form>
  <p class="hint">Demo con datos simulados · Usuarios y contraseñas en Supabase → Table Editor → demo_accesos</p></div>`;
}
const pinPad = (act, len, filled, label, busy) => `<span class="field"><label>${label}</label></span><div class="dots">${Array.from({ length: len }, (_, i) => `<i class="${i < filled ? 'on' : ''}"></i>`).join('')}</div>
 <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<button data-act="${act}" data-v="${d}" ${busy ? 'disabled' : ''}>${d}</button>`).join('')}<span></span><button data-act="${act}" data-v="0" ${busy ? 'disabled' : ''}>0</button><button data-act="${act}Del" style="font-size:14px">Borrar</button></div>${busy ? '<span class="muted">Verificando…</span>' : ''}`;
document.addEventListener('submit', ev => { if (ev.target.id === 'loginform') { ev.preventDefault(); login(); } });

/* =================== TABLET =================== */
async function cargarTablet() {
  S.t.prods = store.get('prods', []); S.t.personal = store.get('personal', []); S.t.envios = store.get('envios', []);
  render();
  try {
    const [prods, personal, envios, cierre] = await Promise.all([
      q(sb.from('productos').select('id,nombre,categoria_id,por_paquete,activo').eq('activo', true).order('id')),
      q(sb.rpc('personal_de_mi_sucursal')),
      q(sb.from('envios').select('id,codigo,fecha,estado,salio_en,salio_por,entregado_en,entregado_por, paquetes(codigo,producto_id,unidades)').order('id')),
      q(sb.from('cierres').select('firmado_por,cerrado_en').eq('fecha', hoy()).maybeSingle()),
    ]);
    const cats = await q(sb.from('categorias').select('*').order('orden'));
    S.cats = cats; store.set('cats', cats);
    S.t.prods = prods; S.t.personal = personal.map(p => p.nombre); S.t.cerrado = cierre;
    const pendientes = new Set(S.t.queue.filter(x => x.tipo === 'rec').map(x => x.args.p_envio));
    S.t.envios = envios.filter(e => !pendientes.has(e.id));
    store.set('prods', prods); store.set('personal', S.t.personal); store.set('envios', S.t.envios);
    S.t.online = true;
  } catch (e) { if (!esRed(e)) toast('Error al cargar: ' + h(errMsg(e))); S.cats = store.get('cats', S.cats); }
  if (!S.cats.length) S.cats = store.get('cats', []);
  if (S.t.view !== 'scan') render(); else renderNet();
}
const tProd = id => S.t.prods.find(p => p.id === id) || S.P[id] || { nombre: 'Producto ' + id, categoria_id: 'var' };
function tHome() {
  const pend = S.t.envios.length; const c = S.t.cerrado || S.t.queue.find(x => x.tipo === 'cd' && x.args.p_fecha === hoy())?.local;
  return `<div><span class="eyebrow">${fechaLarga()}</span><h1>¿Qué va a hacer?</h1></div>
  <div class="big-actions">
   <button class="big" data-act="tview" data-v="recibir"><span class="ico">${ICON.scan}</span><b>Recibir envío</b><span class="muted" style="font-size:16px">Escanee cada paquete que llegó de oficina central.</span>${pend ? `<span class="badge">${pend} por recibir</span>` : ''}</button>
   <button class="big" data-act="tview" data-v="cierre" ${c ? 'disabled' : ''}><span class="ico">${ICON.cierre}</span><b>Cierre del día</b><span class="muted" style="font-size:16px">${c ? 'Ya cerró hoy: ' + h(c.firmado_por) + ' a las ' + fHora(c.cerrado_en) : 'Anote lo vendido según la cinta y cuente lo que queda.'}</span>${c ? '<span class="badge" style="background:var(--olive)">Hecho</span>' : ''}</button>
  </div>
  ${S.t.queue.length ? `<div class="panel stack"><h3>Pendientes de enviar a oficina (${S.t.queue.length})</h3><div class="queue-list">${S.t.queue.map(x => `<div>${x.tipo === 'rec' ? 'Recepción ' + h(x.codigo) : 'Cierre del día'} · ${h(x.args.p_firma)} · ${fCuando(x.args.p_en)}${x.error ? ` <span class="bad">· ${h(x.error)}</span>` : ''}</div>`).join('')}</div><div><button class="btn" data-act="sync">Reintentar ahora</button></div></div>` : ''}`;
}
function tRecibir() {
  return `<button class="back" data-act="tview" data-v="home">← Inicio</button><div class="row" style="justify-content:space-between"><h1>Envíos por recibir</h1><button class="btn" data-act="tReload">Actualizar</button></div>
  ${S.t.envios.map(e => `<button class="env-card" data-act="startScan" data-v="${e.id}"><span class="ico" style="width:52px;height:52px;display:grid;place-items:center">${ICON.box}</span><span style="display:flex;flex-direction:column"><b>${e.codigo}</b><span class="muted">${e.entregado_en ? `Lo dejó ${h(e.entregado_por)} a las ${fHora(e.entregado_en)}` : `En camino · salió ${fHora(e.salio_en)}`} · ${e.paquetes.length} paquetes</span></span><span class="tbtn primary" style="margin-left:auto;display:inline-flex;align-items:center">Escanear</span></button>`).join('') || `<div class="note" style="font-size:17px">No hay envíos en camino para esta sucursal. Cuando oficina central despache uno, aparecerá aquí.</div>`}`;
}
function tScan() {
  const sc = S.t.scan; const e = S.t.envios.find(x => x.id === sc.envio); if (!e) { S.t.view = 'recibir'; return tRecibir(); }
  if (sc.confirm) { const miss = e.paquetes.length - sc.scanned.length;
    return `<button class="back" data-act="scanBack">← Seguir escaneando</button><h1>Confirmar recepción</h1>
    <div class="flash ${miss ? 'bad' : 'ok'}" style="font-size:20px">${miss ? `Faltan ${miss} paquete(s) por escanear. Se reportarán a oficina central como no recibidos.` : `Escaneó los ${e.paquetes.length} paquetes del envío.`}</div>
    ${sc.damaged.length ? `<div class="flash warn">${sc.damaged.length} paquete(s) marcados como dañados.</div>` : ''}
    <p class="muted" style="font-size:16px;margin:0">Al aprobar, su nombre queda registrado como quien recibió este envío.</p>
    <div class="row"><button class="tbtn primary" data-act="approveRec">Aprobar con mi PIN</button><button class="tbtn ghost" data-act="scanBack">Volver</button></div>`; }
  return `<button class="back" data-act="tview" data-v="recibir">← Envíos</button>
  <div class="row" style="justify-content:space-between"><h1>Recibiendo ${e.codigo}</h1><div style="text-align:right"><div class="counter num" id="scancount">${sc.scanned.length}<span class="muted" style="font-size:26px"> / ${e.paquetes.length}</span></div><span class="muted">paquetes escaneados</span></div></div>
  <div class="scan-grid">
   <div class="stack"><div class="cam" id="cam"><div class="frame"><div class="laser"></div></div><div class="cap" id="camcap">Iniciando cámara…</div></div>
    <div class="row"><input id="mancode" class="mono" placeholder="O escriba el código: GRT001234" style="flex:1;min-width:0;height:52px;font-size:16px" autocomplete="off"><button class="tbtn" data-act="manScan">OK</button></div></div>
   <div class="stack"><div id="scanmsg"></div><div class="scanned" id="scanlist"></div>
    <button class="tbtn primary" data-act="finishScan" id="finishbtn" ${sc.scanned.length ? '' : 'disabled'}>Terminar recepción</button></div>
  </div>`;
}
function renderScanParts() {
  const sc = S.t.scan; if (!sc) return; const e = S.t.envios.find(x => x.id === sc.envio); if (!e) return;
  const cnt = $('scancount'); if (cnt) cnt.innerHTML = `${sc.scanned.length}<span class="muted" style="font-size:26px"> / ${e.paquetes.length}</span>`;
  const msg = $('scanmsg'); if (msg) msg.innerHTML = sc.msg ? `<div class="flash ${sc.msg.k}">${sc.msg.t}</div>` : '';
  const list = $('scanlist'); if (list) list.innerHTML = sc.scanned.slice().reverse().map(c => { const pk = e.paquetes.find(x => x.codigo === c); const p = tProd(pk.producto_id); const d = sc.damaged.includes(c);
    return `<div class="${d ? 'dmg' : ''}">${thumb({ nombre: p.nombre, categoria_id: p.categoria_id })}<span><b>${h(p.nombre)}</b> · ${pk.unidades} u<br><span class="mono muted">${c}</span></span><button data-act="dmg" data-v="${c}">${d ? 'Quitar daño' : 'Marcar dañado'}</button></div>`; }).join('') || '<div class="note" style="font-size:16px;border:0">Aún no ha escaneado paquetes.</div>';
  const fb = $('finishbtn'); if (fb) fb.disabled = !sc.scanned.length;
}
let ultimoCodigo = { c: '', t: 0 };
function onScan(raw) {
  const code = String(raw || '').trim().toUpperCase(); const sc = S.t.scan; if (!sc || !code) return;
  if (code === ultimoCodigo.c && Date.now() - ultimoCodigo.t < 2500) return; ultimoCodigo = { c: code, t: Date.now() };
  const e = S.t.envios.find(x => x.id === sc.envio); const pk = e.paquetes.find(x => x.codigo === code);
  if (!/^GRT\d{6}$/.test(code)) sc.msg = { k: 'bad', t: `El código ${h(code)} no es una etiqueta de Green &amp; Red.` };
  else if (sc.scanned.includes(code)) sc.msg = { k: 'warn', t: 'Este paquete ya fue escaneado.' };
  else if (!pk) sc.msg = { k: 'bad', t: 'Este paquete no es de este envío. No lo reciba y avise a oficina central.' };
  else { sc.scanned.push(code); sc.msg = { k: 'ok', t: `✓ ${h(tProd(pk.producto_id).nombre)} · ${pk.unidades} unidades` }; if (navigator.vibrate) navigator.vibrate(60); }
  renderScanParts();
}
let CAM = null;
async function iniciarCam() {
  const box = $('cam'); if (!box || CAM) return; const cap = $('camcap');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false });
    const v = document.createElement('video'); v.playsInline = true; v.muted = true; v.setAttribute('playsinline', ''); v.srcObject = stream; box.prepend(v); await v.play();
    CAM = { stream, v, timer: null, reader: null }; if (cap) cap.textContent = 'Apunte la cámara a la etiqueta';
    if ('BarcodeDetector' in window) {
      const det = new window.BarcodeDetector({ formats: ['code_128', 'qr_code', 'ean_13', 'code_39'] });
      const tick = async () => { if (!CAM) return; try { const r = await det.detect(v); if (r[0]) onScan(r[0].rawValue); } catch { } CAM.timer = setTimeout(tick, 200); }; tick();
    } else {
      await cargarScript('https://unpkg.com/@zxing/library@0.21.3/umd/index.min.js');
      const reader = new window.ZXing.BrowserMultiFormatReader(); CAM.reader = reader;
      reader.decodeFromVideoElementContinuously(v, res => { if (res) onScan(res.getText()); });
    }
  } catch (e) {
    box.innerHTML = `<div class="camoff"><b>No se pudo abrir la cámara</b><span>${/Permission|NotAllowed/i.test(e.name + e.message) ? 'Permita el acceso a la cámara en el navegador y vuelva a intentar.' : h(errMsg(e))}</span><span>Puede escribir el código abajo.</span></div>`;
  }
}
function pararCam() { if (!CAM) return; clearTimeout(CAM.timer); try { CAM.reader?.reset(); } catch { } CAM.stream.getTracks().forEach(t => t.stop()); CAM = null; }
const cargarScript = src => new Promise((ok, mal) => { if (document.querySelector(`script[src="${src}"]`)) return ok(); const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = mal; document.head.appendChild(s); });

function tCierre() {
  const cd = S.t.cd; const prods = S.t.prods; const done = prods.filter(p => cd.quedan[p.id] !== undefined && cd.quedan[p.id] !== '').length;
  const list = prods.filter(p => p.categoria_id === cd.cat);
  if (cd.confirm) { const vend = sum(Object.values(cd.vend));
    return `<button class="back" data-act="cdBack">← Volver al conteo</button><h1>Cerrar el día</h1>
    <div class="kpis" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="kpi"><span class="muted">Productos contados</span><b>${done} / ${prods.length}</b></div><div class="kpi"><span class="muted">Unidades vendidas</span><b>${vend}</b></div><div class="kpi"><span class="muted">Total de la cinta</span><b>$${(+cd.cinta || 0).toFixed(2)}</b></div></div>
    <p class="muted" style="font-size:16px;margin:0">Una vez cerrado ya no se puede cambiar desde la tablet. Si hay un error, avise a oficina central.</p>
    <div class="row"><button class="tbtn primary" data-act="approveCd">Cerrar con mi PIN</button><button class="tbtn ghost" data-act="cdBack">Volver</button></div>`; }
  return `<button class="back" data-act="tview" data-v="home">← Inicio</button>
  <div class="row" style="justify-content:space-between;align-items:flex-end"><div><h1>Cierre del día</h1><p class="muted" style="margin:4px 0 0;font-size:16px">Anote lo vendido según la cinta y <b>cuente físicamente</b> cuánto queda de cada producto.</p></div>
  <div style="min-width:220px"><div class="row" style="justify-content:space-between"><span class="muted">Contados</span><b id="cdprog">${done} de ${prods.length}</b></div><div class="progress"><i id="cdbar" style="width:${prods.length ? done / prods.length * 100 : 0}%"></i></div></div></div>
  ${cintaBox(cd)}
  <div class="chips">${S.cats.map(c => { const ps = prods.filter(p => p.categoria_id === c.id); const d = ps.filter(p => cd.quedan[p.id] !== undefined && cd.quedan[p.id] !== '').length; return `<button class="chip" style="padding:10px 16px;font-size:15px" data-act="cdcat" data-v="${c.id}" aria-pressed="${cd.cat === c.id}">${h(c.nombre)} · ${d}/${ps.length}</button>`; }).join('')}</div>
  <div>${list.map(p => `<div class="cd-row ${cd.quedan[p.id] !== undefined && cd.quedan[p.id] !== '' ? 'done' : ''}" data-row="${p.id}"><div class="prod">${thumb(p)}<span><b>${h(p.nombre)}</b>${cd.auto?.[p.id] !== undefined ? `<br><span class="auto-tag">De la cinta: ${cd.auto[p.id]}</span>` : ''}</span></div><div><div class="lab">Vendidos (cinta)</div>${stepper('t.cd.vend.' + p.id, cd.vend[p.id], 't-step')}</div><div><div class="lab">Quedan (contados)</div>${stepper('t.cd.quedan.' + p.id, cd.quedan[p.id], 't-step')}</div></div>`).join('')}</div>
  <div class="sticky-foot"><div class="field"><label for="cinta">Total de la cinta ($)</label><input id="cinta" data-key="t.cd.cinta" inputmode="decimal" value="${h(cd.cinta)}" placeholder="0.00" style="height:52px;font-size:18px;width:160px"></div>
  <button class="tbtn primary" data-act="cdConfirm" style="margin-left:auto" id="cdgo" ${done === prods.length && prods.length ? '' : 'disabled'}>${done === prods.length ? 'Revisar y cerrar' : `Faltan ${prods.length - done} por contar`}</button></div>`;
}
/* ---------- foto de la cinta ---------- */
function cintaBox(cd) {
  const L = cd.lectura; const fotos = cd.fotosLocal || [];
  const sinProducto = (L?.items || []).filter(i => i.producto_id == null);
  const conProducto = (L?.items || []).filter(i => i.producto_id != null);
  const fechaMal = L?.fecha && L.fecha !== hoy();
  return `<div class="panel stack cinta-box">
   <div class="row" style="justify-content:space-between;align-items:flex-start"><div><h3>Cinta de la caja</h3><span class="muted small">Tome foto del <b>cierre de día</b> y del <b>reporte de ventas de items</b>. Si la cinta es larga, tome varias fotos. Es opcional: también puede anotar todo a mano.</span></div>
   <div class="row"><label class="tbtn primary" for="fcam" style="display:inline-flex;align-items:center">Tomar foto</label><label class="tbtn" for="fgal" style="display:inline-flex;align-items:center">Subir foto</label></div></div>
   <input type="file" id="fcam" accept="image/*" capture="environment" hidden><input type="file" id="fgal" accept="image/*" multiple hidden>
   ${fotos.length ? `<div class="thumbs">${fotos.map((f, i) => `<div class="th"><img src="${f.url}" alt="Foto ${i + 1} de la cinta">${cd.leyendo || cd.lectura ? '' : `<button data-act="fotoDel" data-v="${i}" aria-label="Quitar foto">×</button>`}</div>`).join('')}</div>` : ''}
   ${fotos.length && !cd.leyendo && !cd.lectura ? `<div><button class="tbtn primary" data-act="leerCinta">Leer cinta (${fotos.length} ${fotos.length === 1 ? 'foto' : 'fotos'})</button></div>` : ''}
   ${cd.leyendo ? '<div class="flash warn">Leyendo la cinta… tarda unos segundos.</div>' : ''}
   ${cd.cintaErr ? `<div class="err">${h(cd.cintaErr)}</div>` : ''}
   ${L ? `<div class="stack" style="gap:8px">
     ${!L.legible ? '<div class="err">No se pudo leer la cinta. Tome la foto más de cerca, con buena luz, o anote los datos a mano.</div>' : ''}
     ${fechaMal ? `<div class="err">Ojo: la cinta es del ${h(L.fecha.split('-').reverse().join('/'))}, no de hoy.</div>` : ''}
     <div class="row" style="gap:18px">${L.total != null ? `<span>Total de la cinta: <b>$${(+L.total).toFixed(2)}</b></span>` : ''}${(L.pagos || []).map(p => `<span class="muted small">${h(p.forma)}: ${p.monto != null ? '$' + (+p.monto).toFixed(2) : '?'}</span>`).join('')}</div>
     ${conProducto.length ? `<div class="flash ok">Se llenaron <b>${Object.keys(cd.auto || {}).length}</b> productos con lo vendido según la cinta. Revíselos abajo y corrija si algo no cuadra.</div>` : ''}
     ${sinProducto.length ? `<details><summary class="small">${sinProducto.length} artículos de la cinta no son de inventario (comida del menú, etc.)</summary><div class="small muted" style="margin-top:6px">${sinProducto.map(i => h(i.texto) + (i.cantidad != null ? ' (' + i.cantidad + ')' : '')).join(' · ')}</div></details>` : ''}
     ${(L.anulados || []).length ? `<span class="small muted">Anulados: ${L.anulados.map(a => h(a.producto) + (a.cantidad ? ' (' + a.cantidad + ')' : '')).join(', ')}</span>` : ''}
     ${L.observaciones ? `<span class="small muted">Nota de la lectura: ${h(L.observaciones)}</span>` : ''}
     <div><button class="btn" data-act="cintaOtra">Tomar otra foto y volver a leer</button></div></div>` : ''}
  </div>`;
}
async function comprimir(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = url; });
    const max = 2200; const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL('image/jpeg', 0.85);
    return { url: dataUrl, data: dataUrl.split(',')[1], media_type: 'image/jpeg' };
  } finally { URL.revokeObjectURL(url); }
}
async function leerCinta() {
  const cd = S.t.cd; cd.leyendo = true; cd.cintaErr = ''; render();
  try {
    const { data, error } = await sb.functions.invoke('leer-cinta', { body: { imagenes: cd.fotosLocal.map(f => ({ data: f.data, media_type: f.media_type })) } });
    if (error) throw error;
    cd.fotos = data.fotos || [];
    if (data.error) { cd.cintaErr = data.error; }
    else {
      const L = data.lectura; cd.lectura = L; cd.auto = {};
      if (L.total != null) cd.cinta = String(L.total);
      const ids = new Set(S.t.prods.map(p => p.id));
      for (const it of L.items || []) if (it.producto_id != null && ids.has(it.producto_id) && it.cantidad != null) cd.auto[it.producto_id] = (cd.auto[it.producto_id] || 0) + it.cantidad;
      for (const [pid, n] of Object.entries(cd.auto)) cd.vend[pid] = String(n);
    }
  } catch (e) {
    cd.cintaErr = esRed(e) ? 'Sin internet no se puede leer la cinta. Anote los datos a mano.' : 'No se pudo leer la cinta: ' + errMsg(e) + '. Anote los datos a mano.';
  }
  cd.leyendo = false; render();
}

function tablet() {
  const views = { home: tHome, recibir: tRecibir, scan: tScan, cierre: tCierre };
  return `<header class="top"><div class="top-in"><span class="brand">${LOGO}<span class="sep"></span><span class="app">Operación</span></span><span class="proto">Demo</span><div class="me"><span><b>${h(S.perfil?.nombre || 'Tablet')}</b><br><span class="muted small">Sucursal</span></span><button class="btn" data-act="logoutTablet">Salir</button></div></div></header>
  <div class="tab-stage"><div class="device"><div class="t-top"><span class="who">${h(sucNombre(S.perfil?.sucursal_id) || S.perfil?.nombre)}</span><span class="sub">Tablet de sucursal</span><span class="net ${S.t.online ? '' : 'off'}" id="net"></span></div>
  <div class="t-body">${views[S.t.view]()}</div></div>
  <p class="hint">Si se va el internet, la tablet sigue funcionando: guarda las recepciones y el cierre, y los envía sola cuando vuelve la señal. La sucursal nunca ve cuánto inventario debería tener.</p></div>`;
}
function renderNet() { const n = $('net'); if (!n) return; n.className = 'net' + (S.t.online ? '' : ' off'); n.innerHTML = `<i></i>${S.t.online ? (S.t.syncing ? 'Enviando…' : 'En línea') : 'Sin internet'}${S.t.queue.length ? ` · ${S.t.queue.length} en espera` : ''}`; }

/* ---------- cola sin internet ---------- */
function encolar(item) { S.t.queue.push(item); store.set('queue', S.t.queue); }
async function ejecutar(item) { return q(sb.rpc(item.rpc, item.args)); }
async function flushQueue() {
  if (S.mode !== 'tablet' || S.t.syncing || !S.t.queue.length) return;
  S.t.syncing = true; renderNet(); let enviados = 0;
  for (const item of [...S.t.queue]) {
    try { await ejecutar(item); S.t.queue = S.t.queue.filter(x => x !== item); enviados++; }
    catch (e) { if (esRed(e)) { S.t.online = false; break; } item.error = errMsg(e); }
  }
  store.set('queue', S.t.queue); S.t.syncing = false;
  if (enviados) { toast(`Se enviaron ${enviados} registro(s) a oficina central`); cargarTablet(); } else if (S.t.view === 'home') render(); else renderNet();
}

/* ---------- PIN de firma en la tablet ---------- */
function pedirFirma(titulo, accion) { S.modal = { tipo: 'firma', titulo, user: S.t.personal[0], pin: '', err: '', busy: false, accion }; renderModal(); }
function confirmar(titulo, texto, okLabel, accion, peligro) { S.modal = { tipo: 'confirm', titulo, texto, okLabel, accion, peligro, err: '', busy: false }; renderModal(); }
async function verCierre(id) {
  const c = S.cierres.find(x => x.id === +id); if (!c) return;
  const L = c.cinta_lectura || null; const fotos = L?.fotos || (c.foto_cinta ? [c.foto_cinta] : []);
  const body = () => `<p class="muted" style="margin:0">${h(sucNombre(c.sucursal_id))} · ${fFecha(c.fecha)} · firmó ${h(c.firmado_por)} a las ${fHora(c.cerrado_en)}</p>
   <div class="row" style="gap:18px"><span>Total registrado: <b>$${(+c.cinta_total || 0).toFixed(2)}</b></span>${L?.total != null && Math.abs(+L.total - +c.cinta_total) > 0.009 ? `<span class="neg">La cinta leída dice $${(+L.total).toFixed(2)}</span>` : ''}</div>
   ${L?.pagos?.length ? `<table><tbody>${L.pagos.map(p => `<tr><td>${h(p.forma)}${p.transacciones != null ? ` <span class="muted small">(${p.transacciones})</span>` : ''}</td><td class="r">${p.monto != null ? money(+p.monto) : '?'}</td></tr>`).join('')}</tbody></table>` : ''}
   ${L?.anulados?.length ? `<div class="small"><b>Anulados:</b> ${L.anulados.map(a => `${h(a.producto)} (${a.cantidad ?? '?'}) ${a.monto != null ? money(+a.monto) : ''}`).join(' · ')}</div>` : ''}
   ${L?.items?.length ? `<div class="small muted">${L.items.filter(i => i.producto_id != null).length} productos de inventario y ${L.items.filter(i => i.producto_id == null).length} artículos del menú leídos de la cinta.</div>` : ''}
   ${fotos.length ? `<div class="thumbs big" id="cfotos">${fotos.map(() => '<div class="th"><span class="muted small">Cargando foto…</span></div>').join('')}</div>` : '<div class="note">Este cierre se registró sin foto de la cinta.</div>'}`;
  S.modal = { tipo: 'info', titulo: 'Cierre del día', html: body() }; renderModal();
  if (fotos.length) {
    const urls = await Promise.all(fotos.map(p => sb.storage.from('cintas').createSignedUrl(p, 600).then(r => r.data?.signedUrl).catch(() => null)));
    const box = $('cfotos'); if (box) box.innerHTML = urls.map((u, i) => u ? `<a class="th" href="${u}" target="_blank" rel="noopener"><img src="${u}" alt="Foto ${i + 1} de la cinta"></a>` : '<div class="th"><span class="muted small">No se pudo cargar</span></div>').join('');
  }
}
function renderModal() {
  const m = S.modal; const el = $('modal'); if (!m) { el.innerHTML = ''; return; }
  if (m.tipo === 'info') { el.innerHTML = `<div class="overlay" data-act="mCancelBg"><div class="modal wide" role="dialog" aria-modal="true" aria-label="${h(m.titulo)}"><div class="row" style="justify-content:space-between"><h2>${h(m.titulo)}</h2><button class="btn" data-act="mCancel">Cerrar</button></div>${m.html}</div></div>`; return; }
  if (m.tipo === 'confirm') { el.innerHTML = `<div class="overlay" data-act="mCancelBg"><div class="modal" role="dialog" aria-modal="true" aria-label="${h(m.titulo)}"><h2>${h(m.titulo)}</h2><p class="muted" style="margin:0">${m.texto}</p>${m.err ? `<div class="err">${h(m.err)}</div>` : ''}<div class="row" style="justify-content:flex-end"><button class="btn" data-act="mCancel">Cancelar</button><button class="btn ${m.peligro ? 'danger' : 'primary'}" data-act="mOk" ${m.busy ? 'disabled' : ''}>${m.busy ? 'Guardando…' : h(m.okLabel)}</button></div></div></div>`; return; }
  el.innerHTML = `<div class="overlay" data-act="mCancelBg"><div class="modal" role="dialog" aria-modal="true" aria-label="${h(m.titulo)}"><h2>${h(m.titulo)}</h2>
   <div class="field"><label>¿Quién es?</label><div class="users">${S.t.personal.map(u => `<button data-act="fUser" data-v="${h(u)}" aria-pressed="${m.user === u}">${h(u)}</button>`).join('') || '<span class="muted">No hay personal cargado. Conéctese a internet una vez.</span>'}</div></div>
   ${pinPad('fpin', 4, m.pin.length, 'PIN de 4 dígitos', m.busy)}${m.err ? `<div class="err">${h(m.err)}</div>` : ''}
   <button class="btn" data-act="mCancel">Cancelar</button></div></div>`;
}
async function correrModal() {
  const m = S.modal; m.busy = true; m.err = ''; renderModal();
  try { const r = await m.accion(m); S.modal = null; renderModal(); if (r !== false) render(); }
  catch (e) { m.busy = false; m.pin = ''; m.err = errMsg(e); renderModal(); }
}

/* =================== impresión de etiquetas =================== */
function imprimir(paquetes) {
  if (!paquetes.length) return;
  const w = window.open('', '_blank'); if (!w) { toast('Permita las ventanas emergentes para imprimir etiquetas.'); return; }
  const lbl = pk => { const p = S.P[pk.producto_id]; return `<div class="l"><div class="t"><span>GREEN &amp; RED TOMATOES</span><span>${pk.indice} de ${pk.de_total}</span></div><div class="n">${h(p?.nombre)}</div><div class="u">${pk.unidades} unidades · ${fFecha(isoLocal(new Date(pk.creado_en || Date.now())))}</div><svg data-code="${pk.codigo}"></svg><div class="c">${pk.codigo}</div></div>`; };
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Etiquetas</title><style>@page{size:2.25in 1.25in;margin:0}body{margin:0;font-family:Arial,sans-serif}.l{width:2.25in;height:1.25in;box-sizing:border-box;padding:.06in .1in;page-break-after:always;display:flex;flex-direction:column;overflow:hidden}.t{display:flex;justify-content:space-between;font-size:7pt;font-weight:bold}.n{font-size:11pt;font-weight:bold;line-height:1.1}.u{font-size:7pt}svg{width:100%;height:.45in}.c{font:8pt monospace;text-align:center}</style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js"><\/script></head><body>${paquetes.map(lbl).join('')}
  <script>window.onload=function(){document.querySelectorAll('svg[data-code]').forEach(function(s){JsBarcode(s,s.dataset.code,{format:'CODE128',displayValue:false,margin:0,height:40,width:1.6})});setTimeout(function(){window.print()},300)}<\/script></body></html>`);
  w.document.close();
}

/* =================== render =================== */
function render() {
  if (S.mode !== 'tablet' || S.t.view !== 'scan') pararCam();
  const app = $('app');
  if (S.mode === 'boot') app.innerHTML = '<div class="boot">Cargando…</div>';
  else if (S.mode === 'login') { app.innerHTML = vLogin(); if (!S.login.busy) ($('luser').value ? $('lpass') : $('luser')).focus(); }
  else if (S.mode === 'office') app.innerHTML = office();
  else app.innerHTML = tablet();
  if (window.JsBarcode) document.querySelectorAll('#app svg[data-code]').forEach(s => { try { JsBarcode(s, s.dataset.code, { format: 'CODE128', displayValue: false, margin: 0, height: 60, width: 2, background: '#ffffff', lineColor: '#111111' }); } catch { } });
  renderModal();
  if (S.mode === 'tablet') { renderNet(); if (S.t.view === 'scan' && S.t.scan && !S.t.scan.confirm) { renderScanParts(); iniciarCam(); } }
}

/* =================== acciones =================== */
async function rpc(nombre, args) { return q(sb.rpc(nombre, args)); }
document.addEventListener('click', async ev => {
  const b = ev.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act, v = b.dataset.v;
  if (a === 'mCancelBg' && ev.target !== b) return;
  try {
    switch (a) {
      /* entrada */
      case 'lshow': { const i = $('lpass'); i.type = i.type === 'password' ? 'text' : 'password'; b.textContent = i.type === 'password' ? 'Ver' : 'Ocultar'; return; }
      case 'logout': await salir(); return;
      case 'logoutTablet': confirmar('Cerrar sesión de la tablet', 'Para volver a entrar necesitará el usuario y la contraseña de la tablet. Los registros pendientes de enviar se conservan.', 'Cerrar sesión', async () => { await salir(); return false; }); return;
      /* oficina: navegación */
      case 'view': S.view = v; S.modal = null; window.scrollTo(0, 0); if (v === 'semana') { S.sem.rows = null; } break;
      case 'inc': case 'dec': { const k = b.dataset.key; let x = +(getKey(k) || 0) + (a === 'inc' ? 1 : -1); if (x < 0) x = 0; setKey(k, String(x)); b.parentNode.querySelector('input').value = x; despues(k); return; }
      case 'ingcat': S.ing.cat = v; break;
      case 'closeIng': {
        const items = Object.entries(S.ing.qty).filter(([, n]) => +n > 0).map(([pid, n]) => ({ producto_id: +pid, unidades: +n }));
        const prov = S.provs.find(p => p.id === +S.ing.prov);
        confirmar('Cerrar ingreso', `${items.length} productos, ${sum(items.map(i => i.unidades))} unidades de <b>${h(prov?.nombre)}</b>. Queda registrado a nombre de ${h(S.perfil.nombre)}.`, 'Cerrar ingreso', async () => {
          await rpc('cerrar_ingreso', { p_proveedor: +S.ing.prov, p_items: items }); S.ing.qty = {}; toast('Ingreso cerrado. Bodega actualizada.'); await cargarOficina(); });
        return;
      }
      case 'genPk': {
        const p = S.P[S.pk.pid]; const n = +S.pk.n;
        confirmar('Armar paquetes', `${n} paquetes de <b>${h(p.nombre)}</b> (${n * p.por_paquete} unidades). Después podrá imprimir las etiquetas.`, 'Armar', async () => {
          S.pk.last = await rpc('armar_paquetes', { p_producto: p.id, p_cantidad: n }); toast(`${n} paquetes armados. Ya puede imprimir las etiquetas.`); await cargarOficina(); });
        return;
      }
      case 'printLast': imprimir(S.pk.last); return;
      case 'printPid': imprimir(S.paqBodega.filter(x => x.producto_id === +v)); return;
      case 'envsuc': S.env.suc = v; break;
      case 'envAdd': { const pk = S.paqBodega.find(x => x.producto_id === +v && !S.env.codes.includes(x.codigo)); if (pk) S.env.codes.push(pk.codigo); break; }
      case 'envDel': { const i = S.env.codes.map(c => S.paqBodega.find(x => x.codigo === c)?.producto_id).lastIndexOf(+v); if (i >= 0) S.env.codes.splice(i, 1); break; }
      case 'envScan': { const c = (S.env.scan || '').trim().toUpperCase(); S.env.scan = ''; const pk = S.paqBodega.find(x => x.codigo === c);
        if (!pk) toast('Ese código no está en bodega (no existe o ya salió).'); else if (S.env.codes.includes(c)) toast('Ese paquete ya está en este envío.'); else S.env.codes.push(c); break; }
      case 'despachar': confirmar('Despachar envío extra', `${S.env.codes.length} paquetes a <b>${h(sucNombre(S.env.suc))}</b>. Sale de bodega a nombre de ${h(S.perfil.nombre)}.`, 'Despachar', async () => {
        const cod = await rpc('despachar', { p_sucursal: S.env.suc, p_codigos: S.env.codes, p_origen: 'extra' }); S.env.codes = []; toast(`${cod} en camino. Ya aparece en la tablet de la sucursal.`); await cargarOficina(); }); return;
      case 'dDesp': confirmar('Despachar a ' + sucNombre(v), `Sale de bodega el pedido base: ${pedidoTxt(v)}.`, 'Despachar', async () => {
        const cod = await rpc('despachar_plan', { p_sucursal: v }); toast(`${cod} salió hacia ${h(sucNombre(v))}`); await cargarOficina(); }); return;
      case 'dEntr': { const e = S.envios.find(x => x.id === +v); confirmar('Marcar entregado', `${e.codigo} quedó en ${h(sucNombre(e.sucursal_id))}. Después la sucursal debe escanear los paquetes.`, 'Entregado', async () => {
        await rpc('marcar_entregado', { p_envio: +v }); toast('Entrega registrada.'); await cargarOficina(); }); return; }
      case 'pday': { const s = b.dataset.s, d = +v; const on = S.plan[s].days.includes(d);
        if (on) await q(sb.from('plan_dias').delete().eq('sucursal_id', s).eq('dia', d)); else await q(sb.from('plan_dias').insert({ sucursal_id: s, dia: d }));
        S.plan[s].days = on ? S.plan[s].days.filter(x => x !== d) : [...S.plan[s].days, d].sort(); break; }
      case 'planEdit': S.planEdit = v; break;
      case 'planDone': { const s = S.planEdit; const it = S.plan[s].items; const keep = Object.entries(it).filter(([, n]) => +n > 0);
        await q(sb.from('plan_items').delete().eq('sucursal_id', s));
        if (keep.length) await q(sb.from('plan_items').insert(keep.map(([pid, n]) => ({ sucursal_id: s, producto_id: +pid, paquetes: +n }))));
        S.plan[s].items = Object.fromEntries(keep.map(([pid, n]) => [pid, +n])); S.planEdit = null; toast('Pedido base guardado'); break; }
      case 'wsuc': S.sem.suc = v; S.sem.rows = null; break;
      case 'wmode': S.sem.modo = v; break;
      case 'semPrev': S.sem.lunes = addDays(S.sem.lunes, -7); S.sem.rows = null; break;
      case 'semNext': S.sem.lunes = addDays(S.sem.lunes, 7); S.sem.rows = null; break;
      case 'vStart': { const pool = activos().filter(p => !isOwner() || S.costos[p.id] != null); const pick = [];
        while (pick.length < 3 && pick.length < pool.length) { const p = pool[Math.floor(Math.random() * pool.length)].id; if (!pick.includes(p)) pick.push(p); }
        S.visit = { suc: v, res: {}, notes: {}, conteo: pick, counts: {} }; break; }
      case 'vCancel': S.visit = null; break;
      case 'ck': S.visit.res[b.dataset.i] = v; break;
      case 'vFinish': { const V = S.visit; confirmar('Terminar visita', `Visita a <b>${h(sucNombre(V.suc))}</b> a nombre de ${h(S.perfil.nombre)}.`, 'Guardar visita', async () => {
        await rpc('registrar_visita', { p_sucursal: V.suc, p_respuestas: S.checklist.map(c => ({ item: c.texto, ok: V.res[c.id] === 'ok', nota: V.notes[c.id] || '' })), p_conteos: V.conteo.map(pid => ({ producto_id: +pid, contado: +V.counts[pid] || 0 })) });
        S.visit = null; toast('Visita guardada.'); await cargarOficina(); }); return; }
      case 'ckDel': await q(sb.from('checklist_items').update({ activo: false }).eq('id', +v)); S.checklist = S.checklist.filter(c => c.id !== +v); break;
      case 'ckAdd': { const t = (S.newItem || '').trim(); if (!t) return; const row = await q(sb.from('checklist_items').insert({ texto: t, orden: S.checklist.length + 1 }).select().single()); S.checklist.push(row); S.newItem = ''; break; }
      case 'pf': S.pf = v; break;
      case 'pact': { const p = S.P[v]; await q(sb.from('productos').update({ activo: !p.activo }).eq('id', p.id)); p.activo = !p.activo; toast(p.activo ? h(p.nombre) + ' activo de nuevo' : h(p.nombre) + ' desactivado: ya no aparece en tablets ni en ingresos'); break; }
      case 'padd': { const N = S.np; const name = (N.name || '').trim(); if (!name) { toast('Escriba el nombre del producto.'); return; }
        const cost = parseFloat(N.cost); await rpc('crear_producto', { p_nombre: name, p_categoria: N.cat, p_por_paquete: parseInt(N.pack) || S.cats.find(c => c.id === N.cat)?.paquete_default || 10, p_costo: isNaN(cost) ? null : cost });
        S.np = { name: '', cat: N.cat, cost: '', pack: '' }; S.pf = N.cat; toast(h(name) + ' agregado al catálogo'); await cargarOficina(); return; }
      case 'resetDemo': confirmar('Reiniciar la demo', 'Se borra toda la operación (envíos, cierres, visitas, ingresos) y se vuelve a simular 4 semanas. Los productos, costos y usuarios se conservan.', 'Reiniciar', async () => {
        const r = await rpc('reiniciar_demo', {}); toast(h(r)); await cargarOficina(); }, true); return;
      /* modales */
      case 'mOk': await correrModal(); return;
      case 'mCancel': case 'mCancelBg': S.modal = null; renderModal(); return;
      case 'fUser': S.modal.user = v; S.modal.err = ''; renderModal(); return;
      case 'fpin': { const m = S.modal; if (m.busy) return; m.pin += v; if (m.pin.length >= 4) { await correrModal(); return; } renderModal(); return; }
      case 'fpinDel': S.modal.pin = S.modal.pin.slice(0, -1); renderModal(); return;
      /* tablet */
      case 'tview': S.t.view = v; if (v === 'cierre' && !S.t.cd) S.t.cd = { vend: {}, quedan: {}, cinta: '', cat: S.cats[0]?.id || 'beb', client: uuid() }; if (v === 'recibir') cargarTablet(); break;
      case 'tReload': await cargarTablet(); return;
      case 'sync': S.t.queue.forEach(x => delete x.error); await flushQueue(); return;
      case 'startScan': S.t.scan = { envio: +v, scanned: [], damaged: [], msg: null }; S.t.view = 'scan'; break;
      case 'manScan': onScan($('mancode')?.value); if ($('mancode')) $('mancode').value = ''; return;
      case 'dmg': { const sc = S.t.scan; const i = sc.damaged.indexOf(v); i >= 0 ? sc.damaged.splice(i, 1) : sc.damaged.push(v); renderScanParts(); return; }
      case 'finishScan': S.t.scan.confirm = true; break;
      case 'scanBack': S.t.scan.confirm = false; break;
      case 'approveRec': { const sc = S.t.scan; const e = S.t.envios.find(x => x.id === sc.envio);
        pedirFirma('Aprobar recepción de ' + e.codigo, async m => {
          const item = { tipo: 'rec', rpc: 'recibir_envio', codigo: e.codigo, args: { p_envio: e.id, p_escaneados: sc.scanned, p_danados: sc.damaged, p_firma: m.user, p_pin: m.pin, p_en: new Date().toISOString() } };
          try { await ejecutar(item); toast('Recepción aprobada. Oficina central ya la ve.'); }
          catch (err) { if (!esRed(err)) throw err; encolar(item); S.t.online = false; toast('Sin internet: la recepción quedó guardada en la tablet y se enviará sola.'); }
          S.t.envios = S.t.envios.filter(x => x.id !== e.id); store.set('envios', S.t.envios); S.t.scan = null; S.t.view = 'home';
        }); return; }
      case 'cdcat': S.t.cd.cat = v; break;
      case 'fotoDel': S.t.cd.fotosLocal.splice(+v, 1); break;
      case 'leerCinta': await leerCinta(); return;
      case 'cintaOtra': { const cd = S.t.cd; for (const pid of Object.keys(cd.auto || {})) delete cd.vend[pid]; cd.lectura = null; cd.auto = {}; cd.fotos = []; cd.cintaErr = ''; break; }
      case 'verCierre': await verCierre(v); return;
      case 'cdConfirm': S.t.cd.confirm = true; break;
      case 'cdBack': S.t.cd.confirm = false; break;
      case 'approveCd': { const cd = S.t.cd;
        pedirFirma('Cerrar el día', async m => {
          const item = { tipo: 'cd', rpc: 'cerrar_dia', args: { p_client: cd.client, p_fecha: hoy(), p_firma: m.user, p_pin: m.pin, p_cinta: +cd.cinta || 0, p_en: new Date().toISOString(),
            p_items: S.t.prods.map(p => ({ producto_id: p.id, vendidos: +cd.vend[p.id] || 0, quedan: +cd.quedan[p.id] || 0 })) }, local: { firmado_por: m.user, cerrado_en: new Date().toISOString() } };
          if (cd.fotos?.length) { item.args.p_foto = cd.fotos[0]; item.args.p_lectura = { ...(cd.lectura || {}), fotos: cd.fotos }; }
          try { await ejecutar(item); S.t.cerrado = item.local; toast('Día cerrado. Oficina central ya lo ve.'); }
          catch (err) { if (!esRed(err)) throw err; encolar(item); S.t.online = false; toast('Sin internet: el cierre quedó guardado en la tablet y se enviará solo.'); }
          S.t.cd = null; S.t.view = 'home';
        }); return; }
    }
    render();
  } catch (e) { console.error(e); toast('No se pudo completar: ' + h(errMsg(e))); }
});
function despues(k) {
  if (k.startsWith('t.cd.quedan')) { const prods = S.t.prods; const done = prods.filter(p => S.t.cd.quedan[p.id] !== undefined && S.t.cd.quedan[p.id] !== '').length;
    const pr = $('cdprog'); if (pr) pr.textContent = `${done} de ${prods.length}`; const bar = $('cdbar'); if (bar) bar.style.width = done / prods.length * 100 + '%';
    document.querySelector(`[data-row="${k.split('.')[3]}"]`)?.classList.toggle('done', getKey(k) !== '');
    const go = $('cdgo'); if (go) { go.disabled = done < prods.length; go.textContent = done < prods.length ? `Faltan ${prods.length - done} por contar` : 'Revisar y cerrar'; }
    document.querySelectorAll('[data-act="cdcat"]').forEach(c => { const ps = prods.filter(p => p.categoria_id === c.dataset.v); c.textContent = `${S.cats.find(x => x.id === c.dataset.v)?.nombre} · ${ps.filter(p => S.t.cd.quedan[p.id] !== undefined && S.t.cd.quedan[p.id] !== '').length}/${ps.length}`; }); }
  if (k.startsWith('ing.qty')) { const tot = sum(Object.values(S.ing.qty)), cnt = Object.values(S.ing.qty).filter(v => +v > 0).length; $('ingtot').textContent = `${cnt} productos · ${tot} unidades`; $('ingbtn').disabled = !tot; }
  if (k === 'pk.n' || k.startsWith('visit.counts') || k.startsWith('plan.')) render();
}
document.addEventListener('input', ev => { const k = ev.target.dataset.key; if (!k || k === 'planAdd') return; let v = ev.target.value; if (ev.target.inputMode === 'numeric') { v = v.replace(/\D/g, ''); ev.target.value = v; } setKey(k, v); if (k !== 'pk.n' && !k.startsWith('visit.counts') && !k.startsWith('plan.')) despues(k); });
document.addEventListener('change', async ev => {
  if (ev.target.id === 'fcam' || ev.target.id === 'fgal') {
    const files = [...(ev.target.files || [])]; ev.target.value = ''; if (!files.length) return;
    const cd = S.t.cd; cd.fotosLocal ||= [];
    for (const f of files.slice(0, 6 - cd.fotosLocal.length)) { try { cd.fotosLocal.push(await comprimir(f)); } catch { toast('No se pudo abrir una de las fotos.'); } }
    render(); return;
  }
  const pr = ev.target.dataset.prod;
  if (pr) { const p = S.P[pr];
    try {
      if (ev.target.dataset.field === 'cost') { const val = parseFloat(ev.target.value); const nv = isNaN(val) ? null : Math.round(val * 100) / 100;
        if (nv !== S.costos[p.id]) { const antes = S.costos[p.id]; await rpc('cambiar_costo', { p_producto: p.id, p_costo: nv }); S.costos[p.id] = nv; S.costLog[p.id] = { cambiado_por: S.perfil.nombre, cambiado_en: new Date().toISOString(), costo_anterior: antes ?? null }; toast('Costo de ' + h(p.nombre) + ' actualizado'); } }
      else { const n = parseInt(ev.target.value); if (n > 0 && n !== p.por_paquete) { await q(sb.from('productos').update({ por_paquete: n }).eq('id', p.id)); p.por_paquete = n; toast('Tamaño de paquete actualizado'); } }
    } catch (e) { toast('No se pudo guardar: ' + h(errMsg(e))); }
    render(); return; }
  const k = ev.target.dataset.key; if (!k) return;
  if (k === 'pk.pid') { S.pk.pid = +ev.target.value; S.pk.last = []; render(); }
  if (k === 'pk.n') { if (!(+S.pk.n > 0)) S.pk.n = '1'; render(); }
  if (k === 'np.cat') render();
  if (k === 'planAdd' && ev.target.value) { S.plan[S.planEdit].items[ev.target.value] = 1; render(); }
  if (k.startsWith('visit.counts') || k.startsWith('plan.')) render();
});
document.addEventListener('keydown', ev => {
  if (ev.key !== 'Enter') return; const id = ev.target.id;
  if (id === 'envscan') { ev.preventDefault(); document.querySelector('[data-act="envScan"]')?.click(); }
  if (id === 'mancode') document.querySelector('[data-act="manScan"]')?.click();
  if (id === 'newitem') document.querySelector('[data-act="ckAdd"]')?.click();
});
setInterval(() => { if (S.mode === 'tablet' && navigator.onLine && S.t.queue.length) flushQueue(); }, 30000);

boot().catch(e => { console.error(e); $('app').innerHTML = `<div class="boot">No se pudo iniciar: ${h(errMsg(e))}</div>`; });

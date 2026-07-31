# Dominios en Vercel — johel (no joel) + subdominio del Panel

Guía paso a paso para:

1. Hacer **canónico** `joheltraining.tito-apps.com` (con **h**, "johel").
2. **Redirigir** el viejo `joeltraining.tito-apps.com` (con typo "joel") → al canónico.
3. Publicar el **Panel de Plataforma** en `trainingapp.tito-apps.com/platform`
   (subdominio neutral, Joel es un usuario más — la URL no lleva su nombre).

> El slug del tenant en la base ya es **`joheltraining`** (con h) en todo el código.
> No hay que renombrar nada en la base. Esto es solo dominios/DNS en Vercel.

---

## Antes de empezar

- Tené a mano dónde administrás el **DNS de `tito-apps.com`** (Vercel DNS, o tu
  registrador: Namecheap, GoDaddy, Cloudflare, etc.).
- El proyecto de la app ya está desplegado en Vercel (el que hoy sirve
  `joeltraining.tito-apps.com`).
- Todos los subdominios apuntan al **mismo** proyecto/deployment; la app decide
  qué mostrar por hostname + ruta.

---

## Parte 1 — Agregar el dominio canónico `joheltraining.tito-apps.com`

1. Entrá a **vercel.com** → tu proyecto (el de la app de entrenamiento).
2. **Settings → Domains**.
3. En "Add Domain" escribí: `joheltraining.tito-apps.com` → **Add**.
4. Vercel te va a pedir un registro DNS. Como es un subdominio, será un **CNAME**:
   - **Type:** CNAME
   - **Name/Host:** `joheltraining`
   - **Value/Target:** `cname.vercel-dns.com` (Vercel te muestra el valor exacto)
5. Creá ese CNAME donde administrás el DNS de `tito-apps.com` y esperá a que
   Vercel lo marque como **Valid/Verified** (suele tardar de minutos a una hora).

> Si el DNS de `tito-apps.com` ya está **en Vercel**, en muchos casos agrega el
> registro solo; solo confirmá que quede "Valid".

Al terminar, `https://joheltraining.tito-apps.com` debe abrir la app de Johel
(el subdominio `joheltraining` coincide con el slug → resuelve directo).

---

## Parte 2 — Redirigir el viejo `joeltraining` (joel) → `joheltraining` (johel)

La forma más limpia en Vercel es un **redirect a nivel de dominio** (301), sin
tocar código:

1. En **Settings → Domains**, asegurate de que `joeltraining.tito-apps.com`
   siga listado (es el que hoy usás). Si no está, agregalo igual que en la Parte 1
   (CNAME `joeltraining` → `cname.vercel-dns.com`).
2. Al lado de `joeltraining.tito-apps.com`, abrí **Edit** (o el menú "…").
3. Elegí la opción **"Redirect to…"** y seleccioná **`joheltraining.tito-apps.com`**.
4. Tipo de redirect: **Permanent (308/301)**.
5. Guardá.

Desde ese momento, cualquiera que entre a `joeltraining.tito-apps.com` (o a un
link viejo) es reenviado automáticamente a `joheltraining.tito-apps.com`,
conservando la ruta.

> Red de seguridad en código: aunque un request evada el redirect, el alias de
> subdominio `joeltraining → joheltraining` (en `src/tenant/resolveTenant.js`)
> hace que igual resuelva al tenant correcto. No hay que quitarlo.

### Alternativa por `vercel.json` (si preferís no usar el redirect del panel)

Si en vez del redirect visual querés hacerlo por configuración, se puede usar un
redirect condicionado por host en `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "joeltraining.tito-apps.com" }],
      "destination": "https://joheltraining.tito-apps.com/:path*",
      "permanent": true
    }
  ]
}
```

Usá **una** de las dos vías (el redirect del dashboard **o** el `vercel.json`), no
ambas, para no duplicar reglas.

---

## Parte 3 — Subdominio del Panel de Plataforma `trainingapp.tito-apps.com`

El panel vive en la ruta `/platform` y funciona en cualquier host, pero conviene
darle un subdominio neutral (Joel es un usuario más; la URL no lleva su nombre).

1. **Settings → Domains → Add Domain**: `trainingapp.tito-apps.com` → **Add**.
2. Creá el CNAME:
   - **Type:** CNAME · **Name:** `trainingapp` · **Value:** `cname.vercel-dns.com`
3. Esperá a "Valid".
4. Listo: el panel queda en **`https://trainingapp.tito-apps.com/platform`**.

El código ya trata `trainingapp` (y `app`/`admin`/`platform`) como subdominios
**reservados**: su raíz no intenta abrir ningún tenant, y `/platform` siempre
renderiza el Panel de Plataforma (validado contra `platform_admins`).

> Opcional: si querés que entrar a `trainingapp.tito-apps.com` (sin `/platform`)
> lleve directo al panel, se puede agregar un rewrite/redirect de `/` a `/platform`
> para ese host. Decímelo y lo dejo configurado.

---

## Parte 4 — Verificación

- `https://joheltraining.tito-apps.com` → app de Johel. ✅
- `https://joeltraining.tito-apps.com` → redirige (barra de URL cambia a johel). ✅
- `https://trainingapp.tito-apps.com/platform` → login del Panel de Plataforma;
  entra solo un usuario en `platform_admins`. ✅
- El link "🛰️ Plataforma" en el sidebar del panel de entrenador aparece solo si
  sos superadmin y te lleva a `/platform`.

---

## Notas

- **No hace falta** cambiar el nombre del proyecto de Vercel ni de la carpeta local
  (`/Users/Tito/joeltraining`): son cosméticos y no afectan las URLs públicas. Si
  igual querés renombrarlos, se puede hacer aparte (proyecto: Settings → General →
  Project Name).
- Variables de entorno de Vercel: no cambian por esto. La app resuelve el tenant
  por hostname/ruta en runtime.
- Nada de esto toca Supabase ni la base de datos.

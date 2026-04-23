# Tu Casaca Deportiva Store (TCDS)

Next.js (App Router), TypeScript, Tailwind.

## Admin (`/admin`)

El panel de administración no usa usuarios creados en la aplicación ni Supabase Auth. El acceso está **bloqueado en el edge** con **HTTP Basic Auth** (ver `middleware.ts` en la raíz del repo).

Definí en el entorno (por ejemplo en Vercel o en un `.env` local) **ambas** variables; si falta alguna, las rutas `/admin` y `/api/admin/*` responden **503** con un mensaje explícito:

| Variable | Uso |
| --- | --- |
| `ADMIN_BASIC_USER` | Usuario del challenge Basic (solo servidor) |
| `ADMIN_BASIC_PASSWORD` | Contraseña del challenge Basic (solo servidor) |

Con credenciales configuradas, un cliente sin `Authorization: Basic` (o con usuario/clave incorrectos) recibe **401** y el prompt estándar de Basic Auth en el navegador.

```bash
npm run dev
npm run lint
npm run build
```

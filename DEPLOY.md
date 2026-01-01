# 🚀 Despliegue en Cloudflare Pages

## Opción 1: Desde GitHub (RECOMENDADO - 3 minutos)

### Paso 1: Ir a Cloudflare Pages
1. Abre https://dash.cloudflare.com
2. Click en **"Pages"** en el menú izquierdo
3. Click en **"Create a project"**
4. Click en **"Connect to Git"**

### Paso 2: Conectar GitHub
1. Click en **"GitHub"**
2. Autoriza a Cloudflare (si es la primera vez)
3. Selecciona el repositorio **"MavendanoS/Apps"**
4. Click en **"Begin setup"**

### Paso 3: Configurar Build
```
Project name: mi-entrenamiento
Production branch: claude/workout-planner-app-5VOD7
Framework preset: None
Build command: (dejar vacío)
Build output directory: /
Root directory: (dejar vacío)
```

### Paso 4: Deploy
1. Click en **"Save and Deploy"**
2. Espera 1-2 minutos
3. ¡Listo! Te dará una URL como: `https://mi-entrenamiento.pages.dev`

---

## Opción 2: Arrastrar y Soltar (SI NO FUNCIONA GITHUB)

### Paso 1: Descargar Archivos
Descarga estos 5 archivos del repositorio:
- `index.html`
- `styles.css`
- `app.js`
- `manifest.json`
- `sw.js`

### Paso 2: Subir a Cloudflare
1. Ve a https://dash.cloudflare.com
2. **Pages** → **Create a project** → **Upload assets**
3. Arrastra los 5 archivos
4. Click en **"Deploy site"**
5. ¡Listo!

---

## 📱 Instalar como PWA

Una vez desplegado:

1. Abre `https://tu-app.pages.dev` en **Chrome móvil**
2. Verás un banner: **"Agregar a pantalla de inicio"**
3. O presiona menú (⋮) → **"Instalar aplicación"**
4. ¡Aparecerá el icono 💪 en tu pantalla!

---

## 🔄 Actualizaciones Automáticas

Cada vez que hagas `git push`, Cloudflare detectará el cambio y desplegará automáticamente en ~30 segundos.

---

## ✅ Checklist

- [ ] Cuenta en Cloudflare (gratis)
- [ ] GitHub conectado
- [ ] Proyecto creado
- [ ] Deploy exitoso
- [ ] URL copiada
- [ ] PWA instalada en celular
- [ ] ¡A entrenar! 💪

---

## 🆘 Problemas Comunes

**"No veo mi repositorio"**
→ Revisa permisos de GitHub en Cloudflare

**"Build failed"**
→ No debería pasar, no hay build. Revisa que Framework = None

**"Service Worker no funciona"**
→ Espera 5 minutos para que el DNS se propague

**"No puedo instalar PWA"**
→ Asegúrate de estar en HTTPS (Cloudflare lo da automático)

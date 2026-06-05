# Blogix Web — Frontend App

Este es el cliente frontend de **Blogix**, un lector y gestor de blogs técnicos premium diseñado con **Angular 19**, **Tailwind CSS** y una filosofía de diseño minimalista orientada al modo oscuro permanente.

La interfaz está construida con un alto foco en la experiencia de usuario (UX), transiciones suaves e interacción SPA (Single Page Application) sin recargas molestas de página.

---

## ✨ Características de Diseño y UX

- **Modo Oscuro Permanente**: Gama cromática basada en paletas oscuras HSL (`slate-900`, `slate-950`), bordes sutiles y efectos de traslucidez (*glassmorphism*).
- **Diseño estilo Revista Tecnológica**: Rejilla responsiva dinámica de 3 columnas para los posts secundarios con portadas de relación fija (`h-48`) y micro-animaciones en hover (`hover:scale-105 duration-300`).
- **Filtrado SPA Reactivo e In-Situ**: Filtros de categorías y etiquetas integrados de forma nativa en la página de inicio. Se sincronizan en la URL silenciosamente a través de `queryParams` (ej: `/posts?category=docker`) sin refrescar el sitio, y recargan de forma independiente la sección de posts mostrando un elegante esqueleto parpadeante (*skeleton loader*).
- **Interacciones Reactivas (Likes & Comentarios)**:
  - Botón de likes interactivo con *Optimistic UI* (el contador y el corazón relleno cambian inmediatamente al hacer clic, con rollback seguro en caso de error en la API).
  - Caja de comentarios dinámica, validada mediante formularios reactivos de Angular.
- **Botón Inteligente de Compartir**: Integración con la API nativa del dispositivo (Web Share API) para compartir en redes/apps de mensajería con un plan B (fallback) automático al portapapeles.
- **Modales de Confirmación Reutilizables**: Eliminación de popups nativos `confirm()` del navegador para el borrado de posts o comentarios, unificando la estética en un modal premium (`<app-confirm-modal>`).
- **Compresión de Imágenes en Canvas**: Al crear o editar un post, las imágenes de portada seleccionadas se procesan, redimensionan y comprimen en el cliente utilizando un Canvas de HTML5 antes de enviarse al backend.

---

## 🛠️ Estructura del Proyecto

El código fuente sigue las mejores prácticas de Angular organizando el código de forma modular:

```text
src/app/
├── core/                    # Módulos globales, configuraciones y utilidades
│   ├── guards/              # Protectores de rutas (auth.guard)
│   ├── interceptors/        # Interceptores HTTP (inyección de JWT Bearer tokens)
│   ├── services/            # Servicios de consumo de APIs (PostService, AuthService, etc.)
│   └── models/              # Interfaces y tipos TypeScript unificados (types.ts)
├── features/                # Vistas y componentes organizados por características
│   ├── auth/                # Login, Registro, Recuperación de contraseña
│   ├── posts/               # Lista de posts, detalle de lectura y editor de contenido
│   ├── categories/          # Panel de gestión de categorías
│   ├── tags/                # Visualización de etiquetas populares
│   └── profile/             # Gestión de la cuenta del usuario
├── components/              # Componentes de UI reutilizables
│   ├── confirm-modal/       # Modal de confirmación estilizado
│   └── wysiwyg-editor/      # Editor de texto enriquecido integrado
└── shared/                  # Pipes de saneamiento y utilidades compartidas
```

---

## 🚀 Instalación y Puesta en Marcha

### Requisitos previos

- **Node.js** v18 o superior.
- **npm** (incluido con Node).

### Pasos para iniciar localmente

1. Accede al directorio de la aplicación frontend:
   ```bash
   cd blog-app-front
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   # o bien:
   ng serve
   ```
4. Abre tu navegador en [http://localhost:4200/](http://localhost:4200/). La aplicación se recargará automáticamente al detectar cambios en los archivos.

### Construir para Producción

Para generar el bundle optimizado y minificado de producción:

```bash
npm run build
```

Los artefactos listos para el despliegue se almacenarán en la carpeta `dist/blog-app-front`.

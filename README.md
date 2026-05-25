<div align="center">

# ◎ SIGMA

### Sistema Institucional de Gestión de Matrículas Académicas

*Plataforma web académica moderna para la administración institucional de procesos universitarios*

---

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white&labelColor=20232A)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![SCSS](https://img.shields.io/badge/SCSS-Styles-CC6699?style=flat-square&logo=sass&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=flat-square&logo=vite&logoColor=white)
![Status](https://img.shields.io/badge/Estado-En%20Desarrollo-7C3AED?style=flat-square)

---

> Proyecto final de la asignatura **Estructuras de Datos II** — Ingeniería Informática  
> SIGMA aplica estructuras de datos reales (pilas, árboles y grafos) dentro de un sistema web funcional e institucional.

</div>

---

## 📋 Tabla de Contenidos

1. [¿Qué es SIGMA?](#-qué-es-sigma)
2. [Objetivo del proyecto](#-objetivo-del-proyecto)
3. [Características principales](#-características-principales)
4. [Roles del sistema](#-roles-del-sistema)
5. [Módulos principales](#-módulos-principales)
6. [Estructuras de datos implementadas](#-estructuras-de-datos-implementadas)
7. [Tecnologías utilizadas](#-tecnologías-utilizadas)
8. [Estructura del proyecto](#-estructura-del-proyecto)
9. [Instalación y ejecución local](#-instalación-y-ejecución-local)
10. [Configuración de Firebase](#-configuración-de-firebase)
11. [Despliegue](#-despliegue)
12. [Enlaces importantes](#-enlaces-importantes)
13. [Equipo de desarrollo](#-equipo-de-desarrollo)
14. [Conclusión](#-conclusión)

---

## 🎓 ¿Qué es SIGMA?

**SIGMA** *(Sistema Institucional de Gestión de Matrículas Académicas)* es una plataforma web diseñada para facilitar y optimizar la administración de procesos académicos dentro de una institución educativa universitaria.

El sistema centraliza la gestión de:

- 🏛️ **Facultades, carreras y pensums** organizados en una estructura jerárquica.
- 📚 **Materias y grupos** con control de cupos en tiempo real.
- 📝 **Matrículas académicas** de estudiantes según condiciones del pensum.
- 📰 **Noticias institucionales** publicadas y gestionadas por administradores.
- 👤 **Usuarios** con roles diferenciados: estudiante y administrador.

SIGMA no es solo una aplicación CRUD convencional. Su valor académico radica en la integración de **estructuras de datos formales** — pilas, árboles y grafos — para resolver problemas concretos de gestión universitaria.

---

## 🎯 Objetivo del Proyecto

Representar de manera práctica la aplicación de estructuras de datos dentro de un entorno real, integrando conceptos académicos con tecnologías modernas de desarrollo web.

La plataforma busca demostrar cómo estructuras como **pilas**, **árboles** y **grafos** pueden utilizarse para modelar y resolver problemáticas reales presentes en sistemas de información académica, yendo más allá del ejercicio teórico y aterrizándolo en un producto funcional.

---

## ✨ Características Principales

| Característica | Descripción |
|---|---|
| 🔐 Autenticación | Sistema de login por correo y contraseña con Firebase Auth |
| 👥 Roles de usuario | Estudiante y Administrador con accesos diferenciados |
| 🏛️ Árbol académico | Jerarquía Facultad → Carrera → Pensum administrable |
| 📊 Grafos de pensum | Representación de prerrequisitos entre materias como grafo dirigido |
| 📰 Módulo de noticias | Gestión con lógica de pila (LIFO) |
| 🎓 Sistema de matrículas | Inscripción de materias con actualización de cupos en tiempo real |
| 📱 Diseño responsive | Interfaz adaptada a diferentes tamaños de pantalla |
| ⚡ Tiempo real | Sincronización con Firestore en tiempo real |

---

## 👤 Roles del Sistema

### 🎓 Estudiante

El estudiante tiene acceso al sistema de matrículas y a la información académica de su pensum.

**Datos asociados al perfil estudiantil:**
- Historial académico representado como una lista de IDs de materias cursadas.
- Pensum al que pertenece dentro de la jerarquía institucional.
- Variable `enroll`: indica si el estudiante ya realizó su proceso de matrícula.

**Acciones disponibles:**
- Consultar noticias institucionales.
- Visualizar las materias de su pensum y sus prerrequisitos.
- Realizar la matrícula de materias disponibles según cupos y condiciones académicas.

---

### 🛠️ Administrador

El administrador posee acceso exclusivo a las páginas de gestión del sistema, con control total sobre las estructuras institucionales.

**Acciones disponibles:**
- Gestionar el árbol académico (facultades, carreras, pensums).
- Administrar materias, grupos y cupos.
- Configurar los grafos de prerrequisitos de cada pensum.
- Publicar, editar y eliminar noticias institucionales.

---

## 📦 Módulos Principales

### 📰 Módulo de Noticias

Sistema de publicaciones institucionales visible desde la página principal, sin requerir autenticación para su consulta.

La gestión editorial (crear, editar, eliminar) está restringida al rol administrador.

**Funciones:**
- Crear y publicar noticias.
- Editar publicaciones existentes.
- Eliminar noticias.
- Mostrar noticias en orden de más reciente a más antigua.

---

### 🎓 Módulo de Matrículas

Permite a los estudiantes inscribir materias disponibles de acuerdo con su pensum, los cupos vigentes y sus condiciones académicas.

**Datos gestionados en cada matrícula:**

| Campo | Descripción |
|---|---|
| `materiaId` | Identificador único de la materia |
| `cuposDisponibles` | Cupos restantes en el grupo |
| `estudiantesMatriculados` | Lista de IDs de estudiantes inscritos |

Al completarse una matrícula, los cupos disponibles se actualizan automáticamente en tiempo real a través de Firestore.

---

### 🏛️ Módulo de Árbol Académico

Administración de la jerarquía institucional completa: facultades, carreras y pensums, organizada como un árbol jerárquico.

```
Institución
├── Facultad de Ingeniería
│   ├── Carrera: Ingeniería Informática
│   │   ├── Pensum 2022
│   │   └── Pensum 2024
│   └── Carrera: Ingeniería de Sistemas
└── Facultad de Ciencias
    └── ...
```

---

### 📊 Módulo de Grafo del Pensum

Cada pensum cuenta con un grafo dirigido que representa las relaciones de prerrequisitos entre materias.

Las materias se conectan mediante dependencias académicas, permitiendo visualizar y administrar qué materias deben cursarse antes de otras.

---

### 📚 Módulo de Materias

Cada materia del sistema contiene la siguiente información:

| Campo | Descripción |
|---|---|
| `nombre` | Nombre de la materia |
| `codigo` | Código identificador de la asignatura |
| `creditos` | Número de créditos académicos |
| `grupos` | Lista de grupos disponibles |
| `grupos[].nombre` | Nombre del grupo (Ej: Grupo A) |
| `grupos[].cupos` | Cantidad de cupos disponibles en ese grupo |

---

## 🧱 Estructuras de Datos Implementadas

Esta sección documenta las decisiones técnicas de diseño en cuanto a estructuras de datos, que constituyen el núcleo académico del proyecto.

---

### 🗂️ Pila — Módulo de Noticias

**¿Por qué una pila?**

Las noticias siguen una lógica **LIFO** (*Last In, First Out*): la publicación más reciente debe mostrarse primero. La pila es la estructura idónea para modelar este comportamiento, ya que el último elemento insertado es el primero en ser consultado.

```
Pila de noticias:
┌─────────────────────────────┐
│  [4] Noticia más reciente   │ ← tope (se muestra primero)
├─────────────────────────────┤
│  [3] Noticia anterior       │
├─────────────────────────────┤
│  [2] Noticia anterior       │
├─────────────────────────────┤
│  [1] Noticia más antigua    │ ← base
└─────────────────────────────┘
```

---

### 🌳 Árbol — Estructura Académica Institucional

**¿Por qué un árbol?**

La organización institucional (facultades → carreras → pensums) tiene una naturaleza **jerárquica y recursiva** por definición. El árbol permite modelar esta relación padre-hijo de manera natural, donde cada nodo puede tener múltiples hijos pero un único padre, respetando la lógica organizacional de la institución.

```
Árbol Académico
        [Institución]
             │
    ┌────────┴────────┐
[Facultad A]    [Facultad B]
     │
┌────┴────┐
[Carrera] [Carrera]
    │
[Pensum]
```

---

### 🔗 Grafo Dirigido — Prerrequisitos del Pensum

**¿Por qué un grafo?**

Las relaciones de prerrequisitos entre materias son **no lineales**: una materia puede depender de varias otras simultáneamente, y varias materias pueden depender de una misma base. El grafo dirigido es la única estructura que modela correctamente estas relaciones de dependencia múltiple entre nodos.

```
Grafo de prerrequisitos (ejemplo):

  [Cálculo I] ──────────► [Cálculo II] ──► [Ecuaciones Diferenciales]
       │                       │
       ▼                       ▼
  [Álgebra]           [Física I] ──────► [Física II]
```

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Uso en el proyecto |
|---|---|
| ![React](https://img.shields.io/badge/-React-20232A?style=flat-square&logo=react) | Construcción de la interfaz de usuario modular y dinámica |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | Tipado estático, interfaces y mayor seguridad en el desarrollo |
| ![Firebase Auth](https://img.shields.io/badge/-Firebase_Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black) | Autenticación de usuarios por correo y contraseña |
| ![Firestore](https://img.shields.io/badge/-Firestore-FF6F00?style=flat-square&logo=firebase&logoColor=white) | Base de datos en tiempo real y persistencia de datos |
| ![SCSS](https://img.shields.io/badge/-SCSS-CC6699?style=flat-square&logo=sass&logoColor=white) | Estilos personalizados con metodología BEM |
| ![React Router](https://img.shields.io/badge/-React_Router-CA4245?style=flat-square&logo=reactrouter&logoColor=white) | Navegación entre rutas públicas, privadas y administrativas |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | Entorno de desarrollo y compilación |
| ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) | Entorno de ejecución y gestión de dependencias |
| ![Notistack](https://img.shields.io/badge/-Notistack-7C3AED?style=flat-square) | Notificaciones dinámicas dentro de la plataforma |
| ![Git](https://img.shields.io/badge/-Git-F05032?style=flat-square&logo=git&logoColor=white) | Control de versiones y trabajo colaborativo |

---

## 🗂️ Estructura del Proyecto

```
sigma/
├── public/
│   └── student.png
├── src/
│   ├── Components/
│   │   ├── Navbar.tsx
│   │   ├── AdminNavbar.tsx
│   │   └── SCSS/
│   │       ├── NavBar.scss
│   │       └── AdminNavbar.scss
│   ├── Context/
│   │   └── AuthContext.tsx
│   ├── Hooks/
│   │   ├── useArbolAcademico.ts
│   │   └── useGrafoAcademico.ts
│   ├── Pages/
│   │   ├── Home.tsx
│   │   ├── SignIn.tsx
│   │   ├── SignUp.tsx
│   │   ├── DashboardAdmin.tsx
│   │   ├── ArbolAcademico.tsx
│   │   ├── GrafoAcademico.tsx
│   │   ├── Noticias.tsx
│   │   └── SCSS/
│   │       ├── home.scss
│   │       ├── DashboardAdmin.scss
│   │       ├── ArbolAcademico.scss
│   │       └── GrafoAcademico.scss
│   ├── Utils/
│   │   └── Graph.ts
│   ├── firebase.ts
│   ├── App.tsx
│   └── main.tsx
├── .env
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ⚙️ Instalación y Ejecución Local

Sigue los pasos a continuación para ejecutar el proyecto en tu entorno de desarrollo:

**1. Clonar el repositorio**

```bash
git clone [Enlace al repositorio]
cd sigma
```

**2. Instalar dependencias**

```bash
npm install
```

**3. Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto. Consulta la sección [Configuración de Firebase](#-configuración-de-firebase) para los valores requeridos.

**4. Ejecutar en modo desarrollo**

```bash
npm run dev
```

**5. Abrir en el navegador**

```
http://localhost:5173
```

---

## 🔑 Configuración de Firebase

El proyecto requiere una instancia de Firebase con **Authentication** y **Firestore** habilitados.

Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```env
VITE_API_KEY=...
VITE_AUTH_DOMAIN=...
VITE_PROJECT_ID=...
VITE_STORAGE_BUCKET=...
VITE_MESSAGING_SENDER_ID=...
VITE_APP_ID=...
```

> ⚠️ **Importante:** Reemplaza cada valor con las credenciales reales de tu proyecto en [Firebase Console](https://console.firebase.google.com/). Nunca compartas estas claves públicamente ni las incluyas en el repositorio.

Asegúrate de que el archivo `.env` esté incluido en `.gitignore` antes de realizar cualquier commit.

---

## 🚀 Despliegue

El proyecto está configurado para desplegarse en servicios de hosting estático compatibles con aplicaciones Vite/React, como **Netlify**, **Vercel** o **Firebase Hosting**.

| Plataforma | Enlace |
|---|---|
| 🌐 Producción | [Enlace al despliegue] |

---

## 🔗 Enlaces Importantes

| Recurso | Enlace |
|---|---|
| 📁 Repositorio GitHub | [Enlace al repositorio] |
| 🎨 Propuesta gráfica (Figma / Adobe) | [Enlace a la propuesta gráfica] |
| 🌐 Despliegue en producción | [Enlace al despliegue] |
| 📄 Documento final del proyecto | [Enlace al documento final] |

---

## 👨‍💻 Equipo de Desarrollo

Estudiantes de **Ingeniería Informática** responsables del diseño, desarrollo e implementación de SIGMA como proyecto final de la asignatura Estructuras de Datos II.

<div align="center">

| Integrante | Rol |
|---|---|
| **Lucas Garcia Gallego** | Desarrollo e implementación |
| **Laura Isabel Campo Ruiz** | Desarrollo e implementación |
| **Alex Yohan Silva Mina** | Desarrollo e implementación |

</div>

---

## 📌 Conclusión

SIGMA representa la convergencia entre teoría y práctica dentro del campo de las estructuras de datos. A través del desarrollo de esta plataforma, el equipo pudo aplicar conceptos formales — como pilas, árboles y grafos — en un contexto real y funcional, demostrando que estas estructuras no son únicamente construcciones académicas abstractas, sino herramientas concretas para resolver problemáticas del mundo real.

El proyecto evidencia cómo una aplicación web moderna puede, al mismo tiempo, ser tecnológicamente robusta y académicamente rigurosa.

---

<div align="center">

**SIGMA** · Sistema Institucional de Gestión de Matrículas Académicas

*Ingeniería Informática — Estructuras de Datos II*

![Made with](https://img.shields.io/badge/Hecho%20con-React%20%2B%20TypeScript-7C3AED?style=flat-square)

</div>

# 🧀 QuesosGPT - Chatbot Inteligente con Next.js y Google Gemini API

Proyecto full-stack de Inteligencia Artificial para la práctica guiada de Chatbot interactivo. Implementa una arquitectura cliente-servidor desacoplada con **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** y el SDK oficial unificado **`@google/genai`**, junto con control de hiperparámetros de LLM en tiempo real y una interfaz de usuario avanzada inspirada en **Cortex**.

---

## 📋 Requisitos Previos

1. **Node.js**: Versión 18.x o superior instalada (incluye `npm` y `npx`).
   - *Nota para Windows:* Asegúrate de que `C:\Program Files\nodejs\` se encuentre en las variables de entorno de tu sistema (PATH).
2. **Clave de API de Google Gemini**:
   - Obtenida gratuitamente desde [Google AI Studio](https://aistudio.google.com/).

---

## 🚀 Pasos de Instalación y Ejecución

### Opción A: Ejecución Directa (Proyecto ya instalado)

El proyecto ya cuenta con las dependencias instaladas y la clave de API configurada en `.env.local`.

1. Abre tu terminal en la carpeta del proyecto o en la subcarpeta `chatterbot-nextjs`:
   ```bash
   cd chatterbot-nextjs
   ```

2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   *(O desde la carpeta raíz: `npm run dev`)*

3. Abre en tu navegador web:
   👉 **[http://localhost:3000](http://localhost:3000)**

---

### Opción B: Instalación Paso a Paso desde Cero (Guía del Estudiante)

Si deseas reconstruir el proyecto paso a paso como práctica:

#### 1. Clonar o entrar al directorio del proyecto:
```bash
cd "c:\Proyectos\Fundamentos de IA\Proyecto 1 ChatBot\chatterbot-nextjs"
```

#### 2. Instalar dependencias de Next.js y librerías del proyecto:
```bash
npm install
```
O manualmente:
```bash
npm install @google/genai lucide-react clsx tailwind-merge
```

#### 3. Configurar la clave de API en `.env.local`:
Crea un archivo llamado `.env.local` en la carpeta `chatterbot-nextjs/`:
```env
# chatterbot-nextjs/.env.local
GEMINI_API_KEY=tu_clave_secreta_aqui
```

> **Principio de Seguridad de Software:**
> Nunca utilices el prefijo `NEXT_PUBLIC_` para llaves de API con costo o cuota. Las variables sin `NEXT_PUBLIC_` solo son accesibles en el entorno de Node.js (Servidor), protegiendo la clave de ser extraída desde las herramientas de desarrollador en el navegador del usuario. Asegúrate de que `.env.local` esté listado en tu archivo `.gitignore`.

#### 4. Iniciar el servidor:
```bash
npm run dev
```

---

## 🏗️ Arquitectura del Sistema

```
┌───────────────────────────────────────┐
│     Frontend (Next.js - React / CSS)  │
│  - Cortex Chat Interface              │
│  - Panel de Parámetros (ConfigPanel)  │
└──────────────────┬────────────────────┘
                   │ 1. POST /api/chat (Payload: historial + config)
                   ▼
┌───────────────────────────────────────┐
│       Backend (Next.js App Router)    │
│  - /app/api/chat/route.ts             │
│  - Validación de entradas             │
│  - Ocultamiento de GEMINI_API_KEY     │
└──────────────────┬────────────────────┘
                   │ 2. Llamada al SDK oficial @google/genai
                   ▼
┌───────────────────────────────────────┐
│          Google Cloud / Gemini        │
│  - gemini-3.8-flash / gemini-3.5-flash│
│  - Inferencia con hiperparámetros     │
└──────────────────┬────────────────────┘
                   │ 3. Retorno de respuesta + usageMetadata
                   ▼
┌───────────────────────────────────────┐
│   Frontend: Renderizado enriquecido   │
│  - Bloques de código con botón copiar │
│  - Métricas de tokens en tiempo real  │
└───────────────────────────────────────┘
```

---

## 🎛️ Hiperparámetros de LLM Manipulables en Tiempo Real

Desde el panel lateral de parámetros (ícono de deslizadores <kbd>⊶</kbd>) puedes controlar técnicamente el comportamiento del modelo:

| Hiperparámetro | Rango / Opciones | Descripción Técnica |
| :--- | :--- | :--- |
| **Modelo Base** | `gemini-3.8-flash`, `gemini-3.5-flash`, `gemini-3.7-flash` | Selección del LLM base según velocidad, capacidad de razonamiento o latencia. |
| **System Prompt (Rol)** | Texto libre / Presets didácticos | Instrucción de sistema inyectada en el contexto para condicionar rol, restricciones y formato. |
| **Temperatura** | `0.0` a `2.0` (paso `0.1`) | Nivel de entropía/aleatoriedad en el muestreo de tokens: `0.0` determinista, `1.8+` divergente y creativo. |
| **Límite de Tokens (`maxOutputTokens`)** | `64` a `4096` (paso `64`) | Cantidad máxima estricta de tokens que el modelo puede emitir en su respuesta. |
| **Top-P (Nucleus Sampling)** | `0.0` a `1.0` (paso `0.05`) | Considera solo el subconjunto de tokens cuya probabilidad acumulada suma hasta el valor P. |
| **Top-K** | `1` a `40` (paso `1`) | Limita el muestreo a los K tokens más probables en cada paso de predicción. |

---

## 🧪 Casos de Prueba de Laboratorio

Prueba los siguientes escenarios para comprobar el comportamiento del LLM:

### 1. Prueba de Contexto (System Instruction)
1. En el panel lateral, cambia el **System Prompt** a:
   ```text
   Responde únicamente en formato JSON con la clave 'respuesta' y 'lenguaje'. Sin explicaciones adicionales.
   ```
2. Envía la pregunta:
   ```text
   ¿Cómo declaro una variable inmutable en Rust?
   ```
3. **Resultado esperado:** El modelo debe responder exclusivamente con el objeto JSON solicitado:
   ```json
   {
     "respuesta": "let nombre = valor;",
     "lenguaje": "Rust"
   }
   ```

### 2. Prueba de Límite de Respuesta (`maxOutputTokens`)
1. Configura el slider de **Tokens Máximos** en `64`.
2. Envía una consulta amplia como:
   ```text
   Explica en detalle la historia y evolución de los sistemas operativos desde 1960.
   ```
3. **Resultado esperado:** La respuesta se interrumpirá bruscamente exactamente al alcanzar la cuota de tokens configurada.

### 3. Prueba de Temperatura (Determinismo vs Creatividad)
1. Coloca **Temperatura = 0.0**:
   - Pide: `"Escribe un algoritmo quicksort en TypeScript"`.
   - La respuesta será directa, concisa y determinista.
2. Coloca **Temperatura = 1.8**:
   - Pide: `"Dame 3 ideas disruptivas de startups que combinen inteligencia artificial y agricultura"`.
   - La respuesta será diversa, imaginativa y con conexiones creativas.

---

## 📂 Estructura del Código Fuente

```
chatterbot-nextjs/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Endpoint Backend seguro con SDK @google/genai
│   ├── globals.css               # Estilos globales, tema oscuro y fuentes
│   ├── layout.tsx                # Layout principal y configuración HTML
│   └── page.tsx                  # Vista principal del chat, barra superior y modales
├── components/
│   ├── ChatInput.tsx             # Barra flotante de entrada con atajos (Enter / Shift+Enter)
│   ├── ChatMessage.tsx           # Burbujas de mensaje con soporte para código y copiado
│   └── ConfigPanel.tsx           # Panel de configuración de parámetros LLM
├── types/
│   └── chat.ts                   # Interfaces y tipos de TypeScript
├── .env.local                    # Clave de API (NO versionar en Git)
├── package.json
└── tsconfig.json
```

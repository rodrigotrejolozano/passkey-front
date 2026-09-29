# Passkey Frontend

Interfaz web de demostración para autenticación sin contraseñas. Está construida
con Next.js, React y WebAuthn, y permite usar Passkeys, Google OAuth y métodos
de recuperación de cuenta.

La API que implementa la autenticación y almacena los datos está en el
repositorio [passkey-back](https://github.com/rodrigotrejolozano/passkey-back).
Este frontend no contiene secretos, credenciales de Google ni acceso directo a
la base de datos.

## Qué permite aprender

- Registro e inicio de sesión con Passkeys mediante WebAuthn.
- Inicio de sesión, vinculación y verificación adicional con Google OAuth.
- Sesiones protegidas mediante cookies `HttpOnly`.
- Protección CSRF para operaciones que modifican datos.
- Recuperación mediante correo, código OTP, enlace mágico o códigos de respaldo.
- Verificación adicional antes de acciones sensibles.
- Internacionalización en español e inglés, con rutas `/es/...` y `/en/...`.

## Arquitectura y relación con la API

El navegador se comunica exclusivamente con la API configurada en
`NEXT_PUBLIC_API_ORIGIN`, que por defecto es `http://localhost:3001`.

1. El frontend solicita opciones WebAuthn a la API.
2. El navegador abre el diálogo nativo de Passkey con `@simplewebauthn/browser`.
3. El frontend envía la respuesta firmada a la API para su verificación.
4. La API crea o valida la sesión y la devuelve mediante cookie segura.

Google OAuth comienza en la API para que el secreto de cliente nunca llegue al
navegador. El frontend redirige al endpoint de inicio y la API vuelve a una ruta
localizada al finalizar el callback.

Para conocer endpoints, modelo de datos, configuración de proveedores y reglas
de seguridad, consulta el
[README del backend](https://github.com/rodrigotrejolozano/passkey-back).

## Requisitos

- Node.js `>=24 <25`.
- npm `>=12 <13`.
- El backend en ejecución. Para Passkeys, Google y recuperación real también se
  necesita configurar sus dependencias según el README del backend.

Passkeys funcionan en `localhost` durante desarrollo. En otros dominios el
navegador exige HTTPS y una configuración WebAuthn coherente con el dominio.

## Instalación local

```bash
git clone https://github.com/rodrigotrejolozano/passkey-front.git
cd passkey-front
npm install
cp .env.example .env
```

El valor local por defecto es:

```dotenv
NEXT_PUBLIC_API_ORIGIN=http://localhost:3001
```

Inicia primero el backend y después este proyecto:

```bash
npm run dev
```

Abre `http://localhost:3000`. La ruta raíz redirige al español (`/es`); también
puedes navegar directamente a `http://localhost:3000/en`.

## Flujos de autenticación

### Passkeys

En crear cuenta se solicita un nombre y el navegador registra una Passkey. En
iniciar sesión, el navegador firma un reto con una Passkey existente. Nunca se
transmite ni se almacena una contraseña.

### Google OAuth

El botón de Google dirige a la API. La API crea una transacción temporal ligada
al navegador, inicia OAuth y procesa el callback. El idioma actual se conserva
durante el flujo y el usuario vuelve a `/es/...` o `/en/...` según corresponda.

### Recuperación y acciones sensibles

La recuperación puede usar correo, OTP, enlace mágico, código de recuperación o
Google. Para modificar Passkeys, sesiones, Google vinculado o recuperación, la
aplicación puede pedir una verificación adicional con Passkey o Google.

## Internacionalización

Los mensajes se mantienen en:

- `messages/es.json`
- `messages/en.json`

La configuración está en `i18n/`, las rutas localizadas se generan con
`i18n/navigation.ts` y `proxy.ts` obliga el prefijo de idioma. Al añadir texto
visible o accesible, agrega la misma clave en ambos diccionarios y usa
`useTranslations` o `getTranslations`; no introduzcas literales traducibles en
componentes.

## Comandos útiles

```bash
npm run dev             # Desarrollo
npm run build           # Build de producción
npm run start           # Servir el build
npm run typecheck       # Comprobar TypeScript
npm run lint            # Ejecutar ESLint
npm test                # Pruebas unitarias con Vitest
npm run test:e2e        # Pruebas Playwright
npm run format:check    # Comprobar formato
```

Las pruebas E2E usan `PLAYWRIGHT_BASE_URL` y `PLAYWRIGHT_API_ORIGIN` si se
necesita apuntar a un despliegue distinto.

## Seguridad y límites

- No guardes secretos en variables `NEXT_PUBLIC_*`: son visibles en el browser.
- Configura `NEXT_PUBLIC_API_ORIGIN` con el origen exacto de la API, sin rutas.
- La seguridad de sesión, CORS, CSRF, rate limiting, correo y OAuth reside en el
  backend; este cliente debe seguir usando sus endpoints protegidos.
- No uses el proyecto como sustituto de una auditoría de seguridad antes de un
  uso productivo.

## Despliegue

El frontend puede desplegarse en Vercel. La guía de demostración está en
[`docs/DEMO_DEPLOYMENT.md`](docs/DEMO_DEPLOYMENT.md). Configura solamente
`NEXT_PUBLIC_API_ORIGIN` en la plataforma frontend; los secretos pertenecen al
backend.

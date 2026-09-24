# Implementacion del frontend

## 1. Alcance

`passkey-front` es el cliente Next.js del portfolio passwordless. Presenta y orquesta ceremonias de navegador, pero nunca verifica firmas, emite sesiones ni guarda secretos. Toda autoridad de autenticacion vive en `passkey-back`.

Tras iniciar sesion, la aplicacion se limita intencionalmente a un Home sencillo de estado de seguridad y a configuracion de autenticacion, recovery, sesiones y nombre. No se agregan modulos de negocio.

Documentos de referencia obligatorios:

- `../PASSWORDLESS_IMPLEMENTATION_PLAN.md`
- `../DEPLOYMENT_AND_DEVELOPMENT_ARCHITECTURE.md`
- `../passkey-back/docs/BACKEND_IMPLEMENTATION.md`

## 2. Tecnologias

| Area               | Decision                                                                                |
| ------------------ | --------------------------------------------------------------------------------------- |
| Framework          | Next.js con TypeScript.                                                                 |
| Ceremonias passkey | `@simplewebauthn/browser`.                                                              |
| Estilos            | Sistema liviano y consistente; se decide al crear el proyecto, sin cambiar UX definida. |
| Estado remoto      | Capa de API tipada basada en los contratos backend.                                     |
| Sesion             | Cookie HttpOnly enviada por el navegador con `credentials: 'include'`.                  |
| Tests              | Vitest/Jest de componentes y Playwright E2E.                                            |

No se guarda token en JavaScript, `localStorage` o `sessionStorage`.

## 3. Rutas

| Ruta                 | Tipo          | Proposito                                                              |
| -------------------- | ------------- | ---------------------------------------------------------------------- |
| `/`                  | Publica       | Landing educativa passwordless.                                        |
| `/create-account`    | Publica       | Nombre y registro mediante passkey o Google.                           |
| `/sign-in`           | Publica       | Login passkey, Google y acceso a recovery.                             |
| `/recovery`          | Publica       | Elegir email o recovery code.                                          |
| `/recovery/email`    | Publica       | Solicitar y verificar OTP/Magic Link.                                  |
| `/recovery/code`     | Publica       | Verificar recovery code.                                               |
| `/restore-access`    | Recovery-only | Crear passkey o conectar Google desde RecoverySession.                 |
| `/auth/result`       | Publica       | Resultado seguro de callback Google o Magic Link, sin secretos en URL. |
| `/home`              | Autenticada   | Dashboard sencillo y estado de seguridad.                              |
| `/security/sign-in`  | Autenticada   | Passkeys y Google.                                                     |
| `/security/recovery` | Autenticada   | Recovery email y recovery codes.                                       |
| `/security/sessions` | Autenticada   | Sesiones activas y revocacion.                                         |
| `/profile`           | Autenticada   | Cambio de display name.                                                |

Middleware o guard de cliente mejora navegacion, pero la API es siempre la autoridad. Si `GET /api/auth/me` rechaza una sesion, se limpia el estado visual y se redirige a `/sign-in`.

## 4. API client

Existe un unico cliente HTTP que:

- Usa `NEXT_PUBLIC_API_ORIGIN`.
- Incluye `credentials: 'include'` en cada solicitud.
- Adjunta token CSRF cuando backend lo requiera.
- Convierte los codigos de error backend en estados de UI tipados.
- No interpreta un error publico como prueba de que una cuenta existe.

El cliente no conoce tokens de sesion. Puede recibir datos de usuario, metodos configurados, estados de recovery y sesiones desde endpoints autenticados.

## 5. Flujos publicos

### Landing

Debe explicar el objetivo: autenticacion sin passwords, sin secretos que recordar, filtrar o resetear. Contiene acciones `Create account` y `Sign in`, y una comparacion breve entre password tradicional y firma criptografica.

### Registro

Solicita solamente `Name`. Ofrece:

- `Continue with Passkey`
- `Continue with Google`

Passkey solicita options al backend, llama a `startRegistration`, manda la respuesta a verify y, si tiene exito, navega al onboarding de recovery o a Home. Google navega al inicio OIDC; la UI no diferencia registro y login.

### Login

Ofrece:

- `Sign in with Passkey`
- `Continue with Google`
- `Can't access your account?`

Passkey usa options discoverable y `startAuthentication`. La cancelacion del autenticador, expiracion de challenge y fallos de verification tienen mensajes seguros y accion de reintento.

No existen entradas de email o password para login.

### Recovery publica

El usuario escoge Recovery Email o Recovery Code. Recovery Email permite elegir OTP o Magic Link al enviar una solicitud; el resultado inicial siempre comunica que, si corresponde, se enviaron instrucciones. Recovery Code acepta un codigo con formato legible.

Una prueba valida navega a `/restore-access`. Esta ruta solo ofrece `Create new Passkey` o `Connect Google`; no muestra navbar autenticada ni permite entrar a Home hasta que el backend confirme una sesion normal.

## 6. Aplicacion autenticada

Layout unico:

```text
Top bar: PASSWORDLESS | display name | Logout
Sidebar: Home | Security: Sign-in, Recovery, Sessions | Profile
Content: pagina seleccionada
```

En movil, sidebar se convierte en navegacion accesible colapsable. La interfaz no necesita otras areas ni funcionalidades de negocio.

### Home

Home es breve. Muestra:

- Saludo con `displayName`.
- Numero de passkeys y estado Google.
- Estado de Recovery Email y Recovery Codes.
- Numero de sesiones activas.
- Alerta no bloqueante si no existe recovery verificado ni recovery codes activos, con accion hacia Recovery.

### Sign-in Methods

- Lista passkeys con nombre, fecha de creacion, ultimo uso y metadatos de backup solo cuando backend los entregue.
- Permite agregar passkey, renombrar y eliminar.
- Muestra Google conectado y `providerEmail` solo como dato visual; permite conectar o desconectar.
- Si backend responde que es el ultimo metodo, muestra el mensaje y enlaza a agregar otro metodo. No intenta evitar la validacion server-side.

### Recovery

- Muestra Recovery Email enmascarado y su estado verificado.
- Permite agregar o cambiar correo mediante OTP o Magic Link.
- Muestra si Recovery Codes estan configurados y cuantos quedan.
- Generar o regenerar muestra los nuevos codigos una unica vez en un dialogo que permite copiar, descargar y confirmar que fueron guardados.
- No vuelve a solicitar ni renderizar valores de codigos antiguos.

### Sessions y Profile

Sessions muestra dispositivo/navegador, actividad, sesion actual y ubicacion solo si backend la entrega como aproximada. Permite revocar una sesion ajena o todas excepto la actual.

Profile solo modifica `displayName` y muestra fecha de creacion.

## 7. Step-up

Operaciones sensibles reciben `STEP_UP_REQUIRED` si no hay step-up valido. La UI abre un dialogo `Verify it is you` con passkey y Google. Tras verification correcta, reintenta una vez la accion original; si falla, conserva la pagina y comunica el error.

Acciones que obligatoriamente usan este mecanismo:

- Agregar, renombrar o eliminar passkey.
- Conectar o desconectar Google.
- Agregar, cambiar o eliminar Recovery Email.
- Generar o regenerar Recovery Codes.

El dialogo no almacena credenciales ni token alguno. Al expirar los cinco minutos, se vuelve a solicitar en la siguiente accion sensible.

## 8. Estados y accesibilidad

Cada flujo tiene estados `idle`, `loading`, `success`, `error`, `expired` y `cancelled` cuando aplique. Durante ceremonias WebAuthn y callbacks se evita doble envio. Los errores se anuncian accesiblemente, reciben foco y no exponen detalles internos.

Los formularios usan labels, validacion visible y navegacion por teclado. Dialogos de step-up y recovery codes retienen foco y tienen cierre seguro. Los botones sensibles explican su resultado antes de confirmar.

## 9. Pruebas

Componentes prueban estados de carga/error, formularios, alertas de recovery, step-up y mensaje de ultimo metodo. Los limites del navegador y Google se mockean en tests de componente.

Playwright cubre navegacion publica, ausencia de password UI, estados de callbacks, redireccion por sesion invalida, navegacion recovery-only, Home, seguridad, responsive y logout. Las ceremonias reales de WebAuthn se prueban en el entorno que las soporte; el resto de E2E usa dobles controlados del backend.

## 10. Criterios de aceptacion

1. Ninguna pantalla contiene password, password reset o almacenamiento de token en JavaScript.
2. Landing comunica el proposito demostrativo y las pantallas publicas completan passkey, Google y recovery.
3. Home es sencillo y se limita al resumen de seguridad.
4. Las pantallas posteriores al login solo cubren configuracion auth, recovery, sesiones y profile minimo.
5. Las operaciones sensibles responden a step-up sin perder contexto.
6. RecoverySession no da acceso visual a Home.
7. Desktop, movil, teclado y errores accesibles funcionan en los flujos principales.

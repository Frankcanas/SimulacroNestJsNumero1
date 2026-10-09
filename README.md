# API REST Interna para Seguimiento Comercial (NestJS)

API REST interna desarrollada con **NestJS**, **TypeScript**, **TypeORM** y persistencia en **PostgreSQL**, empaquetada con **Docker & Docker Compose**. El sistema gestiona el ciclo de vida de solicitudes comerciales con control de acceso basado en roles (RBAC) en memoria, autorización mediante múltiples API Keys dinámicas, máquina de estados lineal estricta y documentación interactiva **Swagger/OpenAPI**.

---

## 🚀 Tecnologías Principales

- **Framework**: [NestJS 12](https://nestjs.com/)
- **Lenguaje**: TypeScript
- **Persistencia**: [TypeORM](https://typeorm.io/) con [PostgreSQL 16](https://www.postgresql.org/)
- **Validación y DTOs**: `class-validator` y `class-transformer`
- **Contenedorización**: Docker & Docker Compose (Multi-stage build con Node 22 Alpine)
- **Documentación Interactiva**: OpenAPI / Swagger UI
- **Pruebas Automatizadas**: Vitest (Unit & Integration tests)

---

## 🔐 Modelo de Seguridad y Roles

Todos los endpoints funcionales exigen obligatoriamente las siguientes cabeceras:

1. `x-api-key`: Clave secreta validada dinámicamente contra la variable de entorno `API_KEYS` (soporte multiclave separado por comas). No existen claves quemadas (*hardcoded*) en el código fuente.
2. `x-user`: Identificador de usuario validado contra el catálogo en memoria del sistema. Inyecta el usuario autenticado en la petición y desacredita cualquier rol enviado en el body.

### Catálogo de Usuarios en Memoria y Roles

| Usuario (`x-user`) | Rol | Alcance y Permisos |
|---|---|---|
| `admin`, `admin1` | **admin** | Control y visibilidad total: consulta y modifica el estado de cualquier solicitud. |
| `supervisor`, `supervisor1` | **supervisor** | Supervisión comercial: consulta y modifica el estado de cualquier solicitud. |
| `asesor1`, `asesor2`, `asesor_carlos` | **asesor** | Asesor en contacto con clientes: registra solicitudes y consulta/modifica **únicamente sus propias solicitudes**. |

---

## 🔄 Máquina de Estados de Solicitudes

El ciclo de vida de una solicitud comercial es estrictamente **lineal y finito**:

```
[ PENDIENTE ]  ───►  [ EN_GESTION ]  ───►  [ RESUELTA ]
```

- **Transiciones Permitidas**:
  - `PENDIENTE` ➔ `EN_GESTION`: Permitida al iniciar la atención por supervisor, admin o el asesor responsable.
  - `EN_GESTION` ➔ `RESUELTA`: Permitida al finalizar la gestión con el cliente.
- **Transiciones Prohibidas**:
  - `PENDIENTE` ➔ `RESUELTA`: Rechazada (prohibido salto directo sin pasar por gestión previa).
  - `RESUELTA` ➔ Cualquier estado: Rechazada (**las solicitudes resueltas jamás se reabren**).
  - Modificación de solicitudes ajenas por parte de un asesor: Rechazada con `403 Forbidden`.

---

## 📋 Requisitos Previos

- [Docker](https://docs.docker.com/get-docker/) y [Docker Compose](https://docs.docker.com/compose/) instalados y en ejecución.
- (Opcional para desarrollo local) Node.js >= 20 y npm >= 10.

---

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd SimulacroNestJs
```

### 2. Configurar variables de entorno
Copia la plantilla de variables de entorno [.env.example](.env.example) a un nuevo archivo `.env`:
```bash
cp .env.example .env
```

El archivo [.env.example](.env.example) incluye:
```env
# Configuración del Servidor
PORT=3000

# Claves de Acceso API (soporte multiclave separadas por coma)
API_KEYS=clave_dev_1,clave_dev_2

# Base de Datos PostgreSQL
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=solicitudes_db
```

---

## 🐳 Ejecución con Docker (Recomendado)

Inicia todos los servicios (Base de datos PostgreSQL 16 y la API en NestJS) en segundo plano:

```bash
docker compose up --build -d
```

- **API REST**: `http://localhost:3000`
- **Documentación Swagger UI**: `http://localhost:3000/api/docs`
- **Base de Datos PostgreSQL**: `localhost:5433` (mapeo externo para herramientas de administración como DBeaver / pgAdmin)

### Comandos útiles de Docker:
```bash
# Ver estado de los contenedores
docker compose ps

# Ver logs en tiempo real de la API
docker compose logs -f api

# Detener los contenedores
docker compose down
```

---

## 💻 Ejecución Local (Sin Docker)

Si dispones de una instancia local de PostgreSQL:

1. Instalar dependencias:
   ```bash
   npm install --legacy-peer-deps
   ```

2. Ajustar `DB_HOST=localhost` en tu archivo `.env`.

3. Iniciar en modo desarrollo:
   ```bash
   npm run start:dev
   ```

4. Compilar para producción:
   ```bash
   npm run build
   npm run start:prod
   ```

---

## 📖 Documentación Interactiva (Swagger / OpenAPI)

Una vez en ejecución, accede a la documentación interactiva en:

👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

### Cómo probar desde Swagger UI:
1. Haz clic en el botón superior verde **Authorize**.
2. En `x-api-key`, introduce una clave válida (ej. `clave_dev_1`).
3. En `x-user`, introduce un usuario válido (ej. `admin` o `asesor1`).
4. Haz clic en **Authorize** y luego en **Close**.
5. ¡Prueba cualquier endpoint interactivamente con **Try it out**!

---

## 📡 Endpoints de la API y Ejemplos de Consumo con `curl`

### 1. Registrar una nueva solicitud (`POST /solicitudes`)
```bash
curl -i -X POST http://localhost:3000/solicitudes \
  -H "x-api-key: clave_dev_1" \
  -H "x-user: asesor1" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "Empresa Alfa S.A.S.",
    "descripcion": "Solicitud de asesoría e implementación cloud"
  }'
```
*Respuesta exitosa (`201 Created`):*
```json
{
  "success": true,
  "data": {
    "id": 1,
    "cliente": "Empresa Alfa S.A.S.",
    "descripcion": "Solicitud de asesoría e implementación cloud",
    "asesor": "asesor1",
    "estado": "PENDIENTE",
    "creadaEn": "2026-10-09T15:40:29.148Z",
    "actualizadaEn": "2026-10-09T15:40:29.148Z"
  }
}
```

### 2. Consultar listado de solicitudes (`GET /solicitudes`)
- Si se envía `x-user: asesor1`, la consulta filtra automáticamente en PostgreSQL por `WHERE asesor = 'asesor1'`.
- Si se envía `x-user: admin` o `x-user: supervisor`, retorna la totalidad de solicitudes.

```bash
curl -i http://localhost:3000/solicitudes \
  -H "x-api-key: clave_dev_1" \
  -H "x-user: asesor1"
```

### 3. Consultar solicitud por ID (`GET /solicitudes/:id`)
```bash
curl -i http://localhost:3000/solicitudes/1 \
  -H "x-api-key: clave_dev_1" \
  -H "x-user: asesor1"
```

### 4. Actualizar estado de una solicitud (`PATCH /solicitudes/:id/estado`)
```bash
curl -i -X PATCH http://localhost:3000/solicitudes/1/estado \
  -H "x-api-key: clave_dev_1" \
  -H "x-user: asesor1" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "EN_GESTION"
  }'
```

---

## 🛡️ Formato Estandarizado de Respuestas

### Respuesta Exitosa (`200 OK` / `201 Created`):
```json
{
  "success": true,
  "data": <payload>
}
```

### Respuesta de Error Normalizada:
```json
{
  "statusCode": 400,
  "message": "Transición inválida: Queda terminantemente prohibido el salto directo de PENDIENTE a RESUELTA",
  "timestamp": "2026-10-09T15:40:59.686Z"
}
```

---

## 🧪 Pruebas Automatizadas

El proyecto cuenta con una cobertura completa de pruebas unitarias sobre todas las historias de usuario y criterios de aceptación Gherkin:

```bash
# Ejecutar suite de pruebas con Vitest
npm test

# Modo observador (watch)
npm run test:watch

# Reporte de cobertura
npm run test:cov
```

---

## 📸 Carpeta de Evidencias de Pruebas

Para revisión del Team Leader (TL) y aseguramiento de calidad, en la carpeta [`evidencias/`](./evidencias/) se encuentran capturas gráficas de cada uno de los escenarios principales:

1. **`01_pruebas_automatizadas_vitest.png`**: Cobertura de 47/47 pruebas unitarias exitosas.
2. **`02_seguridad_api_key_401.png`**: Rechazo de peticiones sin `x-api-key` autorizada (401).
3. **`03_seguridad_usuarios_roles_401_403.png`**: Validación de usuarios y control de roles (401 y 403).
4. **`04_registro_solicitud_post_201.png`**: Creación exitosa de solicitudes (201 Created).
5. **`05_validacion_dto_400.png`**: Rechazo de payloads con fallos de validación en DTO (400).
6. **`06_consulta_filtro_asesor_vs_admin_200.png`**: Filtro por asesor vs vista global para supervisor y admin.
7. **`07_consulta_por_id_y_proteccion_recurso_403_404.png`**: Aislamiento de solicitudes por asesor (403) y búsqueda por ID inexistente (404).
8. **`08_transiciones_estado_maquina_estados.png`**: Cumplimiento del ciclo `PENDIENTE` ➔ `EN_GESTION` ➔ `RESUELTA`.
9. **`09_documentacion_swagger_ui.png`**: Interfaz de Swagger UI interactiva en `/api/docs`.
10. **`10_despliegue_docker_compose_up.png`**: Despliegue de los servicios con Docker Compose.

Consulta la guía completa de evidencias en [evidencias/README.md](./evidencias/README.md).

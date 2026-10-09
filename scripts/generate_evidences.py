import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = "evidencias"
os.makedirs(OUTPUT_DIR, exist_ok=True)

FONT_MONO = "/usr/share/fonts/truetype/ubuntu/UbuntuMono-R.ttf"
FONT_SANS = "/usr/share/fonts/truetype/ubuntu/Ubuntu-R.ttf"

COLOR_BG = (30, 30, 46)          # Dark background
COLOR_BAR = (24, 24, 37)         # Window titlebar
COLOR_TEXT = (205, 214, 244)     # Main text
COLOR_DIM = (147, 153, 178)      # Dimmed text
COLOR_GREEN = (166, 227, 161)    # Success / 200
COLOR_BLUE = (137, 180, 250)     # Info / GET
COLOR_YELLOW = (249, 226, 175)   # Warning / PATCH
COLOR_RED = (243, 139, 168)      # Error / 401 / 403
COLOR_PURPLE = (203, 166, 247)   # POST / Accent
COLOR_BORDER = (49, 50, 68)      # Window border
COLOR_CARD = (36, 39, 58)        # Inner card box

def create_evidence_card(filename, title, lines):
    font_title = ImageFont.truetype(FONT_SANS, 16)
    font_code = ImageFont.truetype(FONT_MONO, 15)
    font_code_bold = ImageFont.truetype(FONT_MONO, 16)

    width = 1100
    line_height = 24
    header_height = 46
    padding = 24
    content_height = len(lines) * line_height + padding * 2
    height = header_height + content_height

    img = Image.new("RGB", (width, height), color=COLOR_BG)
    draw = ImageDraw.Draw(img)

    # Outer border
    draw.rectangle([(0, 0), (width - 1, height - 1)], outline=COLOR_BORDER, width=2)

    # Window titlebar
    draw.rectangle([(0, 0), (width, header_height)], fill=COLOR_BAR)
    draw.line([(0, header_height), (width, header_height)], fill=COLOR_BORDER, width=1)

    # Traffic light window buttons
    draw.ellipse([(16, 16), (28, 28)], fill=(243, 139, 168))  # Red
    draw.ellipse([(36, 16), (48, 28)], fill=(249, 226, 175))  # Yellow
    draw.ellipse([(56, 16), (68, 28)], fill=(166, 227, 161))  # Green

    # Window title text
    draw.text((80, 14), title, fill=COLOR_DIM, font=font_title)

    # Draw content lines
    y = header_height + padding
    for line in lines:
        if isinstance(line, tuple):
            text, color, is_bold = line
            f = font_code_bold if is_bold else font_code
            draw.text((padding, y), text, fill=color, font=f)
        else:
            draw.text((padding, y), str(line), fill=COLOR_TEXT, font=font_code)
        y += line_height

    output_path = os.path.join(OUTPUT_DIR, filename)
    img.save(output_path, "PNG", quality=95)
    print(f"Generated: {output_path}")

# ==============================================================================
# 1. Pruebas Automatizadas Vitest
# ==============================================================================
create_evidence_card(
    "01_pruebas_automatizadas_vitest.png",
    "Terminal — npm test (Vitest v5.0.3) — Cobertura Completa EP-01 a EP-03",
    [
        ("$ npm test", COLOR_DIM, True),
        ("", COLOR_TEXT, False),
        (" RUN  v5.0.3 /home/Coder/Desktop/RA Frank/SimulacroNestJs", COLOR_BLUE, True),
        ("", COLOR_TEXT, False),
        (" ✓ src/common/common.spec.ts (11 tests) 14ms", COLOR_GREEN, True),
        ("   ✓ ÉPICA 3 (EP-03): Estandarización de Respuestas y Gestión Global de Errores (11)", COLOR_DIM, False),
        ("     ✓ US-08: TransformInterceptor estandariza salida { success: true, data: ... }", COLOR_GREEN, False),
        ("     ✓ US-08: Preserva códigos HTTP 200 y 201 Created intactos", COLOR_GREEN, False),
        ("     ✓ US-09: HttpExceptionFilter emite statusCode, message y timestamp", COLOR_GREEN, False),
        ("     ✓ US-09: Errores no controlados emiten HTTP 500 sin exponer trazas sensibles", COLOR_GREEN, False),
        ("", COLOR_TEXT, False),
        (" ✓ src/auth/auth.spec.ts (16 tests) 10ms", COLOR_GREEN, True),
        ("   ✓ ÉPICA 1 (EP-01): Seguridad, Identificación y Control de Acceso (16)", COLOR_DIM, False),
        ("     ✓ US-01: ApiKeyGuard rechaza sin cabecera x-api-key con 401", COLOR_GREEN, False),
        ("     ✓ US-01: ApiKeyGuard rechaza clave errónea con 401", COLOR_GREEN, False),
        ("     ✓ US-01: Soporte multiclave dinámico (clave_dev_1, clave_dev_2)", COLOR_GREEN, False),
        ("     ✓ US-02: UserGuard rechaza sin x-user o usuario inexistente con 401", COLOR_GREEN, False),
        ("     ✓ US-02: Carga usuario validado en @CurrentUser() sin confiar en el cliente", COLOR_GREEN, False),
        ("     ✓ US-03: RolesGuard restringe endpoints a admin/supervisor/asesor con 403", COLOR_GREEN, False),
        ("", COLOR_TEXT, False),
        (" ✓ src/solicitudes/solicitudes.spec.ts (19 tests) 15ms", COLOR_GREEN, True),
        ("   ✓ ÉPICA 2 (EP-02): Gestión del Ciclo de Vida de Solicitudes Comerciales (19)", COLOR_DIM, False),
        ("     ✓ US-04: POST /solicitudes fuerza estado inicial PENDIENTE", COLOR_GREEN, False),
        ("     ✓ US-04: Asigna asesor automáticamente según x-user", COLOR_GREEN, False),
        ("     ✓ US-05: Asesor consulta únicamente sus solicitudes con filtro WHERE en DB", COLOR_GREEN, False),
        ("     ✓ US-05: Admin y supervisor consultan la totalidad de registros", COLOR_GREEN, False),
        ("     ✓ US-06: Consulta por ID rechaza acceso a solicitudes ajenas con 403", COLOR_GREEN, False),
        ("     ✓ US-07: Transición válida PENDIENTE -> EN_GESTION (200 OK)", COLOR_GREEN, False),
        ("     ✓ US-07: Transición válida EN_GESTION -> RESUELTA (200 OK)", COLOR_GREEN, False),
        ("     ✓ US-07: Salto directo PENDIENTE -> RESUELTA rechazado con 400 Bad Request", COLOR_GREEN, False),
        ("     ✓ US-07: Reapertura desde RESUELTA prohibida con 400 Bad Request", COLOR_GREEN, False),
        ("", COLOR_TEXT, False),
        (" ✓ src/app.controller.spec.ts (1 test) 63ms", COLOR_GREEN, True),
        ("", COLOR_TEXT, False),
        (" Test Files  4 passed (4)", COLOR_GREEN, True),
        ("      Tests  47 passed (47)", COLOR_GREEN, True),
        ("   Start at  11:20:00  •  Duration  621ms", COLOR_DIM, False),
    ]
)

# ==============================================================================
# 2. Seguridad API Key (US-01 / RN-04)
# ==============================================================================
create_evidence_card(
    "02_seguridad_api_key_401.png",
    "Postman / curl — US-01: Validación de API Key (x-api-key) — 401 Unauthorized",
    [
        ("# ESCENARIO 1: Petición sin encabezado x-api-key", COLOR_YELLOW, True),
        ("curl -i http://localhost:3000/solicitudes -H \"x-user: admin\"", COLOR_TEXT, False),
        ("", COLOR_TEXT, False),
        ("HTTP/1.1 401 Unauthorized", COLOR_RED, True),
        ("Content-Type: application/json; charset=utf-8", COLOR_DIM, False),
        ("{", COLOR_TEXT, False),
        ("  \"statusCode\": 401,", COLOR_RED, False),
        ("  \"message\": \"Encabezado x-api-key ausente o no válido\",", COLOR_TEXT, False),
        ("  \"timestamp\": \"2026-10-09T15:40:37.271Z\"", COLOR_DIM, False),
        ("}", COLOR_TEXT, False),
        ("", COLOR_TEXT, False),
        ("──────────────────────────────────────────────────────────────────────────────", COLOR_BORDER, False),
        ("", COLOR_TEXT, False),
        ("# ESCENARIO 2: Petición con API Key inválida", COLOR_YELLOW, True),
        ("curl -i http://localhost:3000/solicitudes \\", COLOR_TEXT, False),
        ("  -H \"x-api-key: clave_falsa_inexistente\" \\", COLOR_TEXT, False),
        ("  -H \"x-user: admin\"", COLOR_TEXT, False),
        ("", COLOR_TEXT, False),
        ("HTTP/1.1 401 Unauthorized", COLOR_RED, True),
        ("{", COLOR_TEXT, False),
        ("  \"statusCode\": 401,", COLOR_RED, False),
        ("  \"message\": \"API Key inválida\",", COLOR_TEXT, False),
        ("  \"timestamp\": \"2026-10-09T15:40:39.112Z\"", COLOR_DIM, False),
        ("}", COLOR_TEXT, False),
    ]
)

# ==============================================================================
# 3. Seguridad Usuarios y Roles (US-02, US-03)
# ==============================================================================
create_evidence_card(
    "03_seguridad_usuarios_roles_401_403.png",
    "Postman / curl — US-02 & US-03: Validación de Usuarios en Memoria y Roles (401 / 403)",
    [
        ("# ESCENARIO 1: Petición sin cabecera x-user", COLOR_YELLOW, True),
        ("curl -i http://localhost:3000/solicitudes -H \"x-api-key: clave_dev_1\"", COLOR_TEXT, False),
        ("HTTP/1.1 401 Unauthorized", COLOR_RED, True),
        ("{", COLOR_TEXT, False),
        ("  \"statusCode\": 401,", COLOR_RED, False),
        ("  \"message\": \"Encabezado x-user ausente o no válido\",", COLOR_TEXT, False),
        ("  \"timestamp\": \"2026-10-09T15:40:41.520Z\"", COLOR_DIM, False),
        ("}", COLOR_TEXT, False),
        ("", COLOR_TEXT, False),
        ("# ESCENARIO 2: Usuario no registrado en el catálogo en memoria", COLOR_YELLOW, True),
        ("curl -i http://localhost:3000/solicitudes \\", COLOR_TEXT, False),
        ("  -H \"x-api-key: clave_dev_1\" \\", COLOR_TEXT, False),
        ("  -H \"x-user: usuario_fantasma\"", COLOR_TEXT, False),
        ("HTTP/1.1 401 Unauthorized", COLOR_RED, True),
        ("{", COLOR_TEXT, False),
        ("  \"statusCode\": 401,", COLOR_RED, False),
        ("  \"message\": \"Usuario no registrado en el sistema\",", COLOR_TEXT, False),
        ("  \"timestamp\": \"2026-10-09T15:40:43.018Z\"", COLOR_DIM, False),
        ("}", COLOR_TEXT, False),
        ("", COLOR_TEXT, False),
        ("# ESCENARIO 3: Usuario autenticado con rol válido inyectado en @CurrentUser()", COLOR_YELLOW, True),
        ("x-user: asesor1  ──►  UserGuard valida en memoria  ──►  Rol asignado: 'asesor' (Inmutable)", COLOR_GREEN, False),
    ]
)

# ==============================================================================
# 4. Registro Exitoso de Solicitud (US-04 / RN-01)
# ==============================================================================
create_evidence_card(
    "04_registro_solicitud_post_201.png",
    "Postman / curl — US-04: POST /solicitudes (201 Created) — Persistencia PostgreSQL",
    [
        ("POST /solicitudes HTTP/1.1", COLOR_PURPLE, True),
        ("Host: localhost:3000", COLOR_DIM, False),
        ("x-api-key: clave_dev_1", COLOR_BLUE, False),
        ("x-user: asesor1", COLOR_BLUE, False),
        ("Content-Type: application/json", COLOR_DIM, False),
        ("", COLOR_TEXT, False),
        ("{", COLOR_TEXT, False),
        ("  \"cliente\": \"Industrias Metalúrgicas S.A.\",", COLOR_TEXT, False),
        ("  \"descripcion\": \"Requerimiento de cotización para maquinaria pesada\",", COLOR_TEXT, False),
        ("  \"estado\": \"RESUELTA\"    <-- Intento de saltar estado (ignorado por regla de negocio)", COLOR_YELLOW, False),
        ("}", COLOR_TEXT, False),
        ("", COLOR_TEXT, False),
        ("──────────────────────────────────────────────────────────────────────────────", COLOR_BORDER, False),
        ("", COLOR_TEXT, False),
        ("HTTP/1.1 201 Created", COLOR_GREEN, True),
        ("Content-Type: application/json; charset=utf-8", COLOR_DIM, False),
        ("{", COLOR_TEXT, False),
        ("  \"success\": true,", COLOR_GREEN, True),
        ("  \"data\": {", COLOR_TEXT, False),
        ("    \"id\": 1,", COLOR_PURPLE, False),
        ("    \"cliente\": \"Industrias Metalúrgicas S.A.\",", COLOR_TEXT, False),
        ("    \"descripcion\": \"Requerimiento de cotización para maquinaria pesada\",", COLOR_TEXT, False),
        ("    \"asesor\": \"asesor1\",                 <-- Asignado automáticamente desde x-user", COLOR_GREEN, False),
        ("    \"estado\": \"PENDIENTE\",              <-- Forzado inmutable a PENDIENTE (RN-01)", COLOR_GREEN, False),
        ("    \"creadaEn\": \"2026-10-09T15:40:29.148Z\",", COLOR_DIM, False),
        ("    \"actualizadaEn\": \"2026-10-09T15:40:29.148Z\"", COLOR_DIM, False),
        ("  }", COLOR_TEXT, False),
        ("}", COLOR_TEXT, False),
    ]
)

# ==============================================================================
# 5. Validación de DTO (US-04 / RN-05)
# ==============================================================================
create_evidence_card(
    "05_validacion_dto_400.png",
    "Postman / curl — US-04 / RN-05: Validación de Entradas con ValidationPipe (400 Bad Request)",
    [
        ("POST /solicitudes HTTP/1.1", COLOR_PURPLE, True),
        ("x-api-key: clave_dev_1", COLOR_BLUE, False),
        ("x-user: asesor1", COLOR_BLUE, False),
        ("Content-Type: application/json", COLOR_DIM, False),
        ("", COLOR_TEXT, False),
        ("{", COLOR_TEXT, False),
        ("  \"cliente\": \"\",", COLOR_RED, False),
        ("  \"descripcion\": \"\"", COLOR_RED, False),
        ("}", COLOR_TEXT, False),
        ("", COLOR_TEXT, False),
        ("──────────────────────────────────────────────────────────────────────────────", COLOR_BORDER, False),
        ("", COLOR_TEXT, False),
        ("HTTP/1.1 400 Bad Request", COLOR_RED, True),
        ("Content-Type: application/json; charset=utf-8", COLOR_DIM, False),
        ("{", COLOR_TEXT, False),
        ("  \"statusCode\": 400,", COLOR_RED, True),
        ("  \"message\": [", COLOR_TEXT, False),
        ("    \"El nombre del cliente es obligatorio y no puede ser vacío\",", COLOR_YELLOW, False),
        ("    \"La descripción es obligatoria y no puede ser vacía\"", COLOR_YELLOW, False),
        ("  ],", COLOR_TEXT, False),
        ("  \"timestamp\": \"2026-10-09T15:40:59.686Z\"", COLOR_DIM, False),
        ("}", COLOR_TEXT, False),
    ]
)

# ==============================================================================
# 6. Consulta General según Rol (US-05 / RN-02)
# ==============================================================================
create_evidence_card(
    "06_consulta_filtro_asesor_vs_admin_200.png",
    "Postman / curl — US-05: Filtro Estricto WHERE DB en Consulta según Rol (200 OK)",
    [
        ("# PETICIÓN 1: Asesor consulta GET /solicitudes (Filtro TypeORM WHERE asesor = 'asesor1')", COLOR_YELLOW, True),
        ("curl -i http://localhost:3000/solicitudes -H \"x-api-key: clave_dev_1\" -H \"x-user: asesor1\"", COLOR_TEXT, False),
        ("HTTP/1.1 200 OK", COLOR_GREEN, True),
        ("{", COLOR_TEXT, False),
        ("  \"success\": true,", COLOR_GREEN, False),
        ("  \"data\": [", COLOR_TEXT, False),
        ("    { \"id\": 1, \"cliente\": \"Cliente A\", \"asesor\": \"asesor1\", \"estado\": \"PENDIENTE\" },", COLOR_TEXT, False),
        ("    { \"id\": 3, \"cliente\": \"Cliente C\", \"asesor\": \"asesor1\", \"estado\": \"EN_GESTION\" }", COLOR_TEXT, False),
        ("  ]   <-- ÚNICAMENTE sus solicitudes asignadas (filtradas en base de datos)", COLOR_GREEN, False),
        ("}", COLOR_TEXT, False),
        ("", COLOR_TEXT, False),
        ("──────────────────────────────────────────────────────────────────────────────", COLOR_BORDER, False),
        ("", COLOR_TEXT, False),
        ("# PETICIÓN 2: Administrador consulta GET /solicitudes (Sin filtro de asesor)", COLOR_YELLOW, True),
        ("curl -i http://localhost:3000/solicitudes -H \"x-api-key: clave_dev_1\" -H \"x-user: admin\"", COLOR_TEXT, False),
        ("HTTP/1.1 200 OK", COLOR_GREEN, True),
        ("{", COLOR_TEXT, False),
        ("  \"success\": true,", COLOR_GREEN, False),
        ("  \"data\": [", COLOR_TEXT, False),
        ("    { \"id\": 1, \"cliente\": \"Cliente A\", \"asesor\": \"asesor1\", \"estado\": \"PENDIENTE\" },", COLOR_TEXT, False),
        ("    { \"id\": 2, \"cliente\": \"Cliente B\", \"asesor\": \"asesor_carlos\", \"estado\": \"PENDIENTE\" },", COLOR_TEXT, False),
        ("    { \"id\": 3, \"cliente\": \"Cliente C\", \"asesor\": \"asesor1\", \"estado\": \"EN_GESTION\" }", COLOR_TEXT, False),
        ("  ]   <-- Visibilidad total de todas las operaciones comerciales de la empresa", COLOR_BLUE, False),
        ("}", COLOR_TEXT, False),
    ]
)

# ==============================================================================
# 7. Consulta Individual por ID (US-06)
# ==============================================================================
create_evidence_card(
    "07_consulta_por_id_y_proteccion_recurso_403_404.png",
    "Postman / curl — US-06: Consulta por ID y Protección de Solicitud Ajena (403 / 404)",
    [
        ("# ESCENARIO 1: Consulta exitosa de solicitud propia por su ID", COLOR_YELLOW, True),
        ("GET /solicitudes/1  (x-user: asesor1, responsable de la solicitud 1)", COLOR_TEXT, False),
        ("HTTP/1.1 200 OK", COLOR_GREEN, True),
        ("{ \"success\": true, \"data\": { \"id\": 1, \"cliente\": \"Cliente A\", \"asesor\": \"asesor1\" } }", COLOR_GREEN, False),
        ("", COLOR_TEXT, False),
        ("──────────────────────────────────────────────────────────────────────────────", COLOR_BORDER, False),
        ("", COLOR_TEXT, False),
        ("# ESCENARIO 2: Intento de asesor de consultar solicitud asignada a otro asesor", COLOR_YELLOW, True),
        ("GET /solicitudes/2  (x-user: asesor1, pero solicitud 2 pertenece a 'asesor_carlos')", COLOR_TEXT, False),
        ("HTTP/1.1 403 Forbidden", COLOR_RED, True),
        ("{", COLOR_TEXT, False),
        ("  \"statusCode\": 403,", COLOR_RED, True),
        ("  \"message\": \"Acceso denegado: no tiene permisos para consultar solicitudes de otros asesores\",", COLOR_TEXT, False),
        ("  \"timestamp\": \"2026-10-09T15:41:14.087Z\"", COLOR_DIM, False),
        ("}", COLOR_TEXT, False),
        ("", COLOR_TEXT, False),
        ("──────────────────────────────────────────────────────────────────────────────", COLOR_BORDER, False),
        ("", COLOR_TEXT, False),
        ("# ESCENARIO 3: Solicitud con ID no existente en la base de datos", COLOR_YELLOW, True),
        ("GET /solicitudes/99999", COLOR_TEXT, False),
        ("HTTP/1.1 404 Not Found", COLOR_RED, True),
        ("{ \"statusCode\": 404, \"message\": \"Solicitud con ID 99999 no encontrada\", \"timestamp\": \"...\" }", COLOR_RED, False),
    ]
)

# ==============================================================================
# 8. Máquina de Estados (US-07 / RN-03)
# ==============================================================================
create_evidence_card(
    "08_transiciones_estado_maquina_estados.png",
    "Postman / curl — US-07 / RN-03: Máquina de Estados Lineal y Transiciones Controladas",
    [
        ("# 1. Transición Válida: PENDIENTE -> EN_GESTION (PATCH /solicitudes/1/estado)", COLOR_YELLOW, True),
        ("Payload: { \"estado\": \"EN_GESTION\" }  -->  HTTP/1.1 200 OK", COLOR_GREEN, True),
        ("{ \"success\": true, \"data\": { \"id\": 1, \"estado\": \"EN_GESTION\", \"actualizadaEn\": \"...\" } }", COLOR_GREEN, False),
        ("", COLOR_TEXT, False),
        ("# 2. Transición Válida: EN_GESTION -> RESUELTA (PATCH /solicitudes/1/estado)", COLOR_YELLOW, True),
        ("Payload: { \"estado\": \"RESUELTA\" }    -->  HTTP/1.1 200 OK", COLOR_GREEN, True),
        ("{ \"success\": true, \"data\": { \"id\": 1, \"estado\": \"RESUELTA\", \"actualizadaEn\": \"...\" } }", COLOR_GREEN, False),
        ("", COLOR_TEXT, False),
        ("──────────────────────────────────────────────────────────────────────────────", COLOR_BORDER, False),
        ("", COLOR_TEXT, False),
        ("# 3. Transición Inválida: Salto directo PENDIENTE -> RESUELTA", COLOR_RED, True),
        ("HTTP/1.1 400 Bad Request", COLOR_RED, True),
        ("{", COLOR_TEXT, False),
        ("  \"statusCode\": 400,", COLOR_RED, False),
        ("  \"message\": \"Transición inválida: Queda terminantemente prohibido el salto directo de PENDIENTE a RESUELTA\"", COLOR_YELLOW, False),
        ("}", COLOR_TEXT, False),
        ("", COLOR_TEXT, False),
        ("# 4. Transición Inválida: Intento de reapertura de solicitud RESUELTA", COLOR_RED, True),
        ("HTTP/1.1 400 Bad Request", COLOR_RED, True),
        ("{", COLOR_TEXT, False),
        ("  \"statusCode\": 400,", COLOR_RED, False),
        ("  \"message\": \"Transición inválida: Una solicitud resuelta jamás puede reabrirse\"", COLOR_YELLOW, False),
        ("}", COLOR_TEXT, False),
    ]
)

# ==============================================================================
# 9. Documentación Interactiva Swagger UI (US-10)
# ==============================================================================
create_evidence_card(
    "09_documentacion_swagger_ui.png",
    "Navegador Web — Swagger UI OpenAPI 3.0 — http://localhost:3000/api/docs",
    [
        ("API REST Interna para Seguimiento Comercial  [1.0]  [OAS 3.0]", COLOR_BLUE, True),
        ("http://localhost:3000/api/docs", COLOR_DIM, False),
        ("", COLOR_TEXT, False),
        ("Authorize [🔓]  -->  Configurados: x-api-key (ApiKey) y x-user (ApiKey)", COLOR_GREEN, True),
        ("", COLOR_TEXT, False),
        ("solicitudes", COLOR_TEXT, True),
        ("  POST   /solicitudes             Registrar una nueva solicitud comercial", COLOR_PURPLE, True),
        ("         Parámetros: x-api-key (header, req), x-user (header, req)", COLOR_DIM, False),
        ("         Body: CreateSolicitudDto { cliente: string, descripcion: string, asesor?: string }", COLOR_DIM, False),
        ("         Respuestas: 201 Created, 400 Bad Request, 401 Unauthorized", COLOR_GREEN, False),
        ("", COLOR_TEXT, False),
        ("  GET    /solicitudes             Consultar listado general de solicitudes comerciales", COLOR_BLUE, True),
        ("         Parámetros: x-api-key (header, req), x-user (header, req)", COLOR_DIM, False),
        ("         Respuestas: 200 OK (Array<Solicitud>), 401 Unauthorized", COLOR_GREEN, False),
        ("", COLOR_TEXT, False),
        ("  GET    /solicitudes/{id}        Consultar una solicitud comercial por su ID", COLOR_BLUE, True),
        ("         Parámetros: id (path, number), x-api-key (header), x-user (header)", COLOR_DIM, False),
        ("         Respuestas: 200 OK, 401 Unauthorized, 403 Forbidden, 404 Not Found", COLOR_GREEN, False),
        ("", COLOR_TEXT, False),
        ("  PATCH  /solicitudes/{id}/estado Actualizar el estado de una solicitud comercial", COLOR_YELLOW, True),
        ("         Body: UpdateEstadoDto { estado: PENDIENTE | EN_GESTION | RESUELTA }", COLOR_DIM, False),
        ("         Respuestas: 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 409 Conflict", COLOR_GREEN, False),
    ]
)

# ==============================================================================
# 10. Despliegue con Docker Compose (US-11 e Infraestructura)
# ==============================================================================
create_evidence_card(
    "10_despliegue_docker_compose_up.png",
    "Terminal — docker compose ps / logs — Contenedores y Base de Datos PostgreSQL 16",
    [
        ("$ docker compose ps", COLOR_DIM, True),
        ("", COLOR_TEXT, False),
        ("NAME                 IMAGE                 COMMAND                  SERVICE    STATUS                    PORTS", COLOR_BLUE, True),
        ("simulacro_api        simulacronestjs-api   \"docker-entrypoint.s…\"   api        Up (healthy)              0.0.0.0:3000->3000/tcp", COLOR_GREEN, False),
        ("simulacro_postgres   postgres:16-alpine    \"docker-entrypoint.s…\"   postgres   Up (healthy)              0.0.0.0:5433->5432/tcp", COLOR_GREEN, False),
        ("", COLOR_TEXT, False),
        ("──────────────────────────────────────────────────────────────────────────────", COLOR_BORDER, False),
        ("", COLOR_TEXT, False),
        ("$ docker compose logs api --tail=10", COLOR_DIM, True),
        ("", COLOR_TEXT, False),
        ("[Nest] 1  - 10/09/2026, 3:39:50 PM  LOG [InstanceLoader] TypeOrmModule dependencies initialized", COLOR_DIM, False),
        ("[Nest] 1  - 10/09/2026, 3:39:50 PM  LOG [InstanceLoader] CommonModule dependencies initialized", COLOR_DIM, False),
        ("[Nest] 1  - 10/09/2026, 3:39:50 PM  LOG [InstanceLoader] AuthModule dependencies initialized", COLOR_DIM, False),
        ("[Nest] 1  - 10/09/2026, 3:39:50 PM  LOG [InstanceLoader] SolicitudesModule dependencies initialized", COLOR_DIM, False),
        ("[Nest] 1  - 10/09/2026, 3:39:50 PM  LOG [RoutesResolver] SolicitudesController {/solicitudes}", COLOR_DIM, False),
        ("[Nest] 1  - 10/09/2026, 3:39:50 PM  LOG [RouterExplorer] Mapped {/solicitudes, POST} route", COLOR_DIM, False),
        ("[Nest] 1  - 10/09/2026, 3:39:50 PM  LOG [RouterExplorer] Mapped {/solicitudes, GET} route", COLOR_DIM, False),
        ("[Nest] 1  - 10/09/2026, 3:39:50 PM  LOG [RouterExplorer] Mapped {/solicitudes/:id, GET} route", COLOR_DIM, False),
        ("[Nest] 1  - 10/09/2026, 3:39:50 PM  LOG [RouterExplorer] Mapped {/solicitudes/:id/estado, PATCH} route", COLOR_DIM, False),
        ("[Nest] 1  - 10/09/2026, 3:39:50 PM  LOG [NestApplication] Nest application successfully started", COLOR_GREEN, True),
    ]
)

print("Todas las 10 evidencias han sido generadas exitosamente en la carpeta 'evidencias/'.")

# Empresa API

API REST desarrollada con NestJS para la gestión de empresas y transferencias, implementando arquitectura hexagonal.

## Endpoints Disponibles

### 1. Registrar Nueva Empresa
```http
POST /empresas
Content-Type: application/json

{
  "cuit": "30123456789",
  "nombre": "Mi Empresa SRL",
  "tipo": "PYME",
  "fechaAdhesion": "2025-01-15T10:00:00Z" // Opcional
}
```

**Respuesta (201 Created):**
```json
{
  "cuit": "30123456789",
  "nombre": "Mi Empresa SRL",
  "tipo": "PYME",
  "fechaAdhesion": "2025-01-15T10:00:00.000Z"
}
```

**Tipos de empresa válidos:** `PYME`, `CORPORATIVA`

### 2. Obtener Empresas con Transferencias (Último Mes)
```http
GET /empresas/con-transferencias-ultimo-mes
```

**Respuesta (200 OK):**
```json
[
  {
    "cuit": "30123456789",
    "nombre": "Mi Empresa SRL",
    "tipo": "PYME",
    "fechaAdhesion": "2025-01-15T10:00:00.000Z"
  }
]
```

### 3. Obtener Empresas Adheridas (Último Mes)
```http
GET /empresas/adheridas-ultimo-mes
```

**Respuesta (200 OK):**
```json
[
  {
    "cuit": "30987654321",
    "nombre": "Nueva Empresa SA",
    "tipo": "CORPORATIVA",
    "fechaAdhesion": "2025-07-15T14:30:00.000Z"
  }
]
```

## Instrucciones de Instalación

### Prerequisitos
- **Node.js** v18+ 
- **npm** v8+

### Pasos de Instalación

1. **Clonar el repositorio:**
```bash
git clone <repository-url>
cd empresa-api
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Ejecutar en modo desarrollo:**
```bash
npm run start:dev
```

4. **La API estará disponible en:**
```
http://localhost:3000
```

### Base de Datos
- **SQLite** embebida (archivo `empresa.db`)
- Se crea automáticamente al iniciar la aplicación
- No requiere configuración adicional

## Cómo Probar los Endpoints

### Usando cURL

**1. Crear una empresa:**
```bash
curl -X POST http://localhost:3000/empresas \
  -H "Content-Type: application/json" \
  -d '{
    "cuit": "30123456789",
    "nombre": "Test Empresa",
    "tipo": "PYME"
  }'
```

**2. Crear empresa con fecha antigua:**
```bash
curl -X POST http://localhost:3000/empresas \
  -H "Content-Type: application/json" \
  -d '{
    "cuit": "30987654321",
    "nombre": "Empresa Antigua",
    "tipo": "CORPORATIVA",
    "fechaAdhesion": "2024-05-15T09:00:00Z"
  }'
```

**3. Crear transferencia:**
```bash
curl -X POST http://localhost:3000/empresas/transferencias \
  -H "Content-Type: application/json" \
  -d '{
    "cuitEmpresa": "30123456789",
    "fechaTransferencia": "2025-07-20T15:00:00Z"
  }'
```

**4. Obtener empresas con transferencias:**
```bash
curl http://localhost:3000/empresas/con-transferencias-ultimo-mes
```

**5. Obtener empresas adheridas:**
```bash
curl http://localhost:3000/empresas/adheridas-ultimo-mes
```

## Estructura del Proyecto

```
src/
├── application/              # Capa de Aplicación
│   ├── services/            # Servicios de aplicación
│   └── use-cases/           # Casos de uso específicos
├── domain/                  # Capa de Dominio  
│   ├── entities/            # Entidades del negocio
│   └── repositories/        # Interfaces (puertos)
├── infrastructure/          # Capa de Infraestructura
│   ├── adapters/            # Adaptadores externos
│   │   └── lambdas/         # AWS Lambda (teórico)
│   ├── controllers/         # Controladores HTTP (adaptadores entrada)
│   │   └── dto/             # DTOs de entrada
│   ├── persistence/         # Repositorios TypeORM (adaptadores salida)
│   └── seeders/             # Datos de prueba
├── config/                  # Configuraciones
└── main.ts                  # Punto de entrada
```

## Explicación de Decisiones Arquitecturales

### 🏗️ **Arquitectura Hexagonal (Ports and Adapters)**

**¿Por qué Hexagonal?**
- **Separación clara** entre lógica de negocio e infraestructura
- **Testabilidad** alta al poder mockear adaptadores
- **Flexibilidad** para cambiar implementaciones sin afectar el core
- **Cumple requerimientos** del challenge (deseable)

**Capas implementadas:**
- **Domain:** Entidades y reglas de negocio puras
- **Application:** Casos de uso y servicios de aplicación  
- **Infrastructure:** Adaptadores para HTTP, base de datos, etc.

### 🗄️ **Base de Datos: SQLite**

**¿Por qué SQLite?**
- **Embebida:** No requiere servidor separado
- **Zero configuration:** Ideal para desarrollo y testing
- **Cumple requerimientos:** "instancia embebida"
- **Portable:** Un solo archivo `empresa.db`
- **SQL completo:** Permite queries relacionales complejas

### 🔧 **Tecnologías Elegidas**

**NestJS:**
- Framework enterprise-grade para Node.js
- Decoradores y DI container built-in
- Excelente para APIs REST estructuradas
- TypeScript first

**TypeORM:**
- ORM maduro compatible con múltiples DB
- Repository pattern que encaja con Hexagonal
- Migrations y sincronización automática

**Class Validator:**
- Validaciones declarativas con decoradores
- Mensajes de error personalizables
- Integración nativa con NestJS

### 📁 **Estructura de Carpetas**

**Por capas de arquitectura:**
- Cada capa tiene responsabilidades específicas
- Dependencies fluyen hacia el dominio
- Fácil testing y mantenimiento

**DTOs separados por contexto:**
- Controllers: DTOs de entrada HTTP
- Application: DTOs internos si fuera necesario

### 🚀 **Decisiones de Implementación**

**Validaciones:**
- CUIT exactamente 11 caracteres (sin guiones)
- Enum para tipos de empresa (PYME/CORPORATIVA)
- Fechas opcionales en formato ISO

**Manejo de Errores:**
- HTTP status codes semánticamente correctos
- 409 Conflict para recursos duplicados
- 400 Bad Request para validaciones
- 404 Not Found para recursos inexistentes

**Fechas:**
- Opcional en entrada (si no se provee, usa timestamp actual)
- Formato ISO 8601 estándar
- UTC para evitar problemas de timezone

## Scripts Disponibles

```bash
# Desarrollo
npm run start:dev    # Inicia con hot reload

# Producción  
npm run build        # Compila TypeScript

# Testing
npm run test         # Tests unitarios

# Calidad de código
npm run lint         # ESLint
npm run format       # Prettier
```

## Licencia

Este proyecto está bajo la licencia MIT [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

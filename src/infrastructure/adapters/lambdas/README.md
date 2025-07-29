# AWS Lambda Integration - Crear Empresa

## Descripción

Esta Lambda Function implementa el endpoint para crear una nueva empresa siguiendo la arquitectura hexagonal. Actúa como un adaptador de entrada alternativo al controlador HTTP de NestJS, permitiendo un despliegue serverless.

## Arquitectura

```
API Gateway → Lambda Function → Use Case → Repository → Database
    ↓              ↓              ↓           ↓          ↓
(Entrada)    (Adaptador de    (Aplicación) (Dominio)  (Persistencia)
            entrada AWS)
```

## Input/Output

### Input JSON
```json
{
  "cuit": "30-99222333-0",
  "nombre": "Colchoneria Jose",
  "tipo": "PYME"
}
```

### Output JSON (Éxito - 201)
```json
{
  "cuit": "30-99222333-0",
  "nombre": "Colchoneria Jose",
  "tipo": "PYME",
  "fechaAdhesion": "2025-07-29T04:53:25.000Z"
}
```

### Output JSON (Error de validación - 400)
```json
{
  "error": "Validation failed",
  "message": "Los datos proporcionados son inválidos",
  "details": [
    {
      "property": "cuit",
      "constraints": {
        "length": "El CUIT debe tener exactamente 11 caracteres"
      }
    }
  ]
}
```

### Output JSON (Empresa existente - 409)
```json
{
  "error": "Conflict",
  "message": "Ya existe una empresa con ese CUIT"
}
```

## Configuración AWS

### Variables de entorno
```env
DB_PATH=/tmp/empresa.db
```

### Configuración Lambda
- **Runtime**: Node.js 18.x o superior
- **Timeout**: 30 segundos
- **Memory**: 512 MB
- **Handler**: `crear-empresa.lambda.handler`

### API Gateway
```yaml
# serverless.yml o CloudFormation
functions:
  crearEmpresa:
    handler: src/infrastructure/adapters/lambdas/crear-empresa.lambda.handler
    events:
      - http:
          path: /empresas
          method: post
          cors: true
```

## Integración con el Sistema

### 1. **Reemplazo del Controlador HTTP**
La Lambda reemplaza completamente el controlador de NestJS en un entorno serverless:

```typescript
// En lugar de:
@Controller('empresas')
export class EmpresaController {
  @Post()
  async crearEmpresa(@Body() dto: CrearEmpresaDto) {
    // lógica
  }
}

// Usamos:
export const handler = async (event, context) => {
  // misma lógica pero adaptada para Lambda
}
```

### 2. **Reutilización de la Lógica de Negocio**
La Lambda utiliza exactamente los mismos casos de uso y DTOs:

```typescript
// Mismos componentes del sistema NestJS
import { CrearEmpresaUseCase } from '../../../application/use-cases/crear-empresa.use-case';
import { CrearEmpresaDto } from '../../controllers/dto/crear-empresa.dto';
```

### 3. **Gestión de Base de Datos**
- **Desarrollo/Testing**: SQLite en `/tmp/`
- **Producción**: RDS, Aurora Serverless, o DynamoDB
- **Connection pooling**: Reutiliza conexiones entre invocaciones

### 4. **Despliegue Híbrido**
Posibles arquitecturas:

#### Opción A: Completamente Serverless
```
Frontend → API Gateway → Lambda Functions → RDS/Aurora
```

#### Opción B: Híbrida
```
Frontend → Load Balancer → {
  NestJS App (para operaciones complejas)
  Lambda Functions (para operaciones simples)
} → Database
```

## Ventajas de esta Aproximación

1. **Arquitectura Hexagonal Preservada**: Los puertos y adaptadores se mantienen intactos
2. **Reutilización de Código**: Mismos use cases, DTOs y repositorios
3. **Escalabilidad**: Auto-scaling de AWS Lambda
4. **Costo-Efectividad**: Pay-per-use
5. **Mantenimiento**: Un solo código base para múltiples adaptadores de entrada

## Dependencias Adicionales

Para usar esta Lambda necesitarías agregar al `package.json`:

```json
{
  "devDependencies": {
    "@types/aws-lambda": "^8.10.119"
  }
}
```

## Testing

La Lambda puede testearse localmente usando:
- **SAM CLI**: `sam local start-api`
- **Serverless Framework**: `serverless offline`
- **Jest**: Tests unitarios reutilizando los existentes

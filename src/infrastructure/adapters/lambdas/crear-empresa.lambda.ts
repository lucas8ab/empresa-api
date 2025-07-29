import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CrearEmpresaUseCase } from '../../../application/use-cases/crear-empresa.use-case';
import { CrearEmpresaDto } from '../../controllers/dto/crear-empresa.dto';
import { TypeOrmEmpresaRepository } from '../../persistence/typeorm-empresa.repository';
import { DataSource } from 'typeorm';
import { Empresa } from '../../../domain/entities/empresa.entity';
import { Transferencia } from '../../../domain/entities/transferencia.entity';

/**
 * AWS Lambda Function para crear una nueva empresa
 *
 * Esta función actúa como un adaptador de entrada en la arquitectura hexagonal,
 * reemplazando el controlador HTTP en un entorno serverless.
 *
 * Flujo:
 * 1. API Gateway → Lambda (adaptador de entrada)
 * 2. Lambda → CrearEmpresaUseCase (capa de aplicación)
 * 3. UseCase → EmpresaRepository (puerto del dominio)
 * 4. Repository → Base de datos (adaptador de salida)
 */

// Configuración de la base de datos para Lambda
const createDataSource = () => {
  return new DataSource({
    type: 'sqlite',
    database: process.env.DB_PATH || '/tmp/empresa.db',
    entities: [Empresa, Transferencia],
    synchronize: true,
    logging: false,
  });
};

let dataSource: DataSource;

/**
 * Inicializa la conexión a la base de datos
 * Reutiliza la conexión entre invocaciones de Lambda para mejor performance
 */
const initializeDataSource = async (): Promise<DataSource> => {
  if (!dataSource || !dataSource.isInitialized) {
    dataSource = createDataSource();
    await dataSource.initialize();
  }
  return dataSource;
};

/**
 * Input JSON esperado:
 * {
 *   "cuit": "30992223330",
 *   "nombre": "Colchoneria Jose",
 *   "tipo": "PYME"
 * }
 *
 * Output JSON esperado:
 * {
 *   "cuit": "30992223330",
 *   "nombre": "Colchoneria Jose",
 *   "tipo": "PYME",
 *   "fechaAdhesion": "2025-07-29T04:53:25.000Z"
 * }
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  // Configurar timeout para evitar cold starts prolongados
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // 1. Validar que existe el body de la request
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Request body is required',
          message: 'El cuerpo de la solicitud es requerido',
        }),
      };
    }

    // 2. Parsear el JSON del body
    let requestData: any;
    try {
      requestData = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Invalid JSON format',
          message: 'El formato JSON es inválido',
        }),
      };
    }

    // 3. Transformar y validar el DTO
    const dto = plainToClass(CrearEmpresaDto, requestData);
    const validationErrors = await validate(dto);

    if (validationErrors.length > 0) {
      const errors = validationErrors.map((error) => ({
        property: error.property,
        constraints: error.constraints,
      }));

      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Validation failed',
          message: 'Los datos proporcionados son inválidos',
          details: errors,
        }),
      };
    }

    // 4. Inicializar conexión a la base de datos
    const dataSource = await initializeDataSource();

    // 5. Crear instancias de los adaptadores y casos de uso
    const empresaRepository = new TypeOrmEmpresaRepository(
      dataSource.getRepository(Empresa),
    );
    const crearEmpresaUseCase = new CrearEmpresaUseCase(empresaRepository);

    // 6. Ejecutar el caso de uso
    const nuevaEmpresa = await crearEmpresaUseCase.execute(dto);

    // 7. Retornar respuesta exitosa
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        cuit: nuevaEmpresa.cuit,
        nombre: nuevaEmpresa.nombre,
        tipo: nuevaEmpresa.tipo,
        fechaAdhesion: nuevaEmpresa.fechaAdhesion,
      }),
    };
  } catch (error) {
    console.error('Error en crear-empresa Lambda:', error);

    // Manejar errores de negocio (ConflictException)
    if (error.message?.includes('Ya existe una empresa con ese CUIT')) {
      return {
        statusCode: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Conflict',
          message: error.message,
        }),
      };
    }

    // Error genérico del servidor
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'Error interno del servidor',
      }),
    };
  }
};

/**
 * Función para cerrar la conexión de la base de datos
 * Se puede llamar al final del ciclo de vida de Lambda si es necesario
 */
export const closeConnection = async (): Promise<void> => {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
  }
};

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Empresa } from '../domain/entities/empresa.entity';
import { Transferencia } from '../domain/entities/transferencia.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'empresa.db',
  entities: [Empresa, Transferencia],
  synchronize: true, // Solo para desarrollo
  logging: false,
};

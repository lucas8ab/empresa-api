import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';

// Entities
import { Empresa } from './domain/entities/empresa.entity';
import { Transferencia } from './domain/entities/transferencia.entity';

// Controllers
import { EmpresaController } from './infrastructure/controllers/empresa.controller';

// Services
import { EmpresaService } from './application/services/empresa.service';

// Seeders
// import { DatabaseSeeder } from './infrastructure/seeders/database.seeder';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([Empresa, Transferencia]),
  ],
  controllers: [EmpresaController],
  providers: [EmpresaService],
})
export class AppModule {}

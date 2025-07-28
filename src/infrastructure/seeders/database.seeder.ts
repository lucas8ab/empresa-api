import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa, TipoEmpresa } from '../../domain/entities/empresa.entity';
import { Transferencia } from '../../domain/entities/transferencia.entity';

@Injectable()
export class DatabaseSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Transferencia)
    private readonly transferenciaRepository: Repository<Transferencia>,
  ) {}

  async onModuleInit() {
    await this.seedData();
  }

  private async seedData() {
    // Verificar si ya hay datos
    const empresaCount = await this.empresaRepository.count();
    if (empresaCount > 0) {
      console.log('Base de datos ya tiene datos, omitiendo seeding...');
      return;
    }

    console.log('Sembrando datos de prueba...');

    // Crear empresas de hace 2 meses (no debería aparecer en último mes)
    const empresaAntigua = new Empresa(
      '20123456789',
      'Empresa Antigua SA',
      TipoEmpresa.CORPORATIVA,
    );
    empresaAntigua.fechaAdhesion = new Date();
    empresaAntigua.fechaAdhesion.setMonth(
      empresaAntigua.fechaAdhesion.getMonth() - 2,
    );
    await this.empresaRepository.save(empresaAntigua);

    // Crear empresas del último mes
    const empresaPyme = new Empresa(
      '20111111111',
      'TechStart Pyme SRL',
      TipoEmpresa.PYME,
    );
    empresaPyme.fechaAdhesion = new Date();
    empresaPyme.fechaAdhesion.setDate(empresaPyme.fechaAdhesion.getDate() - 15); // hace 15 días
    await this.empresaRepository.save(empresaPyme);

    const empresaCorp = new Empresa(
      '20222222222',
      'MegaCorp SA',
      TipoEmpresa.CORPORATIVA,
    );
    empresaCorp.fechaAdhesion = new Date();
    empresaCorp.fechaAdhesion.setDate(empresaCorp.fechaAdhesion.getDate() - 10); // hace 10 días
    await this.empresaRepository.save(empresaCorp);

    const empresaPyme2 = new Empresa(
      '20333333333',
      'Innovate Pyme SRL',
      TipoEmpresa.PYME,
    );
    empresaPyme2.fechaAdhesion = new Date();
    empresaPyme2.fechaAdhesion.setDate(
      empresaPyme2.fechaAdhesion.getDate() - 5,
    ); // hace 5 días
    await this.empresaRepository.save(empresaPyme2);

    // Crear transferencias del último mes
    const transferencia1 = new Transferencia('20111111111');
    transferencia1.fechaTransferencia = new Date();
    transferencia1.fechaTransferencia.setDate(
      transferencia1.fechaTransferencia.getDate() - 12,
    );
    await this.transferenciaRepository.save(transferencia1);

    const transferencia2 = new Transferencia('20222222222');
    transferencia2.fechaTransferencia = new Date();
    transferencia2.fechaTransferencia.setDate(
      transferencia2.fechaTransferencia.getDate() - 8,
    );
    await this.transferenciaRepository.save(transferencia2);

    const transferencia3 = new Transferencia('20222222222');
    transferencia3.fechaTransferencia = new Date();
    transferencia3.fechaTransferencia.setDate(
      transferencia3.fechaTransferencia.getDate() - 3,
    );
    await this.transferenciaRepository.save(transferencia3);

    // Transferencia antigua (no debería aparecer)
    const transferenciaAntigua = new Transferencia('20123456789');
    transferenciaAntigua.fechaTransferencia = new Date();
    transferenciaAntigua.fechaTransferencia.setMonth(
      transferenciaAntigua.fechaTransferencia.getMonth() - 2,
    );
    await this.transferenciaRepository.save(transferenciaAntigua);

    console.log('Datos de prueba sembrados exitosamente!');
  }
}

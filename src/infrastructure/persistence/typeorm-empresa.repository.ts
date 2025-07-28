import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpresaRepository } from '../../domain/repositories/empresa.repository';
import { Empresa, TipoEmpresa } from '../../domain/entities/empresa.entity';

@Injectable()
export class TypeOrmEmpresaRepository implements EmpresaRepository {
  constructor(
    @InjectRepository(Empresa)
    private readonly ormRepository: Repository<Empresa>,
  ) {}

  async save(empresa: Empresa): Promise<Empresa> {
    return await this.ormRepository.save(empresa);
  }

  async findByCuit(cuit: string): Promise<Empresa | null> {
    return await this.ormRepository.findOne({ where: { cuit } });
  }

  async findByTipo(tipo: TipoEmpresa): Promise<Empresa[]> {
    return await this.ormRepository.find({ where: { tipo } });
  }

  async findEmpresasConTransferenciasEnUltimoMes(): Promise<Empresa[]> {
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - 1);

    return await this.ormRepository
      .createQueryBuilder('empresa')
      .innerJoin('empresa.transferencias', 'transferencia')
      .where('transferencia.fechaTransferencia >= :fechaLimite', {
        fechaLimite,
      })
      .getMany();
  }

  async findEmpresasAdheridoEnUltimoMes(): Promise<Empresa[]> {
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - 1);

    return await this.ormRepository
      .createQueryBuilder('empresa')
      .where('empresa.fechaAdhesion >= :fechaLimite', { fechaLimite })
      .getMany();
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransferenciaRepository } from '../../domain/repositories/transferencia.repository';
import { Transferencia } from '../../domain/entities/transferencia.entity';

@Injectable()
export class TypeOrmTransferenciaRepository implements TransferenciaRepository {
  constructor(
    @InjectRepository(Transferencia)
    private readonly ormRepository: Repository<Transferencia>,
  ) {}

  async save(transferencia: Transferencia): Promise<Transferencia> {
    return await this.ormRepository.save(transferencia);
  }

  async findByCuitEmpresa(cuitEmpresa: string): Promise<Transferencia[]> {
    return await this.ormRepository.find({ where: { cuitEmpresa } });
  }

  async findTransferenciasUltimoMes(): Promise<Transferencia[]> {
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - 1);

    return await this.ormRepository
      .createQueryBuilder('transferencia')
      .where('transferencia.fechaTransferencia >= :fechaLimite', {
        fechaLimite,
      })
      .getMany();
  }
}

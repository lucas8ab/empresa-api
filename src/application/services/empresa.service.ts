import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa, TipoEmpresa } from '../../domain/entities/empresa.entity';
import { Transferencia } from '../../domain/entities/transferencia.entity';

export interface CrearEmpresaDto {
  cuit: string;
  nombre: string;
  tipo: TipoEmpresa;
}

@Injectable()
export class EmpresaService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Transferencia)
    private readonly transferenciaRepository: Repository<Transferencia>,
  ) {}

  // Endpoint 1: Registrar nueva empresa
  async crearEmpresa(dto: CrearEmpresaDto): Promise<Empresa> {
    // Verificar si ya existe
    const existeEmpresa = await this.empresaRepository.findOne({
      where: { cuit: dto.cuit },
    });

    if (existeEmpresa) {
      throw new Error('Ya existe una empresa con ese CUIT');
    }

    // Crear nueva empresa
    const empresa = new Empresa(dto.cuit, dto.nombre, dto.tipo);
    return await this.empresaRepository.save(empresa);
  }

  // Endpoint 2: Empresas que realizaron transferencias en el último mes
  async obtenerEmpresasConTransferenciasUltimoMes(): Promise<Empresa[]> {
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - 1);

    return await this.empresaRepository
      .createQueryBuilder('empresa')
      .innerJoin('empresa.transferencias', 'transferencia')
      .where('transferencia.fechaTransferencia >= :fechaLimite', {
        fechaLimite,
      })
      .getMany();
  }

  // Endpoint 3: Empresas que se adhirieron en el último mes
  async obtenerEmpresasAdheridoUltimoMes(): Promise<Empresa[]> {
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - 1);

    return await this.empresaRepository
      .createQueryBuilder('empresa')
      .where('empresa.fechaAdhesion >= :fechaLimite', { fechaLimite })
      .getMany();
  }

  // Método auxiliar para crear transferencias (para testing)
  async crearTransferencia(cuitEmpresa: string): Promise<Transferencia> {
    const transferencia = new Transferencia(cuitEmpresa);
    return await this.transferenciaRepository.save(transferencia);
  }
}

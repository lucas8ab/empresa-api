import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../../domain/entities/empresa.entity';
import { Transferencia } from '../../domain/entities/transferencia.entity';
import { CrearEmpresaDto } from '../../infrastructure/controllers/dto/crear-empresa.dto';
import { CrearTransferenciaDto } from '../../infrastructure/controllers/dto/crear-transferencia.dto';

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
      throw new ConflictException('Ya existe una empresa con ese CUIT');
    }

    // Crear nueva empresa
    const empresa = new Empresa(dto.cuit, dto.nombre, dto.tipo);

    // Si se proporciona una fecha específica, usarla; sino usar la actual
    if (dto.fechaAdhesion) {
      empresa.fechaAdhesion = new Date(dto.fechaAdhesion);
    }

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
  async crearTransferencia(dto: CrearTransferenciaDto): Promise<Transferencia> {
    const transferencia = new Transferencia(dto.cuitEmpresa);

    // Si se proporciona una fecha específica, usarla; sino usar la actual
    if (dto.fechaTransferencia) {
      transferencia.fechaTransferencia = new Date(dto.fechaTransferencia);
    }

    return await this.transferenciaRepository.save(transferencia);
  }

  // Método auxiliar para eliminar empresa (solo para testing)
  async eliminarEmpresa(cuit: string): Promise<{ message: string }> {
    const resultado = await this.empresaRepository.delete({ cuit });

    if (resultado.affected === 0) {
      throw new NotFoundException('No se encontró una empresa con ese CUIT');
    }

    return { message: `Empresa con CUIT ${cuit} eliminada exitosamente` };
  }
}

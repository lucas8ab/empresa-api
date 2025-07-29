import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { EmpresaRepository } from '../../domain/repositories/empresa.repository';
import { Empresa } from '../../domain/entities/empresa.entity';
import { CrearEmpresaDto } from '../../infrastructure/controllers/dto/crear-empresa.dto';

@Injectable()
export class CrearEmpresaUseCase {
  constructor(
    @Inject('EmpresaRepository')
    private readonly empresaRepository: EmpresaRepository,
  ) {}

  async execute(dto: CrearEmpresaDto): Promise<Empresa> {
    // Verificar que no existe una empresa con el mismo CUIT
    const empresaExistente = await this.empresaRepository.findByCuit(dto.cuit);
    if (empresaExistente) {
      throw new ConflictException('Ya existe una empresa con ese CUIT');
    }

    // Crear nueva empresa
    const nuevaEmpresa = new Empresa(dto.cuit, dto.nombre, dto.tipo);

    // Guardar en la base de datos
    return await this.empresaRepository.save(nuevaEmpresa);
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { EmpresaRepository } from '../../domain/repositories/empresa.repository';
import { Empresa } from '../../domain/entities/empresa.entity';

@Injectable()
export class ObtenerEmpresasAdheridoUltimoMesUseCase {
  constructor(
    @Inject('EmpresaRepository')
    private readonly empresaRepository: EmpresaRepository,
  ) {}

  async execute(): Promise<Empresa[]> {
    return await this.empresaRepository.findEmpresasAdheridoEnUltimoMes();
  }
}

import { Empresa, TipoEmpresa } from '../entities/empresa.entity';

export interface EmpresaRepository {
  save(empresa: Empresa): Promise<Empresa>;
  findByCuit(cuit: string): Promise<Empresa | null>;
  findByTipo(tipo: TipoEmpresa): Promise<Empresa[]>;
  findEmpresasConTransferenciasEnUltimoMes(): Promise<Empresa[]>;
  findEmpresasAdheridoEnUltimoMes(): Promise<Empresa[]>;
}

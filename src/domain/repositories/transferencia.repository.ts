import { Transferencia } from '../entities/transferencia.entity';

export interface TransferenciaRepository {
  save(transferencia: Transferencia): Promise<Transferencia>;
  findByCuitEmpresa(cuitEmpresa: string): Promise<Transferencia[]>;
  findTransferenciasUltimoMes(): Promise<Transferencia[]>;
}

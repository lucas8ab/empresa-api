import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Empresa } from './empresa.entity';

@Entity('transferencias')
export class Transferencia {
  @PrimaryGeneratedColumn('uuid', { name: 'id_transferencia' })
  idTransferencia: string;

  @Column({ type: 'varchar', length: 20, name: 'cuit_empresa' })
  cuitEmpresa: string;

  @CreateDateColumn({ name: 'fecha_transferencia' })
  fechaTransferencia: Date;

  @ManyToOne(() => Empresa, (empresa) => empresa.transferencias)
  @JoinColumn({ name: 'cuit_empresa' })
  empresa: Empresa;

  constructor(cuitEmpresa: string) {
    this.cuitEmpresa = cuitEmpresa;
  }
}

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Transferencia } from './transferencia.entity';

export enum TipoEmpresa {
  PYME = 'PYME',
  CORPORATIVA = 'CORPORATIVA',
}

@Entity('empresas')
export class Empresa {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  cuit: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({
    type: 'simple-enum',
    enum: TipoEmpresa,
    default: TipoEmpresa.PYME,
  })
  tipo: TipoEmpresa;

  @CreateDateColumn({ name: 'fecha_adhesion' })
  fechaAdhesion: Date;

  @OneToMany(() => Transferencia, (transferencia) => transferencia.empresa)
  transferencias: Transferencia[];

  constructor(
    cuit: string,
    nombre: string,
    tipo: TipoEmpresa,
    fechaAdhesion?: Date,
  ) {
    this.cuit = cuit;
    this.nombre = nombre;
    this.tipo = tipo;
    this.fechaAdhesion = fechaAdhesion || new Date();
    this.transferencias = [];
  }

  // Métodos de dominio
  isPyme(): boolean {
    return this.tipo === TipoEmpresa.PYME;
  }

  isCorporativa(): boolean {
    return this.tipo === TipoEmpresa.CORPORATIVA;
  }
}

import {
  IsString,
  IsEnum,
  IsNotEmpty,
  Length,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { TipoEmpresa } from '../../../domain/entities/empresa.entity';

export class CrearEmpresaDto {
  @IsString()
  @IsNotEmpty()
  @Length(11, 11, { message: 'El CUIT debe tener exactamente 11 caracteres' })
  cuit: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nombre: string;

  @IsEnum(TipoEmpresa)
  tipo: TipoEmpresa;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'La fecha de adhesión debe ser una fecha válida en formato ISO',
    },
  )
  fechaAdhesion?: string;
}

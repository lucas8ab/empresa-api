import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class CrearTransferenciaDto {
  @IsString()
  @IsNotEmpty()
  @Length(11, 11, { message: 'El CUIT debe tener exactamente 11 caracteres' })
  cuitEmpresa: string;

  @IsNumber()
  monto: number;

  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'La fecha de transferencia debe ser una fecha válida en formato ISO',
    },
  )
  fechaTransferencia?: string;
}

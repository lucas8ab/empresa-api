import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { EmpresaService } from '../../application/services/empresa.service';
import { CrearEmpresaDto } from './dto/crear-empresa.dto';
import { CrearTransferenciaDto } from './dto/crear-transferencia.dto';

@Controller('empresas')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearEmpresa(@Body() dto: CrearEmpresaDto) {
    return await this.empresaService.crearEmpresa(dto);
  }

  @Get('con-transferencias-ultimo-mes')
  async obtenerEmpresasConTransferenciasUltimoMes() {
    return await this.empresaService.obtenerEmpresasConTransferenciasUltimoMes();
  }

  @Get('adheridas-ultimo-mes')
  async obtenerEmpresasAdheridoUltimoMes() {
    return await this.empresaService.obtenerEmpresasAdheridoUltimoMes();
  }

  // Endpoint auxiliar para crear transferencias para testing
  @Post('transferencias')
  async crearTransferencia(@Body() dto: CrearTransferenciaDto) {
    return await this.empresaService.crearTransferencia(dto);
  }

  // Endpoint auxiliar para eliminar empresa por CUIT (solo para testing)
  @Delete(':cuit')
  async eliminarEmpresa(@Param('cuit') cuit: string) {
    return await this.empresaService.eliminarEmpresa(cuit);
  }
}

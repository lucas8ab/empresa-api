import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  EmpresaService,
  CrearEmpresaDto,
} from '../../application/services/empresa.service';

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
  async crearTransferencia(@Body() body: { cuitEmpresa: string }) {
    return await this.empresaService.crearTransferencia(body.cuitEmpresa);
  }
}

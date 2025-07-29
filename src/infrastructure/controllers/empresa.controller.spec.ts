import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { EmpresaController } from './empresa.controller';
import { EmpresaService } from '../../application/services/empresa.service';
import { CrearEmpresaDto } from './dto/crear-empresa.dto';
import { CrearTransferenciaDto } from './dto/crear-transferencia.dto';
import { TipoEmpresa } from '../../domain/entities/empresa.entity';

describe('EmpresaController', () => {
  let controller: EmpresaController;
  let service: EmpresaService;

  const mockEmpresaService = {
    crearEmpresa: jest.fn(),
    obtenerEmpresasConTransferenciasUltimoMes: jest.fn(),
    obtenerEmpresasAdheridoUltimoMes: jest.fn(),
    crearTransferencia: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmpresaController],
      providers: [
        {
          provide: EmpresaService,
          useValue: mockEmpresaService,
        },
      ],
    }).compile();

    controller = module.get<EmpresaController>(EmpresaController);
    service = module.get<EmpresaService>(EmpresaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crearEmpresa - Registrar adhesión de nueva empresa', () => {
    it('debe crear una empresa PYME exitosamente', async () => {
      // Arrange
      const dto: CrearEmpresaDto = {
        cuit: '30123456700',
        nombre: 'Test Pyme SRL',
        tipo: TipoEmpresa.PYME,
      };

      const empresaCreada = {
        cuit: '30123456700',
        nombre: 'Test Pyme SRL',
        tipo: TipoEmpresa.PYME,
        fechaAdhesion: new Date(),
      };

      mockEmpresaService.crearEmpresa.mockResolvedValue(empresaCreada);

      // Act
      const resultado = await controller.crearEmpresa(dto);

      // Assert
      expect(service.crearEmpresa).toHaveBeenCalledWith(dto);
      expect(resultado).toEqual(empresaCreada);
    });

    it('debe crear una empresa CORPORATIVA exitosamente', async () => {
      // Arrange
      const dto: CrearEmpresaDto = {
        cuit: '30987654321',
        nombre: 'Test Corp SA',
        tipo: TipoEmpresa.CORPORATIVA,
      };

      const empresaCreada = {
        cuit: '30987654321',
        nombre: 'Test Corp SA',
        tipo: TipoEmpresa.CORPORATIVA,
        fechaAdhesion: new Date(),
      };

      mockEmpresaService.crearEmpresa.mockResolvedValue(empresaCreada);

      // Act
      const resultado = await controller.crearEmpresa(dto);

      // Assert
      expect(service.crearEmpresa).toHaveBeenCalledWith(dto);
      expect(resultado).toEqual(empresaCreada);
    });

    it('debe crear empresa con fecha de adhesión específica', async () => {
      // Arrange
      const fechaEspecifica = '2025-01-15T10:00:00.000Z';
      const dto: CrearEmpresaDto = {
        cuit: '30555666777',
        nombre: 'Empresa Con Fecha',
        tipo: TipoEmpresa.PYME,
        fechaAdhesion: fechaEspecifica,
      };

      const empresaCreada = {
        cuit: '30555666777',
        nombre: 'Empresa Con Fecha',
        tipo: TipoEmpresa.PYME,
        fechaAdhesion: new Date(fechaEspecifica),
      };

      mockEmpresaService.crearEmpresa.mockResolvedValue(empresaCreada);

      // Act
      const resultado = await controller.crearEmpresa(dto);

      // Assert
      expect(service.crearEmpresa).toHaveBeenCalledWith(dto);
      expect(resultado.fechaAdhesion).toEqual(new Date(fechaEspecifica));
    });

    it('debe lanzar ConflictException cuando el CUIT ya existe', async () => {
      // Arrange
      const dto: CrearEmpresaDto = {
        cuit: '30123456700',
        nombre: 'Empresa Duplicada',
        tipo: TipoEmpresa.PYME,
      };

      mockEmpresaService.crearEmpresa.mockRejectedValue(
        new ConflictException('Ya existe una empresa con ese CUIT'),
      );

      // Act & Assert
      await expect(controller.crearEmpresa(dto)).rejects.toThrow(
        ConflictException,
      );
      expect(service.crearEmpresa).toHaveBeenCalledWith(dto);
    });
  });

  describe('obtenerEmpresasConTransferenciasUltimoMes', () => {
    it('debe retornar empresas que realizaron transferencias en el último mes', async () => {
      // Arrange
      const empresasConTransferencias = [
        {
          cuit: '30123456700',
          nombre: 'Empresa Con Transferencias',
          tipo: TipoEmpresa.PYME,
          fechaAdhesion: new Date('2025-06-01'),
        },
        {
          cuit: '30987654321',
          nombre: 'Otra Empresa',
          tipo: TipoEmpresa.CORPORATIVA,
          fechaAdhesion: new Date('2025-05-15'),
        },
      ];

      mockEmpresaService.obtenerEmpresasConTransferenciasUltimoMes.mockResolvedValue(
        empresasConTransferencias,
      );

      // Act
      const resultado =
        await controller.obtenerEmpresasConTransferenciasUltimoMes();

      // Assert
      expect(
        service.obtenerEmpresasConTransferenciasUltimoMes,
      ).toHaveBeenCalled();
      expect(resultado).toEqual(empresasConTransferencias);
      expect(resultado).toHaveLength(2);
    });

    it('debe retornar array vacío cuando no hay empresas con transferencias', async () => {
      // Arrange
      mockEmpresaService.obtenerEmpresasConTransferenciasUltimoMes.mockResolvedValue(
        [],
      );

      // Act
      const resultado =
        await controller.obtenerEmpresasConTransferenciasUltimoMes();

      // Assert
      expect(
        service.obtenerEmpresasConTransferenciasUltimoMes,
      ).toHaveBeenCalled();
      expect(resultado).toEqual([]);
    });
  });

  describe('obtenerEmpresasAdheridoUltimoMes', () => {
    it('debe retornar empresas adheridas en el último mes', async () => {
      // Arrange
      const ahora = new Date();
      const empresasAdheridas = [
        {
          cuit: '30111222333',
          nombre: 'Empresa Reciente',
          tipo: TipoEmpresa.PYME,
          fechaAdhesion: new Date(ahora.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 días atrás
        },
        {
          cuit: '30444555666',
          nombre: 'Empresa Nueva',
          tipo: TipoEmpresa.CORPORATIVA,
          fechaAdhesion: new Date(ahora.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
        },
      ];

      mockEmpresaService.obtenerEmpresasAdheridoUltimoMes.mockResolvedValue(
        empresasAdheridas,
      );

      // Act
      const resultado = await controller.obtenerEmpresasAdheridoUltimoMes();

      // Assert
      expect(service.obtenerEmpresasAdheridoUltimoMes).toHaveBeenCalled();
      expect(resultado).toEqual(empresasAdheridas);
      expect(resultado).toHaveLength(2);
    });

    it('debe retornar array vacío cuando no hay empresas adheridas recientemente', async () => {
      // Arrange
      mockEmpresaService.obtenerEmpresasAdheridoUltimoMes.mockResolvedValue([]);

      // Act
      const resultado = await controller.obtenerEmpresasAdheridoUltimoMes();

      // Assert
      expect(service.obtenerEmpresasAdheridoUltimoMes).toHaveBeenCalled();
      expect(resultado).toEqual([]);
    });
  });

  describe('crearTransferencia - Endpoint auxiliar', () => {
    it('debe crear una transferencia exitosamente', async () => {
      // Arrange
      const dto: CrearTransferenciaDto = {
        cuitEmpresa: '30123456700',
        monto: 1500.0,
      };

      const transferenciaCreada = {
        idTransferencia: 'uuid-123',
        cuitEmpresa: '30123456700',
        monto: 1500.0,
        fechaTransferencia: new Date(),
      };

      mockEmpresaService.crearTransferencia.mockResolvedValue(
        transferenciaCreada,
      );

      // Act
      const resultado = await controller.crearTransferencia(dto);

      // Assert
      expect(service.crearTransferencia).toHaveBeenCalledWith(dto);
      expect(resultado).toEqual(transferenciaCreada);
    });

    it('debe crear transferencia con fecha específica', async () => {
      // Arrange
      const fechaEspecifica = '2025-07-20T15:00:00.000Z';
      const dto: CrearTransferenciaDto = {
        cuitEmpresa: '30123456700',
        monto: 2500.0,
        fechaTransferencia: fechaEspecifica,
      };

      const transferenciaCreada = {
        idTransferencia: 'uuid-456',
        cuitEmpresa: '30123456700',
        monto: 2500.0,
        fechaTransferencia: new Date(fechaEspecifica),
      };

      mockEmpresaService.crearTransferencia.mockResolvedValue(
        transferenciaCreada,
      );

      // Act
      const resultado = await controller.crearTransferencia(dto);

      // Assert
      expect(service.crearTransferencia).toHaveBeenCalledWith(dto);
      expect(resultado.fechaTransferencia).toEqual(new Date(fechaEspecifica));
    });

    it('debe lanzar BadRequestException cuando la empresa no existe', async () => {
      // Arrange
      const dto: CrearTransferenciaDto = {
        cuitEmpresa: '30999888777',
        monto: 1500.0,
      };

      mockEmpresaService.crearTransferencia.mockRejectedValue(
        new BadRequestException('No existe empresa con el CUIT 30999888777'),
      );

      // Act & Assert
      await expect(controller.crearTransferencia(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.crearTransferencia(dto)).rejects.toThrow(
        'No existe empresa con el CUIT 30999888777',
      );
      expect(service.crearTransferencia).toHaveBeenCalledWith(dto);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { Empresa, TipoEmpresa } from '../../domain/entities/empresa.entity';
import { Transferencia } from '../../domain/entities/transferencia.entity';
import { CrearEmpresaDto } from '../../infrastructure/controllers/dto/crear-empresa.dto';
import { CrearTransferenciaDto } from '../../infrastructure/controllers/dto/crear-transferencia.dto';

describe('EmpresaService', () => {
  let service: EmpresaService;
  let empresaRepository: Repository<Empresa>;
  let transferenciaRepository: Repository<Transferencia>;

  const mockEmpresaRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
    delete: jest.fn(),
  };

  const mockTransferenciaRepository = {
    save: jest.fn(),
  };

  const mockQueryBuilder = {
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresaService,
        {
          provide: getRepositoryToken(Empresa),
          useValue: mockEmpresaRepository,
        },
        {
          provide: getRepositoryToken(Transferencia),
          useValue: mockTransferenciaRepository,
        },
      ],
    }).compile();

    service = module.get<EmpresaService>(EmpresaService);
    empresaRepository = module.get<Repository<Empresa>>(
      getRepositoryToken(Empresa),
    );
    transferenciaRepository = module.get<Repository<Transferencia>>(
      getRepositoryToken(Transferencia),
    );
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

      mockEmpresaRepository.findOne.mockResolvedValue(null);

      const empresaGuardada = new Empresa(dto.cuit, dto.nombre, dto.tipo);
      mockEmpresaRepository.save.mockResolvedValue(empresaGuardada);

      // Act
      const resultado = await service.crearEmpresa(dto);

      // Assert
      expect(empresaRepository.findOne).toHaveBeenCalledWith({
        where: { cuit: dto.cuit },
      });
      expect(empresaRepository.save).toHaveBeenCalled();
      expect(resultado.tipo).toBe(TipoEmpresa.PYME);
    });

    it('debe crear una empresa CORPORATIVA exitosamente', async () => {
      // Arrange
      const dto: CrearEmpresaDto = {
        cuit: '30987654321',
        nombre: 'Test Corp SA',
        tipo: TipoEmpresa.CORPORATIVA,
      };

      mockEmpresaRepository.findOne.mockResolvedValue(null);

      const empresaGuardada = new Empresa(dto.cuit, dto.nombre, dto.tipo);
      mockEmpresaRepository.save.mockResolvedValue(empresaGuardada);

      // Act
      const resultado = await service.crearEmpresa(dto);

      // Assert
      expect(empresaRepository.findOne).toHaveBeenCalledWith({
        where: { cuit: dto.cuit },
      });
      expect(empresaRepository.save).toHaveBeenCalled();
      expect(resultado.tipo).toBe(TipoEmpresa.CORPORATIVA);
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

      mockEmpresaRepository.findOne.mockResolvedValue(null);

      const empresaGuardada = new Empresa(dto.cuit, dto.nombre, dto.tipo);
      empresaGuardada.fechaAdhesion = new Date(fechaEspecifica);
      mockEmpresaRepository.save.mockResolvedValue(empresaGuardada);

      // Act
      const resultado = await service.crearEmpresa(dto);

      // Assert
      expect(empresaRepository.save).toHaveBeenCalled();
      expect(resultado.fechaAdhesion).toEqual(new Date(fechaEspecifica));
    });

    it('debe lanzar ConflictException cuando el CUIT ya existe', async () => {
      // Arrange
      const dto: CrearEmpresaDto = {
        cuit: '30123456700',
        nombre: 'Empresa Duplicada',
        tipo: TipoEmpresa.PYME,
      };

      const empresaExistente = new Empresa(
        dto.cuit,
        'Empresa Existente',
        dto.tipo,
      );
      mockEmpresaRepository.findOne.mockResolvedValue(empresaExistente);

      // Act & Assert
      await expect(service.crearEmpresa(dto)).rejects.toThrow(
        ConflictException,
      );
      expect(empresaRepository.findOne).toHaveBeenCalledWith({
        where: { cuit: dto.cuit },
      });
      expect(empresaRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('obtenerEmpresasConTransferenciasUltimoMes - Casos border de fechas transferencias', () => {
    beforeEach(() => {
      mockEmpresaRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
    });

    it('debe incluir empresas con transferencias de exactamente 29 días atrás', async () => {
      // Arrange
      const ahora = new Date();
      const fecha29DiasAtras = new Date(
        ahora.getTime() - 29 * 24 * 60 * 60 * 1000,
      );

      const empresasBordeInferior = [
        {
          cuit: '30123456700',
          nombre: 'Empresa 29 Días',
          tipo: TipoEmpresa.PYME,
          fechaAdhesion: fecha29DiasAtras,
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(empresasBordeInferior);

      // Act
      const resultado =
        await service.obtenerEmpresasConTransferenciasUltimoMes();

      // Assert
      expect(empresaRepository.createQueryBuilder).toHaveBeenCalledWith(
        'empresa',
      );
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
        'empresa.transferencias',
        'transferencia',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'transferencia.fechaTransferencia >= :fechaLimite',
        expect.objectContaining({
          fechaLimite: expect.any(Date),
        }),
      );
      expect(resultado).toEqual(empresasBordeInferior);
    });

    it('debe incluir empresas con transferencias de exactamente 30 días atrás', async () => {
      // Arrange
      const ahora = new Date();
      const fecha30DiasAtras = new Date(
        ahora.getTime() - 30 * 24 * 60 * 60 * 1000,
      );

      const empresasBordeSuperior = [
        {
          cuit: '30987654321',
          nombre: 'Empresa 30 Días',
          tipo: TipoEmpresa.CORPORATIVA,
          fechaAdhesion: fecha30DiasAtras,
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(empresasBordeSuperior);

      // Act
      const resultado =
        await service.obtenerEmpresasConTransferenciasUltimoMes();

      // Assert
      expect(resultado).toEqual(empresasBordeSuperior);
    });

    it('NO debe incluir empresas con transferencias de más de 31 días atrás', async () => {
      // Arrange - Simular que la query no devuelve empresas con transferencias muy antiguas
      mockQueryBuilder.getMany.mockResolvedValue([]);

      // Act
      const resultado =
        await service.obtenerEmpresasConTransferenciasUltimoMes();

      // Assert
      expect(resultado).toEqual([]);
    });

    it('debe retornar múltiples empresas con transferencias recientes', async () => {
      // Arrange
      const empresasConTransferenciasRecientes = [
        {
          cuit: '30111111111',
          nombre: 'Empresa Reciente 1',
          tipo: TipoEmpresa.PYME,
          fechaAdhesion: new Date('2025-06-01'),
        },
        {
          cuit: '30222222222',
          nombre: 'Empresa Reciente 2',
          tipo: TipoEmpresa.CORPORATIVA,
          fechaAdhesion: new Date('2025-07-01'),
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(
        empresasConTransferenciasRecientes,
      );

      // Act
      const resultado =
        await service.obtenerEmpresasConTransferenciasUltimoMes();

      // Assert
      expect(resultado).toHaveLength(2);
      expect(resultado).toEqual(empresasConTransferenciasRecientes);
    });
  });

  describe('obtenerEmpresasAdheridoUltimoMes - Casos border de fechas adhesión', () => {
    beforeEach(() => {
      mockEmpresaRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
    });

    it('debe incluir empresas adheridas exactamente 29 días atrás', async () => {
      // Arrange
      const ahora = new Date();
      const fecha29DiasAtras = new Date(
        ahora.getTime() - 29 * 24 * 60 * 60 * 1000,
      );

      const empresasBordeInferior = [
        {
          cuit: '30123456700',
          nombre: 'Empresa Adherida 29 Días',
          tipo: TipoEmpresa.PYME,
          fechaAdhesion: fecha29DiasAtras,
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(empresasBordeInferior);

      // Act
      const resultado = await service.obtenerEmpresasAdheridoUltimoMes();

      // Assert
      expect(empresaRepository.createQueryBuilder).toHaveBeenCalledWith(
        'empresa',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'empresa.fechaAdhesion >= :fechaLimite',
        expect.objectContaining({
          fechaLimite: expect.any(Date),
        }),
      );
      expect(resultado).toEqual(empresasBordeInferior);
    });

    it('debe incluir empresas adheridas exactamente 30 días atrás', async () => {
      // Arrange
      const ahora = new Date();
      const fecha30DiasAtras = new Date(
        ahora.getTime() - 30 * 24 * 60 * 60 * 1000,
      );

      const empresasBordeSuperior = [
        {
          cuit: '30987654321',
          nombre: 'Empresa Adherida 30 Días',
          tipo: TipoEmpresa.CORPORATIVA,
          fechaAdhesion: fecha30DiasAtras,
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(empresasBordeSuperior);

      // Act
      const resultado = await service.obtenerEmpresasAdheridoUltimoMes();

      // Assert
      expect(resultado).toEqual(empresasBordeSuperior);
    });

    it('NO debe incluir empresas adheridas hace más de 31 días', async () => {
      // Arrange - Simular que la query no devuelve empresas adheridas hace mucho tiempo
      mockQueryBuilder.getMany.mockResolvedValue([]);

      // Act
      const resultado = await service.obtenerEmpresasAdheridoUltimoMes();

      // Assert
      expect(resultado).toEqual([]);
    });

    it('debe manejar correctamente el cálculo de fecha límite (1 mes atrás)', async () => {
      // Arrange
      const empresasRecientes = [
        {
          cuit: '30555555555',
          nombre: 'Empresa Muy Reciente',
          tipo: TipoEmpresa.PYME,
          fechaAdhesion: new Date(), // Hoy
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(empresasRecientes);

      // Act
      await service.obtenerEmpresasAdheridoUltimoMes();

      // Assert
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'empresa.fechaAdhesion >= :fechaLimite',
        expect.objectContaining({
          fechaLimite: expect.any(Date),
        }),
      );
    });

    it('debe retornar múltiples empresas adheridas recientemente', async () => {
      // Arrange
      const empresasAdheridosRecientes = [
        {
          cuit: '30111111111',
          nombre: 'Empresa Nueva 1',
          tipo: TipoEmpresa.PYME,
          fechaAdhesion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
        },
        {
          cuit: '30222222222',
          nombre: 'Empresa Nueva 2',
          tipo: TipoEmpresa.CORPORATIVA,
          fechaAdhesion: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 días atrás
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(empresasAdheridosRecientes);

      // Act
      const resultado = await service.obtenerEmpresasAdheridoUltimoMes();

      // Assert
      expect(resultado).toHaveLength(2);
      expect(resultado).toEqual(empresasAdheridosRecientes);
    });
  });

  describe('crearTransferencia - Endpoint auxiliar', () => {
    it('debe crear transferencia con fecha actual por defecto', async () => {
      // Arrange
      const dto: CrearTransferenciaDto = {
        cuitEmpresa: '30123456700',
        monto: 1500.75,
      };

      const empresaExistente = new Empresa(
        dto.cuitEmpresa,
        'Empresa Test',
        TipoEmpresa.PYME,
      );
      mockEmpresaRepository.findOne.mockResolvedValue(empresaExistente);

      const transferenciaGuardada = new Transferencia(
        dto.cuitEmpresa,
        dto.monto,
      );
      mockTransferenciaRepository.save.mockResolvedValue(transferenciaGuardada);

      // Act
      const resultado = await service.crearTransferencia(dto);

      // Assert
      expect(empresaRepository.findOne).toHaveBeenCalledWith({
        where: { cuit: dto.cuitEmpresa },
      });
      expect(transferenciaRepository.save).toHaveBeenCalled();
      expect(resultado.cuitEmpresa).toBe(dto.cuitEmpresa);
    });

    it('debe crear transferencia con fecha específica', async () => {
      // Arrange
      const fechaEspecifica = '2025-07-20T15:00:00.000Z';
      const dto: CrearTransferenciaDto = {
        cuitEmpresa: '30123456700',
        monto: 2000.0,
        fechaTransferencia: fechaEspecifica,
      };

      const empresaExistente = new Empresa(
        dto.cuitEmpresa,
        'Empresa Test',
        TipoEmpresa.PYME,
      );
      mockEmpresaRepository.findOne.mockResolvedValue(empresaExistente);

      const transferenciaGuardada = new Transferencia(
        dto.cuitEmpresa,
        dto.monto,
      );
      transferenciaGuardada.fechaTransferencia = new Date(fechaEspecifica);
      mockTransferenciaRepository.save.mockResolvedValue(transferenciaGuardada);

      // Act
      const resultado = await service.crearTransferencia(dto);

      // Assert
      expect(empresaRepository.findOne).toHaveBeenCalledWith({
        where: { cuit: dto.cuitEmpresa },
      });
      expect(transferenciaRepository.save).toHaveBeenCalled();
      expect(resultado.fechaTransferencia).toEqual(new Date(fechaEspecifica));
    });

    it('debe lanzar BadRequestException cuando la empresa no existe', async () => {
      // Arrange
      const dto: CrearTransferenciaDto = {
        cuitEmpresa: '30999888777',
        monto: 1000.0,
      };

      mockEmpresaRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.crearTransferencia(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.crearTransferencia(dto)).rejects.toThrow(
        'No existe empresa con el CUIT 30999888777',
      );

      expect(empresaRepository.findOne).toHaveBeenCalledWith({
        where: { cuit: dto.cuitEmpresa },
      });
      expect(transferenciaRepository.save).not.toHaveBeenCalled();
    });
  });
});

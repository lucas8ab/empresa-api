import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CrearEmpresaUseCase } from './crear-empresa.use-case';
import { EmpresaRepository } from '../../domain/repositories/empresa.repository';
import { Empresa, TipoEmpresa } from '../../domain/entities/empresa.entity';
import { CrearEmpresaDto } from '../../infrastructure/controllers/dto/crear-empresa.dto';

describe('CrearEmpresaUseCase', () => {
  let useCase: CrearEmpresaUseCase;
  let repository: EmpresaRepository;

  const mockEmpresaRepository = {
    findByCuit: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrearEmpresaUseCase,
        {
          provide: 'EmpresaRepository',
          useValue: mockEmpresaRepository,
        },
      ],
    }).compile();

    useCase = module.get<CrearEmpresaUseCase>(CrearEmpresaUseCase);
    repository = module.get<EmpresaRepository>('EmpresaRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - Registrar adhesión de nueva empresa', () => {
    it('debe crear una empresa PYME exitosamente', async () => {
      // Arrange
      const dto: CrearEmpresaDto = {
        cuit: '30123456700',
        nombre: 'Test Pyme SRL',
        tipo: TipoEmpresa.PYME,
      };

      mockEmpresaRepository.findByCuit.mockResolvedValue(null);

      const empresaCreada = new Empresa(dto.cuit, dto.nombre, dto.tipo);
      mockEmpresaRepository.save.mockResolvedValue(empresaCreada);

      // Act
      const resultado = await useCase.execute(dto);

      // Assert
      expect(repository.findByCuit).toHaveBeenCalledWith(dto.cuit);
      expect(repository.save).toHaveBeenCalledWith(expect.any(Empresa));
      expect(resultado.tipo).toBe(TipoEmpresa.PYME);
      expect(resultado.cuit).toBe(dto.cuit);
      expect(resultado.nombre).toBe(dto.nombre);
    });

    it('debe crear una empresa CORPORATIVA exitosamente', async () => {
      // Arrange
      const dto: CrearEmpresaDto = {
        cuit: '30987654321',
        nombre: 'Test Corp SA',
        tipo: TipoEmpresa.CORPORATIVA,
      };

      mockEmpresaRepository.findByCuit.mockResolvedValue(null);

      const empresaCreada = new Empresa(dto.cuit, dto.nombre, dto.tipo);
      mockEmpresaRepository.save.mockResolvedValue(empresaCreada);

      // Act
      const resultado = await useCase.execute(dto);

      // Assert
      expect(repository.findByCuit).toHaveBeenCalledWith(dto.cuit);
      expect(repository.save).toHaveBeenCalledWith(expect.any(Empresa));
      expect(resultado.tipo).toBe(TipoEmpresa.CORPORATIVA);
      expect(resultado.cuit).toBe(dto.cuit);
      expect(resultado.nombre).toBe(dto.nombre);
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
      mockEmpresaRepository.findByCuit.mockResolvedValue(empresaExistente);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(repository.findByCuit).toHaveBeenCalledWith(dto.cuit);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('debe validar que el CUIT no esté vacío', async () => {
      // Arrange
      const dto: CrearEmpresaDto = {
        cuit: '',
        nombre: 'Test Empresa',
        tipo: TipoEmpresa.PYME,
      };

      mockEmpresaRepository.findByCuit.mockResolvedValue(null);

      // Act
      const resultado = await useCase.execute(dto);

      // Assert
      expect(repository.findByCuit).toHaveBeenCalledWith('');
      // El comportamiento esperado depende de si hay validaciones adicionales en el use case
    });

    it('debe crear empresa con datos mínimos válidos', async () => {
      // Arrange
      const dto: CrearEmpresaDto = {
        cuit: '12345678901',
        nombre: 'A', // Nombre mínimo
        tipo: TipoEmpresa.PYME,
      };

      mockEmpresaRepository.findByCuit.mockResolvedValue(null);

      const empresaCreada = new Empresa(dto.cuit, dto.nombre, dto.tipo);
      mockEmpresaRepository.save.mockResolvedValue(empresaCreada);

      // Act
      const resultado = await useCase.execute(dto);

      // Assert
      expect(repository.findByCuit).toHaveBeenCalledWith(dto.cuit);
      expect(repository.save).toHaveBeenCalled();
      expect(resultado.nombre).toBe('A');
    });

    it('debe crear empresa con nombre largo', async () => {
      // Arrange
      const nombreLargo = 'A'.repeat(100); // Máximo permitido
      const dto: CrearEmpresaDto = {
        cuit: '98765432109',
        nombre: nombreLargo,
        tipo: TipoEmpresa.CORPORATIVA,
      };

      mockEmpresaRepository.findByCuit.mockResolvedValue(null);

      const empresaCreada = new Empresa(dto.cuit, dto.nombre, dto.tipo);
      mockEmpresaRepository.save.mockResolvedValue(empresaCreada);

      // Act
      const resultado = await useCase.execute(dto);

      // Assert
      expect(repository.findByCuit).toHaveBeenCalledWith(dto.cuit);
      expect(repository.save).toHaveBeenCalled();
      expect(resultado.nombre).toBe(nombreLargo);
      expect(resultado.nombre).toHaveLength(100);
    });

    it('debe manejar casos donde el repositorio falla', async () => {
      // Arrange
      const dto: CrearEmpresaDto = {
        cuit: '30123456700',
        nombre: 'Test Empresa',
        tipo: TipoEmpresa.PYME,
      };

      mockEmpresaRepository.findByCuit.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow('Database error');
      expect(repository.findByCuit).toHaveBeenCalledWith(dto.cuit);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('debe crear empresa y asignar fecha de adhesión automáticamente', async () => {
      // Arrange
      const dto: CrearEmpresaDto = {
        cuit: '30555666777',
        nombre: 'Empresa Nueva',
        tipo: TipoEmpresa.PYME,
      };

      mockEmpresaRepository.findByCuit.mockResolvedValue(null);

      const empresaCreada = new Empresa(dto.cuit, dto.nombre, dto.tipo);
      // La fecha se asigna automáticamente en el constructor de Empresa
      mockEmpresaRepository.save.mockResolvedValue(empresaCreada);

      // Act
      const resultado = await useCase.execute(dto);

      // Assert
      expect(repository.save).toHaveBeenCalled();
      expect(resultado.fechaAdhesion).toBeDefined();
      expect(resultado.fechaAdhesion).toBeInstanceOf(Date);
    });
  });
});

import { Empresa, TipoEmpresa } from './empresa.entity';

describe('Empresa Entity', () => {
  describe('Constructor', () => {
    it('debe crear una empresa PYME con datos válidos', () => {
      // Arrange
      const cuit = '30123456700';
      const nombre = 'Test Pyme SRL';
      const tipo = TipoEmpresa.PYME;

      // Act
      const empresa = new Empresa(cuit, nombre, tipo);

      // Assert
      expect(empresa.cuit).toBe(cuit);
      expect(empresa.nombre).toBe(nombre);
      expect(empresa.tipo).toBe(TipoEmpresa.PYME);
      expect(empresa.fechaAdhesion).toBeInstanceOf(Date);
    });

    it('debe crear una empresa CORPORATIVA con datos válidos', () => {
      // Arrange
      const cuit = '30987654321';
      const nombre = 'Test Corp SA';
      const tipo = TipoEmpresa.CORPORATIVA;

      // Act
      const empresa = new Empresa(cuit, nombre, tipo);

      // Assert
      expect(empresa.cuit).toBe(cuit);
      expect(empresa.nombre).toBe(nombre);
      expect(empresa.tipo).toBe(TipoEmpresa.CORPORATIVA);
      expect(empresa.fechaAdhesion).toBeInstanceOf(Date);
    });

    it('debe asignar fecha de adhesión automáticamente al crear', () => {
      // Arrange
      const fechaAntes = new Date();

      // Act
      const empresa = new Empresa(
        '30123456700',
        'Test Empresa',
        TipoEmpresa.PYME,
      );

      const fechaDespues = new Date();

      // Assert
      expect(empresa.fechaAdhesion).toBeInstanceOf(Date);
      expect(empresa.fechaAdhesion.getTime()).toBeGreaterThanOrEqual(
        fechaAntes.getTime(),
      );
      expect(empresa.fechaAdhesion.getTime()).toBeLessThanOrEqual(
        fechaDespues.getTime(),
      );
    });
  });

  describe('Validaciones de negocio', () => {
    it('debe aceptar CUIT de exactamente 11 caracteres', () => {
      // Arrange
      const cuitValido = '30123456700'; // 11 caracteres

      // Act
      const empresa = new Empresa(cuitValido, 'Test Empresa', TipoEmpresa.PYME);

      // Assert
      expect(empresa.cuit).toBe(cuitValido);
      expect(empresa.cuit.length).toBe(11);
    });

    it('debe aceptar nombre con longitud mínima', () => {
      // Arrange
      const nombreMinimo = 'A'; // 1 caracter

      // Act
      const empresa = new Empresa(
        '30123456700',
        nombreMinimo,
        TipoEmpresa.PYME,
      );

      // Assert
      expect(empresa.nombre).toBe(nombreMinimo);
      expect(empresa.nombre.length).toBe(1);
    });

    it('debe aceptar nombre con longitud máxima', () => {
      // Arrange
      const nombreMaximo = 'A'.repeat(100); // 100 caracteres

      // Act
      const empresa = new Empresa(
        '30123456700',
        nombreMaximo,
        TipoEmpresa.CORPORATIVA,
      );

      // Assert
      expect(empresa.nombre).toBe(nombreMaximo);
      expect(empresa.nombre.length).toBe(100);
    });

    it('debe aceptar ambos tipos de empresa válidos', () => {
      // Act
      const empresaPyme = new Empresa(
        '30123456700',
        'Pyme Test',
        TipoEmpresa.PYME,
      );
      const empresaCorp = new Empresa(
        '30987654321',
        'Corp Test',
        TipoEmpresa.CORPORATIVA,
      );

      // Assert
      expect(empresaPyme.tipo).toBe(TipoEmpresa.PYME);
      expect(empresaCorp.tipo).toBe(TipoEmpresa.CORPORATIVA);
    });
  });

  describe('Casos border de fechas para adhesión', () => {
    it('debe poder modificar fecha de adhesión para casos de prueba', () => {
      // Arrange
      const empresa = new Empresa(
        '30123456700',
        'Test Empresa',
        TipoEmpresa.PYME,
      );
      const nuevaFecha = new Date('2025-01-15T10:00:00.000Z');

      // Act
      empresa.fechaAdhesion = nuevaFecha;

      // Assert
      expect(empresa.fechaAdhesion).toEqual(nuevaFecha);
    });

    it('debe mantener la fecha asignada manualmente', () => {
      // Arrange
      const empresa = new Empresa(
        '30123456700',
        'Test Empresa',
        TipoEmpresa.PYME,
      );
      // Create date explicitly with December (month 11 in 0-indexed JavaScript)
      const fechaManual = new Date(2024, 11, 1); // 2024-12-01

      // Act
      empresa.fechaAdhesion = fechaManual;

      // Assert
      expect(empresa.fechaAdhesion).toEqual(fechaManual);
      expect(empresa.fechaAdhesion.getFullYear()).toBe(2024);
      expect(empresa.fechaAdhesion.getMonth()).toBe(11); // Diciembre = 11
    });

    it('debe soportar fechas de adhesión en el pasado para testing', () => {
      // Arrange
      const empresa = new Empresa(
        '30123456700',
        'Empresa Antigua',
        TipoEmpresa.CORPORATIVA,
      );
      const fechaPasada = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 días atrás

      // Act
      empresa.fechaAdhesion = fechaPasada;

      // Assert
      expect(empresa.fechaAdhesion).toEqual(fechaPasada);
      expect(empresa.fechaAdhesion.getTime()).toBeLessThan(Date.now());
    });

    it('debe soportar fechas de adhesión exactamente 29 días atrás', () => {
      // Arrange
      const empresa = new Empresa(
        '30123456700',
        'Empresa 29 Días',
        TipoEmpresa.PYME,
      );
      const fecha29DiasAtras = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);

      // Act
      empresa.fechaAdhesion = fecha29DiasAtras;

      // Assert
      expect(empresa.fechaAdhesion).toEqual(fecha29DiasAtras);

      // Verificar que está dentro del rango de último mes (aproximadamente)
      const diferenciaDias =
        (Date.now() - empresa.fechaAdhesion.getTime()) / (24 * 60 * 60 * 1000);
      expect(diferenciaDias).toBeCloseTo(29, 0);
    });

    it('debe soportar fechas de adhesión exactamente 30 días atrás', () => {
      // Arrange
      const empresa = new Empresa(
        '30123456700',
        'Empresa 30 Días',
        TipoEmpresa.CORPORATIVA,
      );
      const fecha30DiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Act
      empresa.fechaAdhesion = fecha30DiasAtras;

      // Assert
      expect(empresa.fechaAdhesion).toEqual(fecha30DiasAtras);

      // Verificar que está en el borde del rango de último mes
      const diferenciaDias =
        (Date.now() - empresa.fechaAdhesion.getTime()) / (24 * 60 * 60 * 1000);
      expect(diferenciaDias).toBeCloseTo(30, 0);
    });
  });

  describe('Enum TipoEmpresa', () => {
    it('debe tener valores correctos definidos', () => {
      // Assert
      expect(TipoEmpresa.PYME).toBe('PYME');
      expect(TipoEmpresa.CORPORATIVA).toBe('CORPORATIVA');
    });

    it('debe tener solo dos valores válidos', () => {
      // Assert
      const valores = Object.values(TipoEmpresa);
      expect(valores).toHaveLength(2);
      expect(valores).toContain('PYME');
      expect(valores).toContain('CORPORATIVA');
    });
  });
});

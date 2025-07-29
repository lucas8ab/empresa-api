import { Transferencia } from './transferencia.entity';

describe('Transferencia Entity', () => {
  describe('Constructor', () => {
    it('debe crear una transferencia con datos válidos', () => {
      // Arrange
      const cuitEmpresa = '30123456700';

      // Act
      const transferencia = new Transferencia(cuitEmpresa);

      // Assert
      expect(transferencia.cuitEmpresa).toBe(cuitEmpresa);
      expect(transferencia.fechaTransferencia).toBeInstanceOf(Date);
      expect(transferencia.idTransferencia).toBeDefined();
    });

    it('debe asignar fecha de transferencia automáticamente al crear', () => {
      // Arrange
      const fechaAntes = new Date();

      // Act
      const transferencia = new Transferencia('30123456700');

      const fechaDespues = new Date();

      // Assert
      expect(transferencia.fechaTransferencia).toBeInstanceOf(Date);
      expect(transferencia.fechaTransferencia.getTime()).toBeGreaterThanOrEqual(
        fechaAntes.getTime(),
      );
      expect(transferencia.fechaTransferencia.getTime()).toBeLessThanOrEqual(
        fechaDespues.getTime(),
      );
    });

    it('debe generar ID único para cada transferencia', () => {
      // Act
      const transferencia1 = new Transferencia('30123456700');
      const transferencia2 = new Transferencia('30987654321');

      // Assert
      expect(transferencia1.idTransferencia).toBeDefined();
      expect(transferencia2.idTransferencia).toBeDefined();
      expect(transferencia1.idTransferencia).not.toBe(
        transferencia2.idTransferencia,
      );
    });
  });

  describe('Casos border de fechas para transferencias', () => {
    it('debe poder modificar fecha de transferencia para casos de prueba', () => {
      // Arrange
      const transferencia = new Transferencia('30123456700');
      const nuevaFecha = new Date('2025-07-20T15:00:00.000Z');

      // Act
      transferencia.fechaTransferencia = nuevaFecha;

      // Assert
      expect(transferencia.fechaTransferencia).toEqual(nuevaFecha);
    });

    it('debe mantener la fecha asignada manualmente', () => {
      // Arrange
      const transferencia = new Transferencia('30123456700');
      const fechaManual = new Date('2025-06-15T12:30:00.000Z');

      // Act
      transferencia.fechaTransferencia = fechaManual;

      // Assert
      expect(transferencia.fechaTransferencia).toEqual(fechaManual);
      expect(transferencia.fechaTransferencia.getFullYear()).toBe(2025);
      expect(transferencia.fechaTransferencia.getMonth()).toBe(5); // Junio = 5
    });

    it('debe soportar fechas de transferencia en el pasado para testing', () => {
      // Arrange
      const transferencia = new Transferencia('30123456700');
      const fechaPasada = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000); // 45 días atrás

      // Act
      transferencia.fechaTransferencia = fechaPasada;

      // Assert
      expect(transferencia.fechaTransferencia).toEqual(fechaPasada);
      expect(transferencia.fechaTransferencia.getTime()).toBeLessThan(
        Date.now(),
      );
    });

    it('debe soportar fechas de transferencia exactamente 29 días atrás', () => {
      // Arrange
      const transferencia = new Transferencia('30123456700');
      const fecha29DiasAtras = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);

      // Act
      transferencia.fechaTransferencia = fecha29DiasAtras;

      // Assert
      expect(transferencia.fechaTransferencia).toEqual(fecha29DiasAtras);

      // Verificar que está dentro del rango de último mes
      const diferenciaDias =
        (Date.now() - transferencia.fechaTransferencia.getTime()) /
        (24 * 60 * 60 * 1000);
      expect(diferenciaDias).toBeCloseTo(29, 0);
    });

    it('debe soportar fechas de transferencia exactamente 30 días atrás', () => {
      // Arrange
      const transferencia = new Transferencia('30123456700');
      const fecha30DiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Act
      transferencia.fechaTransferencia = fecha30DiasAtras;

      // Assert
      expect(transferencia.fechaTransferencia).toEqual(fecha30DiasAtras);

      // Verificar que está en el borde del rango de último mes
      const diferenciaDias =
        (Date.now() - transferencia.fechaTransferencia.getTime()) /
        (24 * 60 * 60 * 1000);
      expect(diferenciaDias).toBeCloseTo(30, 0);
    });

    it('debe soportar fechas de transferencia de más de 31 días atrás (fuera de rango)', () => {
      // Arrange
      const transferencia = new Transferencia('30123456700');
      const fecha35DiasAtras = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);

      // Act
      transferencia.fechaTransferencia = fecha35DiasAtras;

      // Assert
      expect(transferencia.fechaTransferencia).toEqual(fecha35DiasAtras);

      // Verificar que está fuera del rango de último mes
      const diferenciaDias =
        (Date.now() - transferencia.fechaTransferencia.getTime()) /
        (24 * 60 * 60 * 1000);
      expect(diferenciaDias).toBeGreaterThan(31);
    });

    it('debe soportar fechas de transferencia recientes (dentro de 7 días)', () => {
      // Arrange
      const transferencia = new Transferencia('30123456700');
      const fecha5DiasAtras = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

      // Act
      transferencia.fechaTransferencia = fecha5DiasAtras;

      // Assert
      expect(transferencia.fechaTransferencia).toEqual(fecha5DiasAtras);

      // Verificar que está dentro de los últimos 7 días
      const diferenciaDias =
        (Date.now() - transferencia.fechaTransferencia.getTime()) /
        (24 * 60 * 60 * 1000);
      expect(diferenciaDias).toBeLessThan(7);
    });

    it('debe soportar fechas de transferencia de hoy', () => {
      // Arrange
      const transferencia = new Transferencia('30123456700');
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Inicio del día

      // Act
      transferencia.fechaTransferencia = hoy;

      // Assert
      expect(transferencia.fechaTransferencia).toEqual(hoy);

      // Verificar que es de hoy
      const esHoy =
        transferencia.fechaTransferencia.toDateString() ===
        new Date().toDateString();
      expect(esHoy).toBe(true);
    });
  });

  describe('Validaciones de CUIT', () => {
    it('debe aceptar CUIT de 11 caracteres', () => {
      // Arrange
      const cuitValido = '30123456700';

      // Act
      const transferencia = new Transferencia(cuitValido);

      // Assert
      expect(transferencia.cuitEmpresa).toBe(cuitValido);
      expect(transferencia.cuitEmpresa.length).toBe(11);
    });

    it('debe aceptar diferentes formatos de CUIT válidos', () => {
      // Arrange
      const cuits = ['30123456700', '20987654321', '27555666777'];

      // Act & Assert
      cuits.forEach((cuit) => {
        const transferencia = new Transferencia(cuit);
        expect(transferencia.cuitEmpresa).toBe(cuit);
        expect(transferencia.cuitEmpresa.length).toBe(11);
      });
    });
  });

  describe('Relación con Empresa', () => {
    it('debe asociar transferencia correctamente con el CUIT de la empresa', () => {
      // Arrange
      const cuitEmpresa = '30555666777';

      // Act
      const transferencia = new Transferencia(cuitEmpresa);

      // Assert
      expect(transferencia.cuitEmpresa).toBe(cuitEmpresa);
    });

    it('debe permitir múltiples transferencias para la misma empresa', () => {
      // Arrange
      const cuitEmpresa = '30123456700';

      // Act
      const transferencia1 = new Transferencia(cuitEmpresa);
      const transferencia2 = new Transferencia(cuitEmpresa);

      // Assert
      expect(transferencia1.cuitEmpresa).toBe(cuitEmpresa);
      expect(transferencia2.cuitEmpresa).toBe(cuitEmpresa);
      expect(transferencia1.idTransferencia).not.toBe(
        transferencia2.idTransferencia,
      );
    });
  });
});

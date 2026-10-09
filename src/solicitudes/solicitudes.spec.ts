import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SolicitudesService } from './solicitudes.service';
import { Solicitud } from './entities/solicitud.entity';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { EstadoSolicitud } from './enums/estado-solicitud.enum';
import { Role } from '../auth/enums/role.enum';
import { User } from '../auth/interfaces/user.interface';

describe('ÉPICA 2 (EP-02): Gestión del Ciclo de Vida de Solicitudes Comerciales', () => {
  let service: SolicitudesService;
  let repository: Repository<Solicitud>;

  const mockAdmin: User = {
    id: '1',
    username: 'admin',
    name: 'Admin',
    role: Role.ADMIN,
  };

  const mockSupervisor: User = {
    id: '3',
    username: 'supervisor',
    name: 'Supervisor',
    role: Role.SUPERVISOR,
  };

  const mockAsesor1: User = {
    id: '6',
    username: 'asesor1',
    name: 'Asesor 1',
    role: Role.ASESOR,
  };

  const mockAsesorCarlos: User = {
    id: '8',
    username: 'asesor_carlos',
    name: 'Carlos Mendoza',
    role: Role.ASESOR,
  };

  beforeEach(() => {
    repository = {
      create: vi.fn().mockImplementation((dto) => ({ ...dto })),
      save: vi.fn().mockImplementation(async (entity) => ({
        id: entity.id || 1,
        creadaEn: entity.creadaEn || new Date(),
        actualizadaEn: new Date(),
        ...entity,
      })),
      find: vi.fn(),
      findOne: vi.fn(),
    } as unknown as Repository<Solicitud>;

    service = new SolicitudesService(repository);
  });

  describe('US-04: Registro de Solicitud Comercial (POST /solicitudes)', () => {
    it('Escenario 1 (Registro por Asesor): Asesor crea solicitud, campo asesor toma su usuario y estado es PENDIENTE', async () => {
      const dto: CreateSolicitudDto = {
        cliente: 'Empresa Test',
        descripcion: 'Cotización requerida',
      };

      const result = await service.create(dto, mockAsesor1);

      expect(repository.create).toHaveBeenCalledWith({
        cliente: 'Empresa Test',
        descripcion: 'Cotización requerida',
        asesor: 'asesor1',
        estado: EstadoSolicitud.PENDIENTE,
      });
      expect(result.asesor).toBe('asesor1');
      expect(result.estado).toBe(EstadoSolicitud.PENDIENTE);
    });

    it('Escenario 2 (Forzado de PENDIENTE): El estado siempre se inicializa en PENDIENTE sin importar entradas externas', async () => {
      const payload: any = {
        cliente: 'Empresa Test',
        descripcion: 'Prueba estado',
        estado: 'RESUELTA', // Intento de inyectar estado avanzado
      };

      const result = await service.create(payload, mockAsesor1);
      expect(result.estado).toBe(EstadoSolicitud.PENDIENTE);
    });

    it('Escenario 3 (Registro por Supervisor/Admin): Admin puede asignar la solicitud a un asesor específico', async () => {
      const dto: CreateSolicitudDto = {
        cliente: 'Cliente VIP',
        descripcion: 'Reunión comercial',
        asesor: 'asesor_carlos',
      };

      const result = await service.create(dto, mockAdmin);
      expect(result.asesor).toBe('asesor_carlos');
      expect(result.estado).toBe(EstadoSolicitud.PENDIENTE);
    });

    it('Escenario 4 (Validación de DTO): Falla si cliente o descripción están vacíos', async () => {
      const invalidDto = plainToInstance(CreateSolicitudDto, {
        cliente: '',
        descripcion: '   ',
      });
      const errors = await validate(invalidDto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('Escenario 5 (Campos protegidos no modificables): Inyección de id o fechas es descartada', async () => {
      const payload: any = {
        id: 9999,
        cliente: 'Cliente Seguro',
        descripcion: 'Seguridad',
        creadaEn: new Date('2020-01-01'),
      };

      const result = await service.create(payload, mockAsesorCarlos);
      expect(repository.create).toHaveBeenCalledWith(
        expect.not.objectContaining({ id: 9999 }),
      );
      expect(result.asesor).toBe('asesor_carlos');
    });
  });

  describe('US-05: Consulta General de Solicitudes según Rol (GET /solicitudes)', () => {
    it('Escenario 1 (Consulta de Administrador): Retorna todas las solicitudes sin filtro de asesor', async () => {
      const mockList: Solicitud[] = [
        { id: 1, cliente: 'A', descripcion: 'D1', asesor: 'asesor1', estado: EstadoSolicitud.PENDIENTE, creadaEn: new Date(), actualizadaEn: new Date() },
        { id: 2, cliente: 'B', descripcion: 'D2', asesor: 'asesor2', estado: EstadoSolicitud.EN_GESTION, creadaEn: new Date(), actualizadaEn: new Date() },
      ];
      vi.spyOn(repository, 'find').mockResolvedValue(mockList);

      const result = await service.findAll(mockAdmin);
      expect(repository.find).toHaveBeenCalledWith({ order: { id: 'ASC' } });
      expect(result).toHaveLength(2);
    });

    it('Escenario 2 (Consulta de Supervisor): Retorna todas las solicitudes registradas', async () => {
      vi.spyOn(repository, 'find').mockResolvedValue([]);
      await service.findAll(mockSupervisor);
      expect(repository.find).toHaveBeenCalledWith({ order: { id: 'ASC' } });
    });

    it('Escenario 3 y 4 (Consulta de Asesor con filtro DB en TypeORM WHERE): Filtra por asesor en DB', async () => {
      vi.spyOn(repository, 'find').mockResolvedValue([]);
      await service.findAll(mockAsesorCarlos);

      // Verificación estricta de que la cláusula WHERE fue enviada a TypeORM
      expect(repository.find).toHaveBeenCalledWith({
        where: { asesor: 'asesor_carlos' },
        order: { id: 'ASC' },
      });
    });
  });

  describe('US-06: Consulta Individual de Solicitud por ID (GET /solicitudes/:id)', () => {
    it('Escenario 1 (Solicitud no encontrada): Retorna 404 Not Found si no existe', async () => {
      vi.spyOn(repository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne(999, mockAdmin)).rejects.toThrow(NotFoundException);
    });

    it('Escenario 2 (Consulta por Admin/Supervisor): Permite consultar cualquier solicitud existente', async () => {
      const solicitud: Solicitud = {
        id: 10,
        cliente: 'Cliente X',
        descripcion: 'Desc',
        asesor: 'asesor1',
        estado: EstadoSolicitud.PENDIENTE,
        creadaEn: new Date(),
        actualizadaEn: new Date(),
      };
      vi.spyOn(repository, 'findOne').mockResolvedValue(solicitud);

      const result = await service.findOne(10, mockAdmin);
      expect(result.id).toBe(10);
    });

    it('Escenario 3 (Asesor consulta su propia solicitud): Permite acceso con 200 OK', async () => {
      const solicitud: Solicitud = {
        id: 10,
        cliente: 'Cliente X',
        descripcion: 'Desc',
        asesor: 'asesor_carlos',
        estado: EstadoSolicitud.PENDIENTE,
        creadaEn: new Date(),
        actualizadaEn: new Date(),
      };
      vi.spyOn(repository, 'findOne').mockResolvedValue(solicitud);

      const result = await service.findOne(10, mockAsesorCarlos);
      expect(result.id).toBe(10);
    });

    it('Escenario 4 (Asesor consulta solicitud ajena): Deniega acceso con 403 Forbidden', async () => {
      const solicitud: Solicitud = {
        id: 10,
        cliente: 'Cliente X',
        descripcion: 'Desc',
        asesor: 'asesor_otro',
        estado: EstadoSolicitud.PENDIENTE,
        creadaEn: new Date(),
        actualizadaEn: new Date(),
      };
      vi.spyOn(repository, 'findOne').mockResolvedValue(solicitud);

      await expect(service.findOne(10, mockAsesorCarlos)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('US-07: Cambio de Estado Controlado de Solicitud (PATCH /solicitudes/:id/estado)', () => {
    it('Escenario 1 (Transición PENDIENTE -> EN_GESTION): Transición válida permitida', async () => {
      const solicitud: Solicitud = {
        id: 1,
        cliente: 'Cliente 1',
        descripcion: 'Desc',
        asesor: 'asesor1',
        estado: EstadoSolicitud.PENDIENTE,
        creadaEn: new Date(),
        actualizadaEn: new Date(),
      };
      vi.spyOn(repository, 'findOne').mockResolvedValue(solicitud);

      const dto: UpdateEstadoDto = { estado: EstadoSolicitud.EN_GESTION };
      const result = await service.updateEstado(1, dto, mockAsesor1);

      expect(result.estado).toBe(EstadoSolicitud.EN_GESTION);
      expect(repository.save).toHaveBeenCalled();
    });

    it('Escenario 2 (Transición EN_GESTION -> RESUELTA): Transición válida permitida', async () => {
      const solicitud: Solicitud = {
        id: 1,
        cliente: 'Cliente 1',
        descripcion: 'Desc',
        asesor: 'asesor1',
        estado: EstadoSolicitud.EN_GESTION,
        creadaEn: new Date(),
        actualizadaEn: new Date(),
      };
      vi.spyOn(repository, 'findOne').mockResolvedValue(solicitud);

      const dto: UpdateEstadoDto = { estado: EstadoSolicitud.RESUELTA };
      const result = await service.updateEstado(1, dto, mockAsesor1);

      expect(result.estado).toBe(EstadoSolicitud.RESUELTA);
    });

    it('Escenario 3 (Salto directo inválido): PENDIENTE -> RESUELTA es rechazado con BadRequestException', async () => {
      const solicitud: Solicitud = {
        id: 1,
        cliente: 'Cliente 1',
        descripcion: 'Desc',
        asesor: 'asesor1',
        estado: EstadoSolicitud.PENDIENTE,
        creadaEn: new Date(),
        actualizadaEn: new Date(),
      };
      vi.spyOn(repository, 'findOne').mockResolvedValue(solicitud);

      const dto: UpdateEstadoDto = { estado: EstadoSolicitud.RESUELTA };
      await expect(service.updateEstado(1, dto, mockAsesor1)).rejects.toThrow(BadRequestException);
    });

    it('Escenario 4 (Reapertura prohibida): RESUELTA -> cualquier estado es rechazado', async () => {
      const solicitud: Solicitud = {
        id: 1,
        cliente: 'Cliente 1',
        descripcion: 'Desc',
        asesor: 'asesor1',
        estado: EstadoSolicitud.RESUELTA,
        creadaEn: new Date(),
        actualizadaEn: new Date(),
      };
      vi.spyOn(repository, 'findOne').mockResolvedValue(solicitud);

      const dto: UpdateEstadoDto = { estado: EstadoSolicitud.EN_GESTION };
      await expect(service.updateEstado(1, dto, mockAdmin)).rejects.toThrow(BadRequestException);
    });

    it('Escenario 5 (Asesor modifica solicitud ajena): Rechazado con 403 Forbidden', async () => {
      const solicitud: Solicitud = {
        id: 1,
        cliente: 'Cliente 1',
        descripcion: 'Desc',
        asesor: 'asesor_otro',
        estado: EstadoSolicitud.PENDIENTE,
        creadaEn: new Date(),
        actualizadaEn: new Date(),
      };
      vi.spyOn(repository, 'findOne').mockResolvedValue(solicitud);

      const dto: UpdateEstadoDto = { estado: EstadoSolicitud.EN_GESTION };
      await expect(service.updateEstado(1, dto, mockAsesor1)).rejects.toThrow(ForbiddenException);
    });

    it('Escenario 6 (Admin/Supervisor sobre cualquier solicitud): Actualiza respetando transiciones', async () => {
      const solicitud: Solicitud = {
        id: 5,
        cliente: 'Cliente 5',
        descripcion: 'Desc',
        asesor: 'cualquier_asesor',
        estado: EstadoSolicitud.PENDIENTE,
        creadaEn: new Date(),
        actualizadaEn: new Date(),
      };
      vi.spyOn(repository, 'findOne').mockResolvedValue(solicitud);

      const dto: UpdateEstadoDto = { estado: EstadoSolicitud.EN_GESTION };
      const result = await service.updateEstado(5, dto, mockSupervisor);
      expect(result.estado).toBe(EstadoSolicitud.EN_GESTION);
    });

    it('Escenario 7 (Validación de Enum de estado): Rechaza valores que no pertenecen al Enum', async () => {
      const invalidDto = plainToInstance(UpdateEstadoDto, {
        estado: 'ESTADO_INVALIDO',
      });
      const errors = await validate(invalidDto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isEnum).toBeDefined();
    });
  });
});

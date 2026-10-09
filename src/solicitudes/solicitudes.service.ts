import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Solicitud } from './entities/solicitud.entity';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { EstadoSolicitud } from './enums/estado-solicitud.enum';
import { User } from '../auth/interfaces/user.interface';
import { Role } from '../auth/enums/role.enum';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(Solicitud)
    private readonly solicitudesRepository: Repository<Solicitud>,
  ) {}

  /**
   * US-04: Registro de Solicitud Comercial (POST /solicitudes)
   * Asigna el estado inicial PENDIENTE y gestiona el asesor según el rol.
   */
  async create(dto: CreateSolicitudDto, currentUser: User): Promise<Solicitud> {
    let asesorAsignado = currentUser.username;

    // Si registra admin o supervisor, puede asignar a un asesor o asignarse ellos mismos
    if (currentUser.role === Role.ADMIN || currentUser.role === Role.SUPERVISOR) {
      if (dto.asesor && dto.asesor.trim().length > 0) {
        asesorAsignado = dto.asesor.trim();
      }
    }

    const nuevaSolicitud = this.solicitudesRepository.create({
      cliente: dto.cliente.trim(),
      descripcion: dto.descripcion.trim(),
      asesor: asesorAsignado,
      estado: EstadoSolicitud.PENDIENTE, // Forzado inmutable a PENDIENTE
    });

    return await this.solicitudesRepository.save(nuevaSolicitud);
  }

  /**
   * US-05: Consulta General de Solicitudes según Rol (GET /solicitudes)
   * Admin y Supervisor consultan todas. Asesor solo consulta las suyas vía cláusula WHERE en DB.
   */
  async findAll(currentUser: User): Promise<Solicitud[]> {
    if (currentUser.role === Role.ASESOR) {
      return await this.solicitudesRepository.find({
        where: { asesor: currentUser.username },
        order: { id: 'ASC' },
      });
    }

    return await this.solicitudesRepository.find({
      order: { id: 'ASC' },
    });
  }

  /**
   * US-06: Consulta Individual de Solicitud por ID (GET /solicitudes/:id)
   * Valida existencia y permisos de asesor sobre el recurso.
   */
  async findOne(id: number, currentUser: User): Promise<Solicitud> {
    const solicitud = await this.solicitudesRepository.findOne({
      where: { id },
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }

    if (currentUser.role === Role.ASESOR && solicitud.asesor !== currentUser.username) {
      throw new ForbiddenException(
        'Acceso denegado: no tiene permisos para consultar solicitudes de otros asesores',
      );
    }

    return solicitud;
  }

  /**
   * US-07: Cambio de Estado Controlado de Solicitud (PATCH /solicitudes/:id/estado)
   * Valida autoría/permisos y máquina de estados lineal y finita.
   */
  async updateEstado(
    id: number,
    dto: UpdateEstadoDto,
    currentUser: User,
  ): Promise<Solicitud> {
    const solicitud = await this.solicitudesRepository.findOne({
      where: { id },
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }

    // Regla de autoría para asesores
    if (currentUser.role === Role.ASESOR && solicitud.asesor !== currentUser.username) {
      throw new ForbiddenException(
        'Acceso denegado: no tiene permisos para modificar solicitudes de otros asesores',
      );
    }

    const estadoActual = solicitud.estado;
    const nuevoEstado = dto.estado;

    // Validación de la máquina de estados lineal y finita
    if (estadoActual === EstadoSolicitud.RESUELTA) {
      throw new BadRequestException(
        'Transición inválida: Una solicitud resuelta jamás puede reabrirse',
      );
    }

    if (estadoActual === EstadoSolicitud.PENDIENTE) {
      if (nuevoEstado === EstadoSolicitud.RESUELTA) {
        throw new BadRequestException(
          'Transición inválida: Queda terminantemente prohibido el salto directo de PENDIENTE a RESUELTA',
        );
      }
      if (nuevoEstado === EstadoSolicitud.PENDIENTE) {
        throw new BadRequestException(
          'Transición inválida: La solicitud ya se encuentra en estado PENDIENTE',
        );
      }
    }

    if (estadoActual === EstadoSolicitud.EN_GESTION) {
      if (nuevoEstado === EstadoSolicitud.PENDIENTE) {
        throw new BadRequestException(
          'Transición inválida: No se permite regresar de EN_GESTION a PENDIENTE',
        );
      }
      if (nuevoEstado === EstadoSolicitud.EN_GESTION) {
        throw new BadRequestException(
          'Transición inválida: La solicitud ya se encuentra en estado EN_GESTION',
        );
      }
    }

    // Aplicar cambio de estado
    solicitud.estado = nuevoEstado;
    return await this.solicitudesRepository.save(solicitud);
  }
}

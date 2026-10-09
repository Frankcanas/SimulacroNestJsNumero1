import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '../auth/interfaces/user.interface';
import { Solicitud } from './entities/solicitud.entity';

@ApiTags('solicitudes')
@ApiHeader({
  name: 'x-api-key',
  description: 'Clave de acceso a la API (ver .env.example)',
  required: true,
})
@ApiHeader({
  name: 'x-user',
  description: 'Usuario del sistema (admin, supervisor, asesor1, asesor_carlos)',
  required: true,
})
@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva solicitud comercial' })
  @ApiResponse({
    status: 201,
    description: 'Solicitud comercial registrada exitosamente',
    type: Solicitud,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos o faltantes' })
  @ApiResponse({ status: 401, description: 'API Key o usuario no válidos' })
  async create(
    @Body() createSolicitudDto: CreateSolicitudDto,
    @CurrentUser() currentUser: User,
  ): Promise<Solicitud> {
    return await this.solicitudesService.create(createSolicitudDto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Consultar listado general de solicitudes comerciales' })
  @ApiResponse({
    status: 200,
    description: 'Listado de solicitudes obtenido correctamente',
    type: [Solicitud],
  })
  @ApiResponse({ status: 401, description: 'API Key o usuario no válidos' })
  async findAll(@CurrentUser() currentUser: User): Promise<Solicitud[]> {
    return await this.solicitudesService.findAll(currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar una solicitud comercial por su ID' })
  @ApiParam({ name: 'id', description: 'ID numérico de la solicitud' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de la solicitud comercial',
    type: Solicitud,
  })
  @ApiResponse({ status: 401, description: 'API Key o usuario no válidos' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a solicitud de otro asesor' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ): Promise<Solicitud> {
    return await this.solicitudesService.findOne(id, currentUser);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Actualizar el estado de una solicitud comercial' })
  @ApiParam({ name: 'id', description: 'ID numérico de la solicitud' })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado correctamente',
    type: Solicitud,
  })
  @ApiResponse({
    status: 400,
    description: 'Transición inválida o valor de enum no permitido',
  })
  @ApiResponse({ status: 401, description: 'API Key o usuario no válidos' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a solicitud de otro asesor' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  @ApiResponse({
    status: 409,
    description: 'Conflicto en la máquina de estados o reapertura prohibida',
  })
  async updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstadoDto: UpdateEstadoDto,
    @CurrentUser() currentUser: User,
  ): Promise<Solicitud> {
    return await this.solicitudesService.updateEstado(id, updateEstadoDto, currentUser);
  }
}

import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoSolicitud } from '../enums/estado-solicitud.enum';

export class UpdateEstadoDto {
  @ApiProperty({
    description: 'Nuevo estado de la solicitud comercial',
    enum: EstadoSolicitud,
    example: EstadoSolicitud.EN_GESTION,
  })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsEnum(EstadoSolicitud, {
    message: `El estado debe ser uno de los valores válidos: ${Object.values(EstadoSolicitud).join(', ')}`,
  })
  estado: EstadoSolicitud;
}

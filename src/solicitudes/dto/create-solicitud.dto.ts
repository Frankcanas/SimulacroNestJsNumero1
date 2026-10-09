import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSolicitudDto {
  @ApiProperty({
    description: 'Nombre obligatorio del cliente',
    example: 'Empresa ABC S.A.S.',
  })
  @IsNotEmpty({ message: 'El nombre del cliente es obligatorio y no puede ser vacío' })
  @IsString({ message: 'El cliente debe ser una cadena de texto' })
  cliente: string;

  @ApiProperty({
    description: 'Motivo obligatorio de la solicitud comercial',
    example: 'Interés en cotización de servicios cloud',
  })
  @IsNotEmpty({ message: 'La descripción es obligatoria y no puede ser vacía' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion: string;

  @ApiPropertyOptional({
    description: 'Asesor asignado (opcional, aplicable cuando registra admin o supervisor)',
    example: 'asesor_carlos',
  })
  @IsOptional()
  @IsString({ message: 'El asesor debe ser una cadena de texto' })
  asesor?: string;
}

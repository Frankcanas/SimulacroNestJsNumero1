import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EstadoSolicitud } from '../enums/estado-solicitud.enum';

@Entity('solicitudes')
export class Solicitud {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  cliente: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'varchar', length: 100 })
  asesor: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: EstadoSolicitud.PENDIENTE,
  })
  estado: EstadoSolicitud;

  @CreateDateColumn()
  creadaEn: Date;

  @UpdateDateColumn()
  actualizadaEn: Date;
}

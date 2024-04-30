import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'pguser',
    password: 'pgpassword',
    database: 'nestjs',
    entities: [join(__dirname, '**', '*.entity.{ts,js}')],
    synchronize: true,
};
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRole } from './user-roles.enum';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import {
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async createAdminUser(createUserDto: CreateUserDto): Promise<User> {
        if (createUserDto.password != createUserDto.passwordConfirmation) {
            throw new UnprocessableEntityException('As senhas não conferem');
        } else {
            return this.createUser(createUserDto, UserRole.ADMIN);
        }
    }

    async findUserById(userId: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: {
                id: userId
            }, select: ['id', 'name', 'lastName', 'email', 'role', 'status']
        });

        if (!user) throw new NotFoundException('Usuário não encontrado');

        return user;
    }

    async updateUser(updateUserDto: UpdateUserDto, id: string): Promise<User> {
        const user = await this.findUserById(id);
        const { name, lastName, email, role, status } = updateUserDto;
        user.name = name ? name : user.name;
        user.lastName = lastName ? lastName : user.lastName;
        user.email = email ? email : user.email;
        user.role = role ? role : user.role;
        user.status = status === undefined ? user.status : status;
        try {
            await user.save();
            return user;
        } catch (error) {
            throw new InternalServerErrorException(
                'Erro ao salvar os dados no banco de dados',
            );
        }
    }

    async deleteUser(userId: string) {
        const result = await this.userRepository.delete({ id: userId });
        if (result.affected === 0) {
            throw new NotFoundException(
                'Não foi encontrado um usuário com o ID informado',
            );
        }
    }

    async findUsers(
        queryDto: FindUsersQueryDto,
    ): Promise<{ users: User[]; total: number }> {
        const users = await this.findUsersByQuery(queryDto);
        return users;
    }

    // TODO: Move below to UserRepository

    async createUser(
        createUserDto: CreateUserDto,
        role: UserRole,
    ): Promise<User> {
        const { email, name, lastName, password } = createUserDto;

        const user = this.userRepository.create();
        user.email = email;
        user.name = name;
        user.lastName = lastName;
        user.role = role;
        user.status = true;
        user.confirmationToken = crypto.randomBytes(32).toString('hex');
        user.salt = await bcrypt.genSalt();
        user.password = await this.hashPassword(password, user.salt);
        try {
            await user.save();
            delete user.password;
            delete user.salt;
            return user;
        } catch (error) {
            if ((error as { code: string }).code.toString() === '23505') {
                throw new ConflictException('Endereço de email já está em uso');
            } else {
                throw new InternalServerErrorException(
                    'Erro ao salvar o usuário no banco de dados',
                );
            }
        }
    }

    private async hashPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt);
    }

    async findUsersByQuery(
        queryDto: FindUsersQueryDto,
    ): Promise<{ users: User[]; total: number }> {
        queryDto.status = queryDto.status === undefined ? true : queryDto.status;
        queryDto.page = queryDto.page < 1 ? 1 : queryDto.page;
        queryDto.limit = queryDto.limit > 100 ? 100 : queryDto.limit;

        if (!queryDto.page) {
            queryDto.page = 1;
        }

        if (!queryDto.limit) {
            queryDto.limit = 100;
        }

        const { email, name, lastName, status, role } = queryDto;
        const query = this.userRepository.createQueryBuilder('user');
        query.where('user.status = :status', { status });

        if (email) {
            query.andWhere('user.email ILIKE :email', { email: `%${email}%` });
        }

        if (name) {
            query.andWhere('user.name ILIKE :name', { name: `%${name}%` });
        }

        if (lastName) {
            query.andWhere('user.lastName ILIKE :lastName', {
                lastName: `%${lastName}%`,
            });
        }

        if (role) {
            query.andWhere('user.role = :role', { role });
        }
        query.skip((queryDto.page - 1) * queryDto.limit);
        query.take(+queryDto.limit);
        query.orderBy(queryDto.sort ? JSON.parse(queryDto.sort) : undefined);
        query.select(['user.id', 'user.name', 'user.lastName', 'user.email', 'user.role']);

        const [users, total] = await query.getManyAndCount();

        return { users, total };
    }


}
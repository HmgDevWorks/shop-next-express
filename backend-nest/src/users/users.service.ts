import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateUserDto,
  ResponseUserDto,
  UserSimpleResponseDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Paginated, createPaginated } from '../shared/types';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Failed to create user.' })
  async create(createUserDto: CreateUserDto): Promise<UserSimpleResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const newUser = await this.prisma.user.create({
      data: createUserDto,
    });

    if (!newUser) {
      throw new BadRequestException('Failed to create user');
    }

    return plainToInstance(UserSimpleResponseDto, newUser, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'The users have been successfully found.',
  })
  async findAll(
    page: number,
    pageSize: number,
  ): Promise<Paginated<UserSimpleResponseDto>> {
    const users = await this.prisma.user.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const total = await this.prisma.user.count();
    if (!users) {
      throw new NotFoundException('Users not found');
    }
    return createPaginated(
      plainToInstance(UserSimpleResponseDto, users, {
        excludeExtraneousValues: true,
      }),
      total,
      page,
      pageSize,
    );
  }

  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully found.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return plainToInstance(UserSimpleResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return plainToInstance(UserSimpleResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async delete(id: string) {
    const user = await this.prisma.user.delete({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return plainToInstance(UserSimpleResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}

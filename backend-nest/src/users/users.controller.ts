import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UserSimpleResponseDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Paginated, type PaginationParams } from '../shared/types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Failed to create user.' })
  @ApiBody({ type: CreateUserDto })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'The users have been successfully found.',
  })
  @ApiResponse({ status: 404, description: 'Users not found.' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'The page number',
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    required: false,
    description: 'The page size',
  })
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
  ): Promise<Paginated<UserSimpleResponseDto>> {
    return await this.usersService.findAll(page, pageSize);
  }

  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully found.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'The user ID',
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserSimpleResponseDto> {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'The user ID',
  })
  @ApiBody({ type: UpdateUserDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'The user ID',
  })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}

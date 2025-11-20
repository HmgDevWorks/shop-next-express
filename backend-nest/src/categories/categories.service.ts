import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category } from '@prisma/client';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'The category has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Failed to create category.' })
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = await this.prisma.category.create({
      data: createCategoryDto,
    });
    if (!category) {
      throw new BadRequestException('Failed to create category');
    }
    return category;
  }

  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'The categories have been successfully found.',
  })
  @ApiResponse({ status: 404, description: 'Categories not found.' })
  async findAll(): Promise<Category[]> {
    return await this.prisma.category.findMany();
  }

  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully found.',
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  async delete(id: string): Promise<Category> {
    const category = await this.prisma.category.delete({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
}

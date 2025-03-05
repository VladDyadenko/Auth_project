import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    
    @Post()
    createUser(@Body() dto: CreateUserDto) { return this.userService.createUser(dto) }
    
    @Get()
    async getUsers() { return await this.userService.getUsers() }

    @Get(':id')
    async getUserById(@Param('id') id: string) { return await this.userService.getUserById(id) }

    @Get('email/:email')
    async getUserByEmail(@Param('email') email: string) { return await this.userService.getUserByEmail(email) }
   
    @Delete(':id')
    async deleteUser(@Param('id') id: string) { return await this.userService.deleteUserById(id) }
}

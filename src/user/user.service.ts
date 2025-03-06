import { Injectable } from '@nestjs/common';
import { UserModule } from './user.module';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.models';
import { Model, Types } from 'mongoose';
import { IUser } from './interface/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { hashSync, genSaltSync } from 'bcrypt';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModule: Model<IUser>) { }


    async createUser(dto: CreateUserDto) {
      const hashPassword = this.hashPassword(dto.password);
        const user = await this.userModule.create({
                email: dto.email,
                name: dto.name,
                password: hashPassword,
                role: dto.role,     
    });
    return user;
  }

  async getUsers() {
    const users = await this.userModule.find().exec();

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
  }

//   async update(updateUserDto: UpdateUserDto) {
//     const { avatarUrl, name, token, _id } = updateUserDto;

//     const user = await this.userModule.findByIdAndUpdate(
//       _id,
//       { name: name, avatarUrl: avatarUrl, token: token },
//       { new: true },
//     );

//     return user;
//   }

//   async updateChild(_id: string, id: string) {
//     const user = await this.userModule.findByIdAndUpdate(
//       _id,
//       {
//         children: id,
//       },
//       { new: true },
//     );

//     return user;
//   }

  async getUserById(id: string | Types.ObjectId): Promise<IUser | null> {
    const userId = typeof id === 'string' 
        ? Types.ObjectId.createFromHexString(id)
        : id;
    return this.userModule.findById(userId);
  }

  async getUserByEmail(email: string) {
    const user = await this.userModule.findOne({ email });
    return user;
  }

  async deleteUserById(id: string) {
    const user = await this.userModule.deleteOne({ _id: id });
    return `This action delete a #${user} user`;
    }
    
    private hashPassword(password: string) {
        return hashSync(password, genSaltSync(10));
    }
}
import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;
    try {
      const existingUser = await this.usersRepository.findOne({
        where: {
          email,
        },
      });

      if (existingUser) throw new ConflictException('Email existe déjà');

      // hash password
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);
      console.log('salt', salt);
      console.log('hashedPassword', passwordHash);

      const user = this.usersRepository.create({ ...createUserDto, passwordHash: passwordHash });
      await this.usersRepository.save(user);
      return user;
    } catch (error) {
      console.log(error);
      return error;
      // throw new InternalServerErrorException();
    }
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: string) {
    // return `This action returns a #${id} user`;
    return this.usersRepository.findOne({ where: { id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

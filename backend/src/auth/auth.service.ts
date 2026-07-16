import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { user_email: email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with role_id = 2 (customer)
    const newUser = this.usersRepository.create({
      user_full_name: name,
      user_email: email,
      password_hash: hashedPassword,
      role_id: 2, // Customer role
      account_status: 'ACTIVE',
    });

    await this.usersRepository.save(newUser);

    // Generate JWT token
    const token = this.jwtService.sign({
      id: newUser.user_id,
      email: newUser.user_email,
    });

    return {
      success: true,
      token,
      user: {
        id: newUser.user_id,
        name: newUser.user_full_name,
        email: newUser.user_email,
      },
    };
  }

  async login(email: string, password: string) {
    // Find user by email
    const user = await this.usersRepository.findOne({
      where: { user_email: email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      id: user.user_id,
      email: user.user_email,
    });

    return {
      success: true,
      token,
      user: {
        id: user.user_id,
        name: user.user_full_name,
        email: user.user_email,
      },
    };
  }

  async validateToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      return decoded;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

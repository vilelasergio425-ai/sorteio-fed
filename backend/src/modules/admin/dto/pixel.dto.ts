import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreatePixelDto {
  @IsString()
  @IsNotEmpty()
  pixelId: string;

  @IsString()
  @IsNotEmpty()
  nome: string;
}

export class UpdatePixelDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

import { Module } from '@nestjs/common'
import { ResumesService } from './resumes.service'
import { ResumesController } from './resumes.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Resume, ResumeSchema } from './schema/resume.entity'

@Module({
  imports: [MongooseModule.forFeature([{ name: Resume.name, schema: ResumeSchema }])],
  controllers: [ResumesController],
  providers: [ResumesService],
  exports: [ResumesService]
})
export class ResumesModule {}

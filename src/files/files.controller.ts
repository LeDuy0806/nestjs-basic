import { Controller, HttpStatus, ParseFilePipeBuilder, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FilesService } from './files.service'
import { ResponseMessage } from 'src/decorators/customize'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}
  @Post('/upload')
  @ResponseMessage('Upload a file')
  @UseInterceptors(FileInterceptor('fileUpload'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^(jpg|jpeg|image\/jpeg||png|image\/png|gif|txt|pdf|application\/pdf|doc|docx|text\/plain)$/i
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 // 1 mb
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        })
    )
    file: Express.Multer.File
  ) {
    return {
      ...file,
      fileName: file.filename
    }
  }
}

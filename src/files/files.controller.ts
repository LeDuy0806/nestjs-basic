import { Controller, HttpStatus, ParseFilePipeBuilder, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FilesService } from './files.service'
import { ResponseMessage } from 'src/decorators/customize'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ResponseMessage('Upload single file')
  @UseInterceptors(FileInterceptor('fileUpload')) //trong FileInterceptor() là tên field sử dụng trong form-data; cả dòng này để can thiệp vào req để lấy ra file upload (như là 1 middleware)
  uploadFile(
    @UploadedFile()
    // new ParseFilePipeBuilder()
    //   .addFileTypeValidator({
    //     fileType: /^(jpg|jpeg|image\/jpeg||png|image\/png|gif|txt|pdf|application\/pdf|doc|docx|text\/plain)$/i,
    //   })
    //   .addMaxSizeValidator({
    //     maxSize: 1024 * 1024 // 1 mb
    //   })
    //   .build({
    //     errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
    //   })
    // ------> chuyển config 'file' sang multer.config
    file: Express.Multer.File
  ) {
    // file (UploadedFile) = req.files
    return {
      fileName: file.filename
    }
  }
}

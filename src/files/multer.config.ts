import { Injectable } from '@nestjs/common'
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express'
import fs from 'fs'
import { diskStorage } from 'multer'
import path, { join } from 'path'

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  //để lấy ra đg link-url tuyệt đối trên máy tính
  getRootPath = () => {
    return process.cwd()
  }

  //kiểm tra xem thư mục cs tồn tại hay chưa (chưa thì tạo)
  ensureExists(targetDirectory: string) {
    fs.mkdir(targetDirectory, { recursive: true }, (error) => {
      if (!error) {
        console.log('Directory successfully created, or it already exists.')
        return
      }
      switch (error.code) {
        case 'EEXIST':
          // Error:
          // Requested location already exists, but it's not a directory.
          break
        case 'ENOTDIR':
          // Error:
          // The parent hierarchy contains a file with the same name as the dir
          // you're trying to create.
          break
        default:
          // Some other error like permission denied.
          console.error(error)
          break
      }
    })
  }

  createMulterOptions(): MulterModuleOptions {
    return {
      //storage: để cấu hình nơi lưu trữ dữ liệu
      //diskStorage: lưu ngay trong ổ đĩa máy tính của mình (src backend)
      storage: diskStorage({
        destination: (req, file, cb) => {
          const folder = req?.headers?.folder_type ?? 'default' //lấy ra folder_type từ header của req gửi lên

          this.ensureExists(`public/images/${folder}`) //kiểm tra và nếu folder chưa tồn tại thì chạy vào cb ở dưới

          cb(null, join(this.getRootPath(), `public/images/${folder}`)) //trường hợp thành công và tạo ra địa chỉ lưu trữ file
        },

        //chế biến tên file để lưu trữ (tránh trùng tên dẫn đến file bị ghi đè)
        filename: (req, file, cb) => {
          //get image extension
          let extName = path.extname(file.originalname)

          //get image's name (without extension)
          let baseName = path.basename(file.originalname, extName)

          let finalName = `${baseName}-${Date.now()}${extName}`
          cb(null, finalName)
        }
      })
    }
  }
}

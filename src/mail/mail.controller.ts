import { Controller, Get, Logger, Post } from '@nestjs/common'
import { MailService } from './mail.service'
import { MailerService } from '@nestjs-modules/mailer'
import { Public, ResponseMessage } from 'src/decorators/customize'
import { InjectModel } from '@nestjs/mongoose'
import { Subscriber, SubscriberDocument } from 'src/subscribers/schema/subscriber.schema'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { Job, JobDocument } from 'src/jobs/schema/job.schema'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('mail')
@Controller('mail')
export class MailController {
  private readonly logger = new Logger(MailController.name)

  constructor(
    private readonly mailService: MailService,
    private readonly mailerService: MailerService,

    @InjectModel(Subscriber.name) private subscriberModel: SoftDeleteModel<SubscriberDocument>,

    @InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>
  ) {}

  @Post('test')
  @Public()
  // @Cron(CronExpression.EVERY_30_SECONDS)
  @ResponseMessage('Test email')
  async handleTestEmail() {
    this.logger.log('Send test email after 30 seconds')
    return await this.mailerService.sendMail({
      to: 'levanduy08062003@gmail.com',
      from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to Nice App! Confirm your Email',
      template: 'test',
      context: {
        userNameReceiver: 'Duy'
      }
    })
  }

  @Get()
  @Public()
  @ResponseMessage('send email')
  async handleSendEmail() {
    const subscribers = await this.subscriberModel.find({})
    for (const subs of subscribers) {
      const subsSkills = subs.skills
      const jobWithMatchingSkills = await this.jobModel.find({ skills: { $in: subsSkills } })
      if (jobWithMatchingSkills?.length) {
        const jobs = jobWithMatchingSkills.map((item) => {
          return {
            name: item.name,
            company: item.company,
            salary: `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ',
            skills: item.skills
          }
        })

        await this.mailerService.sendMail({
          to: [subs.email],
          from: '"HR Support" <support@example.com>',
          subject: 'Welcome to Nice App',
          template: 'new-job',
          context: {
            userNameReceiver: subs.name,
            email: subs.email,
            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTV4P6EOZRbKaqI4ZsGMghpJyD5wSo_B3eRsg&s',
            jobs: jobs
          }
        })
      }
    }
  }
}

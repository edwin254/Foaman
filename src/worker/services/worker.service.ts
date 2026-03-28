import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Worker } from '../entities/worker.entity';
import { SmsService } from '../../common/services/sms.service';
import { MatchFundiDto } from '../dto/match-fundi.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkerMatchingService {
  constructor(
    @InjectRepository(Worker) private workerRepo: Repository<Worker>,
    private smsService: SmsService,private prisma: PrismaService
  ) {}
  async createWorker(phone: string, data: any) {
    return this.prisma.user.create({
      data: {
        phone,
        fullName: data.fullName,
        location: data.location,
        role: 'WORKER',
        workerProfile: {
          create: {
            idNumber: data.idNumber,
            skill: data.skill,
          },
        },
      },
    });
  }

  async matchFundi(dto: MatchFundiDto): Promise<string> {
    const { skill, location, description } = dto;

    const candidates = await this.workerRepo
      .createQueryBuilder('worker')
      .where('worker.skill = :skill', { skill })
      .andWhere('worker.verified = true')
      .andWhere('worker.available = true')
      .orderBy(
        `ST_Distance(worker.location, ST_MakePoint(:lng, :lat)::geography)`,
        'ASC',
      )
      .setParameters({ lng: location.lng, lat: location.lat })
      .limit(10)
      .getMany();

    const top5 = candidates.slice(0, 5);
    if (top5.length === 0) return '❌ No verified fundi found nearby.';

    const jobRef = `REF-${Date.now()}`;

    // Send SMS to top 5
    for (const w of top5) {
      await this.smsService.send(
        w.phone,
        `New job request (${description || skill}) in your area.\n1. Confirm\n2. Decline\nRef: ${jobRef}`,
      );
    }

    // In real app: use Redis + webhook to wait for first "1" reply
    // For demo we simulate first worker accepts immediately
    const winner = top5[0];
    await this.assignJob(winner, jobRef);

    return `✅ Job assigned to ${winner.fullName} (Ref: ${jobRef}). You’ll receive a call shortly.`;
  }

  private async assignJob(worker: Worker, jobRef: string) {
    worker.available = false;
    worker.lastJobTimestamp = new Date();
    await this.workerRepo.save(worker);
    console.log(`Job ${jobRef} assigned to ${worker.fullName}`);
  }
}

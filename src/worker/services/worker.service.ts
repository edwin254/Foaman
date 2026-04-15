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
    @InjectRepository(Worker) private readonly workerRepo: Repository<Worker>,
    private readonly smsService: SmsService,
    private readonly prisma: PrismaService,
  ) {}

  async createWorker(phone: string, data: Record<string, string>) {
    const existingWorker = await this.workerRepo.findOne({ where: { phone } });

    const worker = this.workerRepo.create({
      ...existingWorker,
      phone,
      fullName: data.fullName,
      idNumber: data.idNumber,
      skill: data.skill,
      verified: existingWorker?.verified ?? false,
      available: existingWorker?.available ?? true,
    });

    return this.workerRepo.save(worker);
  }

  async matchFundi(dto: MatchFundiDto): Promise<string> {
    const { skill, location, description } = dto;

    const candidates = await this.workerRepo
      .createQueryBuilder('worker')
      .where('worker.skill = :skill', { skill })
      .andWhere('worker.verified = true')
      .andWhere('worker.available = true')
      .orderBy('worker.lastJobTimestamp', 'ASC')
      .limit(10)
      .getMany();

    const top5 = candidates.slice(0, 5);
    if (top5.length === 0) return 'No verified fundi found nearby.';

    const jobRef = `REF-${Date.now()}`;

    for (const worker of top5) {
      await this.smsService.send(
        worker.phone,
        `New job request (${description || skill}) in ${location}.\n1. Confirm\n2. Decline\nRef: ${jobRef}`,
      );
    }

    const winner = top5[0];
    await this.assignJob(winner, jobRef);

    return `Job assigned to ${winner.fullName} (Ref: ${jobRef}). You'll receive a call shortly.`;
  }

  async findAndNotifyWorkers(jobId: string): Promise<void> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        skillNeeded: true,
        location: true,
        description: true,
      },
    });

    if (!job) {
      return;
    }

    await this.matchFundi({
      skill: job.skillNeeded,
      location: job.location,
      description: job.description,
    });

    await this.prisma.job.update({
      where: { id: job.id },
      data: { status: 'MATCHED' },
    });
  }

  private async assignJob(worker: Worker, jobRef: string) {
    worker.available = false;
    worker.lastJobTimestamp = new Date();
    await this.workerRepo.save(worker);
    console.log(`Job ${jobRef} assigned to ${worker.fullName}`);
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from './lesson.entity';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CreateLessonInput } from './lesson.input';
import { UpdateLesson } from './lesson.update';
import { In } from 'typeorm';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson) private lessonRepository: Repository<Lesson>,
  ) {}

  async getLesson(id: string): Promise<Lesson> {
    return this.lessonRepository.findOneBy({ id });
  }

  async getLessons(): Promise<Lesson[]> {
    return this.lessonRepository.find();
  }

  async createLesson(createLessonInput: CreateLessonInput): Promise<Lesson> {
    const { name, startDate, endDate } = createLessonInput;

    const lesson = this.lessonRepository.create({
      id: uuid(),
      name,
      startDate,
      endDate,
    });

    return this.lessonRepository.save(lesson);
  }

  async assignStudentsToLesson(
    lessonId: string,
    studentIds: string[],
  ): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOneBy({ id: lessonId });
    if (!lesson) {
      throw new Error('Lesson not found');
    }
    lesson.students = Array.isArray(lesson.students) ? lesson.students : [];

    lesson.students = [...lesson.students, ...studentIds];

    return this.lessonRepository.save(lesson);
  }

  async updateLesson(id: string, updateLesson: UpdateLesson): Promise<Lesson> {
    const { name } = updateLesson;
    const lesson = await this.getLesson(id);
    lesson.name = name;
    await this.lessonRepository.save(lesson);
    return lesson;
  }

  async deleteLesson(id: string): Promise<boolean> {
    const result = await this.lessonRepository.delete({ id });

    if (result.affected === 0) {
      console.log(`No lesson found with id: ${id}`);
      return false;
    }

    console.log(`Lesson with id: ${id} deleted successfully`);
    return true;
  }
}

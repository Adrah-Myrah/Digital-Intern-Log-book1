import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
  ) {}

  async getSetting(key: string): Promise<string | null> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    return setting ? setting.value : null;
  }

  async getAllSettings(): Promise<Setting[]> {
    return this.settingsRepository.find();
  }

  async setSetting(key: string, value: string, label?: string): Promise<Setting> {
    let setting = await this.settingsRepository.findOne({ where: { key } });
    if (setting) {
      setting.value = value;
      if (label) setting.label = label;
    } else {
      setting = this.settingsRepository.create({ key, value, label });
    }
    return this.settingsRepository.save(setting);
  }
}
import { Controller, Get, Post, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  // GET /api/settings
  @Get()
  getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  // POST /api/settings — admin saves a setting
  @Post()
  setSetting(@Body() body: { key: string; value: string; label?: string }) {
    return this.settingsService.setSetting(body.key, body.value, body.label);
  }
}
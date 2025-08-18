import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private currentLevel = environment.production ? LogLevel.WARN : LogLevel.DEBUG;

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: any): void {
    this.log(LogLevel.ERROR, message, error);
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (level < this.currentLevel) return;

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    
    switch (level) {
      case LogLevel.DEBUG:
        console.log(` [${timestamp}] DEBUG: ${message}`, data);
        break;
      case LogLevel.INFO:
        console.info(` [${timestamp}] INFO: ${message}`, data);
        break;
      case LogLevel.WARN:
        console.warn(` [${timestamp}] WARN: ${message}`, data);
        break;
      case LogLevel.ERROR:
        console.error(` [${timestamp}] ERROR: ${message}`, data);
        break;
    }
  }
}
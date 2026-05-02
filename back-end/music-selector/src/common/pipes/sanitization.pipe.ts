import { Injectable, PipeTransform } from '@nestjs/common';
import * as validator from 'class-validator';

/**
 * RNF-S02: Pipe global para sanitizar inputs contra SQL Injection e XSS
 * Remove caracteres perigosos e normaliza strings
 */
@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value === 'string') {
      // Remover espaços em branco extras
      value = value.trim();
      // Escape HTML entities para evitar XSS
      value = value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
      return value;
    }

    if (typeof value === 'object' && value !== null) {
      // Recursivamente sanitizar objetos
      Object.keys(value).forEach((key) => {
        if (typeof value[key] === 'string') {
          value[key] = value[key]
            .trim()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
        } else if (typeof value[key] === 'object' && value[key] !== null) {
          // Sanitizar sub-objetos
          const pipe = new SanitizationPipe();
          value[key] = pipe.transform(value[key]);
        }
      });
    }

    return value;
  }
}
